import { describe, expect, it } from "vitest";
import { SAVE_KEY } from "../../src/balance/constants";
import {
  type GameSnapshot,
  SaveRepository,
  type StorageLike,
} from "../../src/core/save/SaveRepository";

class MemoryStorage implements StorageLike {
  private map = new Map<string, string>();

  getItem(key: string): string | null {
    return this.map.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }

  removeItem(key: string): void {
    this.map.delete(key);
  }
}

const snapshot: GameSnapshot = {
  version: 1,
  chapterId: "ch01",
  phase: "investigation",
  missCount: 1,
  evidence: ["ev_ledger_theft"],
  flags: { f_heard_kenta: true },
  seenDialogues: ["intro.01"],
  elapsedMs: 1200,
};

describe("セーブ", () => {
  it("保存した内容をそのまま読み出せる", () => {
    const repo = new SaveRepository(new MemoryStorage());

    repo.save(snapshot);

    expect(repo.load()).toEqual(snapshot);
  });

  it("保存がなければnullを返す", () => {
    const repo = new SaveRepository(new MemoryStorage());

    expect(repo.load()).toBeNull();
  });

  it("壊れたデータはnullを返す", () => {
    const storage = new MemoryStorage();
    storage.setItem(SAVE_KEY, "{not json");
    const repo = new SaveRepository(storage);

    expect(repo.load()).toBeNull();
  });

  it("未知のバージョンは読み込まない", () => {
    const storage = new MemoryStorage();
    storage.setItem(SAVE_KEY, JSON.stringify({ ...snapshot, version: 99 }));
    const repo = new SaveRepository(storage);

    expect(repo.load()).toBeNull();
  });

  it("消去すると読み込めなくなる", () => {
    const repo = new SaveRepository(new MemoryStorage());
    repo.save(snapshot);

    repo.clear();

    expect(repo.load()).toBeNull();
  });
});
