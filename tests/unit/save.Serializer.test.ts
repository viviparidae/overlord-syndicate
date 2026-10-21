import { Resources } from "@core/Resources";
import { SeededRNG } from "@core/RNG";
import { describe, expect, it } from "vitest";

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
});
