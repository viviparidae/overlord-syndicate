import { SAVE_KEY, SAVE_VERSION } from "../../balance/constants";
import type { ChapterPhase } from "../state/types";

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface GameSnapshot {
  version: number;
  chapterId: string;
  phase: ChapterPhase;
  missCount: number;
  evidence: string[];
  flags: Record<string, boolean>;
  seenDialogues: string[];
  elapsedMs: number;
}

const PHASES: ChapterPhase[] = ["intro", "investigation", "resolution", "epilogue", "cleared"];

function isSnapshot(value: unknown): value is GameSnapshot {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    v.version === SAVE_VERSION &&
    typeof v.chapterId === "string" &&
    typeof v.phase === "string" &&
    PHASES.includes(v.phase as ChapterPhase) &&
    typeof v.missCount === "number" &&
    Array.isArray(v.evidence) &&
    v.evidence.every((e) => typeof e === "string") &&
    typeof v.flags === "object" &&
    v.flags !== null &&
    Array.isArray(v.seenDialogues) &&
    typeof v.elapsedMs === "number"
  );
}

export class SaveRepository {
  constructor(private readonly storage: StorageLike) {}

  save(snapshot: GameSnapshot): void {
    this.storage.setItem(SAVE_KEY, JSON.stringify({ ...snapshot, version: SAVE_VERSION }));
  }

  load(): GameSnapshot | null {
    const raw = this.storage.getItem(SAVE_KEY);
    if (!raw) return null;
    try {
      const parsed: unknown = JSON.parse(raw);
      return isSnapshot(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  clear(): void {
    this.storage.removeItem(SAVE_KEY);
  }
}
