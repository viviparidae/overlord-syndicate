---
title: テスト戦略
description: unitテスト、E2E、アセットパイプラインの検証、手動QA、CIの方針と対象を定義する。
status: draft
version: "0.1"
category: qa
tags: [test, qa, e2e, unit, ci]
traces_to:
- docs/03_production/02_code-architecture/architecture.md
- docs/02_game-spec/02_system-rules/chapter1-data.md
- docs/02_game-spec/01_flow-ui/hud-controls.md
implemented_by: []
verified_by: []
---

# テスト戦略

第1章のプロトタイプを対象とする。実装前の方針書であり、テストコードはまだ存在しない。

## 1. 原則

1. **判定ロジックは core で検証する。** 描画層のテストは書かない（見た目は手動QAとE2Eで確認）。coreはTDDで書く。
2. **決定論でテストする。** 本作に乱数はない。テストも固定データで再現可能にする。
3. **E2Eは本番相当で走らせる。** `pnpm build` 後の `vite preview`（ポート4173）に対してのみ実行する。
4. **テストは実装と同じコミットに置く。** core を変更したら unit テストを同時に更新する（AGENTS.md 規約）。
5. **テスト名は対象ファイルに対応させる。** `ResolutionEngine.ts` → `ResolutionEngine.test.ts`。

## 2. テストの階層

| 階層 | ツール | 対象 | 実行速度 |
| --- | --- | --- | --- |
| unit | Vitest（`happy-dom`） | `src/core/` のロジック | 秒単位。日常的に走らせる |
| E2E | Playwright | 画面遷移、入力、セーブ、タッチ | 分単位。コミット前とCIのみ |
| 生成物検証 | スクリプト | docs、アセット | コミット時 |
| 手動QA | 人 | 見た目、触り心地 | マイルストーンごと |

## 3. unit テストの対象

| 対象モジュール | 検証する振る舞い | 重要度 |
| --- | --- | --- |
| `resolution/ResolutionEngine` | ほころび指摘の正解/不正解、`gap` が null のブロック、証言ブロックの進行順 | 最高 |
| `resolution/MissCounter` | ミス加算、上限判定（3でゲームオーバー）、リトライ時のリセット | 最高 |
| `state/ChapterState` | 遷移の妥当性（調査前に解決へ飛べない）、`TransitionError` の返却 | 最高 |
| `save/SaveRepository` | 往復保存、破損データの初期化、`version` によるマイグレーション | 最高 |
| `investigation/InvestigationState` | 証拠入手、必須4件の充足判定、`hs_counter_slips` は洞察視点でのみ | 高 |
| `investigation/InsightMode` | 洞察視点の切替と、洞察専用ホットスポットの表示 | 高 |
| `story/StoryRunner` | カーソル進行、既読管理、テキスト長0の異常系 | 中 |
| `src/localization` | `LocKey` の型安全化（全キーが ja.json に存在）。unitではなく型で担保 | 型で担保 |

### 3.1 unit テストのルール

- DOM に触れない。`happy-dom` 環境でも動く。
- 固定データ（`tests/unit/fixtures/`）を使い、テスト間で状態を共有しない。
- 異常系は必ず書く: `TransitionError`、破損セーブ、空の証言ブロック。
- 1テスト1振る舞い。テスト名は**日本語の自然言語**で振る舞いを書く（例:「ミスが上限に達するとゲームオーバーになる」）。
- 実装の詳細（privateメソッド、呼び出し順）をテストしない。観測可能な振る舞いだけを確認する。
- core の新規ロジックはTDDで書く（[[docs/03_production/02_code-architecture/coding-standards]] §2）。

## 4. E2E テストの対象

Playwright（Chromium）。シナリオは遊びの動線順に並べる。

