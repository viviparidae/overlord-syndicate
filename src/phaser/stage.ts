import type Phaser from "phaser";
import { ZOOM } from "../balance/constants";

export interface Stage {
  world: Phaser.GameObjects.Container;
  ui: Phaser.GameObjects.Container;
}

export function createStage(scene: Phaser.Scene): Stage {
  const world = scene.add.container(0, 0).setScale(ZOOM);
  const ui = scene.add.container(0, 0);
  return { world, ui };
}

export function worldToScreen(x: number, y: number): { x: number; y: number } {
  return { x: x * ZOOM, y: y * ZOOM };
}
