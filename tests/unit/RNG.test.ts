import { SeededRNG } from "@core/RNG";
import { describe, expect, it } from "vitest";

describe("SeededRNG", () => {
  it("0から1の間の値を返す", () => {
    const rng = new SeededRNG(12345);
    for (let i = 0; i < 100; i++) {
      const val = rng.next();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });

  it("同じシードなら同じ数列になる", () => {
    const rng1 = new SeededRNG(42);
    const rng2 = new SeededRNG(42);
    const vals1 = [rng1.next(), rng1.next(), rng1.next()];
    const vals2 = [rng2.next(), rng2.next(), rng2.next()];
    expect(vals1).toEqual(vals2);
  });

  it("シードが違えば数列も異なる", () => {
    const rng1 = new SeededRNG(1);
    const rng2 = new SeededRNG(2);
    expect(rng1.next()).not.toBe(rng2.next());
  });

  it("指定範囲の整数を返す", () => {
    const rng = new SeededRNG(12345);
    for (let i = 0; i < 100; i++) {
      const val = rng.nextInt(1, 10);
      expect(val).toBeGreaterThanOrEqual(1);
      expect(val).toBeLessThanOrEqual(10);
    }
  });
});
