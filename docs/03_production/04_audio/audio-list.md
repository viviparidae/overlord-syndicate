---
title: BGM/SE管理・発注リスト
description: 必要な楽曲・効果音の一覧、尺、使用箇所、発注状況。
status: draft
version: "0.1"
category: design
tags: [audio, bgm, se, list, production]
traces_to:
- docs/03_production/04_audio/audio-specs.md
implemented_by: []
verified_by: []
---

# BGM/SE管理・発注リスト

スプレッドシート連携を前提とした一覧。プロトタイプ段階では本書を正とする。

## 1. BGM

| ID | 用途 | 尺（ループ） | 雰囲気 | 状態 |
| --- | --- | --- | --- | --- |
| `bgm_title` | タイトル | 1:20 | 深夜ラジオのチューニング前 | 未発注 |
| `bgm_select` | 章選択 | 1:00 | 静かな時計の音を含む | 未発注 |
| `bgm_intro_ch01` | 第1章導入 | 1:30 | ピアノ単音、余白多め | 未発注 |
| `bgm_investigation` | 調査（商店街） | 2:00 | 控えめなベース、環境音と干渉しない | 未発注 |
| `bgm_investigation_insight` | 洞察視点 | 2:00 | 同曲のローパス版 | 未発注 |
| `bgm_resolution` | 仲裁廷 | 2:30 | 弦の刻み、テンポ 96 | 未発注 |
| `bgm_break` | ムジュン指摘成功 | 0:20 | 短いブレイク用 | 未発注 |
| `bgm_gameover` | ゲームオーバー | 0:30 | 低音の持続、解決しない和音 | 未発注 |
| `bgm_epilogue` | エピローグ | 1:40 | 夕景、余韻 | 未発注 |

## 2. SE

| ID | 用途 | 尺 | 状態 |
| --- | --- | --- | --- |
| `se_text_advance` | テキスト送り | 0.1s | 未発注 |
| `se_select` | メニュー決定 | 0.1s | 未発注 |
| `se_cancel` | 戻る | 0.1s | 未発注 |
| `se_found` | ホットスポット発見 | 0.3s | 未発注 |
| `se_evidence_get` | 証拠入手 | 0.6s | 未発注 |
| `se_insight_on` | 洞察視点 ON | 0.4s | 未発注 |
| `se_insight_off` | 洞察視点 OFF | 0.3s | 未発注 |
| `se_door` | 組合事務所の扉 | 0.5s | 未発注 |
| `se_press` | 追及 | 0.2s | 未発注 |
| `se_present_success` | つきつけ成功 | 1.0s | 未発注 |
| `se_present_fail` | つきつけ失敗 | 0.6s | 未発注 |
| `se_miss` | ミス印増加 | 0.4s | 未発注 |
| `se_gameover` | ゲームオーバー | 1.5s | 未発注 |
| `se_chapter_clear` | 章クリア | 1.2s | 未発注 |

## 3. 環境音

| ID | 用途 | 尺（ループ） | 状態 |
| --- | --- | --- | --- |
| `amb_arcade_west` | 西口 | 0:30 | 未発注 |
| `amb_arcade_center` | 中央通り | 0:30 | 未発注 |
| `amb_arcade_east` | 東口 | 0:30 | 未発注 |
| `amb_office` | 組合事務所 | 0:30 | 未発注 |

## 4. 発注時の指定事項

- ループの継ぎ目が無音にならないこと（前後 0.05 秒のクロスフェード可）。
- BGM にボーカルを入れない。
- 1990年代の機器感（FM音源、アナログテープのヒス）を演出に使うが、耳障りなノイズは避ける。
- 納品形式: 44.1kHz / OGG（マスターは WAV も受領）。

## 5. 権利

- 外注時は著作権の帰属と利用範囲（ゲーム内、PV、配信）を契約に明記する。
- ライセンス済み素材を使う場合は出典を `docs/asset-licenses.md`（予定）に追記する。
