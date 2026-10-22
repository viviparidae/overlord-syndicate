---
name: tdd
description: テスト駆動開発 (Red-Green-Refactor) で src/core/・src/balance/・src/localization/ の純粋ロジックを実装する。アクション、リソース、フェーズ遷移、閾値、ローカライゼーションの振る舞いを先に失敗するテストで固定してから実装する。境界値テスト・AAA・テストダブルの判断にも使用。
---
# Skill: tdd

## 説明
`src/core/`・`src/balance/`・`src/localization/` の純粋ロジックをテスト駆動開発 (Red-Green-Refactor) で実装するスキル。Vladimir Khorikov『単体テストの考え方/使い方』(須田智之訳) の古典派手法に準拠する。

**必須ゲート:** 実装コードを書く前に、意図した振る舞いを検証するテスト (Red) を必ず作り、その失敗を実際に確認してから実装 (Green) に入る。テストを後回しにする順序は採らない。

## 使用時
- `src/core/`・`src/balance/`・`src/localization/` のロジックを追加・変更・修正するとき
- 既存ロジックの退行を防ぐテストを追加するとき
- 上限・閾値・失敗判定など境界値の正しさを保証するとき
- まだテストが無いモジュール (`src/balance/Thresholds.ts`, `src/localization/index.ts`) に初めてテストを足すとき

## 適用しない領域
| 領域 | 理由 | 代替の検証 |
|---|---|---|
| `src/phaser/` | 描画・アニメーション・入力。純粋ロジックではない | `pnpm dev` での手動確認 |
| `src/ui/` | DOM オーバーレイ。描画層に属する | `pnpm dev` での手動確認 |
| `src/data/` | データ主体。ロジックを含まない | データ編集 + 目視確認 |

## サイクル

### 1. Red — 失敗するテストを先に書く
1. 振る舞いを 1 つだけ選ぶ (1 テスト 1 振る舞い)
2. 対象ソースと同名のテストファイルへ追記する
3. テストを実行し、意図した理由で失敗することを確認する
   - 期待どおりのアサーション不成立 = 正しい Red
   - import 漏れ・typo・ReferenceError = Red になっていない。先に直す
4. 境界値なら「ちょうど / 直上 / 直下」の 3 点を Red にする

### 2. Green — 最小限の実装
1. Red を満たす最小限のコードだけを書く
2. 対象テストが PASS する
3. `pnpm test:run` で既存テストが壊れていないことを確認する

### 3. Refactor — 構造を整える
1. テストを壊さずに命名・重複除去・型を整理する
2. 変更後に `pnpm test:run` で全 PASS を確認
3. 製品コードの整理でテストを書き換えていたら Red に戻り、テストを先に直す

## テスト設計

### 配置と命名
| 対象ソース | テストファイル |
|---|---|
| `src/core/Resources.ts` | `tests/unit/Resources.test.ts` |
| `src/core/GameState.ts` | `tests/unit/GameState.test.ts` |
| `src/core/actions/runShop.ts` | `tests/unit/actions.runShop.test.ts` |
| `src/core/save/Serializer.ts` | `tests/unit/save.Serializer.test.ts` |
| `src/balance/Thresholds.ts` | `tests/unit/Thresholds.test.ts` |
| `src/localization/index.ts` | `tests/unit/localization.test.ts` |

- `describe()` は対象クラス名・関数名をそのまま英語で使う
- `it()` は日本語で、検証する振る舞いそのものを書く
- `it()` にテスト対象のメソッド名を埋め込まない (`{メソッド名}_{事前条件}_{想定結果}` 形式は不可)
- テストから `src/` への import はパスエイリアス (`@core/...`, `@balance/...`, `@localization/...`) を使う

### 1 テスト 1 振る舞い
- Arrange / Act / Assert を空行で区切って書く
- 1 つの `it()` は 1 つの振る舞いを検証する
- 同じ `describe()` 内に同じ名前の `it()` を作らない

