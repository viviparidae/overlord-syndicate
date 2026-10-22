---
name: md-editor-plus
description: 本プロジェクトの docs/ ディレクトリ配下の Markdown ページを frontmatter と [[wiki-link]] で管理し、ボードビュー（Kanban）とテーブルビューでトレーサビリティを可視化する。ドキュメント検索・一覧・検証に使用。
---
# Skill: MD Editor Plus 活用

## 説明
本プロジェクトの `docs/` ディレクトリ配下の Markdown ページを frontmatter と `[[wiki-link]]` で管理し、ボードビュー（Kanban）とテーブルビューでトレーサビリティを可視化する。Front Matter CMS への依存はない。

## 主要ファイル
- `docs/` 内のすべての `.md` ファイル（YAML frontmatter および `[[wiki-link]]` を含む）
- `.vscode/settings.json` — ボード／テーブルビュー設定
- `scripts/validate-docs.mjs` — frontmatter 必須フィールド・リンク切れの検証
- `docs/foam-smart-folders.md` — 運用手順

## frontmatter 必須フィールド (9 フィールド)
`scripts/validate-docs.mjs` の `REQUIRED_FIELDS` に対応する。1 つでも欠けると `pnpm docs:validate` が失敗する。

| フィールド | 必須 | 値の形式 |
|---|---|---|
| `title` | Yes | 日本語のタイトル |
| `description` | Yes | 日本語の要約 (1 文) |
| `status` | Yes | `draft` / `review` / `approved` / `deprecated` のいずれか |
| `version` | Yes | ダブルクォート付き `"0.1"` |
| `category` | Yes | `design` / `architecture` / `balance` / `localization` / `qa` / `project-management` / `rules` |
| `tags` | Yes | リスト形式 (`- tag`) |
| `traces_to` | Yes | リスト形式。`docs/...` 相対パス（リンク先実在必須） |
| `implemented_by` | Yes | リスト形式。`src/...` 相対パス（`tests/unit/` 等のディレクトリ指定も可） |
| `verified_by` | Yes | リスト形式。`tests/...` 相対パス（`（` / `レビュー` / `手動` を含む手動検証表記はスキップ） |

> **注意:** `docs/index.md` などの先頭行 `---\n...\n---\n` が閉じる前に `---` を挿入すると、frontmatter として解釈されず検証が壊れる。水平罫線として `---` を使う場合は本文内に置く。

## 設計方針
- 各ドキュメントの frontmatter をトレース情報（元設計 → 実装 → 検証）の唯一の情報源とする。
- `status` フィールド（`draft` / `review` / `approved` / `deprecated`）でボードビューを分割し、レビュー状態を可視化する。
- `traces_to` / `implemented_by` / `verified_by` でドキュメント間・ドキュメントとコード間の双方向トレースを成立させる。
- 定義ジャンプとファジーファインダーで関連ページの発見とリンク生成を行う。

## トリガー語
- `md-editor-plus`, `frontmatter`, `ボード`, `Kanban`, `テーブルビュー`, `wiki-link`, `トレーサビリティ`, `トレース`

## アクティベートタスク
- ドキュメント検索・一覧表示
- `status` によるボード分割でのレビュー状況の確認
- frontmatter データの抽出・列挙
- 関連ページの発見と wiki-link 生成
- 切れリンク・必須フィールド欠落の検証