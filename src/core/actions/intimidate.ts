import type { ActionContext, ActionResult, ResourceChange } from "./types";

interface IntimidateTarget {
  id: string;
  name: string;
  requiredRumors: string[];
  requiredFlags?: string[];
  fearCost: number;
  successRate: number;
  fundsReward: number;
  fearDelta: number;
  faithDelta: number;
  suspectDelta: number;
  successMessageKey: string;
  failMessageKey: string;
  unlockFlags?: string[];
}

const INTIMIDATE_TARGETS: Record<string, IntimidateTarget> = {
  thug: {
    id: "thug",
    name: "チンピラ",
    requiredRumors: ["rumor_yakuza_alley"],
    fearCost: 30,
    successRate: 0.85,
    fundsReward: 50000,
    fearDelta: 8,
    faithDelta: -2,
    suspectDelta: 5,
    successMessageKey: "action.intimidate.success",
    failMessageKey: "action.intimidate.fail",
    unlockFlags: ["flag_thug_subdued"],
  },
  landlord_son: {
    id: "landlord_son",
    name: "地主の息子",
    requiredRumors: ["rumor_landlord_son_scandal"],
    fearCost: 30,
    successRate: 0.9,
    fundsReward: 0,
    fearDelta: 8,
    faithDelta: -2,
    suspectDelta: 5,
    successMessageKey: "action.intimidate.success",
    failMessageKey: "action.intimidate.fail",
    unlockFlags: ["flag_landlord_son_subdued"],
  },
  landlord: {
    id: "landlord",
    name: "悪徳地主",
    requiredRumors: ["rumor_landlord_grandson_weakness", "rumor_bribe_evidence"],
    requiredFlags: ["flag_thug_subdued", "flag_landlord_son_subdued"],
    fearCost: 40,
    successRate: 0.95,
    fundsReward: 100000,
    fearDelta: 10,
    faithDelta: -5,
    suspectDelta: 15,
    successMessageKey: "action.intimidate.success",
    failMessageKey: "action.intimidate.fail",
    unlockFlags: ["flag_landlord_exiled", "flag_landlord_subordinate"],
  },
};

export function intimidate(context: ActionContext, targetId: string = "thug"): ActionResult {
  const { resources, gameState } = context;
  const target = INTIMIDATE_TARGETS[targetId];

  if (!target) {
    return {
      success: false,
      resources: [],
      events: ["intimidate_unknown_target"],
      messageKey: "action.notFound",
      messageVars: { actionId: targetId },
    };
  }

  // 必須噂チェック
  const hasRumors = target.requiredRumors.every((rumor) => gameState.flags[rumor] === true);
  if (!hasRumors) {
    return {
      success: false,
      resources: [],
      events: ["intimidate_missing_rumor"],
      messageKey: "action.intimidate.missingRumor",
      messageVars: { target: target.name },
    };
  }

  // 必須フラグチェック
  if (target.requiredFlags) {
    const hasFlags = target.requiredFlags.every((flag) => gameState.flags[flag] === true);
    if (!hasFlags) {
      return {
        success: false,
        resources: [],
        events: ["intimidate_missing_flag"],
        messageKey: "action.intimidate.missingFlag",
        messageVars: { target: target.name },
      };
    }
  }

  // 恐怖コストチェック
  if (resources.fear < target.fearCost) {
    return {
      success: false,
      resources: [],
      events: ["intimidate_insufficient_fear"],
      messageKey: "action.intimidate.insufficientFear",
      messageVars: { cost: target.fearCost },
    };
  }

  // 成功判定
  const rng = context.rng;
  const success = rng.next() < target.successRate;

  if (success) {
    // リソース適用
    resources.addFunds(target.fundsReward);
    resources.addFear(target.fearDelta);
    resources.addFaith(target.faithDelta);
    resources.addSuspect(target.suspectDelta);

    // フラグ設定
    if (target.unlockFlags) {
      for (const flag of target.unlockFlags) {
        gameState.flags[flag] = true;
      }
    }

    const resourceChanges: ResourceChange[] = [
      { name: "funds", delta: target.fundsReward },
      { name: "fear", delta: target.fearDelta },
      { name: "faith", delta: target.faithDelta },
      { name: "suspect", delta: target.suspectDelta },
    ];

    return {
      success: true,
      resources: resourceChanges,
      events: ["intimidate_success", `intimidate_${targetId}_success`],
      messageKey: target.successMessageKey,
      messageVars: { cost: target.fearCost, target: target.name },
    };
  } else {
    // 失敗時のペナルティ
    resources.addFear(-target.fearCost);
    resources.addSuspect(target.suspectDelta + 5);

    return {
      success: false,
      resources: [
        { name: "fear", delta: -target.fearCost },
        { name: "suspect", delta: target.suspectDelta + 5 },
      ],
      events: ["intimidate_fail", `intimidate_${targetId}_fail`],
      messageKey: target.failMessageKey,
      messageVars: { cost: target.fearCost, target: target.name },
    };
  }
}
