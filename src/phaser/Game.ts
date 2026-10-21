import Phaser from "phaser";
import { MainScene } from "./MainScene.js";

export class Game extends Phaser.Game {
  constructor() {
    super({
      type: Phaser.AUTO,
      width: 960,
      height: 540,
      pixelArt: true,
      roundPixels: true,
      backgroundColor: "#000000",
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [MainScene],
      antialias: false,
    });
  }
}

export default Game;
