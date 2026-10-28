import Phaser from "phaser";
import { t } from "../../localization";
import { createStage } from "../stage";
import { currentChapter } from "../state";
import { addButton, addText } from "../ui/components";

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super("GameOver");
  }

  create(): void {
    const { ui } = createStage(this);
    ui.add(this.add.rectangle(0, 0, 960, 540, 0x05050a, 0.9).setOrigin(0, 0).setInteractive());

    addText(this, ui, 60, 140, t("ui.gameover.title"), 32).setTint(0xd9525b);

    addButton(this, ui, 60, 220, "ui.gameover.retryPart", {
      width: 260,
      height: 56,
      onClick: () => {
        const state = currentChapter();
        state.retryResolution();
        this.scene.stop();
        this.scene.start("Resolution");
      },
    });

    addButton(this, ui, 60, 300, "ui.gameover.retryChapter", {
      width: 260,
      height: 56,
      onClick: () => {
        const state = currentChapter();
        state.retryResolution();
        this.scene.stop();
        this.scene.start("Story", { phase: "intro" });
      },
    });
  }
}
