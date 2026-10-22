import { intimidate } from "@core/actions/intimidate";
import { runShop } from "@core/actions/runShop";
import { spreadRumor } from "@core/actions/spreadRumor";
import { GameEngine } from "@core/GameEngine";
import { describe, expect, it } from "vitest";

describe("GameEngine", () => {
  it("アクション実行でスナップショットが更新される", () => {
    const engine = new GameEngine();
    engine.registerAction("runShop", runShop);
    const result = engine.execute("runShop");
    expect(result.success).toBe(true);
    expect(result.gameStateSnapshot.funds).toBe(12000);
    expect(result.gameStateSnapshot.faith).toBe(1);
    expect(result.phaseChanged).toBe(false);
  });

  it("未登録アクションは失敗し状態が変わらない", () => {
    const engine = new GameEngine();
    engine.registerAction("runShop", runShop);
    const before = engine.getResources().funds;
    const result = engine.execute("unknownAction");
    expect(result.success).toBe(false);
    expect(result.gameStateSnapshot.funds).toBe(before);
    expect(result.gameStateSnapshot.gameOver).toBe(false);
    expect(result.messageKey).toBe("action.notFound");
  });

  it("resourcesChanged が購読側に届く", () => {
    const engine = new GameEngine();
    engine.registerAction("runShop", runShop);
    const received: { payload?: { funds: number; fear: number; faith: number; suspect: number } } =
      {};
    engine.on("resourcesChanged", (payload) => {
      received.payload = payload;
    });
    engine.execute("runShop");
    expect(received.payload).toEqual({ funds: 12000, fear: 0, faith: 1, suspect: 0 });
  });

  it("閾値到達でフェーズが昇格し phaseChanged が発火する", () => {
    const engine = new GameEngine();
    engine.registerAction("runShop", runShop);
    const received: { payload?: { from: number; to: number } } = {};
    engine.on("phaseChanged", (payload) => {
      received.payload = payload;
    });
    for (let i = 0; i < 50; i++) {
      engine.execute("runShop");
    }
    expect(engine.getGameState().phase).toBe(2);
    expect(received.payload).toEqual({ from: 1, to: 2 });
  });

  it("suspect 100 到達で GameOver になり以降のアクションが拒否される", () => {
    const engine = new GameEngine();
    engine.registerAction("runShop", runShop);
    engine.registerAction("intimidate", intimidate);
    const received: { payload?: { reason: "suspect" } } = {};
    engine.on("gameOver", (payload) => {
      received.payload = payload;
    });
    for (let i = 0; i < 19; i++) {
      engine.execute("runShop");
    }
    for (let i = 0; i < 20; i++) {
      engine.execute("intimidate");
    }
    expect(engine.getResources().suspect).toBe(100);
    expect(engine.getGameState().isGameOver()).toBe(true);
    expect(received.payload).toEqual({ reason: "suspect" });

    const fundsBefore = engine.getResources().funds;
    const nextResult = engine.execute("runShop");
    expect(nextResult.success).toBe(false);
    expect(nextResult.gameStateSnapshot.gameOver).toBe(true);
    expect(nextResult.messageKey).toBe("action.gameOver");
    expect(engine.getResources().funds).toBe(fundsBefore);
  });

  it("messageKey / messageVars が戻り値に含まれる", () => {
    const engine = new GameEngine();
    engine.registerAction("spreadRumor", spreadRumor);
    const result = engine.execute("spreadRumor");
    expect(result.success).toBe(true);
    expect(result.messageKey).toBe("action.spreadRumor.success");
    expect(result.messageVars).toEqual({ cost: 500 });
  });
});
