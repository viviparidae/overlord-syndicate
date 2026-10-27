// Chapter 1 日常パート ― NPC会話ツリー詳細
import type { DialogueEntry } from "@data/dialogue/phase1";

export const npcDialogues: DialogueEntry[] = [
  // ── 翔太（地主の孫・小学4年） ──
  {
    id: "npc_shota",
    speaker: "翔太",
    text: "こんにちは！　おじちゃん、今日も店番？",
    options: [
      { text: "うん、翔太くんも偉いね、お手伝い？", action: "chat_shota_kind", nextId: "shota_kind_resp" },
      { text: "おじいちゃん、元気？", action: "chat_shota_grandpa", nextId: "shota_grandpa_resp" },
      { text: "ポケベルのシール、新しいの入ったよ", action: "chat_shota_sticker", nextId: "shota_sticker_resp" },
      { text: "もう帰る", action: "leave" },
    ],
  },
  {
    id: "shota_kind_resp",
    speaker: "翔太",
    text: "うん！　ママ、忙しいから、僕がお使い行くの。\nおじいちゃん、『商店街のみんな、仲良くしろよ』って言ってたよ。",
    options: [
      { text: "偉いね、お母さん助かるだろうね", action: "shota_kind_end" },
    ],
  },
  {
    id: "shota_kind_end",
    speaker: "主人公",
    text: "偉いな。お母さん、助かるだろうね。これ、新しいシール――サービスだ。",
    options: [],
  },
  {
    id: "shota_grandpa_resp",
    speaker: "翔太",
    text: "うん、元気！　でも最近、難しい顔してる。\n『翔太、男だぞ、泣くな』って、よく言われる。",
    options: [
      { text: "おじいちゃん、翔太くんのこと大事に思ってるんだよ", action: "shota_grandpa_end" },
    ],
  },
  {
    id: "shota_grandpa_end",
    speaker: "主人公",
    text: "おじいちゃん、翔太くんのこと、大事に思ってるんだよ。\n男って、弱い人を守るために強くなるものだ。",
    options: [],
  },
  {
    id: "shota_sticker_resp",
    speaker: "翔太",
    text: "ほんと！？　見せて見せて！",
    options: [
      { text: "どれがいい？　翔太くんが選んで", action: "shota_sticker_end" },
    ],
  },
  {
    id: "shota_sticker_end",
    speaker: "主人公",
    text: "どれがいい？　翔太くんが選んで。",
    options: [],
  },

  // ── 翔太の母（地主の嫁） ──
  {
    id: "npc_mother",
    speaker: "翔太の母",
    text: "翔太、おじちゃんにお礼言いなさい。……若旦那さん、いつもすみませんね",
    options: [
      { text: "いえ、翔太くんはいい子ですよ", action: "chat_mother_kind", nextId: "mother_kind_resp" },
      { text: "大変ですよね、いろいろと", action: "chat_mother_empathy", nextId: "mother_empathy_resp" },
      { text: "もう帰る", action: "leave" },
    ],
  },
  {
    id: "mother_kind_resp",
    speaker: "翔太の母",
    text: "……ありがとう。夫を早くに亡くして、義父に頭上がらないから。\n翔太だけでも、まっすぐ育てたいって……。",
    options: [
      { text: "お母さんが守ってるから、翔太くんはいい子だ", action: "mother_kind_end" },
    ],
  },
  {
    id: "mother_kind_end",
    speaker: "主人公",
    text: "お母さんが守ってるから、翔太くんはいい子だ。\n何かあったら、いつでも店に来てください。力になります。",
    options: [],
  },
  {
    id: "mother_empathy_resp",
    speaker: "翔太の母",
    text: "……家賃、また上がるんですって。義父、商店街ごと再開発するって。\nでも、翔太の学費もあるし……抗えません。",
    options: [
      { text: "これ、少し厚めにしておきました。内緒ですよ", action: "mother_empathy_end" },
    ],
  },
  {
    id: "mother_empathy_end",
    speaker: "主人公",
    text: "これ、少し厚めにしておきました。内緒ですよ。",
    options: [],
  },

  // ── サラリーマン ──
  {
    id: "npc_salaryman",
    speaker: "サラリーマン",
    text: "俺の会社はもう終わるよ。……タバコ、買ってく",
    options: [
      { text: "タバコ、これですね。フィルター付きのやつ", action: "chat_salaryman_polite", nextId: "salaryman_polite_resp" },
      { text: "何かあったんですか？　話、聞きますよ", action: "chat_salaryman_listen", nextId: "salaryman_listen_resp" },
      { text: "もう帰る", action: "leave" },
    ],
  },
  {
    id: "salaryman_polite_resp",
    speaker: "サラリーマン",
    text: "ああ、それだ。領収書も頼む。",
    options: [
      { text: "はい、二枚印刷しておきました", action: "salaryman_polite_end" },
    ],
  },
  {
    id: "salaryman_polite_end",
    speaker: "主人公",
    text: "はい、二枚印刷しておきました。経理通るやつで。",
    options: [],
  },
  {
    id: "salaryman_listen_resp",
    speaker: "サラリーマン",
    text: "ああ……再開発の話、地主が市議に賄賂渡して通したんやって。\n俺らの退職金、その工事費に回された気すらするわ。",
    options: [
      { text: "領収書、二枚出しときました。経理通るやつで", action: "salaryman_listen_end" },
    ],
  },
  {
    id: "salaryman_listen_end",
    speaker: "主人公",
    text: "領収書、二枚出しときました。経理通るやつで。",
    options: [],
  },

  // ── 悪徳地主 ──
  {
    id: "npc_landlord",
    speaker: "悪徳地主",
    text: "この街は俺が支配している。……翔太、最近店に入り浸ってるそうじゃな",
    options: [
      { text: "はい、よく来てくれますよ。可愛い孫さんですね", action: "chat_landlord_grandson", nextId: "landlord_grandson_resp" },
      { text: "家賃の件、なんとかなりませんか", action: "chat_landlord_rent", nextId: "landlord_rent_resp" },
      { text: "もう帰る", action: "leave" },
    ],
  },
  {
    id: "landlord_grandson_resp",
    speaker: "悪徳地主",
    text: "ふん……あのガキ、泣き虫でよ。男に育てな、跡取りにならん。\n若旦那、変なこと教えるんじゃねえぞ。",
    options: [
      { text: "教えるのは『弱い人を守る強さ』だけですよ", action: "landlord_grandson_end" },
    ],
  },
  {
    id: "landlord_grandson_end",
    speaker: "主人公",
    text: "教えるのは『弱い人を守る強さ』だけですよ。おじいちゃん譲りの目つき、立派です。",
    options: [],
  },
  {
    id: "landlord_rent_resp",
    speaker: "悪徳地主",
    text: "家賃は契約通りだ。払えんなら出て行け。\n……まあ、若旦那ならなんとかするやろ。来月までだぞ。",
    options: [
      { text: "必ず払います。ご心配なく", action: "landlord_rent_end" },
    ],
  },
  {
    id: "landlord_rent_end",
    speaker: "主人公",
    text: "必ず払います。ご心配なく。",
    options: [],
  },
];