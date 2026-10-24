---

title: データスキーマ（対話・イベント・アイテム）
description: ゲーム内で使用する構造化JSONデータの定義と相互参照。
status: draft
version: "0.1"
category: architecture
tags:
- data
- json
- schema
  traces_to:
- docs/design/mechanics.md
  implemented_by:
- src/data/dialogue/phase1.json
- src/data/events/phase1.json
- src/data/items/
  verified_by:
- tests/integration/game-loop.test.ts
- tests/integration/event-system.test.ts

---

# データスキーマ

## 1. `src/data/dialogue/`

### 1.1 `phase1.json`

```json
{
  "greeting": "言 hi",
  "responses": {
    "neutral": "云へよう",
    "positive": "賛成"
  }
}
```

### 1.2 構造方針

- すべての対話テキストは `src/localization/` で管理。`src/data/` はデータ参照のみ。
- `phase1.json` は Phase 1 のダイアログマスターファイル。

## 2. `src/data/events/`

### 2.1 `phase1.json`

```json
{
  "id": "event_001",
  "phase": 1,
  "name": "商店街の噂",
  "description": "市民が噂話を持ち寄る",
  "effects": {
    "funds": 500,
    "suspect": -1
  },
  "conditions": {
    "trigger": "phase == 1 && time > 9 && time < 17"
  }
}
```

### 2.2 イベント定義ポリシー

- イベントIDは `evt_{phase}{sequential}` 形式（例: `evt_1001`）
- `effects` はリソースキーへの数値マッピング。
- `conditions` は自由形式の式文字列で、runtime 時に評価。

## 3. `src/data/items/`

_現在空です。_ 導入フェーズでのみ使用。Phase 3 で `src/balance/Costs.ts` から参照される予定。

> **実装ルール:** このディレクトリを追加した際は、`.gitignore` に `!items/*.json` を追加して Git に追跡されるようにする。
