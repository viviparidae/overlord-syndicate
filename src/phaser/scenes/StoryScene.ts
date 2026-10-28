import Phaser from "phaser";
import { chapter } from "../../data/chapters/ch01";
import { t } from "../../localization";
import { createStage } from "../stage";
import { currentChapter, saveNow } from "../state";
import { addButton, addText } from "../ui/components";

export interface StoryData {
  phase: "intro" | "epilogue";
}

export class StoryScene extends Phaser.Scene {
  private storyData!: StoryData;
  private lines: string[] = [];
  private index = 0;
  private text!: Phaser.GameObjects.BitmapText;
  private skipButton?: Phaser.GameObjects.Container;

  constructor() {
    super("Story");
  }

  init(data: StoryData): void {
    this.storyData = data;
  }

  create(): void {
    const { world, ui } = createStage(this);
    this.cameras.main.setBackgroundColor("#0b0b10");

    world.add(this.add.image(160, 90, "bg_arcade_center_mid").setDisplaySize(320, 180));

    const frame = this.add.rectangle(40, 372, 880, 136, 0x12121a, 0.94).setOrigin(0, 0);
    frame.setStrokeStyle(2, 0xe8d9a0, 0.7);
    ui.add(frame);

    this.text = addText(this, ui, 60, 396, "", 12);
    this.text.setMaxWidth(840);

    this.lines = [
      ...(this.storyData.phase === "intro" ? chapter.introLines : chapter.epilogueLines),
    ];
    this.index = 0;
    this.showLine();

    const advance = () => this.advance();
    frame.setInteractive({ useHandCursor: true });
    frame.on("pointerdown", advance);
    this.input.keyboard?.on("keydown-Z", advance);
    this.input.keyboard?.on("keydown-SPACE", advance);
    this.input.keyboard?.on("keydown-ENTER", advance);

    this.skipButton = addButton(this, ui, 790, 486, "ui.title.chapterSelect", {
      width: 120,
      height: 40,
      onClick: () => this.finish(),
    });
    this.skipButton.setVisible(false);
  }

  private showLine(): void {
    const key = this.lines[this.index];
    this.text.setText(key ? t(key as never) : "");
  }

  private advance(): void {
    if (this.index < this.lines.length - 1) {
      this.index += 1;
      this.showLine();
      return;
    }
    this.finish();
  }

  private finish(): void {
    const state = currentChapter();
    if (this.storyData.phase === "intro") {
      state.startInvestigation();
      saveNow();
      this.scene.start("Investigation");
      return;
    }
    state.clearChapter();
    saveNow();
    this.scene.start("ChapterSelect");
  }
}
