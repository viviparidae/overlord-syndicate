# Plan: FOAM スマートフォルダによる docs/ ドキュメントの仮想フォルダ整理

> **ステータス:** 実装可能 (implementation-ready)  
> **言語:** 日本語  
> **作者:** Kilo (plan agent)

---

## 1. 目的

FOAM の **Smart Folders** 機能を活用し、`docs/` 配下の設計ドキュメントをステータス・カテゴリ・タグで動的にグルーピングする仮想フォルダを設定する。これにより VS Code エクスプローラーのサイドバーから、状態や分類ごとにドキュメントを横断して参照・ナビゲートできるようにする。

---

## 2. 現状と課題

| 項目 | 現状 | 課題 |
|------|------|------|
| FOAM 管理 | `docs/` をワークスペースルートとして `[[wiki-link]]` で相互参照 (AGENTS.md §1.2) | スマートフォルダ（動的グループ化）が未設定 |
| frontmatter | 全ドキュメントに `status`, `category`, `tags`, `traces_to`, `implemented_by`, `verified_by` 等を付与 | フロントマター情報はあるが、VS Code サイドバー上での動的フィルタ表示ができない |
| `.foam/` ディレクトリ | 未作成 | FOAM Smart Folder 用の `.foam/queries/*.yaml` を置く場所がない |
| MD Editor Plus 連携 | `.vscode/settings.json` でボード・テーブルビューを `status` で分割 | Smart Folder と MD Editor Plus のビューが連携していない |

---

## 3. 設計方針（決定事項）

### 3.1 スマートフォルダ定義（`.foam/queries/*.yaml`）

| スマートフォルダ名 | 対象ドキュメント | 用途 | フィルタ（jexl / tag / path） |
|---|---|---|---|
| `status-draft` | `status == draft` | 作業中ドキュメント一覧 | `jexl: "resource.properties.status == 'draft'"` |
| `status-review` | `status == review` | レビュー待ちドキュメント一覧 | `jexl: "resource.properties.status == 'review'"` |
| `status-approved` | `status == approved` | 承認済みドキュメント一覧 | `jexl: "resource.properties.status == 'approved'"` |
| `status-deprecated` | `status == deprecated` | 廃止予定ドキュメント一覧 | `jexl: "resource.properties.status == 'deprecated'"` |
| `category-design` | `category == design` | ゲームデザイン関連ドキュメント | `jexl: "resource.properties.category == 'design'"` |
| `category-architecture` | `category == architecture` | アーキテクチャ関連ドキュメント | `jexl: "resource.properties.category == 'architecture'"` |
| `category-balance` | `category == balance` | バランス調整関連ドキュメント | `jexl: "resource.properties.category == 'balance'"` |
| `category-qa` | `category == qa` | 品質保証・テスト関連ドキュメント | `jexl: "resource.properties.category == 'qa'"` |
| `category-localization` | `category == localization` | ローカライゼーション関連ドキュメント | `jexl: "resource.properties.category == 'localization'"` |
| `orphaned` | バックリンクなし | 孤立ドキュメント（リンク元なし） | `jexl: "resource.backlinks|length == 0"` |
| `missing-verification` | `verified_by` 欠落 | 検証元未設定ドキュメント | `jexl: "resource.properties.verified_by == null \|\| resource.properties.verified_by|length == 0"` |

- 各 YAML は `format: table`、`select: [title, path, status, category]`、`sort: title ASC` を基本とする
- `path` フィルタ（`^/docs/`）は暗黙的に適用（ワークスペースルートが `docs/` なので不要）
- `status-draft` / `status-review` / `status-approved` / `status-deprecated` は MD Editor Plus ボードビューの 4 カラムと一致させる

### 3.2 ファイル配置

| パス | 内容 |
|------|------|
| `.foam/queries/status-draft.yaml` | ステータス別スマートフォルダ |
| `.foam/queries/status-review.yaml` | 同上 |
| `.foam/queries/status-approved.yaml` | 同上 |
| `.foam/queries/status-deprecated.yaml` | 同上 |
| `.foam/queries/category-design.yaml` | カテゴリ別スマートフォルダ |
| `.foam/queries/category-architecture.yaml` | 同上 |
| `.foam/queries/category-balance.yaml` | 同上 |
| `.foam/queries/category-qa.yaml` | 同上 |
| `.foam/queries/category-localization.yaml` | 同上 |
| `.foam/queries/orphaned.yaml` | 孤立ドキュメント |
| `.foam/queries/missing-verification.yaml` | 検証未設定ドキュメント |
| `docs/foam-smart-folders.md` | スマートフォルダの運用ガイド（`[[wiki-link]]` で index.md から参照） |

