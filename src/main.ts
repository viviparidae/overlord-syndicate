import { intimidate } from "@core/actions/intimidate";
import { runShop } from "@core/actions/runShop";
import { spreadRumor } from "@core/actions/spreadRumor";
import { GameEngine } from "@core/GameEngine";
import { GameState } from "@core/GameState";
import { Resources } from "@core/Resources";
import { Game } from "@phaser/Game";

const START_SEED = 12345;

window.addEventListener("DOMContentLoaded", () => {
  const resources = new Resources();
  const gameState = new GameState(START_SEED);
  const engine = new GameEngine(resources, gameState);

  engine.registerAction("runShop", runShop);
  engine.registerAction("spreadRumor", spreadRumor);
  engine.registerAction("intimidate", intimidate);

  new Game(engine, resources);
});
