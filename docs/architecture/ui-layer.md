---

title: UIレイヤー設計（Phaser Canvas内UI）
description: Phaser.jsのCanvas内に統合するステータスバー・コマンドパネル・ログコンソール・ゲームオーバーのレイアウトとスタイリング仕様。DOM/Phaserハイブリッドから完全統一されたCanvas UIへの移行戦略。
status: draft
version: "0.2"
category: architecture
tags:
- architecture
- ui
- phaser
- integration
  traces_to:
- docs/design/ui-integration.md
- docs/architecture/overview.md
  implemented_by:
- src/phaser/scenes/*
- src/phaser/config.ts
  verified_by:
- scripts/validate-docs.mjs

---

# UIレイヤー設計

> **目的:** DOM/PhaserハイブリッドなUIをPhaser Canvas内に統一するためのレイヤー構成とスタイリング仕様を定義する。
> **最新:** v0.2（v0.1は前身の「統合設計策定」）

## ── 概要

`src/ui/` で管理されてきたステータスバー・コマンドパネル・ログコンソール・GameOverオーバーレイをPhaser.js Canvas内に再配置する。DOMによる残存を最小化し、PhaserのComposite構造に従う一方向のUI設計とする。

## ── Canvas内UIレイヤー構成

```
┌─────────────────────────────────────────────────┐
│ Layer 4: Game Over Overlay                       │  z-depth 最高
├─────────────────────────────────────────────────┤
│ Layer 3: Command Panel (Action Buttons)          │ z=999
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

DOM要素を最小限にする。以下のDOM IDが残る：

| DOM ID           | 残存理由                                      |
| ---------------- | --------------------------------------------- |
| `game-container` | Phaser Canvas wrapper div（Layout安定のため） |

残HTML CSS: `@media (max-width: ...)` モバイル用 font-size 調整のみ
残JS: `main.ts` 内でPhaser UIの初期化のみ

## ── トレーサビリティ

- [[docs/design/ui-integration.md]] — UI統合詳細仕様
- [[docs/architecture/overview.md]] — 既存アーキテクチャ依存関係
- [[src/phaser/scenes/StreetScene.ts]] — StreetScene UI実装
- [[src/phaser/scenes/ShopScene.ts]] — ShopScene UI実装
- [[src/phaser/scenes/TerminalScene.ts]] — TerminalScene UI実装
- [[src/phaser/config.ts]] — Phaser設定・レイヤー基準
