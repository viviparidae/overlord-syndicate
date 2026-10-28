import Phaser from "phaser";
import { UI_HEIGHT, UI_WIDTH, WORLD_HEIGHT, WORLD_WIDTH } from "../balance/constants";

export function createGame(parent: string): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: UI_WIDTH,
    height: UI_HEIGHT,
    backgroundColor: "#0b0b10",
    pixelArt: true,
    roundPixels: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [],
    render: { antialias: false },
  });
}

export const WORLD_SIZE = { width: WORLD_WIDTH, height: WORLD_HEIGHT } as const;
