---
title: ドキュメント索引
description: Overlord Syndicate プロトタイプ第二弾のドキュメントハブ。
status: draft
version: "0.1"
category: design
tags: [index, hub]
traces_to: []
implemented_by: []
verified_by: []
---

# Overlord Syndicate — プロトタイプ第二弾 ドキュメント

1990年代日本を舞台にした、横スクロール調査 × 仲裁廷アドベンチャー。
第一弾（`proto/v1`）のコード・設計は引き継がず、本ドキュメント群を正とする。

## 1. 企画

- [[docs/01_concept/vision]] — 企画書・体験の核・スコープ

## 2. ゲーム仕様

### 01. ゲームフロー・UI

- [[docs/02_game-spec/01_flow-ui/screen-transitions]] — 画面遷移図
- [[docs/02_game-spec/01_flow-ui/hud-controls]] — HUD・操作仕様

### 02. システム・ルール

- [[docs/02_game-spec/02_system-rules/game-loop]] — ゲームループ・進行
- [[docs/02_game-spec/02_system-rules/save-data-specs]] — セーブ・データ構造

### 03. レベルデザイン

- [[docs/02_game-spec/03_level-design/stage-gimmicks]] — ステージ構成・ギミック
- [[docs/02_game-spec/03_level-design/difficulty-curve]] — 難易度曲線・バランシング

## 3. 資産・実装ガイドライン

### 01. 共通規約

- [[docs/03_production/01_conventions/naming-conventions]] — ファイル・フォルダ命名規則
- [[docs/03_production/01_conventions/directory-structure]] — プロジェクト内階層ルール

### 02. プログラム・設計

- [[docs/03_production/02_code-architecture/architecture]] — 全体アーキテクチャ・設計思想
- [[docs/03_production/02_code-architecture/coding-standards]] — コーディング規約

### 03. アート・アニメーション

- [[docs/03_production/03_art-animation/2d-art-standards]] — 2Dスプライト・UI規格
- [[docs/03_production/03_art-animation/animations]] — アニメーション・ステート

### 04. サウンド・音声

- [[docs/03_production/04_audio/audio-specs]] — オーディオ仕様・再生トリガー
- [[docs/03_production/04_audio/audio-list]] — BGM/SE管理・発注リスト

## 4. 世界観・シナリオ

- [[docs/04_lore/story-timeline]] — ストーリープロット・年表
- [[docs/04_lore/character-settings]] — キャラクター設定資料
- [[docs/04_lore/narrative-rules]] — 叙述・情報開示規約（主人公の内面をいつ開示するか）

## 5. アーカイブ・ボツ案

- [[docs/05_archive/README]] — 没案・旧仕様の退避場所

## 用語

- **調査パート**: 横スクロールで現場を歩き、聞き込みと痕跡調べで証拠を集めるパート。
- **解決パート**: 商店街組合の臨時総会＝「仲裁廷」で、証言の矛盾を突くパート。
- **ムジュン**: 証言と証拠が食い違う箇所。証拠をつきつけて指摘する対象。
- **ミスカウント**: 解決パートでの誤答回数。上限に達するとゲームオーバー。
