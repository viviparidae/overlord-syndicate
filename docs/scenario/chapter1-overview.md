---

title: Chapter 1 シナリオ概要 ― シャッター商店街
description: Phase 1「シャッター商店街」の物語構成、主要キャラクター、分岐フロー、クライマックス設計
status: draft
version: "0.1"
category: design
tags:
- scenario
- chapter1
- phase1
- narrative
  traces_to:
- docs/design/vision.md
- docs/design/resources.md
- docs/design/game-loop.md
- docs/design/mechanics.md
- src/data/dialogue/phase1.ts
- src/data/scenario/phase1/
  implemented_by:
- src/core/actions/intimidate.ts
- src/core/actions/spreadRumor.ts
- src/core/actions/runShop.ts
  verified_by:
- tests/integration/game-loop.test.ts

---

# Chapter 1：シャッター商店街 ― 「優等生の息子」シナリオ

> **核心コンセプト**: プレイヤー視点では「魔王の内心」が見えるが、ゲーム内の誰からも「礼儀正しく優秀な息子」にしか見えない。この二重構造をテキスト・メカニクス両面で貫く。

---

## 1. 舞台設定

| 項目         | 内容                                                    |
| ------------ | ------------------------------------------------------- |
| **時刻**     | 平成9年（1997年）3月〜4月                               |
| **場所**     | 地方都市・シャッター商店街「日の出文房具店」実家        |
| **主人公**   | 転生した魔王。表の顔：優等生の息子 / 裏の顔：情報工作者 |
| **母**       | 文房具店店主（夫を亡くし、店と息子を守る）              |
| **悪徳地主** | 商店街の実質支配者。息子を亡くし、孫・翔太のみを残す    |
| **翔太**     | 地主の孫・小学4年生。主人公に懐く。母＝地主の嫁         |

---

## 2. 三幕構成

### 第1幕：種まき（Day 1〜10）

**目標**: `funds ≒ 15,000`, `faith ≒ 15`、主要噂入手

| 日数 | 主活動                   | 獲得リソース                         | 入手噂                       |
| ---- | ------------------------ | ------------------------------------ | ---------------------------- |
| 1-3  | 店番チュートリアル       | `funds +3,000〜5,000`, `faith +3`    | —                            |
| 4    | 翔太と会話               | `faith +3`, `suspect -2`             | `shota_trust`                |
| 5    | 翔太「おじいちゃん」発言 | `faith +2`, `fear +1`                | `landlord_soft_side`         |
| 6    | 母（翔太の母）共感       | `faith +5`, `suspect -3`             | `mother_trust`               |
| 7    | 母から家賃値上げ詳細     | `fear +5`, `faith +3`                | `rent_hike_details`          |
| 8    | サラリーマン傾聴         | `fear +10`, `faith +5`, `suspect -2` | `bribe_evidence`             |
| 9    | 地主対面・孫言及         | `fear +8`, `suspect +2`              | `landlord_grandson_weakness` |
| 10   | 店番で資金調整           | `funds +5,000`                       | —                            |

### 第2幕：侵食（Day 11〜20）

**目標**: 裏工作で地主の弱みを固める、`funds >= 35,000`, `faith >= 35`

| アクション                                | 条件                   | 効果                                        | リスク       |
| ----------------------------------------- | ---------------------- | ------------------------------------------- | ------------ |
| `spreadRumor`「家賃値上げ」               | `rent_hike_details`    | `faith +5`, `fear +3`, `suspect +2`         | 低           |
| `spreadRumorWithWork`「息子スキャンダル」 | `landlord_son_scandal` | `faith +5`, `fear +3`, `suspect +7`         | 中           |
| `intimidate` チンピラ                     | `yakuza_alley`         | `funds +50,000`, 屈服フラグ                 | `suspect +5` |
| `intimidate` 地主息子                     | `landlord_son_scandal` | 弱み確保、屈服フラグ                        | `suspect +5` |
| 店番継続                                  | —                      | `funds +2,000/回`, `faith +1`, `suspect -2` | なし         |

