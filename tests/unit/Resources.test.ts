import { Resources } from "@core/Resources";
import { describe, expect, it } from "vitest";

describe("Resources", () => {
  it("initializes with default values", () => {
    const res = new Resources();
    expect(res.funds).toBe(10000);
    expect(res.fear).toBe(0);
    expect(res.faith).toBe(0);
    expect(res.suspect).toBe(0);
  });

  it("tracks funds changes", () => {
    const res = new Resources();
    const change = res.addFunds(500);
    expect(res.funds).toBe(10500);
    expect(change.delta).toBe(500);
  });

  it("tracks fear changes", () => {
    const res = new Resources();
    res.addFear(10);
    expect(res.fear).toBe(10);
  });

  it("caps fear at 100", () => {
    const res = new Resources();
    res.addFear(150);
    expect(res.fear).toBe(100);
  });

  it("caps suspect at 100", () => {
    const res = new Resources();
    res.addSuspect(150);
    expect(res.suspect).toBe(100);
  });

  it("gameOver when suspect reaches 100", () => {
    const res = new Resources({ suspect: 100 });
    expect(res.hasGameOvered()).toBe(true);
  });

  it("snapshot/restore works", () => {
    const res = new Resources();
    res.addFunds(1000);
    res.addFear(5);
    const snap = res.snapshot();
    const res2 = new Resources();
    res2.restore(snap);
    expect(res2.funds).toBe(11000);
    expect(res2.fear).toBe(5);
  });
});
