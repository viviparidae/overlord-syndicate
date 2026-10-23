import { intimidate } from "@core/actions/intimidate";
import { runShop } from "@core/actions/runShop";
import { spreadRumor } from "@core/actions/spreadRumor";
import { GameEngine } from "@core/GameEngine";
import { GameState } from "@core/GameState";
import { Resources } from "@core/Resources";
import { installDebugBridge } from "@phaser/DebugBridge";
import { Game } from "@phaser/Game";
import { initUI } from "@ui/index";
import { persist, restore } from "@ui/persistence";

const START_SEED = 12345;

window.addEventListener("DOMContentLoaded", () => {
  const resources = new Resources();
  const gameState = new GameState(START_SEED);
  const engine = new GameEngine(resources, gameState);

  engine.registerAction("runShop", runShop);
  engine.registerAction("spreadRumor", spreadRumor);
  engine.registerAction("intimidate", intimidate);

  restore(engine);

  initUI(resources, gameState, engine);

  engine.on("actionExecuted", () => {
    persist(engine);
  });

  const game = new Game(engine, resources);
  installDebugBridge(game, engine);

  // 再フィット: レイアウト確定・変化時にPhaserのScale.FITを更新する
  const gameWrap = document.querySelector(".game-container-wrapper");
  if (gameWrap && "ResizeObserver" in window) {
    const ro = new ResizeObserver(() => game.scale.refresh());
    ro.observe(gameWrap);
  }
  window.addEventListener("resize", () => game.scale.refresh());
  requestAnimationFrame(() => game.scale.refresh());
});
