import { intimidate } from "@core/actions/intimidate";
import { runShop } from "@core/actions/runShop";
import { spreadRumor, spreadRumorWithWork } from "@core/actions/spreadRumor";
import { GameEngine } from "@core/GameEngine";
import { GameState } from "@core/GameState";
import { Resources } from "@core/Resources";
import { installDebugBridge } from "@phaser/DebugBridge";
import { Game } from "@phaser/Game";
import { persist, restore } from "@ui/persistence";

const START_SEED = 12345;

declare global {
  interface Window {
    executeOverlordAction: (action: string) => void;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const resources = new Resources();
  const gameState = new GameState(START_SEED);
  const engine = new GameEngine(resources, gameState);

  engine.registerAction("runShop", runShop);
  engine.registerAction("spreadRumor", spreadRumor);
  engine.registerAction("spreadRumorWithWork", spreadRumorWithWork);
  engine.registerAction("intimidate", intimidate);

  restore(engine);

  engine.on("actionExecuted", () => {
    persist(engine);
  });

  const game = new Game(engine, resources);
  installDebugBridge(game, engine);

  // Canvas 外のボタンからアクションを実行するためのエントリーポイント
  window.executeOverlordAction = (action: string): void => {
    const result = engine.execute(action);
    if (result.success) {
      persist(engine);
    }
  };

  // External DOM buttons (dpad + E/T) — Canvas 外
  // dpad (WASD equivalent): move player
  document.getElementById("btn-up")?.addEventListener("click", () => {
    const event = new KeyboardEvent("keydown", { key: "w", bubbles: true });
    window.dispatchEvent(event);
  });
  document.getElementById("btn-down")?.addEventListener("click", () => {
    const event = new KeyboardEvent("keydown", { key: "s", bubbles: true });
    window.dispatchEvent(event);
  });
  document.getElementById("btn-left")?.addEventListener("click", () => {
    const event = new KeyboardEvent("keydown", { key: "a", bubbles: true });
    window.dispatchEvent(event);
  });
  document.getElementById("btn-right")?.addEventListener("click", () => {
    const event = new KeyboardEvent("keydown", { key: "d", bubbles: true });
    window.dispatchEvent(event);
  });
  // E key → shop
  document.getElementById("btn-e")?.addEventListener("click", () => {
    window.executeOverlordAction("runShop");
  });
  document.getElementById("btn-t")?.addEventListener("click", () => {
    window.executeOverlordAction("spreadRumor");
  });
  // Canvas command panel buttons — for E2E test automation
  document.getElementById("btn-shop")?.addEventListener("click", () => {
    window.executeOverlordAction("runShop");
  });
  document.getElementById("btn-rumor")?.addEventListener("click", () => {
    window.executeOverlordAction("spreadRumor");
  });
  document.getElementById("btn-intimidate")?.addEventListener("click", () => {
    window.executeOverlordAction("intimidate");
  });

  window.addEventListener("resize", () => game.scale.refresh());
  requestAnimationFrame(() => game.scale.refresh());
});
