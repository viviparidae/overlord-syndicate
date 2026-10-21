import { intimidate } from "@core/actions/intimidate";
import { runShop } from "@core/actions/runShop";
import { spreadRumor } from "@core/actions/spreadRumor";
import { GameEngine } from "@core/GameEngine";
import { GameState } from "@core/GameState";
import { Resources } from "@core/Resources";
import { GAME_CONFIG } from "@phaser/config";
import { initUI } from "@ui/index";
import Phaser from "phaser";

const START_SEED = 12345;

window.addEventListener("DOMContentLoaded", () => {
  const resources = new Resources();
  const gameState = new GameState(START_SEED);
  const engine = new GameEngine(resources, gameState);

  // Register actions
  engine.registerAction("runShop", runShop);
  engine.registerAction("spreadRumor", spreadRumor);
  engine.registerAction("intimidate", intimidate);

  // Init UI
  initUI(resources, gameState, engine);

  // Start Phaser game
  new Phaser.Game({
    ...GAME_CONFIG,
    scene: [BootScene, StreetScene, ShopScene, TerminalScene],
    plugins: [],
  });
});

import { BootScene } from "@phaser/scenes/BootScene";
import { ShopScene } from "@phaser/scenes/ShopScene";
import { StreetScene } from "@phaser/scenes/StreetScene";
import { TerminalScene } from "@phaser/scenes/TerminalScene";
