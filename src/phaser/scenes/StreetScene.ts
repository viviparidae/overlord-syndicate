import { SCENE_KEYS } from "@phaser/config";
import Phaser from "phaser";

export class StreetScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.STREET });
  }

  create() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x1a1a2e);
    graphics.fillRect(0, 0, 960, 540);

    const ground = this.add.rectangle(480, 480, 960, 120, 0x333333);
    this.physics.add.existing(ground, true);

    this.add
      .text(480, 400, "ストリート", {
        fontSize: "24px",
        color: "#ffffff",
      })
      .setOrigin(0.5);
  }
}
