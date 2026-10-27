// Chapter 1 エピローグ ― 共通エンディング、Phase 2 導入
export interface EpilogueScene {
  id: string;
  speaker: string;
  text: string;
  background?: string;
  bgm?: string;
  delay?: number; // ms
}

export const epilogueScenes: EpilogueScene[] = [
  {
    id: "epi_1",
    speaker: "ナレーション",
    text: "文房具店、閉店後。\n母がお茶を置き、主人公の隣に正座する。",
    background: "shop_night_quiet",
    bgm: "peaceful",
    delay: 1000,
  },
  {
    id: "epi_2",
    speaker: "母",
    text: "あなた、最近頼もしくなったわね。お父さん、喜んでるわ。",
    background: "shop_night_quiet",
    delay: 1500,
  },
  {
    id: "epi_3",
    speaker: "主人公",
    text: "母さん、守るよ。この店も、この街も、母さんも。全部。",
    background: "shop_night_quiet",
    delay: 2000,
  },
  {
    id: "epi_4",
    speaker: "ナレーション",
    text: "母は涙目で頷く。\n画面がゆっくりフェードアウトする。",
    background: "black",
    delay: 3000,
  },
  {
    id: "epi_5",
    speaker: "システム",
    text: "平成九年 四月――\nシャッター商店街、新たな支配者を得る。\nだが、これはまだ、序章に過ぎない。",
    background: "black",
    delay: 2000,
  },
  {
    id: "epi_6",
    speaker: "システム",
    text: "> Phase 2: 地方都市 へ進行します。\n> 深夜ラジオ、ローカルTV、新たな舞台が待っている。",
    background: "black",
    delay: 1000,
  },
];

// ルート別追加テキスト
export const routeSpecificEpilogue = {
  exile: [
    {
      id: "epi_exile_1",
      speaker: "システム",
      text: "【追放ルート完了】\n不動産七軒を確保。家賃収入ルートを開設。\nPhase 2 では『不動産買収』アクションが解放されます。",
    },
  ],
  subordinate: [
    {
      id: "epi_sub_1",
      speaker: "システム",
      text: "【傘下ルート完了】\n地主を会長に据え、月次家賃収入を獲得。\nPhase 2 では『街頭演説』アクションが解放されます。",
    },
  ],
  balance: [
    {
      id: "epi_bal_1",
      speaker: "システム",
      text: "【バランスルート完了】\n地主と均衡。どちらのルートも選択可能なまま Phase 2 へ。\nPhase 2 では両アクションが解放されます。",
    },
  ],
};