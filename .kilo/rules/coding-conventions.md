# Coding Conventions

## Language

- **TypeScript のみ。** `src/` 以下に plain JavaScript を書かない。

## Documentation Language

- **プランファイル (`.kilo/plans/*.md`) は必ず日本語で記述する。** 見出し・本文・表・チェックリストすべて日本語。
- README.md・AGENTS.md・エージェント定義・スキル定義も日本語で記述する。
- ファイル名・識別子・コード・API名・パスは英語のまま維持する。

## Import Conventions

- **モジュール境界をまたぐインポートは必ずパスエイリアス (`@core`, `@phaser`, `@ui`, `@data`, `@localization`, `@balance`) を使用する。** 例: `src/core/GameEngine.ts` から `src/phaser/...` を参照する場合は `@phaser/...`。
- **同一モジュール内のインポートは相対パス (`./GameState`, `./types`, `../GameState`) を使用できる。** 例: `src/core/actions/types.ts` から `src/core/GameState.ts` への参照。
- `src/localization/` の JSON インポート (`./ja.json`, `./en.json`) は相対パスのみ許可。

## Comments

- **コメントはユーザーが明示的に要求しない限り追加しない。** コードは名前で自己説明させる。
- ソースコード内のコメントは日本語を既定とする（既存コメントを追記する場合は日本語で揃える）。

## Naming

- ファイル名・識別子・API名・パスは英語のまま維持する。
- 変数名は camelCase、定数は UPPER_SNAKE_CASE とする。
- クラス名は PascalCase とする。

## Phaser 固有規約

- **Phaser keyboard API アクセスは non-null assertion (`!`) を許容する。** `this.input.keyboard!.addKey(...)`、`this.input.keyboard!.createCursorKeys()` 等は正当。Biome の `noNonNullAssertion` 警告はここで抑制するか、明示的に無視すること。

## Formatting

- Biome でフォーマットする。`pnpm lint:fix` を実行して自動修正する。
- インデントは 2 スペースとする。

## Testing

- テストファイルは対象ソースと同名の `.test.ts` とする（サブディレクトリはドット区切り: `actions/runShop.ts` → `actions.runShop.test.ts`）。
- テストから `src/` へのインポートはパスエイリアス (`@core/...`) を使用する。相対パス禁止。
- `src/core/` を変更したら必ずユニットテストを追加・更新する。
- テストファイル名は対象ファイルに対応させる (`Resources.ts` → `Resources.test.ts`)。
- **テストケース名 (`it()` / `test()` の説明文) は日本語で記述する。** 検証内容が日本語で伝わることを優先する。
- **テストケース名にテスト対象のメソッド名を埋め込まない。** `it("canAdvanceTo returns correct values")` のような形式は避け、検証する振る舞いそのものを書く (`it("昇格可否の判定が正しい")`)。
- `describe()` はテスト対象のクラス名・関数名をそのまま英語で使用する (`describe("Resources")`)。日本語化しない。
- `pnpm test:run` で全テストが PASS すること。

## Logging

- **本番コードパスでの `console.log` / `console.debug` は禁止。**
- エラーハンドラ内 (`catch` ブロック) の `console.error` のみ許容。

## Resource Mutation

- **リソース (`funds`, `fear`, `faith`, `suspect`) の直接代入は禁止。** `Resources.addFunds()`, `addFear()`, `addFaith()`, `addSuspect()`、`GameState.setPhase()` 等のメソッド経由で変更すること。

## Error Handling

- **`src/core/` アクション関数:** エラーは `ActionResult` オブジェクトで返す (`success: false` + `messageKey`)。例外を投げない。
- **`src/phaser/` シーン:** アクション結果の `success` プロパティをチェックし、失敗時は UI 更新をスキップ。
- **`src/core/save/`:** `try/catch` で例外を捕捉し、`console.error` して再スロー（ログ残し）。
- **`src/ui/`:** DOM 操作前に null チェック。

## Quality Gates

完了と報告する前に以下を全部確認する。

| ゲート | コマンド | 基準 |
|--------|----------|------|
| Lint | `pnpm lint` | エラー 0 |
| 型検査 | `pnpm typecheck` | エラー 0 |
| テスト | `pnpm test:run` | 全 PASS。`src/core/` カバレッジ 80% 以上 |
| ビルド | `pnpm build` | エラー 0、`dist/` 生成 |
| ドキュメント | `pnpm docs:validate` | エラー 0 |