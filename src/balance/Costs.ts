/**
 * Costs - Action cost and reward tables
 * Pure data tables, centralized balance tables for game progression
 */
export const ActionCosts = {
  runShop: { funds: 0, time: 1 },
  spreadRumor: { funds: 500, time: 1 },
  intimidate: { funds: 1000, time: 2 },
  broadcastRadio: { funds: 5000, time: 2 },
  politicalSpeech: { funds: 20000, time: 3 },
  buyCompany: { funds: 500000, time: 5 },
  controlDemonstration: { funds: 100000, time: 3 },
} as const;

export const ActionRewards = {
  runShop: { funds: 2000, fear: 0, faith: 1, suspect: 0 },
  spreadRumor: { funds: -500, fear: 3, faith: 5, suspect: 2 },
  intimidate: { funds: -1000, fear: 8, faith: -2, suspect: 5 },
  broadcastRadio: { funds: 0, fear: 15, faith: 25, suspect: 12 },
  politicalSpeech: { funds: 0, fear: 10, faith: 40, suspect: 15 },
  buyCompany: { funds: 0, fear: 30, faith: 50, suspect: 20 },
  controlDemonstration: { funds: 0, fear: 25, faith: 60, suspect: 25 },
} as const;

export type ActionName = keyof typeof ActionCosts;

export const ActionNames: ActionName[] = [
  "runShop",
  "spreadRumor",
  "intimidate",
  "broadcastRadio",
  "politicalSpeech",
  "buyCompany",
  "controlDemonstration",
];
