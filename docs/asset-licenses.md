---
title: アセットライセンス記録
description: 外部素材・AI生成物の出典、規約、生成日を記録する台帳。
status: draft
version: "0.1"
category: design
tags: [assets, license, legal, ai]
traces_to:
- docs/03_production/01_conventions/asset-sourcing-policy.md
- docs/03_production/03_art-animation/character-art-plan.md
implemented_by: []
verified_by: []
---

# アセットライセンス記録

外部素材・AI生成物を追加したら、必ずこの表に記録する。記録のない素材はリポジトリに入れない。

## 1. AI生成物

| アセット | モデル | 生成日 | 商用利用 | 備考 |
| --- | --- | --- | --- | --- |
| `assets-src/generated/characters/*.jpeg`（8人×通常/伏せ） | Nano Banana（Gemini） | 2026-10-28 | 未確認 | スプライト・立ち絵の原画。プロンプトは [[docs/03_production/03_art-animation/ai-prompt-book]] |
| `assets-src/generated/backgrounds/*.jpeg`（5枚） | Nano Banana（Gemini） | 2026-10-28 | 未確認 | 背景4エリアの中景3・遠景1＋事務所 |
| `assets-src/generated/ui/UI枠.jpeg` | Nano Banana（Gemini） | 2026-10-28 | 未確認 | 9スライス用ダイアログ枠 |
| `assets-src/generated/evidence/*.jpeg`（9枚） | Nano Banana（Gemini） | 2026-10-28 | 未確認 | 証拠アイコン原画 |

- 加工版（`public/assets/` の縮小・減色済みPNG）は上記原画の派生物。
- **商用利用は未確認**。Gemini利用規約で商用利用・生成物の権利関係を確認し、確認後にこの表を更新する。

記録項目: ファイル名 / 使用モデルとバージョン / 生成日 / モデル規約の商用利用可否 / プロンプトの要約。

## 1.5 コード生成アセット

| アセット | 生成方法 | ライセンス | 備考 |
| --- | --- | --- | --- |
| `public/assets/backgrounds/bg_*.png` | `scripts/generate-placeholder-backgrounds.py`（Pillow） | 自作（制約なし） | AI生成が使えない間の仮背景。差し替え前提 |

## 2. フリー素材

| アセット | 出典URL | ライセンス | クレジット表記 | 導入日 |
| --- | --- | --- | --- | --- |
| （未使用） | - | - | - | - |

## 3. フォント

| フォント | 出典 | ライセンス | 同梱可否 |
| --- | --- | --- | --- |
| `assets-src/fonts/PixelMplus12-Regular.ttf` | https://github.com/itouhiro/PixelMplus | M+ FONT LICENSE（商用可・改変可・再配布可・無保証） | 可。`public/assets/fonts/pixelmplus12.{png,fnt}` として同梱（LICENSE-PixelMplus.txt を同梱） |
| `public/assets/fonts/pixelmplus12.{png,fnt}` | 上記TTFから生成 | 上記に従う（派生物） | 可 |

## 4. 音源

| アセット | 出典 | ライセンス | クレジット | 導入日 |
| --- | --- | --- | --- | --- |
| （未選定） | - | - | - | - |

## 5. 禁止事項

- 出典不明の素材を置かない。
- 再配布禁止の素材をビルド成果物に同梱しない。
- 実在の人物・店舗・作品に似た要素を使わない。
