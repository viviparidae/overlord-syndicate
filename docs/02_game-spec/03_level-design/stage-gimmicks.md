---
title: ステージ構成・ギミック
description: 第1章の商店街レイアウト、ホットスポット配置、調査ギミックを定義する。
status: draft
version: "0.1"
category: design
tags: [level-design, stage, gimmick, chapter1]
traces_to:
- docs/02_game-spec/02_system-rules/game-loop.md
- docs/04_lore/story-timeline.md
implemented_by: []
verified_by: []
---

# ステージ構成・ギミック

## 1. 舞台: 白鷺銀座商店街

平成9年4月。アーケードの電灯は半分が切れ、閉まったシャッターには「テナント募集」の貼り紙。
画面は横1方向のスクロール。全長は実装上都合のよい3画面分（2880px 相当）を上限とする。

### エリア構成

| エリアID | 名称 | 幅（論理px） | 主な要素 |
| --- | --- | --- | --- |
| `arcade_west` | 西口・篠宮文具店 | 960 | 自店、主人公の作業机、店先の陳列 |
| `arcade_center` | 中央通り | 960 | アーケード中央、電灯、掲示板、組合事務所の入口 |
| `arcade_east` | 東口・丸福商店 | 960 | 豆腐屋、酒屋、写真館、地主の事務所 |
| `shotengai_office` | 組合事務所（室内） | 960 | 机、電話、過去の対応記録、待合椅子 |

エリア間は画面端でつながる（ロードなし）。`shotengai_office` のみ入口ホットスポットから入る。

## 2. 調査ギミック

### 2.1 二つの視点

本作の探索は「日常の視点」と「店主の視点」の2層で構成する。
店主の視点は、**人の言葉の裏と物の不自然さ**が見える状態。特殊能力ではなく、商売で培った観察眼として描く。

| 視点 | 見えるもの | 切替 |
| --- | --- | --- |
| 日常 | 通常のホットスポット、人物 | 既定 |
| 洞察 | 追加ホットスポット（`insight`）、人物の「言い淀み」マーカー | `Shift` 長押し / 専用ボタン |

- 洞察視点中は移動速度が半減する（考えながら歩く演出）。
- 洞察視点でしか見つからない必須証拠が、章1では4件中1件。
- 洞察視点の使用に制限は設けない（回数制限はテンポを損なうため不採用）。

### 2.2 ホットスポット一覧（第1章）

| ID | エリア | 種別 | 内容 | 入手 |
| --- | --- | --- | --- | --- |
| `hs_shop_counter` | west | inspect | レジ横の被害帳簿。万引きの日時と品目が手書きで続く | `ev_ledger_theft` |
| `hs_shop_window` | west | inspect | 商店街の貼り紙。「万引きには刑事罰を」の署名運動と総会の日時 | - |
| `hs_arcade_light` | center | inspect | 切れた電灯。犯行時刻に誰かが影に隠れていた位置関係 | `ev_vhs_tape` |
| `hs_board` | center | inspect | 掲示板。「東口の中学生」だと書き足された落書き。学年の記載はない | - |
| `hs_payphone` | center | inspect | 公衆電話。航が姉の家へかけた記録が通話メモに残る | - |
| `hs_office_door` | center | move | 組合事務所へ | - |
| `hs_asphalt` | center | insight | 自販機の下に挟まったレシート。航が同じ文房具を自腹で買っている | `ev_receipt_owned` |
| `hs_tofu_shop` | east | talk | 丸福商店の健太。犯人の後姿を目撃した話と噂の出所 | `ev_kenta_sighting` |
| `hs_liquor_shop` | east | talk | 松谷静江。自分の店の被害を語る。被害額が大きくなる | `ev_matsutani_report` |
| `hs_photo_studio` | east | talk | 写真館の娘・千夏。店頭に貸し出した防犯用ビデオカメラのVHS | `ev_vhs_tape` |
| `hs_goda_office` | east | talk | 地主・郷田権造。「内輪で済ませろ」と主張する | `ev_goda_statement` |
| `hs_desk` | office | inspect | 過去の万引き対応記録。内輪で済ませた前例が2件 | `ev_past_settlement` |
| `hs_phone_office` | office | inspect | 電話の脇のメモ。郷田からの「新聞に出すな」の言付け | `ev_goda_memo` |
| `hs_waiting_chair` | office | insight | 待合椅子の下に落ちたノート。航が総会の呼び出しで待たされた際の落書き | `ev_notebook_page` |

必須証拠は `ev_ledger_theft` / `ev_vhs_tape` / `ev_notebook_page` / `ev_receipt_owned` の4件。
うち `ev_receipt_owned` は洞察視点でのみ入手可能（千夏の会話後に `hs_asphalt` を調べる導線）。

### 2.3 ギミックの原則

- 1ホットスポットにつき1情報。複合情報は分割する。
- 調べた場所は見た目が変わる（貼り紙がめくれる等）。既読の判別を可能にする。
- 章の進行で追加されるホットスポットは、既存エリアに差し込む（新エリアを増やさない）。
- 移動の邪魔になる配置はしない。調べる対象は歩行ラインから1タイル以内。

## 3. 解決パートの舞台

組合事務所を「仲裁廷」として使う。机を挟んで対面。証言者は立ち位置を変える。

| 証言者 | 立ち位置 | 証言ブロック数 | ほころび |
| --- | --- | --- | --- |
| 郷田 権造 | 中央・机の奥 | 4 | 2（塾の時間帯、換金目的） |
| 松谷 静江 | 左 | 2 | 1（金目の物） |
| 郷田 航 | 右 | 2 | 0（追及で動機が立ち上がる） |
| 岡田 修 | 航の後ろ | 2 | 0（追及で退塾が判明） |

## 4. 没にした案

- 商店街全体を4画面以上に拡張 → プロトタイプの作業量に対して探索密度が薄まるため却下。
- 洞察視点に「集中力ゲージ」 → リソース管理を復活させてしまうため却下。[[docs/05_archive/README]]
