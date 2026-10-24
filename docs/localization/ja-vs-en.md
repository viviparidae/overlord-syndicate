---

title: ローカライゼーション規約とキー運用
description: 多言語リソース管理。ja.json がデフォルト、en.json がフォールバック。キー運用ルールと1990年代用語の統一。

status: draft
version: "0.1"
category: localization
tags:
- localization
- i18n
- japanese
- 1990年代用語

traces_to:
- docs/design/resources.md
- docs/glossary.md
  implemented_by:
- src/localization/ja.json
- src/localization/en.json
- src/localization/index.ts

verified_by:
- tests/unit/localization.test.ts (任意) (将来のテストファイル)

---

# ローカライゼーション規約とキー運用

## 1. 日本語 vs 英語の規約

- `ja.json` が **デフォルト**。すべてのゲームテキストは日本語で記述。
- `en.json` は **フォールバック**。`ja.json` にキーがあれば必ず `en.json` にも入れ。日本語での語順・敬語を英訳。

> **例外:** 固有名詞・技術用語（例: 「メッセンジャー」）は英字のまま。

## 2. キー命名規則

| キーパターン              | 用途                     | 例                       |
| ------------------------- | ------------------------ | ------------------------ |
| `status.<resource>`       | ステータスバー表示       | `status.funds`           |
| `action.<id>.<outcome>`   | アクション結果メッセージ | `action.shopRun.success` |
| `gameover.<reason>`       | ゲームオーバー理由       | `gameover.police`        |
| `phase.<num>.name`        | Phase 表示名             | `phase.1.name`           |
| `menu.<section>.<action>` | UI メニュー              | `menu.main.start`        |

> **ルール:** すべて小文字、スペースなし。命名は `src/localization/` 内で一元管理。`src/localization/` 内の他リソースから相互参照する。

## 3. 1990年代特有の用語と表現

- **日付表記:** `平成9年1月15日`（西暦には `1997-01-15`）
- **通貨表示:** `¥` 記号、`,` 区切り（`formatCurrency`）
- **敬語:** 丁寧語中心（です/ます）。プレイヤーの倫理観に寄り添わない。
- **略語:** ポケベル（`ポケベル`）、テレホンクラブ（`テレホンクラブ`）、深夜ラジオ（`深夜ラジオ`）

### 3.1 日付例

```json
"date.phase1.start": "平成9年1月15日"
```

### 3.2 通貨例

```json
"status.funds": "資金: ¥{amount}"
```

## 4. ローカライゼーション規約

### 4.1 `src/localization/index.ts` の制約

- `t('key', { var: value })` でリソースを取得。テンプレートリテラルで直接キーは書かない。
- プレースホルダー `{var}` を使用。`$` や `{` は使用禁止（Escaping 煩雑）。

### 4.2 `ja.json` / `en.json` のテンプレート

```json
{
  "status.funds": "資金: ¥{amount}",
  "status.fear": "恐怖: {level}",
  "action.shopRun.success": "店番を行いました",
  "gameover": "警戒度が100に達しました。ゲームオーバー。"
}
```

### 4.3 ファイル更新ポリシー

- `ja.json` を先に更新。英語の自然さを保つために `en.json` は後で更新。
- 編集時は `src/localization/` 内の他のリソースも確認。見落としの防止。
- 新規キーは `src/localization/` で定義。仕様は [[docs/localization/ja-vs-en]] に集約する。

> **ガイドライン:** ユーザー向けテキストに英字のままの文面を漏らさない。`ja.json` 内に純粋な英字文がないことを確認。

## 5. テストカバレッジ

- 可能な場合 `tests/unit/localization.test.ts` を追加して JSON キー一致を検証
- `t()` の置換ロジック（`vars` 処理）をユニットテストでカバー
- `pnpm test:run` で全 PASS → ローカライゼーション検証完了

## 6. 将来の拡張（計画中）

- Phase 2: `src/localization/phase2/` ディレクトリ（場所のテキスト）を追加
- Phase 3: `src/localization/ui/` ディレクトリ（UI テキスト）を追加
- Phase 4: `src/localization/global/` ディレクトリ（世界観テキスト）を追加
- `src/localization/` 内に `formatDate` / `formatCurrency` ヘルパーを配置
