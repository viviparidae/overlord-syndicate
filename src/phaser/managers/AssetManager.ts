import type { AssetsManifest } from "@data/assets";
import type Phaser from "phaser";

export class AssetManager {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  loadAssets(manifest: AssetsManifest): void {
    for (const asset of manifest.assets) {
      if (asset.type === "atlas") {
        this.scene.load.atlas(asset.key, asset.path, asset.atlas!);
      } else {
        this.scene.load.image(asset.key, asset.path);
      }
    }
  }
}
