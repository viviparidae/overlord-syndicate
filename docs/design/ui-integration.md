---

title: UI統合設計（Phaser Canvas統一）
description: 既存のDOMステータスバー・コマンドパネル・ログコンソール・ゲームオーバーをPhaser Canvas内に統合するための詳細設計と移行計画。実装フェーズ別のステップと品質基準を含む。
status: draft
version: "0.2"
category: design
tags:
- design
- ui-integration
- phaser
- migration
  traces_to:
- docs/architecture/ui-layer.md
- docs/architecture/input-system.md
- docs/architecture/overview.md
  implemented_by:
- src/phaser/scenes/StreetScene.ts
- src/phaser/scenes/ShopScene.ts
- src/phaser/scenes/TerminalScene.ts
- src/main.ts
  verified_by:
- scripts/validate-docs.mjs

---

# UI統合設計

> **目的:** 既存のDOMステータスバー・コマンドパネル・ログコンソール・ゲームオーバーをPhaser Canvas内に統一し、ハイブリッドDOM/Phaser構造から完全なCanvas UIへ移行する。

## ── 現状の課題

| 項目           | 現状                                                    | 課題                                        |
| -------------- | ------------------------------------------------------- | ------------------------------------------- |
| ステータスバー | `index.html` の `<header class="status-bar">` にDOM要素 | DOMとPhaserが分離しており、双方向管理が煩雑 |
| コマンドパネル | `<div class="command-panel">` にDOMボタン               | ボタン表示とPhaserゲームロジックが別管理    |
| ログコンソール | `<div class="log-console">` にDOMログ                   | イベント発行とDOM描画が2重管理              |
| ゲームオーバー | `position: fixed` のDOMオーバーレイ                     | Phaser描画とDOM表示が重複                   |

## ── 移行目標

| 目標                           | 達成指標                                                                  |
| ------------------------------ | ------------------------------------------------------------------------- |
| ステータスバー完全統合         | `src/ui/index.ts` の `updateStatusBar` をPhaser Text更新に置き換          |
| コマンドパネル完全統合         | `index.html` の `<button>` 3個をPhaser Graphicsボタンに置き換             |
| ログコンソール完全統合         | `addLogEntry` をPhaser Textエントリ追加に置き換                           |
| ゲームオーバーオーバーレイ統合 | DOM `gameOverOverlay` をPhaser Graphicsに置き換                           |
| DOM残存最小化                  | `game-container` wrapper divのみを残し、DOMボタン/ログ/オーバーレイを除去 |
| 入力統一                       | タッチ/マウス/キーボードをPhaserイベントで統一                            |

## ── 実装フェーズ

### Phase 1: 準備（レイヤー設計と新規UIオブジェクト作成）

| ステップ | 内容                                                               | 関連ファイル                        |
| -------- | ------------------------------------------------------------------ | ----------------------------------- |
| 1.1      | `docs/architecture/ui-layer.md` 作成（レイヤー構成・各UI要素仕様） | `docs/architecture/ui-layer.md`     |
| 1.2      | `docs/architecture/input-system.md` 作成（入力マッピング）         | `docs/architecture/input-system.md` |
| 1.3      | 各SceneにPhaser Graphicsによるステータスバー作成メソッドを追加     | `src/phaser/scenes/*.ts`            |
| 1.4      | 各SceneにPhaser Graphicsによるコマンドパネル作成メソッドを追加     | `src/phaser/scenes/*.ts`            |

### Phase 2: ステータスバー統合

| ステップ | 内容                                                    | 関連ファイル                |
| -------- | ------------------------------------------------------- | --------------------------- |
| 2.1      | `StatusBar` クラス作成（Graphics + Text 4リソース表示） | 新規ファイル または Scene内 |
| 2.2      | `EventSystem.resourcesChanged` 購読で `setText` 更新    | `src/ui/index.ts` + Phaser  |
| 2.3      | `index.html` の `<header class="status-bar">` を非表示  | `index.html`                |

### Phase 3: コマンドパネル統合

