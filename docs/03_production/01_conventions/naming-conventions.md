---
title: ファイル・フォルダ命名規則
description: リポジトリ内のファイル名、識別子、アセットID、ドキュメント命名の規則。
status: draft
version: "0.1"
category: architecture
tags: [convention, naming]
traces_to:
- docs/03_production/01_conventions/directory-structure.md
implemented_by: []
verified_by: []
---

# ファイル・フォルダ命名規則

## 1. 基本原則

- **コードとアセットのファイル名は英語**、画面に出す文字列は日本語（`ja.json`）。
- 単語区切りは小文字ケバブ（`kebab-case`）をファイル名に、識別子は言語慣習に従う。
- 略語は既知のもののみ（`ev` 証拠、`hs` ホットスポット、`t` 証言、`bg` 背景、`se`、`bgm`）。

## 2. TypeScript

| 対象 | 規則 | 例 |
| --- | --- | --- |
| クラス | PascalCase、原則1ファイル1クラス | `ResolutionEngine.ts` |
| 型・インターフェース | PascalCase、`I` 接頭辞なし | `TestimonyBlock` |
| 関数・変数 | camelCase | `offerEvidence()` |
| 定数 | UPPER_SNAKE | `MISS_LIMIT_DEFAULT` |
| テスト | 対象ファイル名 + `.test.ts` | `ResolutionEngine.test.ts` |
| E2E | 画面・機能名ケバブ + `.spec.ts` | `resolution-miss.spec.ts` |

## 3. データID

| 種別 | 接頭辞 | 形式 | 例 |
| --- | --- | --- | --- |
| 章 | `ch` | `chNN` | `ch01` |
| エリア | `area_` | `area_{name}` | `area_arcade_center` |
| ホットスポット | `hs_` | `hs_{name}` | `hs_safe` |
| 証拠 | `ev_` | `ev_{name}` | `ev_ledger_theft` |
| 証言 | `t_` | `t_{speaker}` | `t_goda` |
| 証言ブロック | `{t-id}_` | `t_goda_02` | `t_goda_02` |
| 会話 | `talk_` | `talk_{speaker}_{nn}` | `talk_matsutani_01` |
| フラグ | `f_` 任意 | 動詞過去形 | `f_heard_alibi` |
| ローカライズ | 名前空間 | `testimony.goda.02` | - |

IDは**英語のみ・snake_case**。表示名は必ずローカライズキーで持つ。

## 4. アセット

```
public/assets/
├── backgrounds/    bg_{area}_{variant}.png
├── characters/     char_{speaker}_{state}.png
├── portraits/      face_{speaker}_{emotion}.png
├── evidence/       icon_ev_{name}.png
├── ui/             ui_{part}_{element}.png
├── audio/
│   ├── bgm/        bgm_{scene}.ogg
│   └── se/         se_{action}.ogg
└── fonts/          font_{name}.woff2
```

- 連番は 2桁ゼロ埋め（`bg_arcade_center_01.png`）。
- バリエーションは末尾に用途名（`_night`, `_rain`）。`_new`, `_final` は禁止。

## 5. ドキュメント

- ディレクトリは `NN_snake-case`（番号は並び順）。例: `02_game-spec`, `03_production`。
- ファイルは英語ケバブ。日本語タイトルは frontmatter の `title` に置く。
- 相互参照は FOAM の wiki-link で書く。例: `[[docs/02_game-spec/02_system-rules/game-loop]]`（拡張子なし）。

## 6. ブランチ・コミット

| 種別 | 形式 | 例 |
| --- | --- | --- |
| ブランチ | `type/short-description` | `docs/game-loop-spec` |
| プロトタイプ | `proto/vN` | `proto/v2` |
| コミット | Conventional Commits | `docs: add resolution rules` |

## 7. 禁止

- 日本語ファイル名（`画面遷移.md` など）。FOAM の wiki-link は日本語パスも解決するが、リポジトリ規約として英語に統一する。
- 空白を含むファイル名。
- 大文字小文字だけが異なるファイルの共存（macOS/Windows で衝突する）。
