import type { AssetsManifest } from "@data/assets";
import type Phaser from "phaser";

export class AnimationManager {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  createAnimations(manifest: AssetsManifest): void {
    for (const asset of manifest.assets) {
      if (asset.type !== "atlas") continue;
      this.scene.anims.create({
        key: `${asset.key}_walk`,
        frames: ["walk_down_0", "walk_down_1", "walk_down_2"].map((frame) => ({
          key: asset.key,
          frame,
        })),
        frameRate: 8,
        repeat: -1,
      });
    }
  }
}