| シナリオ | 検証 |
| --- | --- |
| `e2e/smoke.spec.ts` | タイトル→章選択→第1章が開ける |
| `e2e/intro.spec.ts` | 導入ADVのテキスト送り、既読スキップ |
| `e2e/investigation.spec.ts` | 移動、バルーンボタンでの調べる/話す、証拠入手の進行 |
| `e2e/insight.spec.ts` | 洞察トグルと `hs_counter_slips` のみの発見 |
| `e2e/resolution.spec.ts` | 証言送り、問い返し、差し出し（正解・不正解） |
| `e2e/gameover.spec.ts` | ミス上限でゲームオーバー→リトライで解決パート冒頭 |
| `e2e/save.spec.ts` | 途中保存→再読込→続きから |
| `e2e/touch.spec.ts` | タッチ操作（`hasTouch: true`）で移動ボタンとバルーンボタンが動く |

### 4.1 E2E のルール

- セレクタは**データ属性**（`data-testid`）で指定する。CSSクラスや位置で指定しない。
- タッチテストは `contextOptions.hasTouch` を使う。
- 待ち時間の指定はロケーター（状態が変わるまで待つ）。`sleep` による固定待ちは書かない。
- スクリーンショット差分比較はやらない（AI生成アセットは変わるため）。
- テスト名は日本語の自然言語（`test("ミス3回でゲームオーバー画面が出る")`）。

## 5. 生成物の検証（コミット時）

| 対象 | 方法 |
| --- | --- |
| docs | `node scripts/validate-docs.mjs`（frontmatter9項目、wiki-link、traces_to） |
| アセット | `python3 scripts/process-assets.py` を再実行し、`public/assets` に差分が出ないことを確認（原画が変わらない限り生成物は同一） |
| フォント | `scripts/generate-bitmap-font.py` で再生成し、.fnt の文字数と docs の日本語に欠けがないか確認 |
| アセットライセンス | 追加素材が `docs/asset-licenses.md` に記録されているか（レビューで確認） |

## 6. 手動QAチェックリスト（マイルストーンごと）

- [ ] タッチ端末（実機 or 開発ツールのタッチエミュレート）だけで第1章を通しで遊べる
- [ ] 44px未満のタップ判定がない
- [ ] 移動中にバルーンボタンが出ない
- [ ] モーダル中に背景が反応しない
- [ ] 文字サイズ125%で文言が切れない
- [ ] フラッシュを無効にすると演出がフェードに変わる
- [ ] ミス上限3回でゲームオーバーし、リトライで復帰できる
- [ ] セーブ→再読込→続きからで位置・証拠・ミスが一致する
- [ ] 背景とキャラの画風が混ざって見えない
- [ ] 60fps相当の動作（プルーニング後の転送量で体感確認）

## 7. CI

GitHub Actions（`ci.yml` は実装開始時に作る）。

```yaml
# 1. pnpm install
# 2. pnpm typecheck
# 3. pnpm lint
# 4. pnpm test:run
# 5. pnpm build
# 6. pnpm test:e2e（build + preview を含む）
# 7. node scripts/validate-docs.mjs
# 8. python3 scripts/process-assets.py → git diff で差分0を確認
```

- すべて通ったコミットのみ main / proto/v2 に push を許可する。
- アセットの再生成で差分が出た場合、そのコミットは失敗とする（原画と生成物の不整合を防ぐ）。

## 8. 受け入れ基準（DoD）

| 項目 | 基準 |
| --- | --- |
| typecheck / lint | エラー・警告0 |
| unit | 全件成功。core の対象モジュールを90%以上カバー |
| E2E | 上記8シナリオが通る |
| docs / アセット検証 | エラー0 |
| 手動QA | チェックリスト全項目OK（章完成時） |

## 9. 未決事項

- スクリーンショット比較を使うか（AI生成アセットは差分が激しいので非推奨のまま）
- モバイル実機テストの環境（ブラウザの開発ツールか、実機デプロイか）
- `happy-dom` のテスト環境で Phaser のheadless起動が必要か（coreのみのテストなら不要）
