---

title: スマホ対応とタッチ入力
description: スマートフォンでプレイ可能にする仮想D-Padとタッチボタンの実装設計。レトロスタイルの操作UIとレスポンシブレイアウト。
status: approved
version: "1.0"
category: architecture
tags:
- architecture
- mobile
- input
- touch
- ui
  traces_to:
- docs/architecture/overview.md
- docs/design/mechanics.md
  implemented_by:
- src/phaser/scenes/StreetScene.ts
- src/phaser/scenes/ShopScene.ts
- src/phaser/scenes/TerminalScene.ts
- src/phaser/types.ts
- index.html
  verified_by:
- tests/e2e/mobile.spec.ts

---

# スマホ対応とタッチ入力

> **ステータス:** approved (v1.0)  
> **関連:** [[docs/architecture/overview]]

## ── 概要

`Overlord Syndicate` をスマートフォンでプレイ可能にするため、Phaserシーンに仮想D-Padとタッチアクションボタンを追加した。キーボード入力は維持し、デスクトップとモバイルの両方で操作可能。

## ── 設計方針

| 項目             | 方針                                                |
| ---------------- | --------------------------------------------------- |
| 操作方式         | 仮想D-Pad (左下固定) + アクションボタン (右下/右上) |
| スタイル         | 1990年代レトロ: 赤ネオン枠 `#e94560` / `#f87171`    |
| 向ける向き       | 横画面優先 (`viewport-fit=cover` 対応)              |
| タップターゲット | 最小44px (iOS HIG準拠)                              |
| キーボード併存   | デスクトップは既存キー入力を維持                    |

## ── StreetScene (メインstreets)

### 仮想D-Pad

- **位置:** 画面左下 `(x=60, y=height-60)`, 半径 40px
- **デザイン:** 黒半透明塗り `#00000066`, 赤ネオン枠 `#e94560` 3px
- **左半分** (x < 60): 左移動
- **右半分** (x >= 60): 右移動
- **中央タップ** (距離40px以内): `SPACE` 相当 (NPC対話)

### アクションボタン

| ボタン   | 位置      | キー相当 | アクション   |
| -------- | --------- | -------- | ------------ |
| E (丸)   | 右下 64px | E        | 店に入る     |
| T (小丸) | 右上 44px | T        | 裏工作パネル |

## ── ShopScene / TerminalScene

- 画面下部に配置されたタッチボタンバー
- ShopScene: `[店番をする]` `[外へ出る]` (左右分割)
- TerminalScene: `[噂を流す]` `[脅迫する]` `[外へ出る]` (3分割)
- 最小タップターゲット: 44px × 60px

## ── レスポンシブHTML

`index.html` に `@media (max-width: 480px)` を追加:
- ステータスバー: フォント 14px, パディング 6px 8px
- コマンドパネルボタン: 最小 44px × 44px
- ログコンソール: 最小高 140px, フォント 12px
- Canvas: ボーダー 1px

## ── 入力抽象化

| 入力方法   | StreetScene          | ShopScene       | TerminalScene   |
| ---------- | -------------------- | --------------- | --------------- |
| キーボード | WASD / SPACE / E / T | SPACE / ESC     | 1 / 2 / ESC     |
| タッチ     | 仮想D-Pad + ボタン   | タッチボタン    | タッチボタン    |
| マウス     | (将来) クリック      | (将来) クリック | (将来) クリック |

## ── トレーシング

- [[docs/architecture/overview]] — アーキテクチャの依存関係
- [[docs/design/mechanics]] — ゲームメカニクス
- [[src/phaser/scenes/StreetScene.ts]] — 実装 (D-Pad + ボタン)
- [[src/phaser/scenes/ShopScene.ts]] — 実装 (店番/戻るボタン)
- [[src/phaser/scenes/TerminalScene.ts]] — 実装 (噂/脅迫/戻るボタン)
- [[tests/e2e/mobile.spec.ts]] — E2E検証 (モバイル viewport)
- [[docs/architecture/ui-layer]] — UIレイヤー設計
- [[docs/architecture/input-system]] — 入力システム設計

## ── UI統合に伴う追加事項

Phaser Canvas内にステータスバー・コマンドパネル・ログコンソール・ゲームオーバーを統合。DOM残存領域を最小化（`game-container` wrapper divのみ）。各UIボタン（touch target 44px以上）とD-Pad（左下固定）はtouch inputに対応。キーボード操作（A/D/SPACE/E/T/ESC）を維持。
