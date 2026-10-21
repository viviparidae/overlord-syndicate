import { SCENE_KEYS } from "@phaser/config";
import { AssetManager } from "@phaser/managers/AssetManager";
import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.BOOT });
  }

  preload() {
    const assetManager = new AssetManager(this);
    assetManager.loadAssets();
    this.scene.start(SCENE_KEYS.STREET);
  }

  create() {}

  update() {}
}
