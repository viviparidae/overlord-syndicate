// Chapter 1 クライマックス ― バランスルート
export interface ClimaxRoute {
  id: string;
  name: string;
  condition: string;
  scenes: ClimaxScene[];
  resourceReward: { funds: number; fear: number; faith: number; suspect: number };
  unlockFlags: string[];
  phase2Unlocks: string[];
}

export interface ClimaxScene {
  id: string;
  speaker: string;
  text: string;
  background?: string;
  bgm?: string;
}

export const balanceRoute: ClimaxRoute = {
  id: "balance",
  name: "バランスルート",
  condition: "!(flag_landlord_exiled || flag_landlord_subordinate) && funds >= 50000 && faith >= 50",
  scenes: [
    {
      id: "bal_1",
      speaker: "ナレーション",
      text: "昼、店先。地主が現れ、腕を組んで店内を眺める。",
      background: "shop_day",
      bgm: "tense_standoff",
    },
    {
      id: "bal_2",
      speaker: "悪徳地主",
      text: "当面は様子見させてもらう。若旦那、お前さん……面白い。\nだが、油断せんことやな。この街はまだ、俺のもんや。",
      background: "shop_day",
    },
    {
      id: "bal_3",
      speaker: "主人公",
      text: "存じてますよ、会長。お互い、損はせんようにしましょう。",
      background: "shop_day",
    },
    {
      id: "bal_4",
      speaker: "ナレーション",
      text: "地主は去っていった。\n握手もしず、契約もしない。\nだが、力関係は変わった。どちらも、知っている。",
      background: "shop_day",
    },
  ],
  resourceReward: { funds: 50000, fear: 15, faith: 20, suspect: 12 },
  unlockFlags: [],
  phase2Unlocks: ["buyProperty", "politicalSpeech"],
};

export const balanceLog = `> 悪徳地主と妥協的均衡を成立させた。商店街の支配権は保留。
> funds +50,000, faith +20, fear +15, suspect +12
> Phase 1 達成条件クリア：Phase 2 へ移行します。
> 注意：地主は健在。Phase 2 で再対決の可能性あり。`;