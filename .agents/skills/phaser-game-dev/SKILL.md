---
name: phaser-game-dev
description: Overlord Syndicate の Phaser.js シーン、スプライト、入力処理、ゲームループを実装する。ビジュアルレイヤ、Canvas-DOM統合、1990年代レトロスタイリングに使用。
---
# Skill: phaser-game-dev

## 説明
Overlord Syndicate の Phaser.js シーン、スプライト、入力処理、ゲームループを実装する。

## 使用時
以下の作業を行う際に使用する本.skill:
- シーン管理 (BootScene, StreetScene, ShopScene, TerminalScene)
- AssetManager 経由のスプライト/アセット読み込み
- キーボード/タッチ入力の割り当て (WASD, Enter, Space でコマンド実行)
- アニメーション定義 (プレイヤーの待機、NPC とのインタラクション)
- Canvas と DOM UI の統合

## 主要API
- `src/phaser/config.ts` — Phaser.GameConfig (960x540, pixelArt: true, roundPixels: true)
- `src/phaser/managers/AssetManager.ts` — アセット読み込み、プレースホルダースプライトを生成
- `src/phaser/entities/Player.ts` — 待機/歩行アニメーションを持つプレイヤースプライト
- `src/main.ts` — エントリポイント、`new Phaser.Game(config)` を生成

## 制約
- `src/core/` のロジックを core へインポートし直すこと禁止 — phaser レイヤーは core のみに依存
- 60fps 目標: `setDepth`、オブジェクトプール、GC プレッシャーの回避を活用
- ピクセルアート: テクスチャ設定で `antialias: false`、GameConfig で `pixelArt: true`
- UI ボタンへのクリックイベントは canvas に到達する前に `stopPropagation()` を呼ぶ