# Plan: Overlord Syndicate エージェントルール & スキル定義

> **ステータス:** 実装可能 (implementation-ready)  
> **言語:** 日本語  
> **プランファイルに関するルール:** 今後作成するプランファイルはすべて日本語で記述する。

---

## 1. プロジェクト概要

| 項目 | 内容 |
|---|---|
| **プロジェクト名** | Overlord Syndicate (オーバーロード・シンジケート) |
| **ジャンル** | 横スクロールADV × 社会侵食シミュレーション |
| **舞台** | 1990年代日本 (バブル崩壊後) |
| **リポジトリ** | `github.com/viviparidae/overlord-syndicate` |
| **スタック** | TypeScript + Vite + Phaser.js + Vitest + Biome |
| **状況** | 初期状態 — README.mdのみ存在。`LICENSE`, `.gitignore`, `package.json` すべて不在。`kuro.jsonc` なし。`.kilo/plans/` 空。 |

---

## 2. 主要決定事項 (Resolved)

| カテゴリ | 選択 | 理由 |
|---|---|---|
| **Phaserバージョン** | **3.85.x** (4.x不採用) | 4.2.1は2025年1月リリース。WebGPU+API破壊的変更あり。3.xはADV/シミュレーションに成熟している。 |
| **パッケージマネージャー** | **pnpm 9** | npmより高速。ワークスペース対応。 |
| **Node.js** | **22.x** | Vite 8はNode 20.19+必須。`.nvmrc` + `packageManager`フィールドでピン可。 |
| **テストフレームワーク** | **Vitest + happy-dom** | Viteネイティブ統合。ヘッドレスでシミュレーションテスト可能。 |
| **リンター/フォーマッタ** | **Biome 2.x** | ESLint+Prettierの代替。インクリメンタル高速。 |
| **i18n方針** | **カスタム軽量** (`src/localization/`) | `ja.json` (デフォルト) + `en.json` (フォールバック)。`t('key', vars)`。i18nextは不要。 |
| **セーブ形式** | **localStorage** (`overlord_syndicate_v1`) | シングルプレイヤーブラウザゲーム。JSONシリアライズ。バージョン管理+マイグレーション。 |
| **デプロイ先** | **GitHub Pages** | `peaceiris/actions-gh-pages` CIで自動デプロイ。 |
| **RNG** | **Seeded mulberry32** | 再現性。テスト可能。セーブから復元時も同じシードで同じ結果。 |
| **ゲームループ** | **固定タイムステップ 60fps** | `src/core/` は純粋ロジック(Phaser非依存)。ヘッドレスユニットテスト可能。 |
| **アセット** | **プロシージャルプレースホルダー** | `Phaser.Graphics`で生成。外部アセット予算なし。 |
| **データ形式** | **JSON in `src/data/`** | 対話/イベント/アイテム/バランステーブル。データベースなし。 |
| **ディレクトリ構造** | `src/core/` (ロジック) + `src/phaser/` (レンダー) + `src/ui/` (DOM) + `src/localization/` + `src/balance/` + `src/data/` | 関心の分離。core→phaser依存だけ。 |

---

## 3. ディレクトリ構造

