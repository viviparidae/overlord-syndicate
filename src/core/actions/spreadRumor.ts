import type { ActionContext, ActionResult } from "./types";

export function spreadRumor(context: ActionContext): ActionResult {
  const { resources } = context;
  const cost = 500;
  const fearIncrease = 3;
  const faithIncrease = 5;
  const suspectIncrease = 2;

  if (resources.funds < cost) {
    return {
      success: false,
      resources: [],
      events: ["spread_rumor_failed"],
      messageKey: "action.spreadRumor.insufficientFunds",
      messageVars: { cost },
    };
  }

  resources.addFunds(-cost);
  resources.addFear(fearIncrease);
  resources.addFaith(faithIncrease);
  resources.addSuspect(suspectIncrease);

  return {
    success: true,
    resources: [
      { name: "funds", delta: -cost },
      { name: "fear", delta: fearIncrease },
      { name: "faith", delta: faithIncrease },
      { name: "suspect", delta: suspectIncrease },
    ],
    events: ["spread_rumor_success"],
    messageKey: "action.spreadRumor.success",
    messageVars: { cost },
  };
}
