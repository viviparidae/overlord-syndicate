import { intimidate } from "@core/actions/intimidate";
import { runShop } from "@core/actions/runShop";
import { spreadRumor } from "@core/actions/spreadRumor";
import { GameEngine } from "@core/GameEngine";
import { NPC_POSITIONS } from "@phaser/scenes/npc-config";
import { describe, expect, it } from "vitest";

/**
 * The NPC/street interactions were previously untestable from Vitest because the
 * tests reached into Phaser Scene privates. These exercise the same flow through
 * the pure engine: an NPC conversation is spreadRumor, the shop is runShop and
 * the back-room is intimidate — the mapping the StreetScene handlers delegate to.
 */
function newEngine() {
  const engine = new GameEngine();
  engine.registerAction("runShop", runShop);
  engine.registerAction("spreadRumor", spreadRumor);
  engine.registerAction("intimidate", intimidate);
  return engine;
}

describe("NPC interaction flow", () => {
  it("exposes an NPC at each configured street position", () => {
    expect(NPC_POSITIONS).toHaveLength(4);
    for (const npc of NPC_POSITIONS) {
      expect(npc.label.length).toBeGreaterThan(0);
      expect(npc.key).toMatch(/^npc_/);
    }
  });

  it("running the shop earns funds and raises faith", () => {
    const engine = newEngine();
    const { funds, faith } = engine.getResources();
    const result = engine.execute("runShop");
    expect(result.success).toBe(true);
    expect(result.gameStateSnapshot.funds).toBeGreaterThan(funds);
    expect(result.gameStateSnapshot.faith).toBeGreaterThan(faith);
  });

  it("spreading a rumour raises fear and faith at the cost of funds and suspicion", () => {
    const engine = newEngine();
    engine.execute("runShop");
    const { funds, faith, suspect, fear } = engine.getResources();
    const result = engine.execute("spreadRumor");
    expect(result.success).toBe(true);
    expect(result.gameStateSnapshot.faith).toBeGreaterThan(faith);
    expect(result.gameStateSnapshot.funds).toBeLessThan(funds);
    expect(result.gameStateSnapshot.suspect).toBeGreaterThan(suspect);
    expect(result.gameStateSnapshot.fear).toBeGreaterThan(fear);
  });

  it("intimidation pushes suspicion up until the run ends in game over", () => {
    const engine = newEngine();
    for (let i = 0; i < 40 && !engine.getGameState().isGameOver(); i++) {
      engine.execute("runShop");
      engine.execute("intimidate");
    }
    expect(engine.getResources().suspect).toBe(100);
    expect(engine.getGameState().isGameOver()).toBe(true);
  });

  it("refuses to execute actions once the game is over", () => {
    const engine = newEngine();
    while (!engine.getGameState().isGameOver()) {
      engine.execute("runShop");
      engine.execute("intimidate");
    }
    const fundsAtGameOver = engine.getResources().funds;
    const result = engine.execute("runShop");
    expect(result.success).toBe(false);
    expect(engine.getResources().funds).toBe(fundsAtGameOver);
  });

  it("a rumour costs funds, so repeated rumour-mongering drains the treasury", () => {
    const engine = newEngine();
    engine.execute("runShop");
    const start = engine.getResources().funds;
    let spent = 0;
    for (let i = 0; i < 5 && engine.execute("spreadRumor").success; i++) {
      spent++;
    }
    expect(spent).toBeGreaterThan(0);
    expect(engine.getResources().funds).toBeLessThan(start);
  });
});
