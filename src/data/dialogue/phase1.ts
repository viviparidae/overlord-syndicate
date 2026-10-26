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
    id: "npc_child",
    speaker: "子供",
    text: "こんにちは！何か知りたいことある？",
    options: [
      { text: "店に入って見たい", action: "enterShop" },
      { text: "噂を聞きたい", action: "spreadRumor" },
      { text: "裏工作パネルを開く", action: "spreadRumorWithWork" },
      { text: "もう帰る", action: "leave" },
    ],
  },
  {
    id: "npc_housewife",
    speaker: "主婦",
    text: "あの子はいつも騒ぎすぎるよ。",
    options: [
      { text: "噂を聞きたい", action: "spreadRumor" },
      { text: "店に入って見たい", action: "enterShop" },
      { text: "裏工作パネルを開く", action: "spreadRumorWithWork" },
      { text: "もう帰る", action: "leave" },
    ],
  },
  {
    id: "npc_salaryman",
    speaker: "サラリーマン",
    text: "俺の会社はもう終わるよ。",
    options: [
      { text: "噂を聞きたい", action: "spreadRumor" },
      { text: "店に入って見たい", action: "enterShop" },
      { text: "裏工作パネルを開く", action: "spreadRumorWithWork" },
      { text: "もう帰る", action: "leave" },
    ],
  },
  {
    id: "npc_landlord",
    speaker: "悪徳地主",
    text: "この街は俺が支配している。",
    options: [
      { text: "噂を聞きたい", action: "spreadRumor" },
      { text: "店に入って見たい", action: "enterShop" },
      { text: "裏工作パネルを開く", action: "spreadRumorWithWork" },
      { text: "もう帰る", action: "leave" },
    ],
  },
];