```
.
├── src/
│   ├── core/                          # 純粋ゲームロジック (Phaser非依存)
│   │   ├── GameEngine.ts              # メインループ、シーンライフサイクル
│   │   ├── Resources.ts               # 資金/恐怖/狂信/警戒度トラッカ
│   │   ├── GameState.ts               # フェーズFSM (商店街→地方都市→首都→グローバル)
│   │   ├── EventSystem.ts             # 型付きイベントエミッタ
│   │   ├── RNG.ts                     # Seeded mulberry32
│   │   ├── actions/                   # プレイヤーアクション (純関数)
│   │   │   ├── runShop.ts
│   │   │   ├── spreadRumor.ts
│   │   │   └── intimidate.ts
│   │   └── save/
│   │       ├── Serializer.ts          # JSON シリアライズ/デシリアライズ
│   │       └── migrations/
│   │           └── v1-migrate.ts      # 初期マイグレーション
│   ├── phaser/                        # 描画レイヤのみ
│   │   ├── scenes/                    # BootScene, StreetScene, ShopScene, TerminalScene
│   │   ├── entities/                  # Player, NPCs
│   │   ├── managers/
│   │   │   └── AssetManager.ts        # アセットロード、プレースホルダ生成
│   │   └── config.ts                  # Phaser.GameConfig (960x540, pixelArt)
│   ├── ui/                            # DOMオーバレイ
│   │   ├── StatusBar.ts
│   │   ├── CommandPanel.ts
│   │   ├── LogConsole.ts
│   │   └── index.html                 # レトロスタイルテンプレート
│   ├── localization/
│   │   ├── index.ts                   # t(), formatCurrency(), formatDate()
│   │   ├── ja.json                    # デフォルト
│   │   └── en.json
│   ├── balance/
│   │   ├── Costs.ts                   # アクションコスト/リワードテーブル
│   │   └── Thresholds.ts              # フェーズ遷移閾値
│   ├── data/                          # JSONゲームデータ
│   │   ├── dialogue/
│   │   ├── events/
│   │   └── items/
│   └── main.ts                        # エントリポイント
├── tests/
│   ├── unit/                          # core/ ロジックのユニットテスト
│   └── integration/                   # 統合テスト
├── .kilo/
│   ├── agents/                        # エージェント定義
│   ├── command/                       # コマンド定義
│   └── skill/                         # スキル定義
├── .github/workflows/ci.yml
├── AGENTS.md
├── .kilo/kilo.json
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── biome.json
├── .nvmrc
├── .gitignore
├── LICENSE
└── README.md
```

---

## 4. AGENTS.md (リポジトリルート — Kiloが自動検出)

```markdown
# AGENTS.md — Overlord Syndicate プロジェクトルール

## 一般
- TypeScriptのみ。src/ にplain JSを書かない。
- ユーザーが明示的に要求しない限り、コメントを追加しない。
- コード変更完了前に **biome lint + tsc --noEmit** が必ずPASSする。
- 秘密鍵をログに出力しない。
- エージェントの失敗は記録され、類似の将来のエラーを回避するために利用されること。

## アーキテクチャ
- `src/core/` = 純粋ゲームロジック。Phaserインポート禁止。ユニットテスト可能。
- `src/phaser/` = 描画/アニメーション層。coreをインポートできるが逆は不可。
- `src/ui/` = DOMオーバレイ。core状態を読み取り専用で更新。
- `src/data/` = JSONゲームデータ。TSロジックを含めない。

## 資源システム
- 資金 (JPY)：店運営、賄賂、不動産
- 恐怖：NPCを脅す。上昇しすぎると警戒度上昇
- 狂信：群衆支援。演説/プロパガンダの力
- 警戒度 (Suspect)：警察の注目度。100に達するとゲームオーバー

## フェーズ
1. 商店街 → 2. 地方都市 → 3. 首都 → 4. グローバル

## ローカライズ
- `src/localization/ja.json` はDEFAULT。すべてのキーはここに。
- `t('key', { var: value })` を使用。

## セーブシステム
- Key: `overlord_syndicate_v1`
- JSON形式のGameStateSnapshot
- 重要なアクション後に自動保存
- マイグレーションは `src/core/save/migrations/`

## コマンド
- `pnpm dev` / `pnpm build` / `pnpm test` / `pnpm lint` / `pnpm typecheck`

## エージェント学習メカニズム
- エージェントの実行結果（成功/失敗）は `.kilo/agent-learning/` に JSON で記録される
- 失敗パターン（構文エラー、タイプエラー、実行時例外など）は分類され、同じタスクを再実行する際に警告または提案として表示される
- 「ブロッカー」級の失敗（セーブ破損、フェーズスキップ、負のリソース）は次回同種のタスクで自動的に回避策が提示され、エージェントはそれを参照してから作業を進めること
- 学習データは `pnpm run learn` コマンドで確認・クリアできる