### 3.3 AGENTS.md 更新

セクション 1.2（ドキュメント管理 FOAM）の末尾にスマートフォルダ活用項を追加：

```
### スマートフォルダ（FOAM Smart Folders）

- `.foam/queries/*.yaml` に保存済みクエリを配置し、VS Code エクスプローラーのサイドバーにスマートフォルダとして表示する
- ステータス（draft/review/approved/deprecated）・カテゴリ（design/architecture/balance/qa/localization）・孤立ドキュメント・検証未設定ドキュメントごとにフォルダを分割する
- `docs/foam-smart-folders.md` で運用手順を記述し、`docs/index.md` から `[[wiki-link]]` を参照する
```

---

## 4. タスク一覧

| # | タスク | 内容 | 対象ファイル |
|---|--------|------|-------------|
| 1 | `.foam/queries/` ディレクトリ作成 | スマートフォルダ用クエリ置き場を作成 | `.foam/queries/` |
| 2 | ステータス別スマートフォルダ作成 | `status-draft/review/approved/deprecated.yaml` を作成 | `.foam/queries/` |
| 3 | カテゴリ別スマートフォルダ作成 | `category-design/architecture/balance/qa/localization.yaml` を作成 | `.foam/queries/` |
| 4 | 孤立・検証未設定スマートフォルダ作成 | `orphaned.yaml`, `missing-verification.yaml` を作成 | `.foam/queries/` |
| 5 | 運用ガイドドキュメント作成 | スマートフォルダの使い方・フィルタ構文を記述 | `docs/foam-smart-folders.md` |
| 6 | `docs/index.md` へリンク追加 | `[[docs/foam-smart-folders]]` 参照を追加 | `docs/index.md` |
| 7 | AGENTS.md セクション 1.2 更新 | スマートフォルダ活用項を追記 | `AGENTS.md` |
| 8 | 検証 | `pnpm docs:validate` が PASS、YAML 構文エラーなし | 全 |

---

## 5. 影響範囲

- `.foam/queries/` — 新規作成（11ファイル）
- `docs/foam-smart-folders.md` — 新規作成
- `docs/index.md` — `[[wiki-link]]` 参照追加（1行追加）
- `AGENTS.md` — セクション 1.2 末尾にスマートフォルダ項追加
- 既存の `docs/**/*.md` への変更なし（frontmatter は既に整備済み）

---

## 6. 検証基準

- `.foam/queries/*.yaml` が YAML として構文的に有効であること
- 各スマートフォルダの `jexl` フィルタがドキュメントの frontmatter プロパティ（`status`, `category`, `verified_by`、`backlinks`）に対して正しく解決されること
- `docs/foam-smart-folders.md` に frontmatter（`title`, `description`, `status`, `version`, `category`, `tags`, `traces_to`, `implemented_by`, `verified_by`）が付与されていること
- `docs/index.md` から `[[docs/foam-smart-folders]]` へのリンク先が存在すること（切れリンクなし）
- `pnpm docs:validate` が PASS（全ドキュメントの frontmatter・wiki-link 検証）
- `pnpm lint`、`pnpm typecheck` がエラー 0（非ソース変更のため影響なし、念のため確認）

---

## 7. リスクと制約

- **FOAM 拡張機能依存**: スマートフォルダは `foam.foam-vscode` 拡張機能がインストールされた VS Code 環境でのみ有効（ターミナル/Kilo 実行環境では表示されない）
- **Jexl 式の互換性**: `resource.properties` へのアクセスは FOAM の frontmatter 解析に依存。プロパティ名（`status`, `category`, `verified_by`）が frontmatter キーと一致していること
- **ワークスペーストラスト**: `foam-query-js` は使用しない（信頼ワークスペースが必要なため）。全クエリを YAML 形式で記述しサンドボックス内で実行
- **手動メンテナンス**: 新規ドキュメント追加時に smart folder の対象となるよう frontmatter を正しく付与する責務は変わらない

---

## 8. 推奨回答

上記設計方針でタスク 1〜8 を順に実行する。タスク 5 の `docs/foam-smart-folders.md` には、各スマートフォルダのフィルタ条件と VS Code サイドバーでの表示例をサンプル YAML 付きで記載する。

---

この plan を承認された場合、`implementation-capable` エージェントがタスク 1〜8 を実行できる。
