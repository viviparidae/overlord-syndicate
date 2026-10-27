// Chapter 1 裏工作パネル ― 噂を流すテキスト
export interface RumorTextEntry {
  id: string;
  title: string;
  description: string;
  requiredRumors: string[];
  cost: number;
  successText: string;
  failText: string;
  resourceDelta: { funds: number; fear: number; faith: number; suspect: number };
}

export const rumorTexts: RumorTextEntry[] = [
  {
    id: "rumor_rent_hike",
    title: "家賃値上げの噂",
    description: "地主が商店街の家賃を値上げし、再開発で更地にするつもりだ",
    requiredRumors: ["rumor_rent_hike_details"],
    cost: 500,
    successText: "> 噂を流した。資金 500 円。街の空気が、少し変わった。",
    failText: "> 噂は広まらなかった。資金 500 円。様子を見よう。",
    resourceDelta: { funds: -500, fear: 3, faith: 5, suspect: 2 },
  },
  {
    id: "rumor_landlord_son_scandal",
    title: "地主の息子スキャンダル",
    description: "地主の息子（故人）が生前に女子高生に手を出していた噂を裏付ける",
    requiredRumors: ["rumor_landlord_son_scandal"],
    cost: 500,
    successText: "> 工作完了。資金 500 円。路地裏がざわつき始めた。",
    failText: "> 工作失敗。資金 500 円。証拠が不十分だったか。警戒度が上がる。",
    resourceDelta: { funds: -500, fear: 3, faith: 5, suspect: 7 },
  },
  {
    id: "rumor_bribe_evidence",
    title: "賄賂証拠のリーク",
    description: "地主が市議会議員に賄賂を渡し、再開発利権を得ていた証拠を匿名で流す",
    requiredRumors: ["rumor_bribe_evidence"],
    cost: 1000,
    successText: "> 証拠を流した。資金 1,000 円。市議の動きが怪しくなった。",
    failText: "> 証拠は握り潰された。資金 1,000 円。警戒度が大きく上がる。",
    resourceDelta: { funds: -1000, fear: 5, faith: 8, suspect: 10 },
  },
  {
    id: "rumor_yakuza_alley",
    title: "路地裏のチンピラ",
    description: "夜の路地裏でチンピラが商店街の店主たちからみかじめ料を徴収している",
    requiredRumors: ["rumor_yakuza_alley"],
    cost: 500,
    successText: "> 噂を流した。資金 500 円。チンピラたちが警戒し始めた。",
    failText: "> 噂は広まらなかった。資金 500 円。",
    resourceDelta: { funds: -500, fear: 2, faith: 3, suspect: 1 },
  },
];