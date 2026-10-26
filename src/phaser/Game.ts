import type { GameEngine } from "@core/GameEngine";
import type { Resources } from "@core/Resources";
import Phaser from "phaser";
import { GAME_CONFIG } from "./config";
import { setGameContext } from "./GameContext";
import { BootScene } from "./scenes/BootScene";
import { HudScene } from "./scenes/HudScene";
import { ShopScene } from "./scenes/ShopScene";
import { StreetScene } from "./scenes/StreetScene";
import { TerminalScene } from "./scenes/TerminalScene";

export class Game extends Phaser.Game {
  constructor(engine: GameEngine, resources: Resources) {
    setGameContext({ engine, resources });
    super({
      ...GAME_CONFIG,
      scene: [BootScene, StreetScene, ShopScene, TerminalScene, HudScene],
      antialias: false,
    });
  }
}

export default Game;
