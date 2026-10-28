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

**目について**: 目を描かないのが理想だが、生成結果に目が描かれていても**潰さずに採用してよい**。
後処理で目を消す工程は設けない。目の有無で不合格にしない。

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
| 輪郭 | アルファ境界に1pxの濃色を付与（任意） |
| 検収 | 下記チェックリスト |

## 6. 検収チェックリスト

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

## 7. Nano Banana（Gemini アプリ）用プロンプト

Nano Banana は対話型の画像生成・編集モデル。**文章で指示し、参照画像で一貫性を保つ**のが特徴。
以下の英文をそのまま貼り付けて使う。比率は 1:1（スプライト・立ち絵）、16:9（背景）。

### 7.1 共通スタイル文（毎回の末尾に付ける）

```
Style: low-resolution 1998 PlayStation-era game art, muted desaturated palette,
harsh top-left key light, deep black shadows, coarse dithering, thick dark
outline, only 16 colors, grainy texture. No text, no logos, no watermark,
no smooth gradients, no antialiasing.
```

人物の場合は加えて:

```
Full body, standing, three-quarter side view, arms hanging at the sides,
hands hidden, plain flat magenta background for easy cutout.
```

（マゼンタ背景は切り抜き用。黒背景だと髪と服が溶ける）

### 7.2 スプライト（32×48の元画像）

| 人物 | プロンプト本文 |
| --- | --- |
| 篠宮 涼 | `A slim 27-year-old Japanese man, short black hair, navy blue work jacket over a white collared shirt, calm neutral expression, face half in shadow, small-town stationery shopkeeper.` |
| 郷田 権造 | `A large heavy-set 61-year-old Japanese man, short grey hair, tan zip-up jacket, flat cap, broad shoulders, confident angry expression, local landlord.` |
| 郷田 航 | `A small skinny 14-year-old Japanese boy, short dark hair, grey school blazer, white shirt, head slightly lowered, hands in pockets, sullen middle-school student.` |
| 松谷 静江 | `A 58-year-old Japanese woman, grey hair in a bun, purple apron over a white blouse, thin frame, tired calm expression, liquor store owner.` |
| 榎本 千夏 | `A 24-year-old slim Japanese woman, short black bob, orange jacket, white shirt, camera strap on her shoulder, curious expression, local newsletter editor.` |
| 岡田 修 | `A 19-year-old Japanese man, blue work overalls, white towel around his neck, short hair, awkward posture, shop helper.` |
| 辰巳 徳造 | `A 68-year-old large Japanese man, indigo samue workwear, flat cap, wrinkled calm face, neighborhood association chairman.` |
| 丸福 健太 | `A 22-year-old Japanese man, white apron over a light blue shirt, short hair, rubber boots, friendly open expression, tofu shop son.` |

### 7.3 立ち絵（128×160の元画像）

スプライトで採用した画像を**添付して編集モードで**指示する（同一性が保てる）。

```
Keep this exact character, same face, same colors, same lighting.
Change only the framing to a chest-up bust portrait, facing the camera,
plain dark grey background, keep the low-resolution pixelated PS1 look.
```

- 参照画像なしで作る場合: スプライト用の本文 + `bust portrait, chest-up, facing the camera, plain dark grey background`。
- 顔伏せカット（全員共用）: `Keep this character. Lower the head so the face is completely in shadow, looking down, same framing and colors.`

### 7.4 背景（16:9・人物なし）

| 用途 | プロンプト |
| --- | --- |
| 中央通り・中景 | `A 1990s Japanese covered shopping arcade at dusk, half of the fluorescent lights broken, shuttered shops, a notice board, a public phone booth, a wooden office door, empty street, no people, no readable signs.` |
| 中央通り・遠景 | `A distant evening skyline of a small Japanese town, power lines, low buildings, darkening sky, no people.` |
| 西口・中景 | `The west end of a 1990s Japanese shopping arcade, a small stationery shop with a glass front, a vending machine, closed shutters, no people, no readable signs.` |
| 東口・中景 | `The east side of a Japanese shopping arcade, a tofu shop, a liquor shop with a noren curtain, a photo studio display case, a real-estate office, no people, no readable signs.` |
| 組合事務所 | `A small neighborhood association office interior at night, a wooden desk, a black telephone, filing cabinets, three waiting chairs, one fluorescent light, no people.` |

背景は毎回 `Style:` 文を付ける。文字・人物・現代的な機器（スマホ、LED）を入れない。
1レイヤずつ生成する（1枚絵から層を分けない）。

### 7.5 UI・アイコン

```
Style: 1998 PlayStation game UI, low-resolution pixel art, dark navy panel,
thin beige 1px border, subtle dithering, no text. A rectangular dialogue
window frame suitable for 9-slice scaling, flat front view.
```

証拠アイコンはフリー素材（game-icons.net）で足りるため、生成は任意。

### 7.6 Nano Banana で失敗しやすい点と対処

| 症状 | 対処 |
| --- | --- |
| ドットが細かすぎる／滑らかになる | `coarse dithering, visible square pixels, low resolution` を強調。`smooth shading` を禁止語に |
| 目や指が崩れる | 目はそのまま採用可。指は `hands hidden` で回避 |
| 文字が入る | `no text, no letters, no signage` を必ず付ける |
| 8人の画風がバラける | 涼の採用画像を毎回添付し、`same style as the reference image` と指示 |
| 背景が人物と合わない | 背景も同じ `Style:` 文で生成し、後で16色へ減色 |
| 比率が違う | アプリ側で 1:1 / 16:9 を指定。指定できない場合はプロンプト冒頭に `square image` / `wide 16:9 image` |

