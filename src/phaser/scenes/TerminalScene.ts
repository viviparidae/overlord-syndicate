import { SCENE_KEYS } from "@phaser/config";
import Phaser from "phaser";

export class TerminalScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.TERMINAL });
  }

  create() {
    this.add
      .text(480, 260, "裏の顔 — デモ画面", {
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
