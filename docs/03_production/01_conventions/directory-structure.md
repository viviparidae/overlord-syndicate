---
title: プロジェクト内階層ルール
description: docs/ と src/ の階層、依存方向、各ディレクトリの責務と禁止事項。
status: draft
version: "0.1"
category: architecture
tags: [architecture, structure, layering]
traces_to:
- docs/03_production/02_code-architecture/architecture.md
implemented_by: []
verified_by: []
---

# プロジェクト内階層ルール

## 1. ルート

```
overlord-syndicate/
├── docs/            # 設計ドキュメント（FOAM）
├── public/assets/   # 画像・音声・フォント
├── src/             # ゲームコード
├── tests/           # unit / e2e
├── scripts/         # 開発補助スクリプト（docs検証など）
└── .foam/queries/   # FOAM スマートフォルダ定義
```

## 2. docs/

```
docs/
├── index.md
├── 01_concept/
├── 02_game-spec/
│   ├── 01_flow-ui/
│   ├── 02_system-rules/
│   └── 03_level-design/
├── 03_production/
│   ├── 01_conventions/
│   ├── 02_code-architecture/
│   ├── 03_art-animation/
│   └── 04_audio/
├── 04_lore/
└── 05_archive/
```

- ドキュメントは**必ず frontmatter 9項目**（`title`, `description`, `status`, `version`, `category`, `tags`, `traces_to`, `implemented_by`, `verified_by`）を持つ。
- 新しい設計判断は該当ディレクトリに追加し、`docs/index.md` からリンクする。
- 廃止した仕様は削除せず `05_archive/` へ移す。

## 3. src/

```
src/
├── core/            # Phaser非依存の純粋ロジック
│   ├── story/       # ADV進行（テキスト送り、選択肢）
│   ├── investigation/ # ホットスポット、エリア移動、証拠入手
│   ├── resolution/  # 証言ブロック、つきつけ判定、ミスカウント
│   ├── save/        # スナップショット、マイグレーション
│   └── state/       # 章進行状態（フラグ、所持証拠）
├── phaser/          # 描画・入力・シーン
│   └── scenes/
├── ui/              # DOMオーバーレイ（HUD、ポーズ、ゲームオーバー）
├── data/            # 章・証言・会話・アセット定義（TS/JSON）
├── balance/         # ミス上限、難易度パラメータ表
└── localization/    # ja.json / en.json
```

## 4. 依存方向

```
src/data ─┐
src/balance ─┤
             ├──▶ src/core ──▶ src/phaser ──▶ src/ui
src/localization ─┘
```

- 一方向のみ。逆流（phaser → core への状態書き戻し等）は禁止。
- `src/core/` は Phaser / DOM / Canvas / `window` を import しない。
- `src/ui/` は core の状態を**読み取り専用**で表示する。直接書き換えない。
- `src/data/` に条件分岐ロジックを書かない。`src/balance/` に分岐を書かない。

## 5. tests/

```
tests/
├── unit/            # core のロジック（DOM非依存）
└── e2e/             # 画面遷移・入力・セーブ（build + preview 対象）
```

- `src/core/` を変更したら unit テストを同時に更新する。
- 画面遷移、入力、セーブを跨ぐ挙動は e2e で検証する。

## 6. 命名・配置の判断基準

| 迷った場合 | 置き場所 |
| --- | --- |
| 表示文言 | `src/localization/ja.json` |
| 数値（ミス上限、移動速度） | `src/balance/` |
| 章の証拠・証言データ | `src/data/chapters/chNN/` |
| 「次に何をすべきか」の判断 | `src/core/` |
| アニメーションの見た目 | `src/phaser/` または `src/data` の演出定義 |