| ステップ | 内容                                                      | 関連ファイル               |
| -------- | --------------------------------------------------------- | -------------------------- |
| 3.1      | 各Sceneにタッチボタン作成メソッドを追加 (Graphics + Text) | `src/phaser/scenes/*.ts`   |
| 3.2      | `EventSystem.actionExecuted` 購読でボタン無効/有効制御    | `src/ui/index.ts` + Phaser |
| 3.3      | `index.html` の `<div class="command-panel">` を非表示    | `index.html`               |

### Phase 4: ログコンソール統合

| ステップ | 内容                                                 | 関連ファイル                |
| -------- | ---------------------------------------------------- | --------------------------- |
| 4.1      | Log Console Graphics + Textエントリ管理クラス作成    | 新規ファイル または Scene内 |
| 4.2      | `addLogEntry` をPhaser Textエントリ追加に置き換      | `src/ui/index.ts` + Phaser  |
| 4.3      | `index.html` の `<div class="log-console">` を非表示 | `index.html`                |

### Phase 5: ゲームオーバーオーバーレイ統合

| ステップ | 内容                                                       | 関連ファイル               |
| -------- | ---------------------------------------------------------- | -------------------------- |
| 5.1      | Game Over Overlay Graphics + Textモーダル作成              | `src/phaser/scenes/*.ts`   |
| 5.2      | `showGameOver()` をPhaser Overlay表示に置き換              | `src/ui/index.ts` + Phaser |
| 5.3      | `index.html` の `<div class="game-over-overlay">` を非表示 | `index.html`               |

### Phase 6: 清掃と検証

| ステップ | 内容                                                    | 関連ファイル      |
| -------- | ------------------------------------------------------- | ----------------- |
| 6.1      | 残DOM UI要素（ボタン・ログ・オーバーレイ）を除去        | `index.html`      |
| 6.2      | `src/ui/` のDOM操作コードをPhaser版に統合               | `src/ui/index.ts` |
| 6.3      | `main.ts` でDOMイベントリスナーをPhaser版に統一         | `src/main.ts`     |
| 6.4      | `pnpm lint`、`pnpm typecheck`、`pnpm test:run` 実行     | 全テスト          |
| 6.5      | E2Eテストで全画面サイズ（モバイル・デスクトップ）を検証 | `tests/e2e/`      |

## ── UI要素間の依存関係

```
GameScene (z=0)
  ↓
Status Bar (z=800)      ← EventSystem.resourcesChanged, phaseChanged
  ↓
Log Console (z=900)     ← EventSystem.actionExecuted
  ↓
Command Panel (z=999)   ← タッチ/ポインターイベント
  ↓
Game Over Overlay (z=最高) ← EventSystem.gameOver
```

## ── 品質基準

| 項目             | 基準                                                        |
| ---------------- | ----------------------------------------------------------- |
| レンダリング     | 全UI要素がPhaser Canvas内で描画される（DOMボタン/ログ除去） |
| 入力統一         | キーボード + タッチ + マウスですべてのUI操作が可能          |
| レスポンシブ     | モバイル/デスクトップ両方でタップターゲット最小44px         |
| パフォーマンス   | UI更新はイベント駆動（毎フレーム再描画なし）                |
| アクセシビリティ | 全機能がキーボード操作可能                                  |
| テスト           | E2Eでボタン動作・ステータス更新・シーン遷移を検証           |

## ── トレーサビリティ

- [[docs/architecture/ui-layer.md]] — UIレイヤー設計
- [[docs/architecture/input-system.md]] — 入力システム設計
- [[docs/architecture/overview.md]] — アーキテクチャ概要
- [[docs/qa/test-plan.md]] — テスト計画
- [[src/phaser/scenes/StreetScene.ts]] — StreetScene実装
- [[src/phaser/scenes/ShopScene.ts]] — ShopScene実装
- [[src/phaser/scenes/TerminalScene.ts]] — TerminalScene実装
- [[src/ui/index.ts]] — UIイベント購読実装
- [[src/main.ts]] — エントリポイント
