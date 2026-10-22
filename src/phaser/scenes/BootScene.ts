import type { AssetsManifest } from "@data/assets";
import manifest from "@data/assets.json";
import { SCENE_KEYS } from "@phaser/config";
import { AnimationManager } from "@phaser/managers/AnimationManager";
import { AssetManager } from "@phaser/managers/AssetManager";
import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.BOOT });
  }

  preload() {
    const assetManager = new AssetManager(this);
    assetManager.loadAssets(manifest as AssetsManifest);
  }

  create() {
    const animationManager = new AnimationManager(this);
    animationManager.createAnimations(manifest as AssetsManifest);
    this.scene.start(SCENE_KEYS.STREET);
  }

  update() {}
}
