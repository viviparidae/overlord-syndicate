# AGENTS.md — Overlord Syndicate プロジェクトルール

> 1990年代日本を舞台にした横スクロールADV × 社会侵食シミュレーション。  
> 玩家的意思是「冷徹な最適解を突き通す」こと。その設計思想をコードにも反映する。

---

## 1. 作業規約 (General)

- **既存規約に合わせる。** 周囲のコードの書き方・命名・ファイル配置を先に読む。

詳細なコーディング規約・ガードレール・禁止事項は `.kilo/rules/coding-conventions.md` と `.kilo/rules/restricted-files.md` を参照すること。

> **Note:** コーディング規約（TypeScriptのみ、コメント禁止等）、品質ゲート、制限ファイル、秘密情報扱い、コミット規約、URL制限などはルールファイルに集約している。AGENTS.md はプロジェクト固有のアーキテクチャ・ドメイン知識・コマンド一覧に特化する。

### 1.1 ドキュメント管理 (FOAM)

- **プロジェクト内のすべてのドキュメント (`.md` ファイル) は FOAM 拡張機能で管理する。**
- `[[wiki-link]]` 構文で相互参照を行う。
- `docs/` ディレクトリを FOAM のワークスペースルートとする（存在しない場合は作成）。
- `AGENTS.md`、`README.md`、プランファイル、エージェント定義、スキル定義もすべて FOAM 管理下に置く。
- 新規ドキュメント作成時は `docs/` 配下に配置し、既存ファイルから `[[link]]` で参照可能にする。
- **スマートフォルダ（FOAM Smart Folders）**: `.foam/queries/*.yaml` に保存済みクエリを配置し、VS Code エクスプローラーのサイドバーにスマートフォルダとして表示する。ステータス（draft/review/approved/deprecated）・カテゴリ（design/architecture/balance/qa/localization）・孤立ドキュメント・検証未設定ドキュメントごとにフォルダを分割する。
- `docs/foam-smart-folders.md` で運用手順を記述し、`docs/index.md` から `[[wiki-link]]` を参照する。

### 1.2 トレーサビリティ（MD Editor Plus + FOAM）

- `docs/` のすべての `.md` ファイルに frontmatter を付与し、`title`, `description`, `status`, `version`, `category`, `tags`, `traces_to`, `implemented_by`, `verified_by` の 9 フィールドを設定する。
- `[[wiki-link]]` でドキュメント間・ドキュメント↔コード間のトレースを表現する。
- MD Editor Plus の Outline / 定義ジャンプ / 検索 / ボードビュー（Kanban）/ テーブルビューを活用し、ドキュメント構造とトレースを確認する。
- 実装変更時は対応する `.md` の `implemented_by` / `version` を同時に更新し、doc drift を防ぐ。

---

## 2. アーキテクチャ (Architecture)

関心の分離を厳守する。依存方向は **一方向のみ**。

```
src/data/  ──┐
src/balance/ ─┤
              ├──> src/core/ ──> src/phaser/ ──> src/ui/
src/localization/ ─┘   (Phaser非依存)   (描画層)    (DOMオーバレイ)
```

| ディレクトリ | 責務 | 禁止事項 |
|---|---|---|
| `src/core/` | 純粋ゲームロジック | **Phaser / DOM / Canvas の import 禁止。** ブラウザ API に依存しない。 |
| `src/phaser/` | 描画・アニメーション・入力 | core を import してよい。core のロジックを書かない。 |
| `src/ui/` | DOM オーバレイ (ステータスバー等) | core 状態を **読み取り専用** で反映する。直接書き換えない。 |
| `src/localization/` | 多言語リソース | ここにロジックを持ち越さない。 |
| `src/balance/` | コスト/リワード/閾値テーブル | 条件分岐ロジックを持ち越さない。 |
| `src/data/` | JSON ゲームデータ | TS ロジックを embed しない。 |

