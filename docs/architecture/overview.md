---

title: 技術アーキテクチャと依存関係
description: プロジェクトの依存方向と技術アーキテクチャを定義。フォワードのみの依存関係、2Dレトロ描画の要件、Core/Phaser/UIの責務分離。
status: draft
version: "0.1"
category: architecture
tags:
- architecture
- design
- dependency
  traces_to:
- docs/design/game-loop.md
- docs/design/mechanics.md
  implemented_by:
- src/main.ts
- src/phaser/config.ts
- src/core/GameEngine.ts
- src/ui/index.ts
  verified_by:
- tests/integration/game-loop.test.ts

---

# 技術アーキテクチャと依存関係

## ── フォワードのみの依存関係

```
src/data/  ──┐
src/balance/ ─┤
              ├──> src/core/ ──> src/phaser/ ──> src/ui/
src/localization/ ─┘   (Phaser非依存)   (描画層)    (DOMオーバレイ)
```

- **上流（data/balance/localization）：** 読み取り専用。マスターデータとBalanceテーブルを保持する
- **中流（core）：** 純粋ゲームロジック。Phaser/DOM非依存
- **下流（phaser）：** Coreをimportして描画・アニメーション・入力処理
- **最下流（ui）：** Core状態を**読み取り専用**で参照し、UIを更新する。Coreの状態を書き換えない

## ── 技術仕様

| 項目           | 値                                            | 根拠                                    |
| -------------- | --------------------------------------------- | --------------------------------------- |
| エンジン       | Phaser.js 3                                   | 2D横スクロールレトロ描画とUI統合        |
| ビルドツール   | Vite                                          | 高速な開発・ビルド。esbuild + HMR       |
| 言語           | TypeScript                                    | 厳密な型安全性。安全なリファクタリング  |
| 論理解像度     | 960×540                                       | 横スクロールに適したアスペクト比。16:9* |
| ピクセルアート | `pixelArt: true`, `roundPixels: true`         | レトロな見た目                          |
| スケールモード | `Scale.FIT`                                   | 960×540 でフルスクリーン表示            |
| パフォーマンス | 60fps を目標。UI更新は DOM タイマーで非同期化 |

## ── フォルダごとの責務

### `src/core/` (純粋ロジック)

- `Resources.ts` — 資金/恐怖/狂信/警戒度トラッカー
- `GameState.ts` — フェーズFSM。勝敗条件。スナップショットメソッド
- `EventSystem.ts` — 型付きエミッタ
- `RNG.ts` — 決定論的乱数発生
- `actions/` — `runShop`, `spreadRumor`, `intimidate` など。純粋関数、副作用なし

### `src/phaser/` (描画・アニメーション・入力)

- `config.ts` — Phaser設定。pixelArt, roundPixels など
- `entities/` — スプライト・アニメーション・物理
- `managers/` — シーン・ゲームオブジェクト管理

### `src/ui/` (UIレイヤー：Phaser Canvas内)

- `index.ts` — UIイベント購読・ステータス更新（現在: DOM→Canvas移行中）
- UIは `EventSystem` を購読。`GameState` と `Resources` を読み取り専用で参照し、Phaser Canvas内のText/Graphicsオブジェクトを更新
- DOM残存: `index.html` の `game-container` wrapper div（Layout安定のため）

### `src/data/` (ゲームデータ)

- `dialogue/` — 会話テキストJSON
- `events/` — イベント定義JSON
- `items/` — アイテム定義JSON

### `src/balance/` (リソース調整)

- `Costs.ts` — 各操作のコストを保持
- `Thresholds.ts` — 警戒度上昇・フェーズ昇格の条件

### `src/localization/` (多言語)

- `ja.json` — デフォルト日本語テキスト
- `en.json` — フォールバック英語テキスト
- `index.ts` — `t('key', { var: value })` でリソース取得

## ── 依存関係規則

- `src/core/` は `src/phaser/` または `src/ui/` を**importしない**
- `src/phaser/` は `src/core/` をimport可能（描画のため）
- `src/ui/` は `src/core/` をimport可能（状態読み取りのため）
- `src/data/`, `src/balance/`, `src/localization/` は `src/core/` のみimport可能

## ── テスト可能な設計

- `src/core/` は DOMに依存しない（`happy-dom` でユニットテスト可能）
- `src/core/` の出力は完全なモック可能で、フィードバックテストに対応
- `src/phaser/` と `src/ui/` は `src/core/` をimportし、副作用で状態変化をテスト

> **参考:** AGENTS.md §2 (core headless テスト). この構造に従い、core のユニットテストは DOMに依存しないようにします。
