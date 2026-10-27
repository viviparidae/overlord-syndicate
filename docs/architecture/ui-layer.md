---

title: UIレイヤー設計（Canvas内UI＋DOMボタンハイブリッド）
description: Phaser.js Canvas内（ステータスバー・ログコンソール）とCanvas外DOM（コマンドボタン）のハイブリッドUIレイヤー設計。DOMボタンとPhaserエンジンの責務分界とイベント結線を定義。
status: approved
version: "0.3"
category: architecture
tags:
- architecture
- ui
- phaser
- hybrid
  traces_to:
- docs/design/ui-integration.md
- docs/architecture/overview.md
  implemented_by:
- src/main.ts
- src/phaser/scenes/HudScene.ts
- src/phaser/scenes/StreetScene.ts
- src/phaser/config.ts
- src/phaser/scenes/HudScene.ts (fix: remove extra setInteractive on background/gameOverOverlay, t_21590ece)
  verified_by:
- scripts/validate-docs.mjs
- tests/e2e/command-panel.spec.ts (E2E verification of fixed pointerdown interaction, t_834a9986)

---

# UIレイヤー設計

> **目的:** Canvas内（ステータスバー・ログコンソール）＋ Canvas外DOM（コマンドボタン）のハイブリッドUI設計。DOMボタンをPhaserエンジンに結線し、Phaser Canvas内UIと責務分界を定義する。
> **最新:** v0.3（ハイブリッドUIレイヤー：Canvas内UI＋DOMボタン外部配置）

## ── 概要

| 目標                   | 達成指標                                                            |
| ---------------------- | ------------------------------------------------------------------- |
| ステータスバー完全統合 | Canvas内ステータスバーを `updateStatusBar` で維持                   |
| コマンドパネル構成     | `index.html` の `.external-controls` (D-pad + E/T/SPACE/ESC) を配置 |
| ログコンソール完全統合 | Canvas内ログを `addLogEntry` で維持                                 |
| ゲームオーバー統合     | DOMオーバーレイを維持せずPhaserで処理                               |
| DOM残存最小化          | `game-container` wrapper divのみを残す                              |
| 入力統一               | キーボード + タッチ + マウスを Phaserイベントで統一                 |
| パフォーマンス最適化   | UI更新はイベント駆動（毎フレーム再描画なし）                        |
| テスト                 | E2Eでボタン動作・ステータス更新を検証                               |
| 品質                   | タップターゲット最小44px、モバイル/デスクトップ両対応               |

`src/ui/` の管理コードは段階的に Phaser Canvas UI に移行する方針であり、DOM要素はコマンドパネルのみ残り、ステータスバー・ログは Canvas 内で統合管理する。DOM残存は最小化し、イベント結線は `src/main.ts` で `engine.execute()` へ橋渡しする。

## ── Canvas内UIレイヤー構成

```
┌─────────────────────────────────────────────────┐
│ Layer 4: Game Over Overlay                       │  z-depth 最高
├─────────────────────────────────────────────────┤
│ Layer 3: Command Panel (DOM Buttons)             │ z=999 (Canvas外DOM)
├─────────────────────────────────────────────────┤
│ Layer 2: Log Console                             │ z=900
├─────────────────────────────────────────────────┤
│ Layer 1: Status Bar                              │ z=800
├─────────────────────────────────────────────────┤
│ Layer 0: Game Scene (Street/Shop/Terminal)       │ z=0
└─────────────────────────────────────────────────┘
```

### 各レイヤーの役割

| レイヤー          | Phaser内での実装                         | zDepth | 配置     |
| ----------------- | ---------------------------------------- | ------ | -------- |
| Status Bar        | `Phaser.GameObjects.Rectangle` + `Text`  | 800    | 画面上部 |
| Command Panel     | `Graphics` + `Text` ボタン (roundedRect) | 900    | 画面下部 |
| Log Console       | `Graphics`背景 + `Text`エントリ          | 900    | 画面下部 |
| Game Over Overlay | 半透明矩形 + `Text` モーダル             | 最高   | 画面全体 |

## ── 各UI要素の詳細設計

