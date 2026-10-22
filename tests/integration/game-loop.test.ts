import { intimidate } from "@core/actions/intimidate";
import { runShop } from "@core/actions/runShop";
import { spreadRumor } from "@core/actions/spreadRumor";
import { GameEngine } from "@core/GameEngine";
import { describe, expect, it } from "vitest";

describe("GameEngine", () => {
  it("アクションを実行して結果を返す", () => {
    const engine = new GameEngine();
    engine.registerAction("runShop", runShop);
    const result = engine.execute("runShop");
    expect(result.success).toBe(true);
    expect(result.gameStateSnapshot.funds).toBe(12000);
    expect(result.phaseChanged).toBe(false);
    expect(result.gameStateSnapshot.faith).toBe(1);
  });

  it("スナップショットが現在の状態を反映する", () => {
    const engine = new GameEngine();
    engine.registerAction("runShop", runShop);
    const result = engine.execute("runShop");
    expect(result.gameStateSnapshot.suspect).toBe(0);
    expect(result.gameStateSnapshot.gameOver).toBe(false);
  });

  it("未登録アクションは失敗し状態が変わらない", () => {
    const engine = new GameEngine();
    engine.registerAction("runShop", runShop);
    const fundsBefore = engine.getResources().funds;
    const result = engine.execute("unknown");
    expect(result.success).toBe(false);
    expect(result.gameStateSnapshot.funds).toBe(fundsBefore);
    expect(result.messageKey).toBe("action.notFound");
  });

  it("resourcesChanged と actionExecuted のイベントが発行される", () => {
    const engine = new GameEngine();
    engine.registerAction("spreadRumor", spreadRumor);
    const received: {
      changed?: { funds: number; faith: number; suspect: number };
      executed?: { actionId: string; messageKey: string };
    } = {};
    engine.on("resourcesChanged", (payload) => {
      received.changed = payload;
    });
    engine.on("actionExecuted", ({ actionId, result }) => {
      received.executed = { actionId, messageKey: result.messageKey };
    });
    engine.execute("spreadRumor");
    expect(received.changed?.funds).toBe(9500);
    expect(received.changed?.faith).toBe(5);
    expect(received.changed?.suspect).toBe(2);
    expect(received.executed?.actionId).toBe("spreadRumor");
    expect(received.executed?.messageKey).toBe("action.spreadRumor.success");
  });

  it("閾値到達でフェーズが昇格し phaseChanged イベントが発火する", () => {
    const engine = new GameEngine();
    engine.registerAction("runShop", runShop);
    let phaseChanged = false;
    engine.on("phaseChanged", () => {
      phaseChanged = true;
    });
    for (let i = 0; i < 50; i++) {
      engine.execute("runShop");
    }
    expect(engine.getGameState().phase).toBe(2);
    expect(phaseChanged).toBe(true);
  });

  it("suspect 100 到達で GameOver になり以降のアクションが拒否される", () => {
    const engine = new GameEngine();
    engine.registerAction("runShop", runShop);
    engine.registerAction("intimidate", intimidate);
    let gameOverFired = false;
    engine.on("gameOver", () => {
      gameOverFired = true;
    });
    for (let i = 0; i < 19; i++) {
      engine.execute("runShop");
    }
    for (let i = 0; i < 20; i++) {
      engine.execute("intimidate");
    }
    expect(engine.getResources().suspect).toBe(100);
    expect(engine.getGameState().isGameOver()).toBe(true);
    expect(gameOverFired).toBe(true);
    const rejected = engine.execute("runShop");
    expect(rejected.success).toBe(false);
    expect(rejected.messageKey).toBe("action.gameOver");
  });

  it("セーブとロードで状態が保たれる", () => {
    const engine = new GameEngine();
    engine.registerAction("runShop", runShop);
    engine.execute("runShop");
    const json = engine.save();
    const engine2 = new GameEngine();
    engine2.load(json);
    expect(engine2.getResources().funds).toBe(12000);
  });
});
