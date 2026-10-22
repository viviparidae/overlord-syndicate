import type { GameEngine } from "@core/GameEngine";

export const SAVE_KEY = "overlord_syndicate_v1";

export function persist(engine: GameEngine): void {
  try {
    localStorage.setItem(SAVE_KEY, engine.save());
  } catch (error) {
    console.error("Failed to persist game state:", error);
  }
}

export function restore(engine: GameEngine): boolean {
  let raw: string | null = null;

  try {
    raw = localStorage.getItem(SAVE_KEY);
  } catch (error) {
    console.error("Failed to read saved game state:", error);
    return false;
  }

  if (raw === null) return false;

  try {
    engine.load(raw);
    return true;
  } catch (error) {
    console.error("Failed to load saved game state:", error);
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (removeError) {
      console.error("Failed to remove corrupted save:", removeError);
    }
    return false;
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (error) {
    console.error("Failed to clear saved game state:", error);
  }
}
