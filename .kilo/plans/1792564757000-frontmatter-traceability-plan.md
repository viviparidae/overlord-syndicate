# Plan: Front Matter CMS を活用したトレーサビリティ確保

> **ステータス:** 実装可能 (implementation-ready)  
> **言語:** 日本語  
> **作者:** Kilo (plan agent)

---

## 1. 目的

`Overlord Syndicate` の設計ドキュメント（`docs/`）とソースコード（`src/`）、テストファイル（`tests/`）の間のトレーサビリティ（要件 ↔ 設計 ↔ 実装 ↔ テスト）を Front Matter CMS + FOAM の frontmatter と wiki-link で確保する。

## 2. 現状と課題

| 項目 | 現状 | 課題 |
|------|------|------|
| `frontmatter.json` スキーマ | `title`, `description`, `date`, `preview`, `draft`, `tags`, `categories` のみ | トレーサビリティ用フィールド（`status`, `version`, `traces_to`, `implemented_by`, `verified_by`）が未定義 |
| `frontmatter.yml` collection fields | `title`, `tags`, `category`, `description` のみ | 追加フィールドが認識されないため CMS フィルタ・グループ対象外 |
| 設計ドキュメント | `status`, `version` を使用中 | スキーマ未定義のため CMS 上で未認識のフィールド扱いとなる可能性 |
| `[[wiki-link]]` | `docs/index.md` 内で使用 | ドキュメント間・ドキュメント↔コード間のリンクが不十分 |
| タクソノミーダッシュボード | `tags`, `category` でグループ化 | トレーサビリティ用グループ（例: `traces_to` 先モジュール）なし |

## 3. 設計方針（決定事項）

### 3.1 Front Matter CMS フィールド拡張（`frontmatter.json`）

`default` コンテンツタイプに以下のフィールドを追加する（日本語ラベル、既存の英語識別子は維持）:

| name | type | 役割 |
|------|------|------|
| `status` | string | ドキュメント状態（draft / review / approved / deprecated） |
| `version` | string | ドキュメントバージョン（例: `0.1`） |
| `traces_to` | string[] | 参照対象の設計ドキュメントファイルパス（相互トレース） |
| `implemented_by` | string[] | 実装ソースファイルパス（例: `src/core/Resources.ts`） |
| `verified_by` | string[] | 検証テストファイルパス（例: `tests/core/Resources.test.ts`） |

`draft` は既存フィールドとして `status` と併用し、下位互換性を保つ。

### 3.2 `frontmatter.yml` collection fields 更新

`documents` コレクションの `fields` に以下を追加:

```
fields:
  - title
  - description
  - status
  - version
  - tags
  - category
  - traces_to
  - implemented_by
  - verified_by
```

### 3.3 各ドキュメント frontmatter 統一

全 `.md` ファイル（`docs/` 配下）に以下を必須付与する:

```yaml
---
title: <日本語タイトル>
description: <日本語概要>
status: draft | review | approved | deprecated
version: "0.1"
category: design | architecture | balance | localization | qa | project-management | rules
tags:
  - <トピック1>
  - <トピック2>
traces_to:
  - docs/design/vision.md
implemented_by:
  - src/core/Resources.ts
verified_by:
  - tests/core/Resources.test.ts
---
```

`category` 値は小文字・英語・単数形で統一（既存ドキュメントの `category` は一部小文字・一部複数形が混在しているため、統一が必要）。

### 3.4 FOAM wiki-link による相互参照

- 設計ドキュメント同士: `[[docs/design/resources]]` → `[[docs/design/mechanics]]`
- ドキュメント→コード: `[`src/core/Resources.ts`](src/core/Resources.ts)` 形式で相対パスリンク
- タグ・カテゴリによるグループ化を `taxonomyDb` のダッシュボードで表示

### 3.5 AGENTS.md ガイドライン追記

セクション 1.2（FOAM）の末尾に以下を追記:

