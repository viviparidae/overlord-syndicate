import type { ActionContext, ActionResult } from "./types";

export function runShop(context: ActionContext): ActionResult {
  const { resources } = context;
  const income = 2000;
  const fearIncrease = 0;
  const faithIncrease = 1;

  resources.addFunds(income);
  resources.addFaith(faithIncrease);
  resources.addFear(fearIncrease);

  const result: ActionResult = {
    success: true,
    resources: [
      { name: "funds", delta: income },
      { name: "faith", delta: faithIncrease },
      { name: "fear", delta: fearIncrease },
    ],
    events: ["shop_run"],
    messageKey: "action.shopRun.success",
    messageVars: { income },
  };

  return result;
}
