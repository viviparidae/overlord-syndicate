import type { GameEngine } from "@core/GameEngine";
import type { Resources } from "@core/Resources";

export interface GameContext {
  engine: GameEngine;
  resources: Resources;
}

let currentContext: GameContext | null = null;

export function setGameContext(context: GameContext): void {
  currentContext = context;
}

export function getGameContext(): GameContext {
  if (!currentContext) {
    throw new Error("GameContext is not initialized. Call setGameContext() first.");
  }
  return currentContext;
}
