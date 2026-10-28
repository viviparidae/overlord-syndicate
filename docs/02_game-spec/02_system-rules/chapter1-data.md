---
title: 第1章データ設計
description: 第1章「怒られたい少年」の証拠・証言・会話・フラグ・ローカライズキーをID体系で具体化する。
status: draft
version: "0.1"
category: design
tags: [data, chapter1, evidence, testimony, localization]
traces_to:
- docs/02_game-spec/02_system-rules/save-data-specs.md
- docs/02_game-spec/02_system-rules/game-loop.md
- docs/02_game-spec/03_level-design/stage-gimmicks.md
- docs/04_lore/story-timeline.md
implemented_by: []
verified_by: []
---

# 第1章データ設計

対象: `ch01`「怒られたい少年」。実装はまだ行わない。ID・キー・関係のみを確定させる。

## 1. 章メタ

| 項目 | 値 |
| --- | --- |
| `id` | `ch01` |
| タイトルキー | `chapter.ch01.title` |
| フェーズ | 1 |
| ミス上限 | 3 |
| 必須証拠 | 4件（下記 §2 の「必須」） |
| 証言者 | 4人（郷田・松谷・航・岡田） |
| 証言ブロック | 10 |
| ほころび | 3 |

## 2. 証拠

| ID | 名称キー | 入手 | 必須 | 内容 |
| --- | --- | --- | --- | --- |
| `ev_ledger_theft` | `evidence.ledger_theft` | `hs_shop_counter`（west） | ○ | 被害帳簿。5店14件の日時・品目。**全て日常品で換金価値がない** |
| `ev_vhs_tape` | `evidence.vhs_tape` | `talk_chiaki_01`（east） | ○ | 写真館が貸した防犯用VHS。犯行時刻に航らしき人物が映る |
| `ev_notebook_page` | `evidence.notebook_page` | `hs_waiting_chair`（office） | ○ | 航が待合椅子に落としたノート。走り書きに「もう終わりにしたい」 |
| `ev_receipt_owned` | `evidence.receipt_owned` | `hs_asphalt`（center・洞察） | ○ | 自販機の下のレシート。航が同じ文房具を自腹で買った記録 |
| `ev_kenta_sighting` | `evidence.kenta_sighting` | `talk_kenta_01`（east） | - | 健太の目撃証言。後姿と時刻の記憶 |
| `ev_matsutani_report` | `evidence.matsutani_report` | `talk_matsutani_01`（east） | - | 松谷の被害報告。金額が実際より大きい |
| `ev_goda_statement` | `evidence.goda_statement` | `talk_goda_01`（east） | - | 郷田の「内輪で済ませろ」という発言の要旨 |
| `ev_past_settlement` | `evidence.past_settlement` | `hs_desk`（office） | - | 過去に内輪で処理した万引き2件の記録 |
| `ev_goda_memo` | `evidence.goda_memo` | `hs_phone_office`（office） | - | 郷田の「新聞に出すな」という言付けのメモ |

- 必須4件が揃うと組合事務所前に「総会」マーカーが出る。
- 任意証拠は、追及時の補強テキストと誤答時の反応差分に使う（正解判定には使わない）。
- 洞察視点でのみ入手できるのは `ev_receipt_owned` の1件（4件中1件）。

## 3. 証言

提示順は 郷田 → 松谷 → 航 → 岡田。各ブロックの `textKey` は `testimony.{speaker}.{nn}`。

### 3.1 郷田 権造（4ブロック・ほころび2）

| ID | 要旨 | 追及 | ほころび |
| --- | --- | --- | --- |
| `tg_01` | 「あの子は毎日塾に通っておる。夜は家で勉強だ」 | 送り迎えの話 | - |
| `tg_02` | 「万引きの時間、あの子は塾におった。家の者が送り迎えしとる」 | 迎えの時刻 | **`ev_vhs_tape`**（VHSの時刻と塾の時間帯が重なる） |
| `tg_03` | 「盗まれた物は換金して小遣いにしたんじゃろ。子どもは金が欲しいものだ」 | 「金目」の定義 | **`ev_ledger_theft`**（被害品は全て換金価値のない日常品） |
| `tg_04` | 「うちは孫に不自由させとらん。金にも物にも困っとらん」 | 小遣いの額 | -（`ev_notebook_page` で動機が立つ） |

### 3.2 松谷 静江（2ブロック・ほころび1）

| ID | 要旨 | 追及 | ほころび |
| --- | --- | --- | --- |
| `tm_01` | 「うちの店でもやられた。金目の物ばかり狙われとる」 | 何を盗られたか | **`ev_ledger_theft`**（酒は棚に残り、なくなったのは菓子と電池） |
| `tm_02` | 「うちは会計だが、金庫は開けとらん」 | 鍵の保管 | - |

### 3.3 郷田 航（2ブロック・ほころび0）

| ID | 要旨 | 追及 | ほころび |
| --- | --- | --- | --- |
| `tw_01` | 「……全部、俺がやった」 | いつから | - |
| `tw_02` | 「金に困ってたから盗んだ。売って小遣いにした」 | 売った先 | -（追及で「売っていない」が判明。`ev_receipt_owned` が動機を崩す） |

### 3.4 岡田 修（2ブロック・ほころび0）

| ID | 要旨 | 追及 | ほころび |
| --- | --- | --- | --- |
| `to_01` | 「航は塾に行ってます。俺が送ってました」 | 最後に送った日 | -（追及で退塾が判明） |
| `to_02` | 「あの子は家で居場所がない。それでも悪いことはしてない」 | 「居場所」の意味 | - |

