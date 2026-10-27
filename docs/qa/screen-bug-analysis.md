---

title: 画面問題点分析（2026-10-25）
description: 外部アクセス確認時の画面（黒画面・レイアウト崩れ・ログ切れ）の分析と修正プラン
status: approved
version: "0.1"
category: qa
tags:
- qa
- ui-layer
- phaser
- bug-analysis
  traces_to:
- docs/design/ui-integration.md
  implemented_by:
- src/main.ts
  verified_by:
- tests/e2e/command-panel.spec.ts

---

# 画面問題点分析（2026-10-25）

## 確認画面

- `http://192.168.40.54:5173/`（Vite dev server / 外部LANアクセス）
- ブラウザスクリーンショット: `Screenshot_20261025-164049.png`

## 問題点

1. Phaser描画レイヤー（中央）が黒いまま（ロード/初期化失敗の可能性）
2. Canvas内ステータスバー・ログコンソールが上部に押しやられている
3. ログテキストが小さい/切れている
4. DOMボタン（店番をする/噂を流す/脅迫する）が画面下端に押し付けられている
5. PhaserとDOMのハイブリッドUI統合が不完全（設計ドキュメントに対して実装が追いついていない）

## 修正方針

- ドキュメント修正 → TDD（テスト→実装）
