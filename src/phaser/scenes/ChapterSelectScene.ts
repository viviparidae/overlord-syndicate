import Phaser from "phaser";
import { t } from "../../localization";
import { createStage } from "../stage";
import { newChapterState } from "../state";
import { addButton, addText } from "../ui/components";

export class ChapterSelectScene extends Phaser.Scene {
  constructor() {
    super("ChapterSelect");
  }

  create(): void {
    const { ui } = createStage(this);
    this.cameras.main.setBackgroundColor("#0b0b10");

    addText(this, ui, 60, 80, t("ui.title.chapterSelect"), 24).setTint(0xe8d9a0);

    addButton(this, ui, 60, 140, "chapter.ch01.title", {
      width: 420,
      onClick: () => {
        newChapterState();
        this.scene.start("Story", { phase: "intro" });
      },
    });
  }
}
