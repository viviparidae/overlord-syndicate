import { intimidate } from "@core/actions/intimidate";
import { runShop } from "@core/actions/runShop";
import { spreadRumor, spreadRumorWithWork } from "@core/actions/spreadRumor";
import { GameEngine } from "@core/GameEngine";
import { GameState } from "@core/GameState";
import { Resources } from "@core/Resources";
import { SCENE_KEYS } from "@phaser/config";
import { installDebugBridge } from "@phaser/DebugBridge";
import { Game } from "@phaser/Game";
import type { StreetScene } from "@phaser/scenes/StreetScene";
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
    const event = new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true });
    window.dispatchEvent(event);
  });
  document.getElementById("btn-down")?.addEventListener("click", () => {
    const event = new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true });
    window.dispatchEvent(event);
  });
  document.getElementById("btn-left")?.addEventListener("click", () => {
    const event = new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true });
    window.dispatchEvent(event);
  });
  document.getElementById("btn-right")?.addEventListener("click", () => {
    const event = new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true });
    window.dispatchEvent(event);
  });
  // Space key → NPC dialogue / 調べる
  document.getElementById("btn-space")?.addEventListener("click", () => {
    const event = new KeyboardEvent("keydown", { key: " ", bubbles: true });
    window.dispatchEvent(event);
  });
  // Escape key → シーン戻る
  document.getElementById("btn-esc")?.addEventListener("click", () => {
    const event = new KeyboardEvent("keydown", { key: "Escape", bubbles: true });
    window.dispatchEvent(event);
  });
  // E key → shop scene transition (direct scene change, not engine action)
  document.getElementById("btn-e")?.addEventListener("click", () => {
    const street = game.scene.getScene(SCENE_KEYS.STREET) as StreetScene | null;
    if (street && game.scene.isActive(SCENE_KEYS.STREET)) {
      street.enterShop();
    }
  });
  // T key → terminal (裏工作) panel scene transition
  document.getElementById("btn-t")?.addEventListener("click", () => {
    const street = game.scene.getScene(SCENE_KEYS.STREET) as StreetScene | null;
    if (street && game.scene.isActive(SCENE_KEYS.STREET)) {
      street.openTerminal();
    }
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
