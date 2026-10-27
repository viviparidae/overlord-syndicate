// Chapter 1 クライマックス ― 追放ルート
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

export const exileRoute: ClimaxRoute = {
  id: "exile",
  name: "追放ルート",
  condition: "flag_thug_subdued && flag_landlord_son_subdued && fear >= 80",
  scenes: [
    {
      id: "exile_1",
      speaker: "ナレーション",
      text: "夜、店の二階。母が寝静まった後。\n地主がひとり、店の前に立っていた。",
      background: "shop_night",
      bgm: "tension_low",
    },
    {
      id: "exile_2",
      speaker: "悪徳地主",
      text: "わ、分かっとる……書類、全部置いてく。印鑑も。\n二度とこの街に顔出さん。頼む、命だけは……。",
      background: "shop_night",
    },
    {
      id: "exile_3",
      speaker: "主人公",
      text: "賢明だ。母さんには『体調崩して療養』と伝えておく。\n商店街の連中には『急な転勤』で通せ。",
      background: "shop_night",
    },
    {
      id: "exile_4",
      speaker: "ナレーション",
      text: "地主は頭を床につけ、這って出ていく。\n二度と戻らない背中だった。",
      background: "shop_night",
    },
    {
      id: "exile_5",
      speaker: "主人公（独り言）",
      text: "（さて、空き店舗が七軒。相場の三割で買い占めよう）",
      background: "shop_night",
    },
  ],
  resourceReward: { funds: 120000, fear: 20, faith: 30, suspect: 15 },
  unlockFlags: ["flag_landlord_exiled"],
  phase2Unlocks: ["buyProperty", "expandTerritory"],
};

export const exileLog = `> 悪徳地主を追放した。商店街の実質的支配権を獲得。
> funds +120,000（不動産確保）, faith +30, fear +20, suspect +15
> Phase 1 達成条件クリア：Phase 2 へ移行します。`;