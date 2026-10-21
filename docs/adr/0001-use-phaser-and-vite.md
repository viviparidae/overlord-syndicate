---
title: アーキテクチャ意思決定記録
description: プロジェクトの重要なアーキテクチャ的な意思決定を追跡記録。
status: draft
version: "0.1"
category: rules
tags:
  - adr
  - architecture
  - decision

traces_to:
  - docs/architecture/overview.md
implemented_by:
  - .github/workflows/ci.yml (CI ピープル)
  - docs/ (関連ドキュメント群)

verified_by:
  - /review uncommitted (未コミット変更レビュー)
---
# アーキテクチャ意思決定記録

## ADR-0001: Phaser.js と Vite 採用

### 1. 決定の背景

1990年代の空気感を再現するための 2D レトロゲームエンジンが必要。Phaser.js は軽量で横スクロールに適し、Vite は高速開発とビルドを提供する。

### 2. 代替案

| 代替案 | 評価 |
|--------|------|
| PixiJS + Matter.js | 2D描画は可だが、イベント・入力管理に追加設定必要。学習コストが高い。 |
| Cocos2d-js | 2Dゲーム向けだが、商用ライセンスが必要。また重量級。 |
| 独自 Canvas ライブラリ | 開発期間が長期化。リソース不足。 |

### 3. 決定事項

- **Phaser.js 3** をエンジン採用。pixelArt / roundPixels でレトロ表示を実現。
- **Vite** をビルドツール採用。HMR と高速ビルドを実現。

### 4. 状況

- 2026-10-21: 承認済み (AGENTS.md に基づく)
- 2026-10-22: CI にビルド・テスト成功確認