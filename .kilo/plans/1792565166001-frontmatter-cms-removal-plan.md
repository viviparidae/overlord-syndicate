# Plan: Front Matter CMS 完全排除

> **目的**: プロジェクトから Front Matter CMS 依存を完全に排除し、MD Editor Plus に完全移行する。

## 1. 現在の状況と残存課題

以下のタスクは前回実行済み（2026-10-21 07:30）ですが、残りの Front Matter CMS 関連ファイルを完全に排除するための最終チェックプランです。

### 既に完了 (2026-10-21 07:30):

| アーティファクト | 状態 |
|------------------|------|
| `frontmatter.json` | **削除済み** |
| `.frontmatter/` ディレクトリ | **削除済み** |
| `docs/frontmatter-cms-views.md` | `docs/md-editor-plus-guide.md` に差し替え済み |
| `.vscode/settings.json` | MD Editor Plus board/table 設定に更新済み |
| `AGENTS.md` §1.3 | MD Editor Plus 版に書き換え済み |
| `AGENTS.md` §9 | MD Editor Plus 活用ガイドラインに更新済み |
| `docs/index.md` | FM CMS 参照先を `md-editor-plus-guide.md` に更新済み |
| `pnpm docs:validate` | **15 ファイル OK** (PASS) |

### 残存 Front Matter CMS 関連ファイル

| ファイル | 影響 | 対応 |
|----------|------|------|
| `.kilo/skill/frontmatter-cms/SKILL.md` | スキル定義に FM CMS 説明が残存 | スキル内容を MD Editor Plus 版に更新または削除 |
| `.kilo/plans/1792563015239-frontmatter-cms-agent-configuration.md` | 過去のプラン記録 | 履歴ファイルとして残す（変更不要） |
| `.kilo/plans/1792564757000-frontmatter-traceability-plan.md` | 過去のプラン記録 | 同上 |
| `scripts/validate-frontmatter.mjs` | スクリプト名に "frontmatter" | **推奨**: `scripts/validate-docs.mjs` にリネーム（FM CMS非依存） |
| `package.json` `docs:validate` スクリプト | 検証コマンド名 | **推奨**: `pnpm docs:validate` のまま（中身はMD Editor Plus対応） |

---

## 2. タスク一覧

| # | タスク | 内容 | 対象ファイル |
|---|--------|------|-------------|
| 1 | FM CMS スキル更新 | `.kilo/skill/frontmatter-cms/SKILL.md` を MD Editor Plus 版に更新 | `.kilo/skill/frontmatter-cms/SKILL.md` |
| 2 | スクリプト名簡素化 | `scripts/validate-frontmatter.mjs` → `scripts/validate-docs.mjs`（内部メッセージも update） | `scripts/validate-frontmatter.mjs`, `package.json` |
| 3 | 最終検証 | `pnpm docs:validate` / `pnpm lint` / `pnpm typecheck` / `pnpm test:run` が PASS | 全 |

---

## 3. 影響範囲

- `.kilo/skill/frontmatter-cms/SKILL.md` — スキル内容の更新または削除
- `scripts/validate-frontmatter.mjs` — ファイル名変更（推奨）およびメッセージ簡素化
- `package.json` — `docs:validate` スクリプト参照はそのままで可
- `.kilo/plans/` — 歴史的プランファイルは変更不要

---

## 4. 検証基準

- `pnpm docs:validate` が PASS（15ファイル OK）
- `.kilo/skill/frontmatter-cms/SKILL.md` が MD Editor Plus に関連づけられている、または削除されている
- `scripts/validate-frontmatter.mjs` の内容が FM CMS 語句を排除している、またはファイル名が `validate-docs.mjs` に変更されている

---

## 5. 推奨回答

上記のタスク 1〜3 を順に実行する。

1. スキルファイルの更新（最優先）
2. スクリプト名の簡素化（任意だが推奨）
3. 検証実行