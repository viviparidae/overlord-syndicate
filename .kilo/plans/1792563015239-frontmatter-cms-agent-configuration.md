# Plan: Front Matter CMS 活用のためのエージェント設定

> **ステータス:** 実装可能 (implementation-ready)  
> **言語:** 日本語

---

## 1. 目的

Kiloエージェントが、本プロジェクトの `.md` ドキュメント管理（FOAM）において Front Matter CMS の検索・フィルタ・ソート（Base機能）を活用できるように設定する。これにより、ドキュメント検索や関係性の整理タスクの効率化を図る。

---

## 2. 変更内容

### 2.1 AGENTS.md (セクション 9) への追加

`## 9. エージェントとスキル` の下に以下の項を追加:

```markdown
### Front Matter CMS 活用ガイドライン

- 本プロジェクトでは `docs/` ディレクトリ配下の `.md` ファイルを Front Matter CMS のデータソースとして扱う。
- Front Matter CMS 拡張機能 (eliostruyf.vscode-front-matter) がインストールされている前提で、以下の操作が可能:
  - `docs/` 内の frontmatter（YAML metadata）を検索・フィルタリング
  - タグ・カテゴリによるグループ化表示（タクソノミーダッシュボード）
  - データファイル/フォルダーダッシュボードからの補助情報参照
- エージェント実行時のトリガー語（例: "frontmatter", "cms", "データベースビュー", "クエリ"）が検知された場合、Front Matter CMS機能を補助的に活用する。
- OBSIDIANのBaseと同等の機能は提供しないが、検索・整理面では代替可能。
```

### 2.2 `.kilo/skill/frontmatter-cms/SKILL.md` の新規作成

`.kilo/skill/frontmatter-cms/SKILL.md` を新規作成（フォルダも新規作成）:

```markdown
# Skill: Front Matter CMS 活用

## 説明
本プロジェクトの `docs/` ディレクトリ配下の Markdown ページの frontmatter を検索・フィルタリングし、タグやカテゴリによる整理ビューを提供する。OBSIDIAN Base に近いデータベースビュー機能を VS Code 上で実現する。

## 主要ファイル
- `src/balance/Costs.ts` — アクションコスト/リワードテーブル
- `src/balance/Thresholds.ts` — フェーズ遷移閾値
- `docs/` 内のすべての `.md` ファイル（YAML frontmatterを含む）

## バランス哲学
- `docs/` 内の各 Markdown ページの frontmatter をデータソースとして認識し、検索・フィルタリングで関連ページを発見する。
- タグ（例: "経済", "恐怖", "政治"）やカテゴリ（例: "導入", "中期", "終盤"）によるグループ化表示を提供する。
- データファイル/フォルダーダッシュボードからの補助情報（セカンダリインデックス）を参照できるようにする。

## トリガー語
- `frontmatter`, `cms`, `データベースビュー`, `クエリ`, `タグ`, `ソート`, `フィルタ`

## アクティベートタスク
- ドキュメント検索・一覧表示
- タグ・カテゴリによる整理ビューの生成
- frontmatter データの抽出・列挙
- 関連ページの発見とリンク生成
```

**注意**: 既存の `.kilo/skill/` 下の他の_SKILL.md_ ファイル（例: `game-balance-tuning/SKILL.md`）も英語の見出し（Description, Key Files, Balance Philosophy）で構成されている。Front Matter CMS スキルは日本語に統一するが、**既存の他の_SKILL.md_ ファイルには触れない**（別タスクとして対応）。

### 2.3 VS Code 設定 (`.vscode/settings.json` と `.frontmatter/`)

`.vscode/settings.json` に Front Matter CMS 関連の設定を追加:

```json
{
  "frontmatter.cms.enabled": true,
  "frontmatter.frontmatterPattern": "^.+$",
  "frontmatter.dashboards.enabled": true,
  "frontmatter.taxonomy.dashboard.enabled": true
}
```

`.frontmatter/frontmatter.yml` (新規作成) をプロジェクトルートに配置:

```yaml
# Front Matter CMS 設定
# 本プロジェクトの docs/ をデータソースとして認識

content:
  include:
    - docs/**/*.md
  exclude:
    - docs/**/*.json
    - docs/**/*.yml

collections:
  - name: documents
    filePattern: "^.+$"
    folder: docs
    fields:
      - title
      - tags
      - category
      - description

dashboards:
  - name: taxonomy
    label: タクソノミーダッシュボード
    resource: documents
    groups:
      - tags
      - category
```

### 2.4 影響範囲

- `.kilo/skill/` ディレクトリ内の新規ファイル作成
- `AGENTS.md` のセクション9へのガイドライン追加（既存ルールと矛盾しない範囲）
- `.vscode/settings.json` および `.frontmatter/` ディレクトリの新規作成
- 既存の `.md` ファイル・既存のスキル定義への影響はなし

---

## 3. 検証項目

- `AGENTS.md` のセクション9に Front Matter CMS ガイドラインが正しく追加されていること
- `.kilo/skill/frontmatter-cms.md` が存在し、frontmatter キーワードでエージェントが適切にアクティブ化できること
- `.vscode/settings.json` に Front Matter CMS の設定が含まれ、VS Code で正しく読み込まれること
- `docs/` 内の既存 `.md` ファイルの frontmatter が Front Matter CMS で認識されること

---

## 4. タスク

1. `AGENTS.md` セクション 9 に Front Matter CMS 活用ガイドラインを追加（完了済み）
2. `.kilo/skill/frontmatter-cms/SKILL.md` を日本語に修正（英語の見出し `Description`, `Key Files`, `Balance Philosophy`, `Trigger Keywords`, `Activated Tasks` を `説明`, `主要ファイル`, `バランス哲学`, `トリガー語`, `アクティベートタスク` に変更し、本文も日本語に統一）
3. `.vscode/settings.json` に Front Matter CMS 設定を追記（完了済み）
4. `.frontmatter/frontmatter.yml` を新規作成（データソース設定）（完了済み）
5. 検証（AGENTS.md 読み上げ + スキル定義のトリガー語確認 + VS Code 設定確認）

---

## 5. リスクと制約

- **リスク**: OBSIDIAN Base と同等の機能期待 → 本プロジェクトは FOAM 管理のため、完全なデータベースビューは提供しない（部分的な検索・整理機能のみ）
- **制約**: `.md` ファイルの frontmatter に YAML metadata が含まれていない場合、Front Matter CMS の検索機能は無効となる。既存ファイルの frontmatter への追加が必要な場合は別途対応が必要。
- **制約**: VS Code 環境でのみ機能する（ターミナルベースの Kilo 実行環境では不可）。