### 7.7 生成後の処理

0. 原画は `assets-src/generated/{characters,portraits,backgrounds,ui}/` に `_raw` 付きで保存する（例: `char_ryo_raw.png`）
1. 1:1 の元画像を **32×48（スプライト）/ 128×160（立ち絵）/ 320×180（背景）** へ最近傍縮小
2. 16色へ減色（ディザあり）
3. マゼンタ背景を透過に置換
4. 3倍表示で確認
5. 確定版を `public/assets/{characters,portraits,backgrounds,ui}/` へ置く（`char_ryo.png`）

置き場所の規則は [[docs/03_production/01_conventions/directory-structure]] を参照。



## 8. 追加生成用プロンプト（不足分）

### 8.1 遠景レイヤ3枚（16:9）

共通 `Style:` 文 + 次の本文。

| 用途 | プロンプト |
| --- | --- |
| 西口・遠景 | `A distant evening skyline of a small Japanese town seen from inside a shopping arcade, power lines, distant apartment blocks, darkening sky, no people, no readable signs.` |
| 東口・遠景 | `A distant evening view of a small Japanese town street continuing east, telephone poles, low rooftops, faint windows, no people, no readable signs.` |
| 組合事務所・遠景 | `A plain dim wall of a small office, a frosted glass window, faint yellow light, flat and uncluttered, no people, no readable signs.` |

### 8.2 証拠アイコン9枚（1:1、16×16に縮小）

共通の接頭語:

```
A single item on a flat magenta background, thick dark outline, low-resolution
1998 PlayStation pixel art style, muted colors, no text, no shadows on the
background.
```

| 証拠 | 本文 |
| --- | --- |
| 被害帳簿 | `An open handwritten shop ledger with columns of dates and item names, slightly worn.` |
| 防犯用VHS | `A black VHS video cassette tape with a white label.` |
| 航のノート | `A small closed school notebook with a pen, slightly crumpled.` |
| 篠宮文具店の購入控え | `A small stack of handwritten purchase slips with dates and item names, bound with a clip.` |
| 健太の目撃 | `A witness testimony card with a hand-drawn silhouette of a person.` |
| 松谷の報告 | `A folded expense report sheet with numbers.` |
| 郷田の発言 | `A speech note card with a firm handwritten mark.` |
| 過去の処理記録 | `A stack of old filed documents tied with a string.` |
| 郷田のメモ | `A small memo paper with a short handwritten scrawl and a phone number.` |

保存先: `assets-src/generated/evidence/{名前}.jpg`（名前は `scripts/process-assets.py` の `EV_IDS` どおり）。
保存後 `python3 scripts/process-assets.py` で `public/assets/evidence/icon_ev_*.png`（16×16）を生成する。

### 8.3 横スクロール用の背景（差し替え・必須）

現在の背景は「正面から見た1枚絵」で、横スクロールに必要な**側面パノラマ**になっていない。
調査パート用には次の条件を満たす画像に差し替える。

- 真横からの視点（カメラは店先と平行）。**消失点のある奥行き表現を禁止**
- 画面下25%は歩行できる地面。地面ラインは水平で固定
- 店先が等間隔に並び、左右の端で絵がつながる（水平タイル可能）
- 人物が立つ尺度: 店のシャッターの高さが画面の約3/4、人物は画面の約1/4
- 中央に目立つモチーフを置かない（キャラと重なる）

共通の接頭語:

```
side-scrolling 2D game background, strict side view, camera parallel to the
storefronts, NO perspective vanishing point, flat horizontal ground line at
75% of the height, walkable pavement along the bottom quarter, continuous row
of evenly spaced shopfronts, seamless horizontally tileable (left edge matches
right edge), no people, no readable signs, no centered hero object,
, ps1 1998 low-poly scene, muted desaturated palette, coarse dithering,
thick dark outline, low resolution pixelated texture, 16 colors
```

| 用途 | 本文 |
| --- | --- |
| 中央通り・中景 | `A 1990s Japanese covered shopping arcade seen from the side: shutters, a stationery shop, a notice board, a public phone booth, a wooden office door, all in a row at the same depth.` |
| 中央通り・遠景 | `A flat distant row of low buildings behind the arcade, seen from the side, no depth lines, dark evening sky.` |
| 西口・中景 | `The west end of the arcade seen from the side: a stationery shop with a glass front, a vending machine, closed shutters in a row.` |
| 東口・中景 | `The east side of the arcade seen from the side: a tofu shop, a liquor shop with a noren curtain, a photo studio display case, a real-estate office, all in a row.` |
| 組合事務所 | `A small office interior seen from the side wall: desk, telephone, filing cabinets, waiting chairs along one wall, flat side view.` |

差し替え後: `assets-src/generated/backgrounds/` に置き、`python3 scripts/process-assets.py` を実行する。


- 生成モデル（ローカル/API）と商用条件 → 決定後に上表へ反映
- 一度に生成する枚数（モデルの料金・レート制限に応じて）