---
title: オーディオ仕様・再生トリガー
description: 音声形式、ミックス、再生制御、シーン別トリガー、無音の扱い。
status: draft
version: "0.1"
category: design
tags: [audio, bgm, se, triggers]
traces_to:
- docs/02_game-spec/01_flow-ui/screen-transitions.md
- docs/03_production/04_audio/audio-list.md
implemented_by: []
verified_by: []
---

# オーディオ仕様・再生トリガー

## 1. 形式

| 項目 | 値 |
| --- | --- |
| 形式 | OGG Vorbis（BGM）、WAV→OGG変換（SE） |
| サンプリング | 44.1kHz |
| チャンネル | BGM ステレオ、SE モノラル |
| BGM ビットレート | 128kbps VBR |
| SE 長 | 原則 1.5秒以内 |
| ループ | OGG のループポイント（サンプル単位）で指定 |

## 2. ミックス

| レイヤ | 基準音量 | 備考 |
| --- | --- | --- |
| BGM | -18 LUFS | 会話中は -3dB 自動ダッキング |
| SE | -12 LUFS（ピーク -3dBFS） | 連打時は同一SEを0.05秒で抑制 |
| 環境音 | -24 LUFS | 商店街の暗騒音。章を通して常時 |
| 無音 | - | 意図的な無音を1章に2回入れる |

## 3. 再生制御

- BGMはクロスフェード 0.8 秒で切り替える。ハードカットしない。
- シーン遷移時に BGM を止めない（章内は原則継続）。
- ポーズ中は BGM を -6dB に下げ、SE を停止する。
- ゲームオーバー時は BGM を 0.4 秒でフェードアウトし、環境音のみ残す。

## 4. トリガー表

| イベント | 音 | 補足 |
| --- | --- | --- |
| タイトル表示 | `bgm_title` | ループ |
| 章選択 | `bgm_select` | ループ |
| 導入開始 | `bgm_intro_ch01` | 静かなピアノ |
| 調査開始 | `bgm_investigation` | 環境音と重ねる |
| 洞察視点 ON | `se_insight_on` + フィルタ | BGMにローパス |
| 洞察視点 OFF | `se_insight_off` | フィルタ解除 |
| ホットスポット発見 | `se_found` | 1回 |
| 証拠入手 | `se_evidence_get` | アイコン飛翔と同期 |
| 会話送り | `se_text_advance` | 0.1秒、音量 -20dB |
| 解決開始 | `bgm_resolution` | テンポ速め |
| 追及 | `se_press` | 証言ウィンドウ明滅 |
| つきつけ成功 | `se_present_success` + `bgm_break` | 白フラッシュ後に BGM 切替 |
| つきつけ失敗 | `se_present_fail` | ミス印増加 |
| ミス上限到達 | `bgm_gameover` | BGM停止→低音の持続音 |
| 章クリア | `bgm_epilogue` | 余韻 |

## 5. 環境音

| エリア | 環境音 |
| --- | --- |
| `arcade_west` | 店先の風鈴、遠くの踏切 |
| `arcade_center` | アーケードの反響、自転車のベル |
| `arcade_east` | 豆腐屋の水音、ラジオの漏れ音 |
| `shotengai_office` | 時計の秒針、電話の呼び出し音（遠い） |

## 6. 音量設定

- BGM / SE / 環境音を個別に 0〜100% で設定可能。
- 既定は BGM 70%、SE 80%、環境音 50%。
- 設定は `overlord_syndicate_v2_settings` に保存する。

## 7. 音声（ボイス）

- プロトタイプでは**収録しない**。
- 将来的に主要台詞のみ部分ボイスを想定。字幕は常時表示する。