- ほころびは3箇所（`tg_02`, `tg_03`, `tm_01`）。残り7ブロックは追及で情報を掘る。
- 同じ証拠を複数のブロックで使わない（`ev_ledger_theft` は `tg_03` と `tm_01` の2箇所で使う例外的な扱い。**許容**とするが、片方を別証拠に差し替える余地を残す）。

### 3.5 正解時の挙動

| ブロック | 正解後の進行 |
| --- | --- |
| `tg_02` | 郷田が言葉を濁す。航の証言へ移る前フラグ `f_goda_lied_time` |
| `tg_03` | 松谷へ証言者が切り替わる |
| `tm_01` | 航の証言が解禁される |

- 全ほころび指摘後、航の `tw_02` 追及で動機が確定し、エピローグへ。
- 誤答時は `testimony.{speaker}.{nn}.fail` を表示し、ミスを1加算して同じブロックに戻る。

## 4. 会話・テキスト

| ID | 種類 | 話者 | 内容 | 効果 |
| --- | --- | --- | --- | --- |
| `intro_01`〜`intro_05` | ADV | 地の文/住人 | 総会の招集、噂、航の来店 | フラグ `f_intro_done` |
| `talk_kenta_01` | 会話 | 健太 | 目撃と噂の出所 | `ev_kenta_sighting` |
| `talk_matsutani_01` | 会話 | 松谷 | 被害報告（金額が大きい） | `ev_matsutani_report` |
| `talk_chiaki_01` | 会話 | 千夏 | VHSを貸した経緯 | `ev_vhs_tape` |
| `talk_goda_01` | 会話 | 郷田 | 「内輪で済ませろ」 | `ev_goda_statement` |
| `inspect_ledger` | 調べ | 地の文 | 帳簿の内容 | `ev_ledger_theft` |
| `inspect_notebook` | 調べ | 地の文 | ノートの走り書き | `ev_notebook_page` |
| `inspect_receipt` | 調べ | 地の文 | レシートの日付と品目 | `ev_receipt_owned` |
| `inspect_settlement` | 調べ | 地の文 | 過去の内輪処理 | `ev_past_settlement` |
| `inspect_memo` | 調べ | 地の文 | 電話脇のメモ | `ev_goda_memo` |

- 導入の選択肢は置かない（章1では分岐なし）。
- 調査パートの会話に選択肢を置かない。追及とつきつけだけで意思決定させる。

## 5. フラグ

| フラグ | 立つ条件 | 用途 |
| --- | --- | --- |
| `f_intro_done` | 導入終了 | 調査開始 |
| `f_heard_kenta` | `talk_kenta_01` | 任意会話の既読表示 |
| `f_heard_matsutani` | `talk_matsutani_01` | 同上 |
| `f_saw_vhs` | `talk_chiaki_01` | 洞察視点のヒント表示 |
| `f_read_notebook` | `inspect_notebook` | 郷田 `tg_04` の追及テキスト差分 |
| `f_goda_lied_time` | `tg_02` 正解 | 郷田の表情（姿勢）変化 |
| `f_resolution_started` | 解決パート開始 | 自動保存のチェックポイント |

- フラグは真偽のみ。数値を持たせない。

## 6. ローカライズキー一覧

```
chapter.ch01.title
evidence.ledger_theft.{name,desc}
evidence.vhs_tape.{name,desc}
evidence.notebook_page.{name,desc}
evidence.receipt_owned.{name,desc}
evidence.kenta_sighting.{name,desc}
evidence.matsutani_report.{name,desc}
evidence.goda_statement.{name,desc}
evidence.past_settlement.{name,desc}
evidence.goda_memo.{name,desc}
testimony.goda.{01..04}.{text,press,success,fail}
testimony.matsutani.{01..02}.{text,press,success,fail}
testimony.wataru.{01..02}.{text,press}
testimony.okada.{01..02}.{text,press}
talk.kenta.01.{a..}
talk.matsutani.01.{a..}
talk.chiaki.01.{a..}
talk.goda.01.{a..}
inspect.ledger
inspect.notebook
inspect.receipt
inspect.settlement
inspect.memo
ui.resolution.{press,present,evidence}
ui.investigation.{inspect,talk,insight}
ui.gameover.{title,retry_part,retry_chapter}
log.evidence.{obtained,already}
```

- 全キーを `ja.json` と `en.json` に同時に追加する。en は章1では英語訳を置かず、`""` でもキー構造を維持する。

## 7. データ配置（予定）

```
src/data/chapters/ch01/
├── index.ts          # 章メタ（id, missLimit, areas, requiredEvidence）
├── evidence.ts       # 証拠9件
├── testimonies.ts    # 証言10ブロック
└── dialogues/
    ├── intro.ts
    ├── talks.ts
    └── inspects.ts
```

- 表示文言は持たない。すべてキー参照。
- `acceptAnyOf` は章1では未使用（空配列）。

## 8. 検証項目（データ受け入れ）

| 項目 | 期待 |
| --- | --- |
| 必須証拠の到達可能性 | 4件すべて入手可能。順序不問 |
| ほころび数 | 3（`tg_02`, `tg_03`, `tm_01`） |
| 証言ブロック数 | 10（4+2+2+2） |
| ポインタ切れ | なし（`textKey` が全て ja.json に存在） |
| フラグ | 全フラグがどこかで参照される（未使用フラグなし） |
| ミス上限 | 3。誤答3回でゲームオーバー |
| 保存 | 解決パート開始時と各証言ブロック開始時に保存 |
