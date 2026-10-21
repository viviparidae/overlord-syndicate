# Plan: MD Editor Plus を活用したドキュメント管理とトレーサビリティ確保

> **ステータス:** 実装可能 (implementation-ready)  
> **言語:** 日本語  
> **作者:** Kilo (plan agent)

---

## 1. 目的

`Overlord Syndicate` の設計ドキュメント（`docs/`）とソースコード（`src/`）、テストファイル（`tests/`）の間のトレーサビリティ（要件 ↔ 設計 ↔ 実装 ↔ テスト）を **MD Editor Plus** + **FOAM** の frontmatter と wiki-link で確保する。

Front Matter CMS から MD Editor Plus に移行する理由:
- VS Code 標準の Markdown 機能を拡張し、軽量
- ツール依存を最小化（extension のみ、別設定ファイル不要）
- FOAM の `[[wiki-link]]` と相性が良い
- 検索・フィルタ・アウトライン表示が標準機能で利用可能

---

## 2. 現状と課題

| 項目 | 現状 | 課題 |
|------|------|------|
| Front Matter CMS 関連ファイル | `frontmatter.json`, `.frontmatter/frontmatter.yml`, `.frontmatter/database/` | 移行に伴い削除・整理が必要 |
| ドキュメント frontmatter | `status`, `version`, `traces_to`, `implemented_by`, `verified_by` 等を含む | MD Editor Plus 用に最適化（簡素化）が必要 |
| FOAM wiki-link | `docs/index.md` 等で使用 | 継続使用、MD Editor Plus のアウトライン/定義ジャンプと連携 |
| AGENTS.md ルール | §1.3 で Front Matter CMS トレーサビリティを定義 | MD Editor Plus 版に書き換え |

---

## 3. 設計方針（決定事項）

### 3.1 MD Editor Plus の活用範囲

| 機能 | 利用方針 |
|------|----------|
| **Outline / TOC 表示** | ドキュメント構造の把握・ナビゲーションに活用 |
| **Live Preview** | 執筆時のリアルタイム確認に活用 |
| **Wiki-link (`[[...]]`)** | FOAM と連携し、ドキュメント間・コード間の相互参照に活用 |
| **Frontmatter 表示/編集** | トレーサビリティフィールドの確認・更新に活用 |
| **定義ジャンプ (Go to Definition)** | `[[wiki-link]]` 先へジャンプ可能 |
| **検索 / ファジーファインダー** | `Cmd+P` / `Cmd+Shift+F` でドキュメント検索 |
| **テーブルビュー (Table View)** | frontmatter フィールドを列ヘッダーとし、ドキュメント一覧をテーブル表示 |
| **ボードビュー (Board / Kanban)** | `status` フィールドでカラム分割し、ドキュメントカードをドラッグで状態遷移 |
| **タスクリスト / チェックボックス** | ドキュメント内の作業進捗管理に活用 |

### 3.2 MD Editor Plus とは

MD Editor Plus (`AviranRevach/md-editor-plus`) は、**Notion スタイルのブロックエディタ**であり、Markdown ファイルをブロック単位で編集でき、以下の機能を提供します。

| 機能 | 利用方針 |
|------|----------|
| **Notion スタイルブロック編集** | ドキュメントを `ブロック` 単位で編集し、構造化コンテンツとして扱う |
| **Live Preview** | リアルタイムのプレビュー表示で執筆を支援 |
| **Wiki-link (`[[...]]`)** | FOAM と連携し、ドキュメント間・コード間の相互参照に活用 |
| **Frontmatter 表示/編集** | トレーサビリティフィールド (`status`, `version`, `traces_to`, `implemented_by`, `verified_by`) をブロック内で編集 |
| **定義ジャンプ (Go to Definition)** | `[[wiki-link]]` 先へジャンプ可能 |
| **検索 / ファジーファインダー** | `Cmd+P` / `Cmd+Shift+F` でプロジェクト内ドキュメント検索 |
| **タスクリスト / チェックボックス** | `[-]`, `[x]` 形式のチェックボックスで作業進捗管理 |

### 3.3 MD Editor Plus のボード (Kanban) 機能

MD Editor Plus は **ドラッグ・アンド・ドロップでの並べ替え** をサポートしています。以下のように運用します。

