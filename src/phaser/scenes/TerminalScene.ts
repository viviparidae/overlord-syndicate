import { SCENE_KEYS } from "@phaser/config";
import { getGameContext } from "@phaser/GameContext";
import Phaser from "phaser";

export class TerminalScene extends Phaser.Scene {
  private engine = getGameContext().engine;
  private key1!: Phaser.Input.Keyboard.Key;
  private key2!: Phaser.Input.Keyboard.Key;
  private escKey!: Phaser.Input.Keyboard.Key;
  private messageText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: SCENE_KEYS.TERMINAL });
  }

  create() {
    const { width, height } = this.scale;

    const bg = this.add.graphics();
    bg.fillStyle(0x0d0d1a);
    bg.fillRect(0, 0, width, height);

    this.add
      .text(width / 2, 60, "裏の顔 — 裏工作パネル", {
        fontSize: "22px",
        color: "#e94560",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 110, "1: 噂を流す (¥500)  |  2: 脅迫する (¥1,000)", {
        fontSize: "16px",
        color: "#fbbf24",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);

    this.messageText = this.add
      .text(width / 2, height / 2, "端末が点いている。ど、相手の弱みでも探すか。", {
        fontSize: "16px",
        color: "#cccccc",
        fontFamily: "monospace",
        wordWrap: { width: 700 },
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height - 70, "1: 噂を流す  /  2: 脅迫する  /  ESC: 外へ出る", {
        fontSize: "12px",
        color: "#888888",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);

    this.key1 = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.key2 = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    this.escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.key1)) {
      this.spreadRumor();
    }
    if (Phaser.Input.Keyboard.JustDown(this.key2)) {
      this.intimidate();
    }
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.returnToStreet();
    }
  }

  private spreadRumor() {
    const result = this.engine.execute("spreadRumor");
    if (result.success) {
      this.showMessage("噂を流した。街の空気が変わった。");
    } else {
      this.showMessage("資金が足りない...", "#f87171");
    }
  }

  private intimidate() {
    const result = this.engine.execute("intimidate");
    if (result.success) {
      this.showMessage("脅迫した。相手の顔から血の気が引いた。");
    } else {
      this.showMessage("資金が足りない...", "#f87171");
    }
  }

  private showMessage(text: string, color?: string) {
    this.messageText.setText(text);
    if (color) this.messageText.setColor(color);

    this.tweens.add({
      targets: this.messageText,
      alpha: 0.3,
      y: this.messageText.y - 20,
      yoyo: true,
      duration: 600,
      repeat: 1,
      ease: "Power2",
      onYoyo: () => {
        this.messageText.setColor("#cccccc");
        this.messageText.y = this.scale.height / 2;
        this.messageText.alpha = 1;
      },
    });
  }

  private returnToStreet() {
    this.scene.start(SCENE_KEYS.STREET);
  }
}