### 1. Status Bar

```typescript
// 各Sceneで持続的に作成・更新
const statusBar = this.add.graphics();
statusBar.fillStyle(0x0f0f1a);
statusBar.fillRect(0, 0, width, 50);

const fundsText = this.add.text(16, 6, `資金: ${formatCurrency(resources.funds)}`, { ... });
const fearText = this.add.text(180, 6, `恐怖: ${level}`, { ... });
// faith, suspectも同様

const phaseText = this.add.text(width / 2 - 100, 6, `${phase} — ${name}`, { ... });
```

**デザイン:**
- 背景: `#0f0f1a`（薄い黒）
- 各リソースの配色:
  - funds: `#4ade80`（緑）
  - fear: `#f87171`（赤）
  - faith: `#fbbf24`（黄）
  - suspect: `#f472b6`（ピンク）
  - phase: `#22d3ee`（青）
- 枠: 各要素の左右に `4px` の border
- フォント: `DotGothic16, monospace`
- フォントサイズ: `14px`

### 2. Command Panel（操作パネル）

```typescript
const panelBg = this.add.graphics();
panelBg.fillStyle(0x1a1a2e);
panelBg.fillRect(0, height - 70, width, 70);
panelBg.lineStyle(1, 0x333333);
panelBg.strokeRect(0, height - 70, width, 70);

const shopBtn = this.add.graphics();
shopBtn.fillStyle(0x000000, 0.6);
shopBtn.fillRoundedRect(40, height - 60, 180, 50, 8);
shopBtn.lineStyle(3, 0x4ade80, 0.9);
shopBtn.strokeRoundedRect(40, height - 60, 180, 50, 8);
const shopLabel = this.add.text(130, height - 35, "店番をする", { ... });
```

**デザイン:**
- 背景: `#1a1a2e`
- 外枠: `#e94560`（赤ネオン）3px
- ボタン矩形: 黒半透明 (`opacity: 0.6`)
- 各Sceneのボタン配置:
  - **StreetScene**: D-Pad + Eボタン + Tボタン
  - **ShopScene**: 店番オプションボタン + 外へ出るボタン
  - **TerminalScene**: 噂を流す / 脅迫する / 外へ出るボタン
- 最小タップターゲット: `44px`

### 3. Log Console

```typescript
const logBg = this.add.rectangle(0, 0, width, 120, 0x0f0f1a).setStrokeStyle(1, 0x222222);

const entry = this.add.text(0, logY, message, { ... });
entry.setOrigin(0, 0);
this.add.existing(entry);
```

**デザイン:**
- 背景: `#0f0f1a`（薄い黒）、境界 `#222222` 1px
- エントリースタイル:
  - system: `#4ade80`
  - warning: `#fbbf24`
  - error: `#f87171`
  - success: `#22d3ee`
- 各行の境界: `#222222` 1px
- アニメーション: fadeIn `opacity 0 → 1`（200ms ease Power2）

### 4. Game Over Overlay

```typescript
const overlay = this.add.graphics();
overlay.fillStyle(0x000000, 0.88);
overlay.fillRect(0, 0, width, height);

const box = this.add.rectangle(width/2, height/2, 300, 120, 0x1a1a2e)
  .setStrokeStyle(2, 0xe94560)
  .setOrigin(0.5);

const titleText = this.add.text(width/2, height/2 - 20, "ゲームオーバー", { ... });
const reasonText = this.add.text(width/2, height/2 + 20, "警戒度が100に達した...", { ... });
```

**デザイン:**
- 背景: `rgba(5,5,12,0.88)`（半透明黒）
- BOX: `#1a1a2e`、境界 `#e94560` 2px
- タイトル: `24px` `#e94560`
- 理由: `13px` `#e9e9e9`
- 配置: 画面中央

## ── 入力統合の設計

各Sceneの `create()` 内で入力イベントリスンを追加し、Phaser内で統一処理する。DOM外部の入力管理を除去する。

### キーボード入力