> **警戒度管理**: 表の善行（翔太・母への優しさ）で `suspect` を下げ、裏工作の上昇を相殺するのが核心ループ。

### 第3幕：クライマックス（Day 21〜30）

**目標**: 地主処理 → Phase 2 昇格条件達成

#### 分岐条件

| ルート       | 条件                               | 結果                                      |
| ------------ | ---------------------------------- | ----------------------------------------- |
| **追放**     | チンピラ・息子両屈服、`fear >= 80` | 地主夜逃げ、不動産確保 `funds +120,000`   |
| **傘下**     | 息子屈服＋賄賂証拠、`faith >= 60`  | 地主降伏、月次家賃収入 `funds +80,000/月` |
| **バランス** | どちらも中途半端                   | 地主「様子見」→ Phase 2 で再対決          |

---

## 3. キャラクター関係図

```
┌─────────────────────────────────────────────────────────┐
│                    悪徳地主（祖父）                        │
│  商店街支配者・家賃値上げ・再開発利権・賄賂               │
└──────────────┬──────────────────────────────────────────┘
               │ 息子（故人）
               ▼
┌─────────────────────────────────────────────────────────┐
│              翔太の母（地主の嫁）                          │
│  夫亡き後、翔太を守るため地主に頭上がらない             │
│  主婦NPC＝この人物                                        │
└──────────────┬──────────────────────────────────────────┘
               │ 母子
               ▼
┌─────────────────────────────────────────────────────────┐
│                    翔太（小学4年）                         │
│  地主の唯一の孫＝地主の「弱点」                           │
│  主人公を「おじちゃん」と呼び懐く                         │
└─────────────────────────────────────────────────────────┘
               ▲
               │ 「優しいおじちゃん」
               │ （主人公＝表の顔）
┌──────────────┴──────────────────────────────────────────┐
│              主人公（魔王・優等生の息子）                  │
│  翔太・母への善行で suspect 低下                          │
│  裏では地主を恐怖・狂信で追い詰める                       │
└─────────────────────────────────────────────────────────┘
```

---

## 4. リソース変動サマリー（Phase 1 完了時標準値）

| リソース  | 追放ルート | 傘下ルート               | バランス |
| --------- | ---------- | ------------------------ | -------- |
| `funds`   | 170,000+   | 130,000+（月次収入開始） | 100,000+ |
| `fear`    | 100+       | 60+                      | 80+      |
| `faith`   | 80+        | 100+                     | 90+      |
| `suspect` | 25〜35     | 20〜30                   | 30〜40   |

> **Phase 1 警戒度実質上限: 30**（Phase 2 以降の余地を残すため）

---

## 5. 1990年代演出ギミック統合

| ガジェット         | シナリオ上の役割             | 裏工作での用途                                |
| ------------------ | ---------------------------- | --------------------------------------------- |
| **ポケベル**       | 翔太との会話きっかけ         | チンピラへの連絡手段（`spreadRumorWithWork`） |
| **テレホンクラブ** | サラリーマンの愚痴ネタ       | 情報収集ルート                                |
| **深夜ラジオ**     | Phase 2 伏線（BGM で流れる） | —                                             |
| **ファックス**     | 地主の賄賂証拠受信           | `intimidate` 証拠提示                         |
| **ワープロ**       | 母の家計簿・領収書偽造       | `runShop` 売上操作フレーバー                  |

---

## 6. 分岐フラグ設計（`GameState.flags`）

```typescript
interface Phase1Flags {
  // 噂取得
  rumor_shota_trust: boolean;
  rumor_landlord_soft_side: boolean;
  rumor_mother_trust: boolean;
  rumor_rent_hike_details: boolean;
  rumor_bribe_evidence: boolean;
  rumor_landlord_grandson_weakness: boolean;
  rumor_yakuza_alley: boolean;
  rumor_landlord_son_scandal: boolean;

  // 屈服フラグ
  flag_thug_subdued: boolean;
  flag_landlord_son_subdued: boolean;

  // クライマックス分岐
  flag_landlord_exiled: boolean; // 追放ルート
  flag_landlord_subordinate: boolean; // 傘下ルート
}
```

