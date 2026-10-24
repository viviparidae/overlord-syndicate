---

title: テスト計画とカバレッジ目標

description: QA 観点・テストカバレッジ目標・検証基準。src/core/ 80% 以上。

status: draft
version: "0.3"
category: qa
tags:
- qa
- test-plan
- coverage
- core-80
- e2e

traces_to:
- docs/design/mechanics.md
- docs/architecture/save-format.md
  implemented_by:
- tests/unit/ (単体テスト)
- tests/integration/ (統合テスト)
- playwright.config.ts
- tests/e2e/

verified_by:
- プロジェクトリーダー / QA 担当者 (レビュー)
- tests/e2e/

---

# テスト計画とカバレッジ目標

## 1. テスト範囲

| 範囲                | テストファイル                 | 主な対象                                                                                                   |
| ------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `src/core/`         | `tests/unit/*`                 | 純粋ロジック。GameEngine, Resources, GameState, RNG, actions, EventSystem, Serializer                      |
| `src/phaser/`       | 計画中（Phaser Canvas UI統合） | 描画・アニメーション・入力。Canvas内UI要素（ステータスバー・コマンドパネル・ログ・オーバーレイ）           |
| `src/ui/`           | `tests/e2e/*`                  | Canvas内UIイベント購読。`src/ui/index.ts` は Phaser UI更新として検証                                       |
| `src/balance/`      | 未作成（将来のユニットテスト） | Cost/Thresholds 値検証                                                                                     |
| `src/localization/` | 任意（将来のユニットテスト）   | JSON キーの存在・置換ロジック                                                                              |
| アプリ全体          | `tests/e2e/*.spec.ts`          | Playwright による実ブラウザ操作（DOM パネル / Phaser キー操作 / フェーズ昇格 / GameOver / セーブ・ロード） |

## 2. カバレッジ目標（AGENTS.md §6 に基づく）

### 2.1 `src/core/` 80% カバレッジ

| ファイル                      | カバレッジ目標 |
| ----------------------------- | -------------- |
| `src/core/Resources.ts`       | 100%           |
| `src/core/GameState.ts`       | 100%           |
| `src/core/EventSystem.ts`     | 90%            |
| `src/core/RNG.ts`             | 100%           |
| `src/core/actions/*.ts`       | 95% 各         |
| `src/core/save/Serializer.ts` | 100%           |
| `src/core/save/migrations/*`  | 100%           |

> **ルール:** `pnpm test:run` で全 PASS、カバレッジ ≥80%。カバレッジ不合格時は全ワークスペースのビルドが中止。

### 2.2 テスト粒度

- **ユニットテスト:** `src/core/` の pure 関数単体。`happy-dom` で DOM 不要の実行
- **統合テスト:** `src/core/` と外部（例: `src/phaser/`）の相互作用。`EventSystem` と UI 連携、`game-loop.test.ts`
- **エンドツーエンド:** `playwright` で自動テスト

### 2.3 E2E テストの実体

| 項目           | 内容                                                                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| フレームワーク | `@playwright/test`（`playwright.config.ts`）                                                                                                |
| 配置           | `tests/e2e/*.spec.ts`（Vitest の `tests/**/*.test.ts` とは非衝突）                                                                          |
| 対象           | `pnpm build` 後の `vite preview`（`http://localhost:4173`）                                                                                 |
| ブラウザ       | Chromium のみ（`launchOptions.args` で SwiftShader を指定）                                                                                 |
| 観測手段       | DOM（`#funds` `#fear` `#faith` `#suspect` `#phase` `#logConsole` `#gameOverOverlay`）と `?e2e=1` 時のデバッグブリッジ `window.__OVERLORD__` |
| 仕様書         | `smoke` / `command-panel` / `phaser-scenes` / `phase-advance` / `gameover` / `save-load`                                                    |

> **注意:** キーに依存するテストは `keyboard.down()` → 待機 → `keyboard.up()` で押下する。`keyboard.press()` は keyup がゲームループより先に処理され `JustDown` が取りこぼされるため使用しない。

## 3. テスト観点

### 3.1 `src/core/` ユニットテスト観点

| 観点                 | 確認内容                                            |
| -------------------- | --------------------------------------------------- |
| アクション純粋性     | 同一 `ActionContext` で同一 `ActionResult` を返す   |
| リソース不変性       | `Resources` 経由以外で値が変わらない                |
| 決定論性             | 同一シード・同一操作で同一ログ・同一セーブ          |
| セーブ/ロード循環    | セーブ→ロード→セーブ で同一スナップショット         |
| フェーズ遷移         | `Thresholds.canPromote()` 境界値（上限・下限）      |
| GameOver 判定        | `suspect == 99` → 安全、`suspect == 100` → GameOver |
| ローカライゼーション | `t('key')` が適切なプレースホルダー展開を行う       |

