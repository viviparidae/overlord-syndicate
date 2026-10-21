---
title: Overlord Syndicate ドキュメント索引
description: ゲームデザイン、技術設計、Balance、リソースなどのドキュメント一覧。
status: draft
version: "0.1"
category: project-management
tags:
  - index
  - documentation
traces_to:
  - docs/design/vision.md
  - docs/design/game-loop.md
  - docs/design/resources.md
  - docs/design/mechanics.md
  - docs/architecture/overview.md
  - docs/architecture/data-format.md
  - docs/architecture/save-format.md
  - docs/balance/costs.md
  - docs/balance/thresholds.md
  - docs/localization/ja-vs-en.md
  - docs/glossary.md
  - docs/qa/test-plan.md
  - docs/md-editor-plus-guide.md
  - docs/foam-smart-folders.md
  - docs/adr/0001-use-phaser-and-vite.md
implemented_by:
  - .vscode/settings.json
verified_by:
  - scripts/validate-docs.mjs
---

# ドキュメント索引

## 1. ゲームデザイン

[[docs/design/vision]] — ビジョン・ピッチ（1ページ設計書）
[[docs/design/game-loop]] — コアゲームループの説明
[[docs/design/resources]] — リソース定義とフェーズ進行
[[docs/design/mechanics]] — アクション・イベント仕様

## 2. アーキテクチャ

[[docs/architecture/overview]] — 技術アーキテクチャと依存関係
[[docs/architecture/data-format]] — ゲームデータJSONスキーマ（対話・イベント・アイテム）
[[docs/architecture/save-format]] — セーブ形式とバージョン管理

## 3. バランス

[[docs/balance/costs]] — Balanceコストテーブル（実行資金・物品代など）
[[docs/balance/thresholds]] — Balanceリソース上昇・警戒度上昇の閾値

## 4. ローカライゼーション・用語

[[docs/localization/ja-vs-en]] — ローカライゼーション規約とキー運用
[[docs/glossary]] — 用語集（表の顔/裏の顔/資金/恐怖/狂信/警戒度/フェーズ/シャッター商店街）

## 5. 品質保証

[[docs/qa/test-plan]] — テスト計画とカバレッジ目標

## 6. 意思決定記録

[[docs/adr/0001-use-phaser-and-vite]] — アーキテクチャ意思決定記録

## 7. FOAM スマートフォルダ

[[docs/foam-smart-folders]] — スマートフォルダによるドキュメント整理ガイド

---

## トレーサビリティ

各ドキュメントの frontmatter に以下を持たせ、双方向のトレースを成立させる。

| フィールド | 役割 | 値の形式 |
|-----------|------|---------|
| `traces_to` | 前提となる／関連する設計ドキュメント | `docs/...` 相対パス |
| `implemented_by` | この仕様を実装するソースファイル | `src/...` 相対パス |
| `verified_by` | この仕様を検証するテスト・検証手段 | `tests/...` 相対パス |

> このドキュメントは FOAM 拡張機能をサポートしています。`[[wiki-link]]` 構文で相互参照を記述します。