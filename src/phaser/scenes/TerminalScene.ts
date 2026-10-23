import { SCENE_KEYS } from "@phaser/config";
import { getGameContext } from "@phaser/GameContext";
import Phaser from "phaser";

export class TerminalScene extends Phaser.Scene {
  private engine = getGameContext().engine;
  private key1!: Phaser.Input.Keyboard.Key;
  private key2!: Phaser.Input.Keyboard.Key;
  private escKey!: Phaser.Input.Keyboard.Key;
  private messageText!: Phaser.GameObjects.Text;
  private btnRumor!: Phaser.GameObjects.Graphics;
  private btnIntimidate!: Phaser.GameObjects.Graphics;
  private btnExit!: Phaser.GameObjects.Graphics;

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

    this.createTouchButtons();

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

private createTouchButtons(): void {
    const gameWidth = 960;
    const gameHeight = 540;
    const btnWidth = gameWidth / 3 - 20;
    const btnY = gameHeight - 90;

    this.btnRumor = this.add.graphics();
    this.btnRumor.fillStyle(0x000000, 0.6);
    this.btnRumor.fillRoundedRect(10, btnY, btnWidth, 60, 8);
    this.btnRumor.lineStyle(3, 0xfbbf24, 0.9);
    this.btnRumor.strokeRoundedRect(10, btnY, btnWidth, 60, 8);
    this.btnRumor.setDepth(999);
    this.btnRumor.setScrollFactor(0);

    this.add
      .text(10 + btnWidth / 2, btnY + 30, "噂を流す", {
        fontSize: "16px",
        color: "#fbbf24",
        fontFamily: "DotGothic16, monospace",
      })
      .setOrigin(0.5)
      .setDepth(1000)
      .setScrollFactor(0);

    this.btnIntimidate = this.add.graphics();
    this.btnIntimidate.fillStyle(0x000000, 0.6);
    this.btnIntimidate.fillRoundedRect(gameWidth / 3 + 10, btnY, btnWidth, 60, 8);
    this.btnIntimidate.lineStyle(3, 0xf87171, 0.9);
    this.btnIntimidate.strokeRoundedRect(gameWidth / 3 + 10, btnY, btnWidth, 60, 8);
    this.btnIntimidate.setDepth(999);
    this.btnIntimidate.setScrollFactor(0);

    this.add
      .text(gameWidth / 3 + 10 + btnWidth / 2, btnY + 30, "脅迫する", {
        fontSize: "16px",
        color: "#f87171",
        fontFamily: "DotGothic16, monospace",
      })
      .setOrigin(0.5)
      .setDepth(1000)
      .setScrollFactor(0);

    this.btnExit = this.add.graphics();
    this.btnExit.fillStyle(0x000000, 0.6);
    this.btnExit.fillRoundedRect((gameWidth * 2) / 3 + 10, btnY, btnWidth, 60, 8);
    this.btnExit.lineStyle(3, 0x888888, 0.9);
    this.btnExit.strokeRoundedRect((gameWidth * 2) / 3 + 10, btnY, btnWidth, 60, 8);
    this.btnExit.setDepth(999);
    this.btnExit.setScrollFactor(0);

    this.add
      .text((gameWidth * 2) / 3 + 10 + btnWidth / 2, btnY + 30, "外へ出る", {
        fontSize: "16px",
        color: "#888888",
        fontFamily: "DotGothic16, monospace",
      })
      .setOrigin(0.5)
      .setDepth(1000)
      .setScrollFactor(0);

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (
        pointer.x >= 10 &&
        pointer.x <= 10 + btnWidth &&
        pointer.y >= btnY &&
        pointer.y <= btnY + 60
      ) {
        this.spreadRumor();
      } else if (
        pointer.x >= gameWidth / 3 + 10 &&
        pointer.x <= gameWidth / 3 + 10 + btnWidth &&
        pointer.y >= btnY &&
        pointer.y <= btnY + 60
      ) {
        this.intimidate();
      } else if (
        pointer.x >= (gameWidth * 2) / 3 + 10 &&
        pointer.x <= (gameWidth * 2) / 3 + 10 + btnWidth &&
        pointer.y >= btnY &&
        pointer.y <= btnY + 60
      ) {
        this.returnToStreet();
      }
    });
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
