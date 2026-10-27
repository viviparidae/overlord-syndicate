export interface DialogueEntry {
  id: string;
  speaker: string;
  text: string;
  options?: DialogueOption[];
}
export interface DialogueOption {
  text: string;
  action: string;
  nextId?: string;
}
export interface EventEntry {
  id: string;
  title: string;
  description: string;
  trigger: string;
  effect: {
    resources: { funds?: number; fear?: number; faith?: number; suspect?: number };
    phaseAdvance?: boolean;
  };
}

export const dialogues: DialogueEntry[] = [
  {
    id: "npc_shota",
    speaker: "翔太",
    text: "こんにちは！　おじちゃん、今日も店番？",
    options: [
      { text: "うん、翔太くんも偉いね、お手伝い？", action: "chat_shota_kind" },
      { text: "おじいちゃん、元気？", action: "chat_shota_grandpa" },
      { text: "ポケベルのシール、新しいの入ったよ", action: "chat_shota_sticker" },
      { text: "もう帰る", action: "leave" },
    ],
  },
  {
    id: "npc_mother",
    speaker: "翔太の母",
    text: "翔太、おじちゃんにお礼言いなさい。……若旦那さん、いつもすみませんね",
    options: [
      { text: "いえ、翔太くんはいい子ですよ", action: "chat_mother_kind" },
      { text: "大変ですよね、いろいろと", action: "chat_mother_empathy" },
      { text: "もう帰る", action: "leave" },
    ],
  },
  {
    id: "npc_salaryman",
    speaker: "サラリーマン",
    text: "俺の会社はもう終わるよ。……タバコ、買ってく",
    options: [
      { text: "タバコ、これですね。フィルター付きのやつ", action: "chat_salaryman_polite" },
      { text: "何かあったんですか？　話、聞きますよ", action: "chat_salaryman_listen" },
      { text: "もう帰る", action: "leave" },
    ],
  },
  {
    id: "npc_landlord",
    speaker: "悪徳地主",
    text: "この街は俺が支配している。……翔太、最近店に入り浸ってるそうじゃな",
    options: [
      { text: "はい、よく来てくれますよ。可愛い孫さんですね", action: "chat_landlord_grandson" },
      { text: "家賃の件、なんとかなりませんか", action: "chat_landlord_rent" },
      { text: "もう帰る", action: "leave" },
    ],
  },
];
