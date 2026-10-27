// Chapter 1 裏工作パネル ― 脅迫実行テキスト
export interface IntimidateTextEntry {
  targetId: string;
  targetName: string;
  requiredRumors: string[];
  requiredFlags?: string[];
  fearCost: number;
  successRate: number; // 0.0-1.0
  successText: string;
  failText: string;
  resourceDelta: { funds: number; fear: number; faith: number; suspect: number };
  unlockFlags?: string[];
}

export const intimidateTexts: IntimidateTextEntry[] = [
  {
    targetId: "thug",
    targetName: "チンピラ（路地裏）",
    requiredRumors: ["rumor_yakuza_alley"],
    fearCost: 30,
    successRate: 0.85,
    successText: "> 実行した。恐怖 30。チンピラの顔から血の気が引いた。資金 50,000 円。屈服フラグ獲得。",
    failText: "> 失敗した。恐怖 30。チンピラは怯まなかった。警戒度が上がる。",
    resourceDelta: { funds: 50000, fear: -30, faith: -2, suspect: 5 },
    unlockFlags: ["flag_thug_subdued"],
  },
  {
    targetId: "landlord_son",
    targetName: "地主の息子（故人・遺品整理で弱み握る）",
    requiredRumors: ["rumor_landlord_son_scandal"],
    fearCost: 30,
    successRate: 0.9,
    successText: "> 実行した。恐怖 30。遺品から決定的な証拠を発見。地主の息子の名誉を盾に、地主を追い詰める。",
    failText: "> 失敗した。恐怖 30。証拠は焼却されていた。警戒度が上がる。",
    resourceDelta: { funds: 0, fear: -30, faith: -2, suspect: 5 },
    unlockFlags: ["flag_landlord_son_subdued"],
  },
  {
    targetId: "landlord",
    targetName: "悪徳地主",
    requiredRumors: ["rumor_landlord_grandson_weakness", "rumor_bribe_evidence"],
    requiredFlags: ["flag_thug_subdued", "flag_landlord_son_subdued"],
    fearCost: 40,
    successRate: 0.95,
    successText: "> 実行した。恐怖 40。孫と嫁を盾に、賄賂証拠を突きつけ、地主は膝をついた。資金 100,000 円。",
    failText: "> 失敗した。恐怖 40。孫の前では屈せん、か……。警戒度が上がる。",
    resourceDelta: { funds: 100000, fear: -40, faith: -5, suspect: 15 },
    unlockFlags: ["flag_landlord_exiled", "flag_landlord_subordinate"], // 分岐でどちらか
  },
];

// 実行確認画面共通テンプレート
export const intimidateConfirmTemplate = (targetName: string, fearCost: number, successRate: number) =>
  `[情報端末 ― 実行確認]
対象: ${targetName}
恐怖消費: ${fearCost}
成功率: ${Math.round(successRate * 100)}%
実行しますか？ [Y/N]`;

// 実行中アニメーション風テキスト
export const intimidateExecutingText = (targetName: string) =>
  `[情報端末 ― 実行中]
対象: ${targetName}
接続中...
脅迫プロトコル起動
心理的圧力印加: ████████░░ 80%
相手の反応解析中...
`;