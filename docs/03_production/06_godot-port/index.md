# Godot移植プロジェクト (GDScript + Resource化)

## 概要
Phaser + TypeScript + Vite 構成の「Overlord Syndicate」を Godot 4.x (GDScript) へ移植する。
既存のコアロジック（`src/core/`）はフレームワーク非依存のため、GDScriptへ 1:1 移植可能。
データは JSON から Godot `Resource` (`.tres`) へ変換し、エディタで編集可能にする。

## 目標
- **機能完全互換**: 既存の全フロー（タイトル→章選択→ストーリー→捜査→弁論→エピローグ）が同等に動作
- **データ駆動の強化**: Resource化によりエディタ上でデータ編集・参照整合性チェック可能に
- **Webエクスポート対応**: Godot WASM エクスポートでブラウザ版も維持
- **開発効率向上**: GDScript のホットリロード・エディタ統合でイテレーション高速化

## スコープ外
- 新規機能追加・ゲームバランス変更
- アセットの再制作（既存 `public/assets/` を流用）
- 多言語の新規追加（既存 ja/en のみ）

## ドキュメント構成
- [アーキテクチャ決定記録](adr.md)
- [Resourceシステム設計](resource-system.md)
- [移植フェーズ・タスク分解](phases.md)
- [変換ツール・パイプライン](conversion-pipeline.md)
- [GDScript コーディング規約](coding-standards.md)
- [CI/CD 設定](ci-cd.md)