import { GameEngine } from "@core/GameEngine";
import { Resources } from "@core/Resources";
import { SeededRNG } from "@core/RNG";
import { loadGame, saveGame, VERSION } from "@core/save/Serializer";
import { describe, expect, it, vi } from "vitest";

describe("Serializer", () => {
  it("決定論的な乱数生成は同一数列を返す", () => {
    const rng1 = new SeededRNG(42);
    const rng2 = new SeededRNG(42);
    expect([rng1.next(), rng1.next()]).toEqual([rng2.next(), rng2.next()]);
  });

  it("リソースのスナップショット復元は情報損失がない", () => {
    const res = new Resources({ funds: 5000, fear: 10, faith: 5, suspect: 3 });
    const snap = res.snapshot();
    const res2 = new Resources();
    res2.restore(snap);
    expect(res2.funds).toBe(5000);
    expect(res2.fear).toBe(10);
    expect(res2.faith).toBe(5);
    expect(res2.suspect).toBe(3);
  });

  it("セーブ文字列はバージョン付きの JSON になる", () => {
    const engine = new GameEngine();
    const json = saveGame(engine);
    const parsed = JSON.parse(json);
    expect(parsed.version).toBe(VERSION);
    expect(parsed.state.funds).toBe(10000);
    expect(parsed.resources.funds).toBe(10000);
  });

  it("ロードでゲーム状態が復元される", () => {
    const engine = new GameEngine();
    engine.getResources().addFunds(500);
    const json = saveGame(engine);

    const target = new GameEngine();
    loadGame(target, json);
    expect(target.getResources().funds).toBe(10500);
  });

  it("壊れたセーブのロードは例外として通知される", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const engine = new GameEngine();
    expect(() => loadGame(engine, "{ broken json")).toThrow();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
