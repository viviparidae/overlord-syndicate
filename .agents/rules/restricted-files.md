# Restricted Files

## Touch Restrictions

以下のファイル・ディレクトリには **読み書き禁止**。
- `package-lock.json` — ロックファイル（pnpm が自動管理）
- `pnpm-lock.yaml` — 同上
- `node_modules/` — 依存パッケージ（自動インストール）
- `dist/` — ビルド出力（自動生成）
- `.git/` — Git リポジトリ（自動管理）


## Secret Restrictions

以下のファイルには **秘密鍵・認証情報を絶対に書き込み禁止**。
- `.env` — 環境変数
- `.env.*` — 環境変数（別環境）
- `credentials.json` — 認証情報
- `*.pem` — 秘密鍵
- `*.key` — 秘密鍵
- `*.p12` — パスワードストア

## Commit Restrictions

- **コミットはユーザーが明示的に指示した場合のみ。** 自発的に git 操作（commit/push/branch 作成）しない。
- **コミットメッセージは日本語で記述する。** Conventional Commits のプレフィックス（`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:` 等）は英語のまま維持する。
  - 許可例: `feat: 恐怖→警戒度の変換をThresholdsへ集約`
  - 禁止例: `feat: add fear to suspect conversion`

## Push Restrictions

- **`git push` はユーザー明示指示なしに実行しない。**

## Dependency Restrictions

- **新規依存パッケージの追加はユーザー明示許可なしに行わない。** `pnpm add` / `pnpm add -D` は許可が出るまで実行しない。
- 既存依存のバージョンアップも同様。

## Working Directory / Worktree

- **カレントディレクトリ外への書き込みは禁止。** `/tmp/kilo/` 以外の外部パスへの作成・書き込みを行わない。
- ワークツリー作成・切り替え・削除はユーザー明示指示のみ。

## URL Restrictions

- **URL を推測しない。** ユーザー提供の URL とローカルファイル内の URL のみ使用。

## Secret Logging Restrictions

- **秘密鍵・認証情報をログ出力しない。** コミットしない。
