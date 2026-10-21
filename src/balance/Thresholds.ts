/**
 * Thresholds - Phase advancement and resource thresholds
 * Centralized balance tables for game progression
 */
export const PhaseThresholds = {
  phase1To2: { faith: 50, funds: 50000 },
  phase2To3: { faith: 150, funds: 200000 },
  phase3To4: { faith: 300, funds: 1000000 },
} as const;

export const SuspectDecay = {
  publicActionReduction: 5,
  maxDailyDecay: 10,
} as const;

export const ResourceCaps = {
  fear: 200,
  faith: 500,
  suspect: 100,
} as const;

export type PhaseThresholdKey = keyof typeof PhaseThresholds;

export function meetsThreshold(
  key: PhaseThresholdKey,
  current: { faith: number; funds: number },
): boolean {
  const threshold = PhaseThresholds[key];
  return current.faith >= threshold.faith && current.funds >= threshold.funds;
}
