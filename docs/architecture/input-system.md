---

title: 入力システム設計（Phaser Canvas統合）
description: キーボード・マウス・タッチ・ポインター入力の統合処理設計。Phaser Canvas内に統合されるUI操作とゲーム入力の統一管理。
status: draft
version: "0.2"
category: architecture
tags:
- architecture
- input
- keyboard
- touch
- pointer
- phaser
  traces_to:
- docs/design/ui-integration.md
- docs/architecture/ui-layer.md
  implemented_by:
- src/phaser/scenes/StreetScene.ts
- src/phaser/scenes/ShopScene.ts
- src/phaser/scenes/TerminalScene.ts
- src/main.ts
  verified_by:
- tests/e2e/mobile.spec.ts

---

# 入力システム設計

> **目的:** キーボード、マウス、タッチ、ポインターの各入力をPhaser Canvas内で統一的に管理し、DOMハイブリッド入力を除去する。

## ── 概要

入力は `Phaser.Input.Keyboard` (キーボード) と `Phaser.Input.Pointer` (タッチ/マウス) の2系統で統一する。各Sceneは `create()` 内で入力ハンドラーを登録し、UIボタン・ゲーム操作・シーン遷移を共通のポインターイベントで処理する。

## ── 入力階層

```
入力階層:
  Keyboard Input (Phaser.Input.Keyboard)
      ↓
  Pointer Input (Phaser.Input.Pointer — touch + mouse)
      ↓
  Scene input handlers (createTouchControls() + keyboard handlers)
      ↓
  Scene methods (runShop(), spreadRumor(), enterShop(), etc.)
```

## ── シーン別入力マッピング

### StreetScene（メイン通り）

| 入力方式   | キー/位置          | アクション            |
| ---------- | ------------------ | --------------------- |
| キーボード | A / D / ← / →      | 左右移動              |
| キーボード | SPACE              | NPC対話 (噂収集)      |
| キーボード | E                  | 店に入る              |
| キーボード | T                  | 裏工作パネル          |
| タッチ     | 仮想D-Pad (左下)   | 左右移動 / タップ対話 |
| タッチ     | Eボタン (右下円形) | 店に入る              |
| タッチ     | Tボタン (右上円形) | 裏工作パネル          |

### ShopScene（文房具店）

| 入力方式   | キー             | アクション |
| ---------- | ---------------- | ---------- |
| キーボード | SPACE            | 店番を行う |
| キーボード | ESC              | 外へ出る   |
| タッチ     | 店番をするボタン | 店番を行う |
| タッチ     | 外へ出るボタン   | 外へ出る   |

### TerminalScene（裏工作パネル）

| 入力方式   | キー           | アクション |
| ---------- | -------------- | ---------- |
| キーボード | 1              | 噂を流す   |
| キーボード | 2              | 脅迫する   |
| キーボード | ESC            | 外へ出る   |
| タッチ     | 噂を流すボタン | 噂を流す   |
| タッチ     | 脅迫するボタン | 脅迫する   |
| タッチ     | 外へ出るボタン | 外へ出る   |

## ── ポインターイベント仕様

各Sceneは `create()` 内で `this.input.on('pointerdown', ...)` を登録し、座標判定でUI要素を識別する。

### タッチターゲット設計

| 要素          | サイズ (最小)         | 位置                 |
| ------------- | --------------------- | -------------------- |
| 仮想D-Pad     | 直径 140px (半径70px) | 左下 (60, height-60) |
| ボタン (円形) | 直径 112px (半径56px) | 右下 (Eボタン)       |
| ボタン (円形) | 直径 88px (半径44px)  | 右上 (Tボタン)       |
| ボタン (矩形) | 200px × 60px          | ShopScene下部        |
| ボタン (矩形) | 各 幅 280px × 60px    | TerminalScene下部    |

### タッチアクション定義

| タッチ位置      | 対応Scene     | アクション          |
| --------------- | ------------- | ------------------- |
| D-Pad左半分     | StreetScene   | 左移動              |
| D-Pad右半分     | StreetScene   | 右移動              |
| D-Pad中央       | StreetScene   | NPC対話 (SPACE相当) |
| 右下Eボタン領域 | StreetScene   | 店に入る            |
| 右上Tボタン領域 | StreetScene   | 裏工作パネル        |
| 店番をする領域  | ShopScene     | 店番を行う          |
| 外へ出る領域    | 全Scene       | 外へ出る            |
| 噂を流す領域    | TerminalScene | 噂を流す            |
| 脅迫する領域    | TerminalScene | 脅迫する            |

## ── 入力優先度

以下の優先順位で入力を処理する:
1. **PointerDown** (UIボタン判定優先)
2. **Keyboard** (ゲーム移動・ショートカット)
3. **PointerMove** (D-Pad方向判定のみ)

UIボタン領域内のポインター操作は、ゲーム移動を優先しない（ボタン領域内はUI優先）。

## ── 入力状態管理

### TouchDirection管理

```
TouchDirection = "none" | "left" | "right"
```

- `pointerdown` 時にD-Pad領域内で左右判定
- `pointermove` で方向更新、範囲外は `none`
- `pointerup` 時に `none` にリセット

### タップ状態管理

- D-Pad中央タップ: `touchTap = true` → `handleInteraction()` でNPC対話実行
- ポインターアップで `touchTap = false`

## ── DOM入力管理の除去

移行後、DOM外部の以下の入力管理を除去する:

| 除去項目                         | 代替                                      |
| -------------------------------- | ----------------------------------------- |
| DOM `button#shopBtn` click       | ShopScene タッチボタン + キーボード SPACE |
| DOM `button#rumorBtn` click      | TerminalScene タッチボタン + キーボード 1 |
| DOM `button#intimidateBtn` click | TerminalScene タッチボタン + キーボード 2 |
| `index.html`内コマンドパネル     | Phaser Canvas内コマンドパネル             |

## ── アクセシビリティ

| 項目             | 方針                                        |
| ---------------- | ------------------------------------------- |
| キーボードのみ   | 全UI機能がキーボードで操作可能              |
| タップターゲット | 最小44px (iOS HIG準拠)                      |
| フォーカス       | Phaserのtab順序を定義し、シーン遷移時に維持 |

## ── トレーサビリティ

- [[docs/design/ui-integration.md]] — UI統合設計
- [[docs/architecture/ui-layer.md]] — UIレイヤー設計
- [[src/phaser/scenes/StreetScene.ts]] — D-Pad + ボタン実装
- [[src/phaser/scenes/ShopScene.ts]] — タッチボタン実装
- [[src/phaser/scenes/TerminalScene.ts]] — タッチボタン実装
- [[src/main.ts]] — イベントブリッジと残DOM入力管理
- [[docs/architecture/mobile-support.md]] — モバイル対応方針 (既存)
