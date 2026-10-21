import { SCENE_KEYS } from "@phaser/config";
import Phaser from "phaser";

export class ShopScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.SHOP });
  }

  create() {
    this.add
      .text(480, 260, "店番中...", {
        fontSize: "28px",
        color: "#e94560",
      })
      .setOrigin(0.5);

    this.add
      .text(480, 320, "Press ENTER to return", {
        fontSize: "14px",
        color: "#cccccc",
      })
      .setOrigin(0.5);

    const keyboard = this.input.keyboard;
    if (keyboard) {
      keyboard.once("keydown-ENTER", () => {
        this.scene.start(SCENE_KEYS.STREET);
      });
    }
  }
}
