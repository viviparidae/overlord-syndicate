import { SAVE_KEY, SETTINGS_KEY } from "../balance/constants";
import { SaveRepository, type GameSnapshot } from "../core/save/SaveRepository";
import { ChapterState } from "../core/state/ChapterState";
import { chapter } from "../data/chapters/ch01";
import { MISS_LIMIT_DEFAULT } from "../balance/constants";

export interface Settings {
  textSpeed: "slow" | "normal" | "fast" | "instant";
  textScale: 1 | 1.25 | 1.5;
  shake: boolean;
  flash: boolean;
}

const storage = {
  getItem: (key: string) => globalThis.localStorage?.getItem(key) ?? null,
  setItem: (key: string, value: string) => globalThis.localStorage?.setItem(key, value),
  removeItem: (key: string) => globalThis.localStorage?.removeItem(key),
};

export const saveRepository = new SaveRepository(storage);

let chapterState: ChapterState | null = null;

export function newChapterState(): ChapterState {
  chapterState = new ChapterState({
    chapterId: chapter.id,
    missLimit: MISS_LIMIT_DEFAULT,
    requiredEvidence: [...chapter.requiredEvidence],
    scale: chapter.scale,
    venueKey: chapter.venueKey,
    roleKey: chapter.roleKey,
    hotspots: [...chapter.hotspots],
    testimonies: [...chapter.testimonies],
  });
  return chapterState;
}

export function currentChapter(): ChapterState {
  return chapterState ?? newChapterState();
}

export function hasSave(): boolean {
  return storage.getItem(SAVE_KEY) !== null;
}

export function saveNow(): void {
  const state = chapterState;
  if (!state) return;
  const snapshot: GameSnapshot = {
    version: 1,
    chapterId: chapter.id,
    phase: state.phase,
    missCount: state.misses.count,
    evidence: state.evidence,
    flags: {},
    seenDialogues: [],
    elapsedMs: 0,
  };
  saveRepository.save(snapshot);
}

export function defaultSettings(): Settings {
  return { textSpeed: "normal", textScale: 1, shake: true, flash: true };
}

export function loadSettings(): Settings {
  const raw = storage.getItem(SETTINGS_KEY);
  if (!raw) return defaultSettings();
  try {
    return { ...defaultSettings(), ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    return defaultSettings();
  }
}

export function saveSettings(settings: Settings): void {
  storage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
