---
title: BGM/SE管理・選定リスト
description: 必要な楽曲・効果音の一覧、尺、使用箇所、選定状況と調達元。
status: draft
version: "0.1"
category: design
tags: [audio, bgm, se, list, production]
traces_to:
- docs/03_production/04_audio/audio-specs.md
implemented_by: []
verified_by: []
---

# BGM/SE管理・選定リスト

> **第1章では音を実装しない（無音）。** 本リストは将来の実装用（保留）。
> 現行スコープは [[docs/03_production/01_conventions/asset-sourcing-policy]] を参照。

人的リソース0のため、**発注は行わない**。フリー音源から選定する（[[docs/03_production/04_audio/audio-specs]]）。
状態は「未選定 / 選定済 / 導入済 / 代替（削除）」の4つ。

## 0. 調達元

| 種別 | 候補 |
| --- | --- |
| BGM | DOVA-SYNDROME / OtoLogic / Free Music Archive |
| SE | 効果音ラボ / OtoLogic / freesound |
| 環境音 | freesound（CC0） |

クレジット必須の素材は README に記載し、`docs/asset-licenses.md` に記録する。

## 1. BGM

| ID | 用途 | 尺（ループ） | 雰囲気 | 状態 |
| --- | --- | --- | --- | --- |
| `bgm_title` | タイトル | 1:20 | 深夜ラジオのチューニング前 | 未選定 |
| `bgm_select` | 章選択 | 1:00 | 静かな時計の音を含む | 未選定 |
| `bgm_intro_ch01` | 第1章導入 | 1:30 | ピアノ単音、余白多め | 未選定 |
| `bgm_investigation` | 調査（商店街） | 2:00 | 控えめなベース、環境音と干渉しない | 未選定 |
| `bgm_investigation_insight` | 洞察視点 | 2:00 | 同曲のローパス版 | 未選定 |
| `bgm_resolution` | 仲裁廷 | 2:30 | 弦の刻み、テンポ 96 | 未選定 |
| `bgm_break` | ムジュン指摘成功 | 0:20 | 短いブレイク用 | 未選定 |
| `bgm_gameover` | ゲームオーバー | 0:30 | 低音の持続、解決しない和音 | 未選定 |
| `bgm_epilogue` | エピローグ | 1:40 | 夕景、余韻 | 未選定 |

## 2. SE

| ID | 用途 | 尺 | 状態 |
| --- | --- | --- | --- |
| `se_text_advance` | テキスト送り | 0.1s | 未選定 |
| `se_select` | メニュー決定 | 0.1s | 未選定 |
| `se_cancel` | 戻る | 0.1s | 未選定 |
| `se_found` | ホットスポット発見 | 0.3s | 未選定 |
| `se_evidence_get` | 証拠入手 | 0.6s | 未選定 |
| `se_insight_on` | 洞察視点 ON | 0.4s | 未選定 |
| `se_insight_off` | 洞察視点 OFF | 0.3s | 未選定 |
| `se_door` | 組合事務所の扉 | 0.5s | 未選定 |
| `se_press` | 追及 | 0.2s | 未選定 |
| `se_present_success` | つきつけ成功 | 1.0s | 未選定 |
| `se_present_fail` | つきつけ失敗 | 0.6s | 未選定 |
| `se_miss` | ミス印増加 | 0.4s | 未選定 |
| `se_gameover` | ゲームオーバー | 1.5s | 未選定 |
| `se_chapter_clear` | 章クリア | 1.2s | 未選定 |

## 3. 環境音

| ID | 用途 | 尺（ループ） | 状態 |
| --- | --- | --- | --- |
| `amb_arcade_west` | 西口 | 0:30 | 未選定 |
| `amb_arcade_center` | 中央通り | 0:30 | 未選定 |
| `amb_arcade_east` | 東口 | 0:30 | 未選定 |
| `amb_office` | 組合事務所 | 0:30 | 未選定 |

## 4. 選定・導入時の確認事項

- ループの継ぎ目が無音にならないこと（前後 0.05 秒のクロスフェードはコードで付ける）。
- BGM にボーカルが入っていないこと。
- 1990年代の機器感（FM音源、テープヒス）があるものを優先するが、耳障りなノイズは避ける。
- 形式変換: OGG へ変換（44.1kHz）。変換はスクリプトで行う。
- ライセンスとクレジット表記の要否を確認し、`docs/asset-licenses.md` に記録する。
- 代替が見つからない音は、その演出ごと削る。

## 5. 権利

- 外注は行わない。フリー音源のみを使用する。
- 出典・ライセンス・クレジット要否を [[docs/asset-licenses]] に記録する。
- 再配布禁止の音源はビルド成果物に同梱しない（ストリーミング参照も不可のため、その音源は使わない）。
