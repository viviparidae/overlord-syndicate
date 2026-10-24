---

title: Smart Folders (FOAD スマートフォルダ)
description: .foam/queries/ の YAML クエリによるスマートフォルダ運用手順。ステータス/カテゴリ/孤立/検証未設定をサイドバーで整理する。
status: draft
version: "0.1"
category: qa
tags:
- foam
- smart-folders
- queries
- documentation
  traces_to:
- docs/index.md
- .foam/queries/status-draft.yaml
  implemented_by:
- .foam/queries/*.yaml
  verified_by:
- scripts/validate-docs.mjs

---

# Smart Folders (フォールドフォルダ)

## 概要

`.foam/queries/*.yaml` に保存されたクエリ定義に基づき、VS Code エクスプローラーのサイドバーにスマートフォルダとして表示する。

## ディレクトリ構成

```text
.foam/queries/
├─ category-architecture.yaml
├─ category-balance.yaml
├─ category-design.yaml
├─ category-localization.yaml
├─ category-qa.yaml
├─ missing-verification.yaml
├─ orphaned.yaml
├─ status-approved.yaml
├─ status-deprecated.yaml
├─ status-draft.yaml
└─ status-review.yaml
```

## スマートフォルダ一覧

| フォルダ                | 対象                     | クエリ例                                                |
| ----------------------- | ------------------------ | ------------------------------------------------------- |
| `status-draft`          | `status: draft`          | `status: draft`                                         |
| `status-review`         | `status: review`         | `status: review`                                        |
| `status-approved`       | `status: approved`       | `status: approved`                                      |
| `status-deprecated`     | `status: deprecated`     | `status: deprecated`                                    |
| `category-architecture` | `category: architecture` | `category: architecture`                                |
| `category-balance`      | `category: balance`      | `category: balance`                                     |
| `category-design`       | `category: design`       | `category: design`                                      |
| `category-localization` | `category: localization` | `category: localization`                                |
| `category-qa`           | `category: qa`           | `category: qa`                                          |
| `missing-verification`  | 未検証                   | frontmatter に `verified_by` 未設定                     |
| `orphaned`              | 孤立ドキュメント         | 他のドキュメントから `[[wiki-link]]` で参照されていない |

## 設定手順

1. **`.foam/queries/*.yaml` ファイルの配置**
   - `.foam/queries/` ディレクトリに YAML クエリファイルを配置する
   - 各ファイルの `status` と `category` フィールドで分類する

2. **`docs/index.md` からのリンク**
   - `[[smart-folders]]` または個別のフォルダリンク (`[[status-draft]]`) を `docs/index.md` に記述
   - MD Editor Plus のサイドバーに自動的にスマートフォルダセットが表示される

3. **運用フロー**
   - 新規 `.md` ドキュメント作成時に `status` と `category` frontmatter を設定
   - ステータスが変化するたびに `status: draft → review → approved → deprecated` と遷移
   - `missing-verification` フォルダの文書はレビュー担当者が `verified_by` を埋める
   - `orphaned` フォルダの文書は `docs/index.md` から `[[wiki-link]]` を追加して解除

## トリガー語

- `smart-folders`, `status-draft`, `status-review`, `status-approved`, `status-deprecated`
- `category-architecture`, `category-balance`, `category-design`, `category-localization`, `category-qa`
- `missing-verification`, `orphaned`

## 関連ファイル

- `.foam/queries/*.yaml` — クエリ定義 (10ファイル)
- `docs/index.md` — スマートフォルダへのリンク設定
- `docs/foam-smart-folders.md` — 本ファイル (本ガイド)