**core/ を headless で完全テスト可能に保つ。** `vitest` は `happy-dom` で走るが、`src/core/` のテストは DOM に触れない。

---

## 3. ゲームドメイン

### 3.1 3つの核心リソース + リスクカウンター

| リソース | 内部名 | 役割 | 上昇したときの副作用 |
|---|---|---|---|
| 資金 | `funds` (JPY) | 店運営・賄賂・不動産買収・工作資金 | — |
| 恐怖 | `fear` | NPC を脅迫・屈服させる力 | 上昇しすぎると **警戒度** が悪化する |
| 狂信 | `faith` | 民衆の熱狂。無償の手駒・支持率に変換 | — |
| 警戒度 | `suspect` | 警察/行政の注目度 | **100 でゲームオーバー** |

- 警戒度は「恐怖を濫用しすぎたペナルティ」であり、恐怖自体が悪ではない。プレイヤーが **効率とリスクのバランス** を設計する。
- **すべてのリソース変更は `Resources` クラス経由で行う。** 直接代入 (`state.funds = 100`) 禁止。

### 3.2 フェーズ進行 (4 Phase)

| Phase | 舞台 | 主たる手段 | 警戒度上限 |
|---|---|---|---|
| 1 | シャッター商店街 | 実家の文房具店、噂収集、悪徳地主の追放 | 30 |
| 2 | 地方都市 | 深夜ラジオ・地方局の電波ジャック、演説 | 60 |
| 3 | 首都・国家 | 全国ネットメディア支配、大企業買収、デモ統制 | 85 |
| 4 | グローバル | 世界金融・情報網の掌握 | 100 (勝利条件) |

- フェーズ昇格は `GameState` のステートマシンで管理する。`if (phase === 3)` のような直接比較を書かない。
- 昇格条件は `src/balance/Thresholds.ts` に集約する。

### 3.3 二面性 (Two-Face)

- **表の顔 (Public):** 実家の文房具店を切り盛り。礼儀正しく優秀な息子を演じる。警察/行政の警戒度を下げる。
- **裏の顔 (Private):** 日常会話や噂話から得たスキャンダルを武器に、裏社会の権力構造を書き換える。

この二面性は **演出とリソースの両方** に影響する。表の行動は警戒度を下げ、裏の行動は狂信/恐怖を稼いで警戒度を上げる。この緊張関係がゲームの中核。

### 3.4 トーン

- 1990年代特有の空気感：バブル崩壊後の陰鬱さ、ポケベル、テレホンクラブ、深夜ラジオ。
- メタナレーション（主人公が「ゲームである」ことを口的OBJECTに言う）は **禁止**。プレイヤーの冷徹な判断そのものがそのまま物語になる。
- テキスト・ログ・ダイアログはすべて日本語。ファイル名・識別子は英語。

---

## 4. ローカライズ

- `src/localization/ja.json` が **デフォルト**。キーの追加は必ず ja.json にも入れる。
- `src/localization/en.json` はフォールバック。ja.json にキーがあれば必ず en.json にも入れる。
- 取得は `t('key', { var: value })` (`src/localization/index.ts`)。テンプレートリテラルで直接キーは書かない。
- 通貨表示は `formatCurrency(10000)` → `¥10,000`。
- 1990年代の日付は `formatDate()` → `平成9年1月15日`。
- ユーザー向けテキストに英字のままの文面を漏らさない。

---

## 5. セーブシステム

- ローカルストレージキー: `overlord_syndicate_v1`。
- フォーマット: `GameStateSnapshot` の JSON。`version` フィールド必須。
- `GameEngine.execute()` の完了ごとに **自動保存** する。
- マイグレーションは `src/core/save/migrations/` にバージョンごとに置く。既存セーブを壊さない。
- 状態は循環参照を持たない。スナップショットは明示的なインターフェースで切り出す。

---

## 6. 品質ゲート

