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

export interface PhaseThresholdTransition {
  from: number;
  to: number;
  key: PhaseThresholdKey;
}

export const PhaseThresholdSequence: readonly PhaseThresholdTransition[] = [
  { from: 1, to: 2, key: "phase1To2" },
  { from: 2, to: 3, key: "phase2To3" },
  { from: 3, to: 4, key: "phase3To4" },
];

export function thresholdKeyForPhase(phase: number): PhaseThresholdKey | undefined {
  return PhaseThresholdSequence.find((transition) => transition.from === phase)?.key;
}

export function thresholdTransitionForPhase(phase: number): PhaseThresholdTransition | undefined {
  return PhaseThresholdSequence.find((transition) => transition.from === phase);
}

export function meetsThreshold(
  key: PhaseThresholdKey,
  current: { faith: number; funds: number },
): boolean {
  const threshold = PhaseThresholds[key];
  return current.faith >= threshold.faith && current.funds >= threshold.funds;
}
