# src/ui/ イベント登録と伝播競合 調査報告

## 確認対象
- src/ui/persistence.ts（外部DOMイベントなし）
- src/phaser/scenes/HudScene.ts（オーバーレイボタン）
- src/main.ts（外部DOMボタンリスナー登録）

## 調査結果

### 1. リスナー登録状況（HudScene.ts）
- `createCommandPanel()` で shopBtn / rumorBtn / intimidateBtn を生成
- 各ボタンに `setInteractive()` と `on("pointerdown", ...)` は登録済み
- **問題**: 背景の `rectangle(0, panelY, width, panelH, 0x0f0f1a)` は `setInteractive({ useHandCursor: false })` で設定されているが、**深度（DEPTH.COMMAND）がボタン（DEPTH.COMMAND+3）より低い**ため、直接の競合ではない
- ただし、背景矩形が `setInteractive()` されていることで、Phaser の入力処理に余計なヒットテスト対象となり、伝播に影響する可能性がある

### 2. イベント伝播（bubble/capture）
- HudScene のボタンは Phaser の `pointerdown` イベントを直接使用（外部DOMでは `click`）
- Phaser の入力システムは内部で独自の伝播を行い、`useHandCursor: false` のインタラクティブオブジェクトが存在すると、ボタンのヒットテストに干渉するリスクあり
- `gameOverOverlay` は `DEPTH.GAMEOVER + 1`（10001）で非表示時は `visible = false` だが、`setInteractive()` が残っている

### 3. z-index / 深度競合
- DEPTH: STATUS 500 / LOG_BG 600 / LOG_TEXT 610 / COMMAND 700 / GAMEOVER 10000
- ボタンのヒット領域は `DEPTH.COMMAND + 3`（703）で背景（700）より上
- 深度順序自体は正しいが、**背景矩形のインタラクティブ設定が不要**で、入力処理の競合要因となり得る

## 根本原因
- **リスナー未登録ではない**（登録済み）
- **伝播阻害の可能性**: 背景矩形の不要な `setInteractive()` により、Phaser の入力ヒットテストで競合が発生し、ボタンの `pointerdown` が無反応になるケースがある
- **修正方針**:
  1. `createCommandPanel()` の背景矩形から `setInteractive()` を削除
  2. `gameOverOverlay` の `setInteractive()` が不要なら削除、または非表示時に無効化
  3. 外部DOM（main.ts）のボタンは `click` イベントで直接発火しており、伝播競合なし

## 修正方針（文書化済み）
- HudScene.ts の背景インタラクティブ削除
- 深度競合確認済み（順序は正しい）
- イベント登録は正常、修正は背景インタラクティブ削除に集中