詳細なコマンドと基準は `.kilo/rules/coding-conventions.md` の "Quality Gates" を参照。

- `src/core/` を変更したら必ずユニットテストを追加・更新する。
- テスト名は対象ファイルに対応させる (`Resources.ts` → `Resources.test.ts`)。
- UI・入力・永続化を含む振る舞いは E2E (`tests/e2e/*.spec.ts`) で検証する。E2E は `pnpm build` 後の `vite preview` を対象とする。
- ゲーム破壊的バグ（セーブ破損・フェーズスキップ・負のリソース）は **ブロッカー**。軽微な表示崩れはこの限りではない。
- バグ報告は `templates/bug-report.md` テンプレートに従って、課題トラッカー（GitHub Issues）に登録する。記録なしは完了とみなさない。詳細なルールは参照する。

---

## 7. パフォーマンス

- 目標 60fps。`update()` 内での **オブジェクト生成を避ける**。プーリングを使う。
- ピクセルアート: `GameConfig` で `pixelArt: true`, `roundPixels: true`。テクスチャは `antialias: false`。
- 論理解像度は 960x540 を基準にする。`Scale.FIT` 想定。
- ジオメトリ/重力計算は毎フレームではなくイベント駆動で。

---

## 8. コマンド

| コマンド | 用途 |
|---|---|
| `pnpm dev` | Vite デベルタサーバー (localhost:5173) |
| `pnpm build` | プロダクションビルド → `dist/` |
| `pnpm preview` | ビルド結果のプレビュー |
| `pnpm lint` | Biome チェック |
| `pnpm lint:fix` | Biome 自動修正 |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Vitest (watch) |
| `pnpm test:run` | Vitest (1回実行) |
| `pnpm test:e2e` | Playwright E2E (1回実行。build + preview を自動起動) |
| `pnpm test:e2e:ui` | Playwright E2E (UI モード) |
| `pnpm docs:validate` | ドキュメント frontmatter・リンク切れ検証 |

Kilo 側のコマンド: `/dev` `/test` `/build` `/balance`

---

## 9. エージェントとスキル

`.kilo/agent/` に専門エージェント、`.kilo/skill/` に再利用スキル、`.kilo/command/` にスラッシュコマンドを配置する。

- 新しいエージェントを追加するときは `mode` (primary / subagent / all) を明示する。
- スキルは `SKILL.md` の frontmatter に `name` と `description` を必ず書く。`description` が発動条件になるので **トリガ关键词**（ファイル名・API名・タスク語）を含める。
- エージェント定義・スキル定義に記す参照パスは **実在するファイル** のみ。存在しないファイルを名指ししない（作成予定の場合は「planned」と明記する）。
- 定義はすべて日本語で書く。

### MD Editor Plus 活用ガイドライン

- 本プロジェクトでは `docs/` ディレクトリ配下の `.md` ファイルを MD Editor Plus (`AviranRevach/md-editor-plus`) のデータソースとして扱う。FOAM 拡張機能と組み合わせ、相互参照 `[[wiki-link]]` とともに活用する。
- MD Editor Plus 拡張機能がインストールされている前提で、以下の操作が可能:
  - `docs/` 内の frontmatter（YAML metadata）を検索・フィルタリング
  - ボードビュー（Kanban）で `status` フィールドでカラム分割し、カードのドラッグでステータス遷移
  - テーブルビューで `title`, `category`, `status`, `version`, `implemented_by`, `verified_by` を列ヘッダーとして一覧表示
  - Outline / 定義ジャンプ (`[[wiki-link]]` 先へジャンプ) / ファジーファインダー
- エージェント実行時のトリガー語（例: "md-editor-plus", "frontmatter", "board", "table-view", "wiki-link"）が検知された場合、MD Editor Plus 機能を補助的に活用する。
- 詳細な運用方法は [[docs/foam-smart-folders]] を参照。
