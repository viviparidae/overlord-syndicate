export interface ResourceChange {
  name: string;
  delta: number;
}

export type ActionResult = {
  success: boolean;
  resources: ResourceChange[];
  newPhase?: number;
  events: string[];
  messageKey: string;
  messageVars?: Record<string, unknown>;
};

import type { GameState } from "../GameState";
import type { Resources } from "../Resources";
import type { SeededRNG } from "../RNG";

export interface ActionContext {
  resources: Resources;
  gameState: GameState;
  rng: SeededRNG;
}
