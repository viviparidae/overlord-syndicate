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
  private frame!: Phaser.GameObjects.Rectangle;

  constructor() {
    super("Story");
  }

  init(data: StoryData): void {
    this.storyData = data;
  }

  create(): void {
    const { world, ui } = createStage(this);
    this.cameras.main.setBackgroundColor("#0b0b10");

    const storyBg =
      this.storyData.phase === "intro" ? "bg_story_arcade_center_mid" : "bg_story_shotengai_office";
    const bg = this.add.image(160, 90, storyBg).setDisplaySize(320, 180);
    if (this.storyData.phase === "epilogue") bg.setTint(0x8890a0);
    world.add(bg);

    this.frame = this.add.rectangle(40, 336, 880, 176, 0x12121a, 0.94).setOrigin(0, 0);
    this.frame.setStrokeStyle(2, 0xe8d9a0, 0.7);
    ui.add(this.frame);

    this.text = addText(this, ui, 60, 356, "", 24);
    this.text.setMaxWidth(840);

    this.lines = [
      ...(this.storyData.phase === "intro" ? chapter.introLines : chapter.epilogueLines),
    ];
    this.index = 0;
    this.showLine();

    const advance = () => this.advance();
    this.frame.setInteractive({ useHandCursor: true });
    this.frame.on("pointerdown", advance);
    this.input.keyboard?.on("keydown-Z", advance);
    this.input.keyboard?.on("keydown-SPACE", advance);
    this.input.keyboard?.on("keydown-ENTER", advance);

    this.skipButton = addButton(this, ui, 760, 472, "ui.skip", {
      width: 150,
      height: 48,
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
    this.frame.setVisible(false);
    this.text.setVisible(false);
    this.time.delayedCall(180, () => this.finish());
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
