import { describe, expect, it } from "vitest";
import { MissCounter } from "../../src/core/resolution/MissCounter";

describe("ミスカウント", () => {
  it("上限に達するまではゲームオーバーにならない", () => {
    const misses = new MissCounter(3);

    misses.add();
    misses.add();

    expect(misses.isLimitReached).toBe(false);
    expect(misses.count).toBe(2);
  });

  it("誤答が上限に達するとゲームオーバーになる", () => {
    const misses = new MissCounter(3);

    misses.add();
    misses.add();
    const reached = misses.add();

    expect(reached).toBe(true);
    expect(misses.isLimitReached).toBe(true);
  });

  it("リトライすると0に戻る", () => {
    const misses = new MissCounter(3);
    misses.add();
    misses.add();
    misses.add();

    misses.reset();

    expect(misses.count).toBe(0);
    expect(misses.isLimitReached).toBe(false);
  });
});