| Scene         | キー  | 入力         |
| ------------- | ----- | ------------ |
| StreetScene   | A / D | 左右移動     |
| StreetScene   | SPACE | NPC対話      |
| StreetScene   | E     | 店に入る     |
| StreetScene   | T     | 裏工作パネル |
| ShopScene     | SPACE | 店番         |
| ShopScene     | ESC   | 外へ出る     |
| TerminalScene | 1     | 噂を流す     |
| TerminalScene | 2     | 脅迫する     |
| TerminalScene | ESC   | 外へ出る     |

### タッチ入力

各Sceneの `createTouchControls()` メソッドを再利用する。`pointerdown`/`pointermove`/`pointerup` イベントをPhaser内で処理する。
- **D-Pad**: 左下 `(x=60, y=height-60)`, 半径 `70px`
- **アクションボタン**: 右側 `y = height - 90` から `height - 30`
- タップターゲット最小 `44px`（iOS HIG準拠）

### 入力レイヤー管理

```
入力階層:
  Keyboard Input (Phaser.Input.Keyboard)
      ↓
  Pointer Input (Phaser.Input.Pointer — touch + mouse)
      ↓
  Scene input handlers (createTouchControls() + keyboard handlers)
      ↓
  Scene methods (runShop(), spreadRumor(), etc.)
```

## ── 同期と描画最適化

### 状態更新タイミング

| イベント           | 更新方法                              |
| ------------------ | ------------------------------------- |
| `resourcesChanged` | 各Textオブジェクトを `setText` で更新 |
| `phaseChanged`     | Status Barの `phaseText` を更新       |
| `actionExecuted`   | Log Consoleのエントリを追加           |
| `gameOver`         | Overlayを表示                         |

### パフォーマンス最適化

- 各UI要素をSceneの `create()` 内で作成し、再作成を回避する
- 既存UI更新はscene-local referenceで参照し直す
- タッチイベントは `pointerdown` のみとする
- `Phaser.GameObjects` primitive (`Rectangle`, `Text`, `Graphics`) の再利用
- 未使用の tween は早期破棄する

## ── DOM残存管理

Canvas外の外部操作コントローラー（D-pad + アクションキー）を配置する。

| DOM ID / クラス                                                            | 残存理由                                                    |
| -------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `game-container`                                                           | Phaser Canvasラッパーdiv（16:9 レトロ画面）                 |
| `.external-controls`                                                       | Canvas外コントローラーのラッパー容器                        |
| `.dpad` (`#btn-up`, `#btn-down`, `#btn-left`, `#btn-right`, `#btn-center`) | 十字キー（矢印キー / Spaceイベントを dispatch）             |
| `.action-keys` (`#btn-e`, `#btn-t`, `#btn-space`, `#btn-esc`)              | E (店番), T (裏工作), SPACE (NPC対話), ESC (ストリート復帰) |

**外部コントローラー構成:**

```html
<div class="external-controls">
  <div class="dpad">
    <button type="button" id="btn-up" class="dpad-btn dpad-up">↑</button>
    <button type="button" id="btn-left" class="dpad-btn dpad-left">←</button>
    <button type="button" id="btn-center" class="dpad-btn dpad-center" disabled></button>
    <button type="button" id="btn-right" class="dpad-btn dpad-right">→</button>
    <button type="button" id="btn-down" class="dpad-btn dpad-down">↓</button>
  </div>
  <div class="action-keys">
    <button type="button" id="btn-e">E</button>
    <button type="button" id="btn-t">T</button>
    <button type="button" id="btn-space">SPACE</button>
    <button type="button" id="btn-esc">ESC</button>
  </div>
</div>
```

## ── トレーサビリティ

- [[docs/design/ui-integration.md]] — UI統合詳細仕様
- [[docs/architecture/overview.md]] — 既存アーキテクチャ依存関係
- [[src/phaser/scenes/StreetScene.ts]] — StreetScene UI実装
- [[src/phaser/scenes/ShopScene.ts]] — ShopScene UI実装
- [[src/phaser/scenes/TerminalScene.ts]] — TerminalScene UI実装
- [[src/phaser/config.ts]] — Phaser設定・レイヤー基準
- [[src/phaser/scenes/HudScene.ts]] — HUD統合UI実装
