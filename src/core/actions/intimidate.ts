import type { ActionContext, ActionResult } from "./types";

export function intimidate(context: ActionContext): ActionResult {
  const { resources } = context;
  const cost = 1000;
  const fearIncrease = 8;
  const faithDecrease = 2;
  const suspectIncrease = 5;

  if (resources.funds < cost) {
    return {
      success: false,
      resources: [],
      events: ["intimidate_failed"],
      messageKey: "action.intimidate.insufficientFunds",
      messageVars: { cost },
    };
  }

  resources.addFunds(-cost);
  resources.addFear(fearIncrease);
  resources.addFaith(-Math.abs(faithDecrease));
  resources.addSuspect(suspectIncrease);

  return {
    success: true,
    resources: [
      { name: "funds", delta: -cost },
      { name: "fear", delta: fearIncrease },
      { name: "faith", delta: -Math.abs(faithDecrease) },
      { name: "suspect", delta: suspectIncrease },
    ],
    events: ["intimidate_success"],
    messageKey: "action.intimidate.success",
    messageVars: { cost },
  };
}
