import { Resources } from "@core/Resources";
import { describe, expect, it } from "vitest";

describe("Resources", () => {
  it("初期値で生成される", () => {
    const res = new Resources();
    expect(res.funds).toBe(10000);
    expect(res.fear).toBe(0);
    expect(res.faith).toBe(0);
    expect(res.suspect).toBe(0);
  });

  it("資金が加算される", () => {
    const res = new Resources();
    const change = res.addFunds(500);
    expect(res.funds).toBe(10500);
    expect(change.delta).toBe(500);
  });

  it("恐怖が加算される", () => {
    const res = new Resources();
    res.addFear(10);
    expect(res.fear).toBe(10);
  });

  it("恐怖は100を超えない", () => {
    const res = new Resources();
    res.addFear(150);
    expect(res.fear).toBe(100);
  });

  it("警戒度は100を超えない", () => {
    const res = new Resources();
    res.addSuspect(150);
    expect(res.suspect).toBe(100);
  });

  it("警戒度が100に達するとゲームオーバーになる", () => {
    const res = new Resources({ suspect: 100 });
    expect(res.hasGameOvered()).toBe(true);
  });

  it("資金の減算が反映される", () => {
    const res = new Resources();
    res.reduceFunds(3000);
    expect(res.funds).toBe(7000);
  });

  it("資金の減算は0を下回らない", () => {
    const res = new Resources();
    res.reduceFunds(99999);
    expect(res.funds).toBe(0);
  });

  it("警戒度が100未満ならゲームオーバーではない", () => {
    const res = new Resources({ suspect: 99 });
    expect(res.isGameOver()).toBe(false);
    expect(res.hasGameOvered()).toBe(false);
  });

  it("スナップショットから復元できる", () => {
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
