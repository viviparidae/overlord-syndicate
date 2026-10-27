import { SCENE_KEYS } from "@phaser/config";
import { getGameContext } from "@phaser/GameContext";
import Phaser from "phaser";

export class ShopScene extends Phaser.Scene {
  private engine = getGameContext().engine;
  private resources = getGameContext().resources;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private escKey!: Phaser.Input.Keyboard.Key;
  private messageText!: Phaser.GameObjects.Text;
  private fundsText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: SCENE_KEYS.SHOP });
  }

  create() {
    const { width, height } = this.scale;

    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e);
    bg.fillRect(0, 0, width, height);

    this.add.rectangle(width / 2, 440, width, 120, 0x2a2a4a).setStrokeStyle(2, 0x4ade80);

    this.fundsText = this.add
      .text(width / 2, 60, `資金: ¥${this.resources.funds.toLocaleString()} | 日の出文房具店`, {
        fontSize: "22px",
        color: "#e94560",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);

    this.messageText = this.add
      .text(width / 2, height / 2 - 30, "「いらっしゃいませ。文房具ですかね」", {
        fontSize: "16px",
        color: "#cccccc",
        fontFamily: "monospace",
        wordWrap: { width: 700 },
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height - 70, "SPACE: 店番をする  /  ESC: 外へ出る", {
        fontSize: "12px",
        color: "#888888",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);

    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.runShop();
    }
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.returnToStreet();
    }
  }

  /** Canvas 外の SPACE ボタン用。店番アクションを1回実行する。 */
  public runShopAction() {
    this.runShop();
  }

  /** Canvas 外の ESC ボタン用。街に戻る。 */
  public exitToStreet() {
    this.returnToStreet();
  }

  private runShop() {
    const result = this.engine.execute("runShop");
    if (result.success) {
      this.showMessage("店番を行いました。客が少ないが、地道な収益。");
      this.updateResources();
    }
  }

  private updateResources() {
    const formatted = new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
      maximumFractionDigits: 0,
    }).format(this.resources.funds);
    this.fundsText.setText(`資金: ${formatted}  |  日の出文房具店`);
  }

  private showMessage(text: string) {
    this.messageText.setText(text);
    this.messageText.setColor("#22d3ee");

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
        this.messageText.y = this.scale.height / 2 - 30;
        this.messageText.alpha = 1;
      },
    });
  }

  private returnToStreet() {
    this.scene.start(SCENE_KEYS.STREET);
  }
}
