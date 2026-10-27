---
title: セーブ・データ構造
description: セーブスナップショット、章データ、証拠・証言データのスキーマを定義する。
status: draft
version: "0.1"
category: design
tags: [save, data, schema, persistence]
traces_to:
- docs/02_game-spec/02_system-rules/game-loop.md
- docs/03_production/02_code-architecture/architecture.md
implemented_by: []
verified_by: []
---

# セーブ・データ構造

本ドキュメントは**仕様**であり、実装コードは含まない。

## 1. セーブ

| 項目 | 値 |
| --- | --- |
| ストレージ | `localStorage` |
| キー | `overlord_syndicate_v2` |
| 設定キー | `overlord_syndicate_v2_settings`（別キー） |
| 形式 | JSON（`GameSnapshot`） |
| `version` | 必須。スキーマ変更時に加算 |
| 自動保存 | パート遷移時、証拠入手時、証言ブロック開始時 |
| 手動保存 | ポーズメニュー（章内いつでも） |
| スロット | 1つのみ（プロトタイプ） |

## 2. スナップショット

```json
{
  "version": 1,
  "savedAt": "1997-04-12T21:40:00+09:00",
  "chapterId": "ch01",
  "phase": "investigation",
  "checkpoint": {
    "kind": "evidence",
    "id": "ev_bank_slip"
  },
  "missCount": 1,
  "evidence": ["ev_photo_arcade", "ev_bank_slip"],
  "flags": {
    "met_chiaki": true,
    "heard_goda_alibi": true
  },
  "seenDialogues": ["intro_01", "intro_02", "talk_tatsumi_01"],
  "investigation": {
    "areaId": "arcade_center",
    "x": 412,
    "facing": "right"
  },
  "resolution": {
    "testimonyId": "t_goda_02",
    "blockIndex": 1
  },
  "elapsedMs": 934000
}
```

### フィールド規則

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `version` | number | ○ | スキーマ版。読み込み時にマイグレーション判定 |
| `chapterId` | string | ○ | `ch01` 形式 |
| `phase` | `"intro" \| "investigation" \| "resolution" \| "epilogue"` | ○ | 現在パート |
| `checkpoint` | object | ○ | 再開位置。`kind` は `"part" \| "evidence" \| "testimony"` |
| `missCount` | number | ○ | 0〜上限。解決パート外では0 |
| `evidence` | string[] | ○ | 入手済み証拠ID。順序は入手順 |
| `flags` | Record<string, boolean> | ○ | 進行フラグ。値は真偽のみ |
| `seenDialogues` | string[] | ○ | 既読テキストID（スキップ判定用） |
| `investigation` | object | - | 調査パート再開時のみ |
| `resolution` | object | - | 解決パート再開時のみ |
| `elapsedMs` | number | ○ | 章内経過時間。表示のみ |

### 禁止事項

- 循環参照を含めない（`JSON.stringify` が失敗する構造は不可）。
- クラスインスタンスを直接保存しない。プレーンオブジェクトに変換する。
- `undefined` を含めない（欠損はキー削除で表現）。

## 3. マイグレーション

- 保存先: `src/core/save/migrations/`（予定）。`v1 → v2` のように1段ずつ変換する。
- 未知の `version`（将来版）は読み込みを拒否し、タイトルへ戻す。
- 破損（パース失敗、必須キー欠落）時は初期化し、その旨を表示する。

## 4. 章データスキーマ

`src/data/chapters/ch01/` に章単位で配置する（予定）。

```json
{
  "id": "ch01",
  "titleKey": "chapter.ch01.title",
  "phase": 1,
  "missLimit": 3,
  "areas": ["arcade_center", "arcade_east", "shotengai_office"],
  "requiredEvidence": ["ev_photo_arcade", "ev_bank_slip", "ev_estimate_dup"],
  "testimonies": ["t_goda", "t_matsutani", "t_okada"],
  "epilogueBranches": ["epi_returned", "epi_sacrificed"]
}
```

## 5. 証拠データ

```json
{
  "id": "ev_bank_slip",
  "nameKey": "evidence.bank_slip.name",
  "descKey": "evidence.bank_slip.desc",
  "icon": "bank_slip",
  "obtainedAt": "investigation",
  "persistent": false,
  "tags": ["document", "money"]
}
```

- `icon` はアセットIDと一致させる。
- テキストは必ずローカライズキー。データに日本語文を直書きしない。

## 6. 証言データ

```json
{
  "id": "t_goda",
  "speaker": "goda",
  "blocks": [
    {
      "id": "tg_01",
      "textKey": "testimony.goda.01",
      "pressKey": "testimony.goda.01.press",
      "contradiction": null
    },
    {
      "id": "tg_02",
      "textKey": "testimony.goda.02",
      "pressKey": "testimony.goda.02.press",
      "contradiction": {
        "evidenceId": "ev_bank_slip",
        "acceptAnyOf": [],
        "successKey": "testimony.goda.02.success",
        "failKey": "testimony.goda.02.fail"
      }
    }
  ]
}
```

- `contradiction` が `null` のブロックは追及のみ意味を持つ。
- `acceptAnyOf` は複数正解を許す場合のみ使用（章1では未使用）。
- 1ブロック最大1ムジュン。物語上の複合矛盾はブロックを分けて表現する。

## 7. 会話データ（導入・調査）

```json
{
  "id": "talk_tatsumi_01",
  "speaker": "tatsumi",
  "lines": [
    { "textKey": "talk.tatsumi.01.a", "emotion": "normal" },
    { "textKey": "talk.tatsumi.01.b", "emotion": "think" }
  ],
  "choices": [],
  "onEnd": { "evidence": ["ev_estimate_dup"], "flags": { "heard_tatsumi": true } }
}
```

- `choices` は章1の調査では原則空。使う場合も進行には影響させない。
- `onEnd` は証拠・フラグのみ変更する。数値リソースは存在しない。

## 8. ローカライズファイル

- `src/localization/ja.json` が正。`en.json` は同一キー構造を維持する。
- キー名前空間: `chapter.*` / `evidence.*` / `testimony.*` / `talk.*` / `ui.*` / `log.*`。
- キーの追加時は必ず ja / en 両方に追加する。
