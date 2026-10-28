import Phaser from "phaser";
import { t } from "../../localization";
import { createStage } from "../stage";
import { newChapterState } from "../state";
import { addButton, addText } from "../ui/components";

export class TitleScene extends Phaser.Scene {
  constructor() {
    super("Title");
  }

  create(): void {
    const { ui } = createStage(this);
    this.cameras.main.setBackgroundColor("#0b0b10");

    addText(this, ui, 60, 110, "OVERLORD SYNDICATE", 40).setTint(0xe8d9a0);
    addText(this, ui, 62, 168, t("chapter.ch01.title"), 24).setTint(0x9aa0b0);

    addButton(this, ui, 60, 270, "ui.title.newGame", {
      width: 280,
      onClick: () => {
        if (this.isPortrait()) return;
        newChapterState();
        this.scene.start("Story", { phase: "intro" });
      },
      testId: "new-game",
    });

    addButton(this, ui, 60, 350, "ui.title.chapterSelect", {
      width: 280,
      onClick: () => {
        if (this.isPortrait()) return;
        this.scene.start("ChapterSelect");
      },
    });

    const overlay = this.add.container(0, 0);
    const backdrop = this.add.rectangle(0, 0, 960, 540, 0x05050a, 0.92).setOrigin(0, 0);
    overlay.add(backdrop);
    const message = addText(this, overlay, 480, 250, t("ui.rotate"), 40).setTint(0xd9525b);
    message.setOrigin(0.5, 0.5);
    ui.add(overlay);

    const update = () => {
      overlay.setVisible(this.isPortrait());
    };
    update();
    this.scale.on("resize", update);
  }

  private isPortrait(): boolean {
    return window.innerHeight > window.innerWidth;
  }
}
