// Chapter 1 クライマックス ― 傘下ルート
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

export const subordinateRoute: ClimaxRoute = {
  id: "subordinate",
  name: "傘下ルート",
  condition: "flag_landlord_son_subdued && rumor_bribe_evidence && faith >= 60",
  scenes: [
    {
      id: "sub_1",
      speaker: "ナレーション",
      text: "昼、店先。商店街の連中が見守る中。\n地主がスーツ姿で、ネクタイを緩めて現れた。",
      background: "shop_day_crowd",
      bgm: "tension_resolve",
    },
    {
      id: "sub_2",
      speaker: "悪徳地主",
      text: "若旦那さん……俺、間違ってた。これからは、お前さんの言う通りに動く。\n商店街再開発、お前さん主導でやらせてくれ。",
      background: "shop_day_crowd",
    },
    {
      id: "sub_3",
      speaker: "主人公",
      text: "よろしく頼むよ、会長。この街、みんなで守ろうじゃないか。",
      background: "shop_day_crowd",
    },
    {
      id: "sub_4",
      speaker: "住人たち",
      text: "「若旦那さん、頼もしい！」「地主さんも丸くなったな」\n拍手と安堵の声が商店街に響く。",
      background: "shop_day_crowd",
    },
    {
      id: "sub_5",
      speaker: "主人公（内心）",
      text: "（拍手してる連中が、一番の駒になる）",
      background: "shop_day_crowd",
    },
  ],
  resourceReward: { funds: 80000, fear: 10, faith: 40, suspect: 10 },
  unlockFlags: ["flag_landlord_subordinate"],
  phase2Unlocks: ["politicalSpeech", "monthlyIncome"],
};

export const subordinateLog = `> 悪徳地主を傘下に収めた。商店街の資金ルートを確保。
> funds +80,000（月次家賃収入開始）, faith +40, fear +10, suspect +10
> Phase 1 達成条件クリア：Phase 2 へ移行します。`;