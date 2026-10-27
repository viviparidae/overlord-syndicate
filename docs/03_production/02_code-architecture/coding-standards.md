---
title: コーディング規約
description: TypeScript、Biome、コメント方針、禁止事項、品質ゲート。
status: draft
version: "0.1"
category: architecture
tags: [convention, typescript, quality]
traces_to:
- docs/03_production/02_code-architecture/architecture.md
implemented_by: []
verified_by: []
---

# コーディング規約

## 1. 言語とツール

| 項目 | 採用 |
| --- | --- |
| 言語 | TypeScript のみ（`.js` を書かない） |
| ビルド | Vite |
| 描画 | Phaser 3 |
| Lint/Format | Biome |
| テスト | Vitest（unit）、Playwright（e2e） |
| パッケージ管理 | pnpm |

## 2. コメント

- **原則としてコメントを書かない。** 名前と構造で意図を表す。
- 例外: 外部仕様の出典（URL）、非自明な計算の根拠、回避策の理由。いずれも1行で書く。
- 変更履歴をコメントで残さない（git の役割）。

## 3. 型

- `any` 禁止。`unknown` + 型ガードを使う。
- `as` によるキャストは、外部データ（JSON）の境界のみ許可。
- 公開関数は戻り値の型を明示する。
- ユニオン型の網羅性は `switch` + `never` で担保する。

## 4. 状態

- 状態の変更は core のメソッド経由のみ。`state.missCount++` のような外部からの直接変更を禁止。
- グローバル変数、モジュールスコープの可変変数を使わない。
- 配列・オブジェクトは必要に応じてコピーして返す（呼び出し側で破壊的変更をしない）。

## 5. 非同期

- `async/await` を使い、Promise チェーンを書かない。
- アセット読込以外で `setTimeout` による待機を書かない（core は時間に依存しない）。
- core に `Date.now()` を持ち込まない。経過時間は引数で渡す。

## 6. ローカライズ

- 画面に出す文字を直書きしない。`t('key')` を経由する。
- キーは ja.json と en.json の両方に追加する。
- 数値・金額の整形は `formatCurrency` / `formatDate` 等の共通関数を使う。

## 7. 禁止事項

| 禁止 | 理由 |
| --- | --- |
| `src/core/` での Phaser / DOM import | レイヤ違反。headless テストが壊れる |
| `window.localStorage` を core から直接触る | 保存は Repository 経由 |
| データに日本語文を直書き | ローカライズ不能になる |
| 乱数（`Math.random()`）の使用 | 決定性を壊す |
| `console.log` の残置 | デバッグは開発用フラグで制御 |

## 8. 品質ゲート

| コマンド | 基準 |
| --- | --- |
| `pnpm typecheck` | エラー0 |
| `pnpm lint` | 警告0（例外は設定で明示） |
| `pnpm test:run` | 全件成功 |
| `pnpm build` | 成功、バンドルサイズ警告なし |
| `pnpm test:e2e` | 主要動線が成功（preview 起動前提） |
| `pnpm docs:validate` | frontmatter とリンク切れなし |

ゲーム破壊的バグ（セーブ破損、遷移不能、ミス上限の誤判定）は**ブロッカー**として扱う。

## 9. コミット

- Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`。
- 1コミット1目的。ドキュメントのみの変更は `docs:` を付ける。
