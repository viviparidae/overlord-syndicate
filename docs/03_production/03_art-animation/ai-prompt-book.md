---
title: AI生成プロンプト集
description: PS1風スタイルの人物・背景を生成するための共通スタイル句、人物別プロンプト、後処理、検収手順。
status: draft
version: "0.1"
category: design
tags: [art, ai, prompt, pixel-art, ps1, production]
traces_to:
- docs/03_production/03_art-animation/character-art-plan.md
- docs/03_production/03_art-animation/background-art-plan.md
- docs/asset-licenses.md
implemented_by: []
verified_by: []
---

# AI生成プロンプト集

人物・背景を PS1（MGS1風）の粗いドットで生成するための指示書。
モデル非依存で書く。生成は3案 → 選定を基本とし、選定結果は [[docs/asset-licenses]] に記録する。

## 1. 共通

### 1.1 スタイル句（後置き）

すべてのプロンプトの末尾に付ける固定句:

```
, ps1 1998 low-poly survival-horror character, muted desaturated palette,
harsh top-left key light, coarse dithering, thick dark outline,
low resolution pixelated texture, no visible eyes, plain dark background,
no text, no watermark
```

### 1.2 ネガティブ指定

```
detailed eyes, iris, pupil, anime style, smooth gradient, high resolution,
photorealistic, antialiasing, glossy, glow, text, letters, logo, watermark,
extra limbs, extra fingers
```

### 1.3 立ち位置の指示

- スプライト: `full body, side view, standing, one object centered`
- 立ち絵: `bust portrait, front / three-quarter view, chest and above`
- どちらも **腕と手を体に沿わせる**（`arms at sides, hands hidden in sleeves`）— 指の破綻を避ける。

## 2. スプライト（32×48・8人）

| 人物 | 指示 |
| --- | --- |
| 篠宮 涼（27） | `slender young japanese man, short black hair, navy blue work jacket, collared shirt, calm posture, small-town shopkeeper` |
| 郷田 権造（61） | `large old japanese man, short grey hair, tan jacket, cap, broad shoulders, landlord` |
| 郷田 航（14） | `small skinny japanese schoolboy, grey uniform blazer, short dark hair, looking down slightly, middle-school student` |
| 松谷 静江（58） | `middle-aged japanese woman, grey bun, purple apron over white blouse, sleeves rolled up` |
| 榎本 千夏（24） | `young slim japanese woman, short bob black hair, orange jacket, white shirt, shoulder bag` |
| 岡田 修（19） | `young japanese man, blue work overalls, towel around neck, practical` |
| 辰巳 徳造（68） | `large elderly japanese man, dark blue kimono-style workwear (samue), cap, vegetable store owner` |
| 丸福 健太（22） | `cheerful young japanese man, white apron, light blue shirt, rubber boots, tofu shop` |

- 体格差は体型ワード（`slender` / `large` / `small skinny`）で指定し、拡大率（0.85〜1.05）と併用する。
- 少年（航）の `looking down` は下を向く姿勢。泣きではない（表情差分を使わないため姿勢で示す）。

## 3. 立ち絵（128×160・8人）

スプライトと同じ人物指示に、次を置換: `full body, side view` → `bust portrait, front view`。

- 例（涼）:
  `bust portrait of a slender young japanese man, short black hair, navy work jacket` + スタイル句。
- 顔伏せカット: `bust portrait, head lowered, face fully in shadow, looking at the ground`。
  この1枚を全員で使い回す（下向きの差分を作らない）。

## 4. 背景（320×180・4エリア × 2層）

共通背景句:

```
, ps1 1998 low-poly scene, muted desaturated palette, coarse dithering,
thick dark outline, low resolution pixelated texture, no characters,
no people, no animals, no readable text, no signs with letters, no logo
```

| エリア | 遠景（0.3） | 中景（1.0） |
| --- | --- | --- |
| `arcade_west` | `evening skyline of a small japanese town, power lines` | `west end of a 1990s japanese covered shopping arcade, shuttered shops, a stationery store front, vending machine` |
| `arcade_center` | `evening skyline, streetlights just turning on` | `central japanese shopping arcade, arcade ceiling lights, several flickering, notice board, public phone booth, office door` |
| `arcade_east` | `evening skyline, antennae` | `east side of the arcade, tofu shop, liquor shop with noren curtain, photo studio display case, real estate office` |
| `shotengai_office` | `plain wall with frosted glass window, low light` | `interior of a small neighborhood association office, desk, telephone, filing cabinets, waiting chairs` |

- 中景にホットスポット（掲示板、電話、事務机、待合椅子）を入れる。実際の座標はデータ側で持つ。
- 夕方1枚を生成し、夜はエンジンのティントで作る（[[docs/03_production/03_art-animation/background-art-plan]]）。

## 5. 後処理（全生成共通）

| 工程 | 内容 |
| --- | --- |
| 背景除去 | 単色背景前提。アルファを自動除去 |
| 縮小 | スプライト 32×48 / 立ち絵 128×160 / 背景 320×180へ最近傍縮小 |
| 減色 | 16色へ量子化（ディザあり） |
| 目潰し | 目の領域を暗色で塗る。白目・瞳を削除 |
| 輪郭 | アルファ境界に1pxの濃色を付与 |
| 検収 | 下記チェックリスト |

## 6. 検収チェックリスト

- [ ] 目が描かれていない（眼窩の影のみ）
- [ ] 指・手の破綻がない
- [ ] 1x で誰だか判別できる
- [ ] 16色以内
- [ ] 3倍表示でドットが四角い（AAなし）
- [ ] 背景と並べて絵の粒が揃う（背景側も同モデル・同減色）
- [ ] 実在の人物・作品・ブランドに似ていない
- [ ] 生成モデルと日付を [[docs/asset-licenses]] に記録

不合格はページ側を差し替える。1案しか作らないと費やしたプロンプト時間が無駄になるため、**3案生成して1案採用**を守る。

## 6.1 生成ログ

| 日付 | 種類 | 人物/エリア | モデル | 採用案 | 備考 |
| --- | --- | --- | --- | --- | --- |
| （未使用） | スプライト | 涼 | - | 0/3 | - |

## 7. 未決事項

- 生成モデル（ローカル/API）と商用条件 → 決定後に上表へ反映
- 一度に生成する枚数（モデルの料金・レート制限に応じて）