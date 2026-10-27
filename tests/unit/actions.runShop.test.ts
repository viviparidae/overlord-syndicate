import { intimidate } from "@core/actions/intimidate";
import { runShop } from "@core/actions/runShop";
import { spreadRumor } from "@core/actions/spreadRumor";
import { GameState } from "@core/GameState";
import { Resources } from "@core/Resources";
import { SeededRNG } from "@core/RNG";
import { describe, expect, it } from "vitest";

function makeContext(funds = 10000) {
  const resources = new Resources({ funds });
  const gameState = new GameState();
  const rng = new SeededRNG(12345);
  return { resources, gameState, rng };
}

describe("runShop", () => {
  it("資金と狂信度が増加する", () => {
    const ctx = makeContext();
    const result = runShop(ctx);
    expect(result.success).toBe(true);
    expect(ctx.resources.funds).toBe(12000);
    expect(ctx.resources.faith).toBe(1);
  });

  it("リソース変化を返す", () => {
    const ctx = makeContext();
    const result = runShop(ctx);
    expect(result.resources).toContainEqual({ name: "funds", delta: 2000 });
    expect(result.resources).toContainEqual({ name: "faith", delta: 1 });
  });
});

describe("spreadRumor", () => {
  it("資金を消費し恐怖・狂信度・警戒度が増加する", () => {
    const ctx = makeContext();
    const result = spreadRumor(ctx);
    expect(result.success).toBe(true);
    expect(ctx.resources.funds).toBe(9500);
    expect(ctx.resources.fear).toBe(3);
    expect(ctx.resources.faith).toBe(5);
    expect(ctx.resources.suspect).toBe(2);
  });

  it("資金不足では失敗する", () => {
    const ctx = makeContext(100);
    const result = spreadRumor(ctx);
    expect(result.success).toBe(false);
    expect(ctx.resources.funds).toBe(100);
  });
});

describe("intimidate", () => {
  it("資金を消費し恐怖と警戒度が増加し狂信度が減少する", () => {
    const ctx = makeContext();
    ctx.gameState.flags["rumor_yakuza_alley"] = true; // 必須噂フラグ
    ctx.resources.fear = 50; // 十分な恐怖値
    const result = intimidate(ctx, "thug");
    expect(result.success).toBe(true);
    expect(ctx.resources.funds).toBe(60000); // 10000 + 50000
    expect(ctx.resources.fear).toBe(58); // 50 + 8
    expect(ctx.resources.faith).toBe(0); // 0 - 2 clamped at 0
    expect(ctx.resources.suspect).toBe(5);
    expect(ctx.gameState.flags["flag_thug_subdued"]).toBe(true);
  });

  it("恐怖不足では失敗する", () => {
    const ctx = makeContext();
    ctx.gameState.flags["rumor_yakuza_alley"] = true;
    ctx.resources.fear = 10; // fearCost=30 より少ない
    const result = intimidate(ctx, "thug");
    expect(result.success).toBe(false);
    expect(result.messageKey).toBe("action.intimidate.insufficientFear");
  });

  it("必須噂がない場合は失敗する", () => {
    const ctx = makeContext();
    ctx.resources.fear = 50;
    // rumor_yakuza_alley を設定しない
    const result = intimidate(ctx, "thug");
    expect(result.success).toBe(false);
    expect(result.messageKey).toBe("action.intimidate.missingRumor");
  });

  it("必須フラグがない場合は失敗する（地主）", () => {
    const ctx = makeContext();
    ctx.gameState.flags["rumor_landlord_grandson_weakness"] = true;
    ctx.gameState.flags["rumor_bribe_evidence"] = true;
    ctx.resources.fear = 50;
    // flag_thug_subdued と flag_landlord_son_subdued がない
    const result = intimidate(ctx, "landlord");
    expect(result.success).toBe(false);
    expect(result.messageKey).toBe("action.intimidate.missingFlag");
  });
});
