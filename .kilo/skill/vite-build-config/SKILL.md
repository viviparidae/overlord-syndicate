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

## コマンド
- `pnpm dev` → Vite dev サーバを `localhost:5173` で起動
- `pnpm build` → `dist/` に出力
- `pnpm preview` → ビルド済みファイルのプレビュー

## ビルド制約
- Phaser の `phaser.c.js` は SSR ポリフィルで除外されなければならない
- アセット出力: `public/` を `src/assets/` から分離する
- dev サーバ: `localhost:5173` で起動し、HMR を有効にする