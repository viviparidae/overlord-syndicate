// Chapter 1 日常パート ― 店番時の客バリエーション

interface ShopCustomer {
  id: string;
  speaker: string;
  text: string;
  purchase: { item: string; price: number };
  resourceDelta: { funds: number; faith: number; suspect?: number };
  afterText: string;
}

export const shopCustomers: ShopCustomer[] = [
  {
    id: "customer_child",
    speaker: "翔太",
    text: "おじちゃん、ポケベルのシール、新しいの入った？",
    purchase: { item: "ポケベルシールセット", price: 300 },
    resourceDelta: { funds: 300, faith: 1, suspect: -1 },
    afterText: "「やった！　見せて見せて！」\n笑顔で選び、会計の時「ママにも見せなきゃ」と呟く。",
  },
  {
    id: "customer_housewife",
    speaker: "主婦",
    text: "赤ボールペン、太いのない？　職場で使うの",
    purchase: { item: "赤ボールペン 3本", price: 450 },
    resourceDelta: { funds: 450, faith: 1, suspect: -1 },
    afterText: "「ありがとう、助かるわ」\n領収書を丁寧に折り、財布にしまう。",
  },
  {
    id: "customer_salaryman",
    speaker: "サラリーマン",
    text: "封筒、長3 百枚。急ぎで",
    purchase: { item: "長3封筒 100枚", price: 2800 },
    resourceDelta: { funds: 2800, faith: 2, suspect: -1 },
    afterText: "「助かったよ、本当に」\n深く頭を下げ、急ぎ足で去る。",
  },
  {
    id: "customer_neighbor",
    speaker: "近所の奥さん",
    text: "あら、若旦那さん立派になったのね",
    purchase: { item: "なし（お茶菓子置き土産）", price: 0 },
    resourceDelta: { funds: 0, faith: 2, suspect: -2 },
    afterText: "「お母様、お元気で何よりよ」\n手作りのクッキーを置いて、にこやかに帰る。",
  },
];

// 店番終了時共通ログ
export const shopEndLog = (income: number) =>
  `> 店番を終えた。売上 ${income} 円。母が「お疲れさま」とお茶を淹れてくれた。`;

// 客がいない時のテキスト
export const shopEmptyText =
  "客が誰もいない。シャッターが閉まりかけている。\n……裏工作の準備でもするか。";