| 機能 | 設定値 | 説明 |
|------|--------|------|
| **ボードグループ分割** | `status` フィールド | `draft` / `review` / `approved` / `deprecated` の 4 カラムで分割 |
| **カード操作** | ドキュメントカードのドラッグ | `status` フィールドを更新し、ステータス遷移を可視化 |
| **カードプレビュー** | カード上に `title`, `traces_to` リンクを表示 | 関連設計ドキュメントへの即時ジャンプ |
| **ボード設定 (`.vscode/settings.json`)** | ```json { "md-editor-plus.board.enabled": true, "md-editor-plus.board.groupBy": "status", "md-editor-plus.board.columns": ["draft", "review", "approved", "deprecated"] }``` | ボードビューの有効化・列定義 |

### 3.4 MD Editor Plus のテーブル ビュー機能

MD Editor Plus は **テーブルブロック** (`| ... |`) をサポートし、以下のテーブル機能を提供します。

| 機能 | 設定値 | 説明 |
|------|--------|------|
| **テーブルヘッダー** | `title`, `category`, `status`, `version`, `implemented_by`, `verified_by`, `tags` | 一覧テーブルの列として表示 |
| **テーブルソート** | 列見出しクリックで昇順・降順ソート | ドキュメントの並べ替え |
| **テーブルフィルタ** | `status`, `category`, `tags` で絞り込み | 目的のドキュメントを素早く抽出 |
| **テーブル設定 (`.vscode/settings.json`)** | ```json { "md-editor-plus.table.enabled": true, "md-editor-plus.table.columns": ["title", "category", "status", "version", "implemented_by", "verified_by", "tags"], "md-editor-plus.table.defaultSort": "status-asc" }``` | テーブルビューの有効化・列定義・デフォルト並び順 |

### 3.5 Frontmatter スキーマ統一

Front Matter CMS 固有のフィールドを削除し、必要最小限にする：

| フィールド | 継続 | 理由 |
|------------|------|------|
| `title` | ✅ | 必須 |
| `description` | ✅ | 概要表示用 |
| `status` | ✅ | トレーサビリティ用（draft/review/approved/deprecated） |
| `version` | ✅ | バージョン管理用 |
| `category` | ✅ | カテゴリ分類用（小文字英語単数形） |
| `tags` | ✅ | タグ検索用 |
| `traces_to` | ✅ | 上流トレース用（相対パス） |
| `implemented_by` | ✅ | 実装トレース用（相対パス） |
| `verified_by` | ✅ | 検証トレース用（相対パス） |
| `draft` | ❌ | `status` に統合 |
| `date` | ❌ | 不要 |
| `preview` | ❌ | 不要 |
| `categories` | ❌ | `category` に統合 |

### 3.6 FOAM wiki-link の標準化

- ドキュメント間: `[[docs/design/resources]]` 形式
- ドキュメント→コード: `` [`src/core/Resources.ts`](src/core/Resources.ts) `` 形式（マークダウンリンク）
- MD Editor Plus の定義ジャンプで `[[...]]` を解決可能

### 3.7 AGENTS.md ルール更新

セクション 1.2（FOAM）の末尾を以下に置き換え:

```
### 1.3 トレーサビリティ（MD Editor Plus + FOAM）

- `docs/` のすべての `.md` ファイルに frontmatter を付与し、`status`, `version`, `traces_to`, `implemented_by`, `verified_by` を設定する。
- `[[wiki-link]]` でドキュメント間・ドキュメント↔コード間のトレースを表現する。
- MD Editor Plus の Outline / 定義ジャンプ / 検索 / ボードビュー（Kanban）/ テーブルビューを活用し、ドキュメント構造とトレースを確認する。
- 実装変更時は対応する `.md` の `implemented_by` / `version` を同時に更新し、doc drift を防ぐ。
```

### 3.8 MD Editor Plus インストールガイド

MD Editor Plus は VS Code マーケットプレイス（Open VSX / Visual Studio Marketplace）から `AviranRevach/md-editor-plus` として公開されています。

1. VS Code マーケットプレイスで `MD Editor Plus` を検索しインストール
2. コマンドパレット (`Cmd+Shift+P` / `Ctrl+Shift+P`) で `MD Editor Plus: Open Preview` を実行し、リアルタイムプレビューを確認
3. `.md` ファイルの先頭に frontmatter を YAML 形式で記述（`---` で囲む）
4. ボードビュー: コマンドパレットから `MD Editor Plus: Toggle Board View` を実行し、`status` フィールドでカラム分割された Kanban ボードを表示
5. テーブルビュー: コマンドパレットから `MD Editor Plus: Toggle Table View` を実行し、`title`/`category`/`status`/`version`/`implemented_by`/`verified_by` を列ヘッダーとしたテーブルを表示
6. `.vscode/settings.json` に board/table 設定を追加し、チーム全体で同じビュー構成を共有する

