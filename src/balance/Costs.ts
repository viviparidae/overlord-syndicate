/**
 * Costs - Action cost and reward tables
 * Pure data tables, no branching logic
 */
export const ActionCosts = {
  runStore: { funds: 0, time: 1 },
  spreadRumor: { funds: 100, time: 1 },
  threatenLandlord: { funds: 500, time: 2 },
  broadcastRadio: { funds: 5000, time: 2 },
  politicalSpeech: { funds: 20000, time: 3 },
  buyCompany: { funds: 500000, time: 5 },
  controlDemonstration: { funds: 100000, time: 3 },
} as const;

export const ActionRewards = {
  runStore: { fear: 0, faith: 2, suspect: -3 },
  spreadRumor: { fear: 5, faith: 3, suspect: 2 },
  threatenLandlord: { fear: 20, faith: 5, suspect: 10 },
  broadcastRadio: { fear: 15, faith: 25, suspect: 12 },
  politicalSpeech: { fear: 10, faith: 40, suspect: 15 },
  buyCompany: { fear: 30, faith: 50, suspect: 20 },
  controlDemonstration: { fear: 25, faith: 60, suspect: 25 },
} as const;

export type ActionName = keyof typeof ActionCosts;

export const ActionNames: ActionName[] = [
  "runStore",
  "spreadRumor",
  "threatenLandlord",
  "broadcastRadio",
  "politicalSpeech",
  "buyCompany",
  "controlDemonstration",
];
