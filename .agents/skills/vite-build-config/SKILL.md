---
name: vite-build-config
description: Vite、TypeScript、Biome、Vitest を Overlord Syndicate に合わせて設定する。pnpm dev/build/test を実行する際に使用。
---
# Skill: vite-build-config

## 説明
Vite、TypeScript、Biome、Vitest を Overlord Syndicate に合わせて設定する。

## 使用時
`pnpm dev`、`pnpm build`、`pnpm test` を実行する際に使用する本スキル。

## 主要ファイル
- `vite.config.ts` — Vite 設定、Dev サーバ、パスエイリアス
- `tsconfig.json` — strict モード、パスエイリアス (`@core`, `@phaser`, `@ui`, `@data`, `@balance`, `@localization`)
- `vitest.config.ts` — happy-dom 環境、カバレッジ閾値
- `biome.json` — formatter/linter ルール (インデント 2 スペース、行長 100)

## パスエイリアス
`tsconfig.json` / `vite.config.ts` / `vitest.config.ts` の 3 箇所で同一のエイリアスを定義する。追加・変更時は必ず 3 箇所を同期すること。

| エイリアス | 対象 |
|---|---|
| `@core` | `src/core` |
| `@phaser` | `src/phaser` |
| `@ui` | `src/ui` |
| `@data` | `src/data` |
| `@localization` | `src/localization` |
| `@balance` | `src/balance` |

## コマンド
- `pnpm dev` → Vite dev サーバを `localhost:5173` で起動
- `pnpm build` → `dist/` に出力
- `pnpm preview` → ビルド済みファイルのプレビュー
- `pnpm lint:fix` → Biome の自動修正

## ビルド制約
- Phaser の `phaser.c.js` は SSR ポリフィルで除外されなければならない
- アセット出力: `public/` を `src/assets/` から分離する
- dev サーバ: `localhost:5173` で起動し、HMR を有効にする

## 既知の警告と対処
- **`biome.json` の `linter.rules.recommended` は非推奨（Biome 2.x）。** `pnpm lint` 実行時に `deserialize DEPRECATED` 警告が出る。次のメジャーバージョンで削除されるため、`preset: "recommended"` へ移行する。移行は `biome migrate` コマンドで自動化できる。
- **`src/phaser/scenes/` の `noNonNullAssertion` 警告 12 件は想定内。** Phaser の keyboard API は型上 `null` 可能だが実行時に必ず初期化される。`.kilo/rules/coding-conventions.md` の「Phaser 固有規約」を参照。