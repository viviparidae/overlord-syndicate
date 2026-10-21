import { runShop } from "@core/actions/runShop";
import { GameEngine } from "@core/GameEngine";
import { describe, expect, it } from "vitest";

describe("GameEngine", () => {
  it("executes actions and returns result", () => {
    const engine = new GameEngine();
    engine.registerAction("runShop", runShop);
    const result = engine.execute("runShop");
    expect(result.success).toBe(true);
    expect(result.gameStateSnapshot.funds).toBe(12000);
    expect(result.phaseChanged).toBe(false);
  });

  it("save/load preserves state", () => {
    const engine = new GameEngine();
    engine.registerAction("runShop", runShop);
    engine.execute("runShop");
    const json = engine.save();
    const engine2 = new GameEngine();
    engine2.load(json);
    expect(engine2.getResources().funds).toBe(12000);
  });

  it("gameStateSnapshot reflects current state", () => {
    const engine = new GameEngine();
    engine.registerAction("runShop", runShop);
    const result = engine.execute("runShop");
    expect(result.gameStateSnapshot.suspect).toBe(0);
  });
});