### 3.2 統合テスト観点

| 観点               | 確認内容                                                |
| ------------------ | ------------------------------------------------------- |
| イベント発行       | `EventSystem.on` が action 発行を購読                   |
| UI ↔ Core 連携     | `EventSystem` が UI 更新をトリガー                      |
| フェーズ遷移フロー | Phase 昇格条件が正しいリソース変化を引き起こす          |
| セーブ整合性       | `GameEngine` 内部状態と保存されたスナップショットの一致 |

### 3.3 E2E テスト観点

| 観点           | 確認内容                                                                                                 |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| Canvas UI 同期 | ステータスバー（資金・恐怖・狂信・警戒度・フェーズ）がPhaser Canvas内で正しく描画・更新される            |
| コマンドパネル | Canvas内ボタン（店番・噂を流す・脅迫する）の操作がゲームロジックに反映される                             |
| ログコンソール | アクション実行時にCanvas内ログエントリが追加される                                                       |
| ゲームオーバー | 警戒度100到達でCanvas内オーバーレイ表示・以降アクション拒否が行われる                                    |
| Phaser 入力    | E / SPACE / T / 1 / 2 / ESC / 矢印キー + タッチボタンでシーン遷移とアクション実行が成立する              |
| フェーズ昇格   | 閾値到達でフェーズ表示とログが更新される                                                                 |
| 永続化         | アクション後に `localStorage` へ保存され、リロード後に復元される。破損セーブでは初期状態へ安全に復帰する |
| 決定性         | 外部フォントを遮断した状態で数値比較が安定する（`Intl` の全角通貨記号に依存しない）                      |

## 4. テストコマンド

| コマンド           | 用途                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| `pnpm test:run`    | カバレッジ検証含む全テストを実行（一回実行）                               |
| `pnpm test`        | Vitest ウォッチモード（デバッグ・開発用）                                  |
| `pnpm test:e2e`    | Playwright の E2E テストを実行（`pnpm build` + `vite preview` を自動起動） |
| `pnpm test:e2e:ui` | Playwright の UI モードで E2E テストを実行（デバッグ用）                   |
| `pnpm lint`        | ソースコードの Biome チェック（コード品質）                                |
| `pnpm typecheck`   | TypeScript 型チェック（`tsc --noEmit`）                                    |

## 5. トレーサビリティ関連テスト

- `tests/unit/Resources.test.ts` は `funds` / `fear` / `faith` / `suspect` 変更をテストし、`implemented_by` トレースを確認
- `tests/unit/GameState.test.ts` は `canPromote` をテストし、`verified_by` トレースを確認
- `tests/unit/actions.runShop.test.ts` は `ActionResult` をテストし、`verified_by` トレースを確認
- `tests/unit/GameEngine.test.ts` はフェーズ昇格・GameOver 判定・イベントの購読をテストする
- `tests/e2e/` は DOM 同期・Phaser 入力・セーブ/ロードを実ブラウザで検証する
- 追加テスト時は `verified_by` に参照対象のドキュメントを更新

## 6. 将来のテスト拡張（計画中）

- Phase 2: `src/phaser/` のCanvas内UI要素（ステータスバー・コマンドパネル・ログ・オーバーレイ）のユニットテスト
- Phase 3: `src/ui/index.ts` のCanvasイベント購読の統合テスト
- Phase 4: `src/balance/` の動的コスト調整の統合テスト
- カバレッジ自動アラート用の CI チェック (`pnpm test:run` でカバレッジ <80% は失敗)
- E2E の Safari / Firefox 対応（現状は Chromium のみ）

- **UI統合テスト追加:** `tests/e2e/canvas-ui.spec.ts` を作成し、Canvas内UI要素のレンダリング・更新を検証

> **ルール:** 新しいテストケースを追加時は、`tests/` 内の `*/.test.ts` 名を対応するソースファイル（`src/core/` 内の場合は `src/core/` ファイル名）に合わせる。テストケース名 (`it()` / `test()`) は日本語で記述し、テスト対象のメソッド名を埋め込まない。詳細は `.kilo/rules/coding-conventions.md` の "## Testing" を参照。
