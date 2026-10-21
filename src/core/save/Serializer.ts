import type { GameEngine } from "../GameEngine";

export interface SnapshotVersion {
  version: number;
  migrate: (data: unknown) => unknown;
}

export const VERSION: number = 1;

export function saveGame(engine: GameEngine): string {
  return engine.save();
}

export function loadGame(engine: GameEngine, json: string): void {
  loadGameInternal(engine, json);
}

function loadGameInternal(engine: GameEngine, json: string): void {
  try {
    engine.load(json);
  } catch (e) {
    console.error("Failed to load game:", e);
    throw e;
  }
}
