import { SCENE_KEYS } from "@phaser/config";
import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.BOOT });
  }

  preload() {
    this.load.once("complete", () => {
      this.scene.start(SCENE_KEYS.STREET);
    });
    this.load.start();
  }

  create() {}
}
