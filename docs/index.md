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

## 8. UI統合

[[docs/architecture/ui-layer]] — UIレイヤー設計（Phaser Canvas内UI）
[[docs/architecture/input-system]] — 入力システム設計（Phaser Canvas統合）
[[docs/design/ui-integration]] — UI統合設計（Phaser Canvas統一）