---

## 4. タスク一覧

| # | タスク | 内容 | 対象ファイル |
|---|--------|------|-------------|
| 1 | Front Matter CMS 関連ファイル削除 | `frontmatter.json`, `.frontmatter/` を削除し、FM 設定を `.vscode/settings.json` から除去 | `frontmatter.json`, `.frontmatter/`, `.vscode/settings.json` |
| 2 | MD Editor Plus 設定追加 | `.vscode/settings.json` に board / table ビュー設定と frontmatter フィールド設定を追加 | `.vscode/settings.json` |
| 3 | ドキュメント frontmatter 統一 | 不要フィールド（`draft`, `date`, `preview`, `categories`）を削除。必須 9 フィールドを維持 | `docs/**/*.md` |
| 4 | ボード・テーブルビュー用ドキュメント追加 | ステータス遷移とトレース一覧をystic したテーブルブロックを含む運用ドキュメントを `docs/` に作成 | `docs/md-editor-plus-guide.md` |
| 5 | AGENTS.md ルール更新 | §1.3 を MD Editor Plus 版（board/table 活用を含む）に書き換え | `AGENTS.md` |
| 6 | CI 検証スクリプト更新 | `scripts/validate-frontmatter.mjs` を MD Editor Plus 対応に簡素化（必須フィールド・wiki-link・リンク先存在の検証を維持） | `scripts/validate-frontmatter.mjs`, `.github/workflows/ci.yml` |
| 7 | 実行検証 | `pnpm lint` / `pnpm typecheck` / `pnpm test:run` / `pnpm docs:validate` が PASS | 全 |

---

## 5. 影響範囲

- `frontmatter.json` — **削除**
- `.frontmatter/` — **削除**
- `.vscode/settings.json` — FM 設定削除、MD Editor Plus board/table 設定追加
- `docs/**/*.md` — frontmatter 統一
- `docs/md-editor-plus-guide.md` — 新規作成（board/table 運用ガイド）
- `AGENTS.md` — セクション 1.3 書き換え
- `scripts/validate-frontmatter.mjs` — 簡素化
- `.github/workflows/ci.yml` — 検証コマンドはそのまま使用

---

## 6. 検証基準

- `docs/` 内の全 `.md` ファイルに `title`, `description`, `status`, `version`, `category`, `tags`, `traces_to`, `implemented_by`, `verified_by` が存在すること
- `category` が小文字英語単数形に統一されていること
- `[[wiki-link]]` のリンク先ファイルが存在すること（切れリンクなし）
- `status` の値が `draft` / `review` / `approved` / `deprecated` のいずれかであること（ボード列と一致）
- MD Editor Plus でボードビュー（`status` 4 カラム）・テーブルビュー（7 列）・Outline・定義ジャンプ・検索が正常動作すること
- `pnpm lint`、`pnpm typecheck`、`pnpm test:run`、`pnpm docs:validate` がすべて PASS

---

## 7. リスクと制約

- **MD Editor Plus は拡張機能** のため、VS Code 環境前提（チーム全員がインストール必要）
- **設定キー名的リスク**: `md-editor-plus.*` の設定キーは拡張機能の実際の仕様为准。実装時に拡張機能に `package.json` の `contributes.configuration` を確認し、異なる場合は実キーへ修正する
- **Front Matter CMS のダッシュボード/タクソノミー機能は失われる**（代替: MD Editor Plus board/table ビュー + Outline + VS Code 標準検索）
- ボードのドラッグ操作は frontmatter の `status` 値を直接書き換えるため、CI の `docs:validate` が `status` の許容値を検証して整合性を保つ
- 手動更新の責務は変わらない（実装変更時の frontmatter 更新）

---

## 8. 推奨回答

上記の設計方針でタスク 1〜7 を順に実行する。タスク 2 の実施前に、拡張機能にインストール済みの `package.json` を確認し `md-editor-plus.*` 設定キーの実名を確定すること。

---

この plan を承認された場合、`implementation-capable` エージェントがタスク 1〜6 を実行できる。