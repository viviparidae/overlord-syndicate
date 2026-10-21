import { intimidate } from "@core/actions/intimidate";
import { runShop } from "@core/actions/runShop";
import { spreadRumor } from "@core/actions/spreadRumor";
import { GameState } from "@core/GameState";
import { Resources } from "@core/Resources";
import { describe, expect, it } from "vitest";

function makeContext(funds = 10000) {
  const resources = new Resources({ funds });
  const gameState = new GameState();
  return { resources, gameState };
}

describe("runShop", () => {
  it("increases funds and faith", () => {
    const ctx = makeContext();
    const result = runShop(ctx);
    expect(result.success).toBe(true);
    expect(ctx.resources.funds).toBe(12000);
    expect(ctx.resources.faith).toBe(1);
  });

  it("returns resource changes", () => {
    const ctx = makeContext();
    const result = runShop(ctx);
    expect(result.resources).toContainEqual({ name: "funds", delta: 2000 });
    expect(result.resources).toContainEqual({ name: "faith", delta: 1 });
  });
});

describe("spreadRumor", () => {
  it("costs funds and increases fear/faith/suspect", () => {
    const ctx = makeContext();
    const result = spreadRumor(ctx);
    expect(result.success).toBe(true);
    expect(ctx.resources.funds).toBe(9500);
    expect(ctx.resources.fear).toBe(3);
    expect(ctx.resources.faith).toBe(5);
    expect(ctx.resources.suspect).toBe(2);
  });

  it("fails when insufficient funds", () => {
    const ctx = makeContext(100);
    const result = spreadRumor(ctx);
    expect(result.success).toBe(false);
    expect(ctx.resources.funds).toBe(100);
  });
});

describe("intimidate", () => {
  it("costs funds and increases fear/suspect, decreases faith", () => {
    const ctx = makeContext();
    const result = intimidate(ctx);
    expect(result.success).toBe(true);
    expect(ctx.resources.funds).toBe(9000);
    expect(ctx.resources.fear).toBe(8);
    expect(ctx.resources.faith).toBe(0); // 0 - 2 clamped at 0
    expect(ctx.resources.suspect).toBe(5);
  });

  it("fails when insufficient funds", () => {
    const ctx = makeContext(100);
    const result = intimidate(ctx);
    expect(result.success).toBe(false);
    expect(ctx.resources.funds).toBe(100);
  });
});
