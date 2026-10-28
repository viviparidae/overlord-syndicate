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

    addText(this, ui, 60, 120, "OVERLORD SYNDICATE", 32).setTint(0xe8d9a0);
    addText(this, ui, 62, 176, t("chapter.ch01.title"), 16).setTint(0x9aa0b0);

    addButton(this, ui, 60, 260, "ui.title.newGame", {
      width: 200,
      onClick: () => {
        newChapterState();
        this.scene.start("Story", { phase: "intro" });
      },
      testId: "new-game",
    });

    addButton(this, ui, 60, 320, "ui.title.chapterSelect", {
      width: 200,
      onClick: () => this.scene.start("ChapterSelect"),
    });
  }
}