---

## 7. Phase 2 への引き継ぎ

| 要素           | 追放ルート                  | 傘下ルート                     | バランス               |
| -------------- | --------------------------- | ------------------------------ | ---------------------- |
| **初期資金**   | 高（不動産売却益）          | 中（月次収入）                 | 中                     |
| **初期恐怖**   | 高                          | 低                             | 中                     |
| **初期狂信**   | 中                          | 高                             | 中                     |
| **アンロック** | `buyProperty`（不動産買収） | `politicalSpeech`（演説）      | 両方選択可             |
| **物語フック** | 「空き店舗七軒、俺のもの」  | 「地主を会長に、商店街再開発」 | 「地主、まだ生きてる」 |

---

## 8. 実装ファイル構成

```
src/data/scenario/phase1/
├── prologue.ts           # プロローグ（葬儀後・母との会話）
├── daily/
│   ├── shopDialogues.ts  # 店番時客バリエーション
│   └── npcDialogues.ts   # NPC会話ツリー（phase1.ts と統合）
├── terminal/
│   ├── rumorTexts.ts     # 裏工作パネル噂テキスト
│   └── intimidateTexts.ts # 脅迫実行テキスト
├── climax/
│   ├── exileRoute.ts     # 追放ルート
│   ├── subordinateRoute.ts # 傘下ルート
│   └── balanceRoute.ts   # バランスルート
└── epilogue.ts           # 共通エピローグ・Phase 2 導入
```

---

## 9. ローカライズキー追加対象（`ja.json`）

```json
{
  "scene.street.npcShota": "翔太",
  "scene.street.npcMother": "翔太の母",
  "dialogue.shota.kind": "うん、翔太くんも偉いね、お手伝い？",
  "dialogue.shota.grandpa": "おじいちゃん、元気？",
  "dialogue.shota.sticker": "ポケベルのシール、新しいの入ったよ",
  "dialogue.mother.kind": "いえ、翔太くんはいい子ですよ",
  "dialogue.mother.empathy": "大変ですよね、いろいろと",
  "dialogue.salaryman.polite": "タバコ、これですね。フィルター付きのやつ",
  "dialogue.salaryman.listen": "何かあったんですか？　話、聞きますよ",
  "dialogue.landlord.grandson": "はい、よく来てくれますよ。可愛い孫さんですね",
  "dialogue.landlord.rent": "家賃の件、なんとかなりませんか",
  "terminal.intimidate.landlord.exile": "孫と嫁を盾に、地主は膝をついた。",
  "terminal.intimidate.landlord.subordinate": "頭を下げ、『これからは若旦那さんの言う通りに』と言った。",
  "log.phase1.exile": "悪徳地主を追放した。商店街の実質的支配権を獲得。",
  "log.phase1.subordinate": "悪徳地主を傘下に収めた。商店街の資金ルートを確保。",
  "epilogue.mother": "あなた、最近頼もしくなったわね。お父さん、喜んでるわ",
  "epilogue.protagonist": "母さん、守るよ。この店も、この街も、母さんも。全部"
}
```

---

## 10. テスト観点

| 観点                 | 確認内容                                             |
| -------------------- | ---------------------------------------------------- |
| **二重構造維持**     | 表画面に「魔王」「裏工作」「恐怖」等の語が一切出ない |
| **警戒度バランス**   | 善行で `suspect` 低下 → 裏工作上昇を相殺可能         |
| **分岐到達**         | 3ルート全て到達可能、Phase 2 条件満たす              |
| **翔太・母イベント** | 会話選択で `faith/suspect` 変動が正しく適用される    |
| **地主戦条件**       | 必須噂2種所持でのみ `intimidate` 地主解放            |
| **セーブ/ロード**    | フラグ・噂・リソースが正しく復元される               |

---

> **関連ドキュメント**: [[docs/design/resources]] / [[docs/design/mechanics]] / [[docs/balance/thresholds]] / [[docs/balance/costs]] / [[docs/design/character-appearance]]