### 検証すべき境界
| 対象 | 境界 |
|---|---|
| `Resources` | 資金は 0 未満にならない / 恐怖は 100 を超えない / 警戒度は 100 を超えない / 警戒度 100 でゲームオーバー |
| `GameState` | フェーズ 1→4 / `advance()` は 4 より先へ進めない / `canAdvanceTo()` は現在のフェーズより大きく 4 以下のときだけ真 |
| `Thresholds.meetsThreshold()` | faith と funds の両方が閾値以上のとき真 / 片方だけ不足で偽 |
| アクション | 成功時の `ActionResult` の内容 / 資金不足で `success: false` (`runShop` は失敗しない) |
| `RNG` | 同一シードで同一数列 / 値が 0〜1 の範囲に収まる |
| `Serializer` | セーブ→ロード→セーブで同一スナップショット |

### テストしないもの
- プライベートメソッド・getter/setter・実装詳細
- 定数・データ表そのものの値 (`src/balance/`・`src/data/` は表として扱う)
- 外部ライブラリ・ブラウザ API の挙動
- 1 つの `it()` に無関係な複数の振る舞いをまとめたもの

### テストダブル
- `src/core/` には外部依存 (ネットワーク・ファイル・DB) がなく、モックは不要
- 注入が要るのは `ActionContext` のような純粋な入力値だけ
- `vi.fn()`・`vi.mock()` は「注入した値への呼び出し履歴を検証したい」場合のみ。振る舞いを固定したいだけならフェイク (実データ) を使う

## コマンド
| コマンド | 用途 |
|---|---|
| `pnpm test:run` | 全テストを 1 回実行 (Green 確認・完了判定) |
| `pnpm test` | ウォッチモード (Red フェーズで反復) |
| `pnpm test:run tests/unit/Resources.test.ts` | 対象ファイルのみ実行 (Red の反復を高速化) |
| `pnpm test:run -t "初期値で生成される"` | テスト名で絞り込み実行 |
| `pnpm lint` / `pnpm typecheck` | 静的チェック |

## 主要ファイル
- `src/core/Resources.ts` — 4 リソースのトラッカー、上限・ゲームオーバー判定
- `src/core/GameState.ts` — フェーズ FSM と `PhaseConfigs`
- `src/core/actions/types.ts` — `ActionResult` / `ActionContext` 契約
- `src/core/actions/*.ts` — 純粋アクション (例外を投げず `ActionResult` を返す)
- `src/core/EventSystem.ts` — 型付きエミッタ
- `src/core/RNG.ts` — シード付き乱数 (mulberry32)
- `src/core/save/Serializer.ts` — セーブ/ロードとマイグレーション
- `src/balance/Thresholds.ts` — フェーズ昇格閾値・リソースキャップ
- `src/localization/index.ts` — `t()` / `formatCurrency()` / `formatDate()`
- `.kilo/rules/coding-conventions.md` — テスト規約 (`## Testing`)

## 制約
- テストは `tests/unit/` に置き、`src/` には置かない
- 失敗は例外ではなく戻り値 (`ActionResult` の `success: false`) で表現する
- リソースの変更は `Resources` のメソッド経由 (直接代入禁止)
- RNG を使うテストはシードを固定する
- 1 回の Red-Green サイクルで扱う振る舞いは 1 つだけ

## 根拠
- Vladimir Khorikov『単体テストの考え方/使い方』(須田智之訳) 第3章「単体テストの構造的解析」
  - テスト名は厳密な命名規則に縛られず、検証内容が誰にでも伝わることを優先する
  - 同書 p.77 の `{テスト対象メソッド}_{事前条件}_{想定結果}` 形式は「よくある (そして役に立たない) 命名規則」であり、メソッド名の埋め込みは避ける
- 既存規約: `.kilo/rules/coding-conventions.md` の `## Testing`
- テスト計画: `docs/qa/test-plan.md`