```
### 1.3 トレーサビリティ（Front Matter CMS）

- `docs/` のすべての `.md` ファイルに frontmatter を付与し、`status`, `version`, `traces_to`, `implemented_by`, `verified_by` を設定する。
- `[[wiki-link]]` でドキュメント間・ドキュメント↔コード間のトレースを表現する。
- `frontmatter.json` の taxonomy にトレーサビリティフィールドを追加し、Front Matter CMS のフィルタ・グループ対象とする。
- 実装変更時は対応する `.md` の `implemented_by` / `version` を同時に更新し、doc drift を防ぐ。
```

## 4. タスク一覧

| # | タスク | 内容 | 対象ファイル |
|---|--------|------|-------------|
| 1 | Front Matter CMS スキーマ拡張 | `status`, `version`, `traces_to`, `implemented_by`, `verified_by` を `frontmatter.json` の taxonomy に追加 | `frontmatter.json` |
| 2 | collection fields 更新 | `frontmatter.yml` の `documents` fields にトレーサビリティフィールドを追加 | `.frontmatter/frontmatter.yml` |
| 3 | docs/ frontmatter 統一 | 全 `.md` に必須 frontmatter を付与。`category` を小文字英語単数形に統一 | `docs/**/*.md` |
| 4 | wiki-link 相互参照追加 | 設計ドキュメント同士とドキュメント↔コード間に `[[wiki-link]]` を追加 | `docs/**/*.md` |
| 5 | AGENTS.md ガイドライン追記 | セクション 1.3（トレーサビリティ）を追加 | `AGENTS.md` |
| 6 | CI 検証スクリプト追加 | frontmatter 検証（必須フィールド欠落チェック）を CI に追加 | `.github/workflows/ci.yml` |
| 7 | 実行検証 | `pnpm lint` / `pnpm typecheck` / `pnpm test:run` が PASS。Front Matter CMS でドキュメント検索・フィルタが動作することを確認 | 全 |

## 5. 影響範囲

- `frontmatter.json` — スキーマ変更（互換性あり、既存フィールドに変更なし）
- `.frontmatter/frontmatter.yml` — collection fields 追加
- `docs/**/*.md` — frontmatter 追加・統一、wiki-link 追加
- `AGENTS.md` — セクション 1.3 追加
- `.github/workflows/ci.yml` — frontmatter 検証ステップ追加（任意）

ソースコード（`src/`）への変更はなし。

## 6. 検証基準

- `docs/` 内の全 `.md` ファイルに `title`, `description`, `status`, `version`, `category`, `tags` の full set が存在すること
- `category` が小文字英語単数形（`design`, `architecture`, `balance`, `localization`, `qa`, `project-management`, `rules`）に統一されていること
- `[[wiki-link]]` のリンク先ファイルが存在すること（切れリンクなし）
- Front Matter CMS の taxonomy ダッシュボードが `status`, `version`, `category` でグループ化可能であること
- `pnpm lint`、`pnpm typecheck`、`pnpm test:run` がすべて PASS であること（文書のみ変更のため影響なし）

## 7. リスクと制約

- Front Matter CMS 機能は VS Code 環境でのみ有効（ターミナルベースの Kilo 実行環境では不可）
- OBSIDIAN Base と同等の完全なデータベースビューは提供しない（タグ・カテゴリによるフィルタ・グループ化のみ）
- `status` / `version` / `traces_to` / `implemented_by` / `verified_by` の手動更新を怠ると doc drift が発生する（実装変更との同期責務は開発者に委ねる）

## 8. 未解決事項（user に確認が必要な項目）

1. **`category` の許容値リスト**: 現状 `design`, `architecture`, `balance`, `localization`, `qa`, `project-management`, `rules` を提案。これ以外に必要なカテゴリはあるか？
2. **`status` の許容値リスト**: `draft`, `review`, `approved`, `deprecated` で十分か？ `proposed` や `implemented` を追加するか？
3. **`traces_to` / `implemented_by` / `verified_by` のリンク形式**: 相対パス（`src/core/Resources.ts`）か、FOAM wiki-link（`[[src/core/Resources]]`）か？
4. **CI frontmatter 検証**: CI に frontmatter 検証ステップを追加するか？（バイナリ依存のリスクあり）

推奨回答は上記の値を採用し、タスクを順に実行すること。

---

この plan を承認された場合、`implementation-capable` エージェントがタスク 1〜7 を実行できる。
