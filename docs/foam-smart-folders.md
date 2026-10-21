---
title: FOAM スマートフォルダ
description: docs/ 配下の設計ドキュメントを frontmatter プロパティで動的に整理する仮想フォルダ（Smart Folders）の設定と運用ガイド。
status: approved
version: "0.1"
category: project-management
tags:
  - foam
  - smart-folder
  - documentation
  - navigation
traces_to:
  - docs/index.md
  - docs/architecture/overview.md
  - docs/design/resources.md
implemented_by:
  - .foam/queries/
  - docs/foam-smart-folders.md
verified_by:
  - scripts/validate-docs.mjs
---

# FOAM スマートフォルダ

## 概要

`docs/` 配下の設計ドキュメントを、frontmatter プロパティ（`status`・`category`・`verified_by`）に基づいて VS Code エクスプローラーのサイドバーに表示する仮想フォルダ（Smart Folders）の設定と運用ガイド。

FOAM の `[[wiki-link]]` と組み合わせて使用し、プロジェクト全体のトレーサビリティ（設計 → 実装 → 検証）を視覚的にサポートします。

---

## インストール

1. VS Code マーケットプレイスから **Foam** (`foam.foam-vscode`) をインストール
2. `pnpm install` で依存パッケージをインストール
3. `.foam/queries/*.yaml` ファイルが配置されていることを確認

---

## 使い方

### スマートフォルダの表示

VS Code のエクスプローラーの **Smart Folders** パネル（サイドバー下部）で、以下の 11 のスマートフォルダが利用できます。

| スマートフォルダ名 | フィルタ条件 | 用途 |
|-------------------|-------------|------|
| `status-draft` | `status == 'draft'` | 作成中ドキュメントの確認 |
| `status-review` | `status == 'review'` | レビュー待ちドキュメントの確認 |
| `status-approved` | `status == 'approved'` | 承認済みドキュメントの確認 |
| `status-deprecated` | `status == 'deprecated'` | 廃止予定ドキュメントの確認 |
| `category-design` | `category == 'design'` | ゲームデザイン関連の横断的参照 |
| `category-architecture` | `category == 'architecture'` | アーキテクチャ関連の横断的参照 |
| `category-balance` | `category == 'balance'` | バランス調整関連の横断的参照 |
| `category-qa` | `category == 'qa'` | 品質保証・テスト関連の横断的参照 |
| `category-localization` | `category == 'localization'` | ローカライゼーション関連の横断的参照 |
| `orphaned` | `backlinks|length == 0` | 孤立ドキュメントの特定 |
| `missing-verification` | `verified_by == null` または空 | 検証元未設定のドキュメント |

### フィルタ構文

各スマートフォルダの YAML で使用する Jexl 述語:

- `resource.properties.status == 'draft'`: ステータスでフィルタ
- `resource.properties.category == 'design'`: カテゴリでフィルタ
- `resource.backlinks|length == 0`: バックリンクがないドキュメント

### 表示形式

各スマートフォルダはテーブル形式で以下の列を表示:

| 列 | 内容 |
|---|------|
| タイトル | ドキュメントのファースト H1 または frontmatter `title` |
| ステータス | `status` プロパティの値 |
| カテゴリ | `category` プロパティの値 |
| パス | ドキュメントのフルパス |

列ヘッダーは `properties.` プレフィックスが自動的に除去されて表示されます。

### ドキュメントへのリンク

テーブル内のタイトルはクリックで対応するドキュメントにジャンプします。`[[wiki-link]]` で参照先ドキュメントへの相互リンクが可能です。

---

## 関連リンク

- `[[docs/architecture/overview]]` — 技術アーキテクチャ全体像
- `[[docs/design/resources]]` — リソース定義
- `AGENTS.md §1.2` — ドキュメント管理 FOAM ルール