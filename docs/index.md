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
- docs/design/character-appearance.md
- docs/design/asset-pipeline.md
- docs/architecture/overview.md
- docs/architecture/data-format.md
- docs/architecture/save-format.md
- docs/architecture/mobile-support.md
- docs/architecture/ui-layer.md
- docs/architecture/input-system.md
- docs/design/ui-integration.md
- docs/balance/costs.md
- docs/balance/thresholds.md
- docs/localization/ja-vs-en.md
- docs/glossary.md
- docs/qa/test-plan.md
- docs/qa/external-dom-button-test-plan.md
- docs/qa/screen-bug-analysis.md
- docs/foam-smart-folders.md
- docs/adr/0001-use-phaser-and-vite.md
- docs/asset-licenses.md
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
[[docs/design/character-appearance]] — キャラクター外観設計
[[docs/design/asset-pipeline]] — アセットパイプライン

## 2. アーキテクチャ

[[docs/architecture/overview]] — 技術アーキテクチャと依存関係
[[docs/architecture/data-format]] — ゲームデータスキーマ（対話・イベント）
[[docs/architecture/save-format]] — セーブ形式とバージョン管理
[[docs/architecture/mobile-support]] — スマホ対応とタッチ入力

## 3. UI統合と入力

[[docs/architecture/ui-layer]] — UIレイヤー設計（Canvas内UI＋DOMボタンハイブリッド）
[[docs/architecture/input-system]] — 入力システム設計（Phaser Canvas統合）
[[docs/design/ui-integration]] — UI統合設計（DOMボタン＋Canvas UIハイブリッド）

## 4. バランス

[[docs/balance/costs]] — Balanceコストテーブル（実行資金・物品代など）
[[docs/balance/thresholds]] — Balanceリソース上昇・警戒度上昇の閾値

## 5. ローカライゼーション・用語

[[docs/localization/ja-vs-en]] — ローカライゼーション規約とキー運用
[[docs/glossary]] — 用語集（表の顔/裏の顔/資金/恐怖/狂信/警戒度/フェーズ/シャッター商店街）

## 6. 品質保証

[[docs/qa/test-plan]] — テスト計画とカバレッジ目標
[[docs/qa/external-dom-button-test-plan]] — 外部DOMボタン操作テスト計画（D-pad/E/T/SPACE/ESC キーコード整合性・欠落ボタン検出）
[[docs/qa/screen-bug-analysis]] — 画面問題点分析（2026-10-25）

## 7. プロジェクト管理・運用

[[docs/foam-smart-folders]] — Smart Folders (FOAM スマートフォルダ) 運用手順

## 8. 意思決定記録・ライセンス

[[docs/adr/0001-use-phaser-and-vite]] — アーキテクチャ意思決定記録
[[docs/asset-licenses]] — アセットライセンス一覧
