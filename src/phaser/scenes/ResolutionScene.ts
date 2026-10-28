import Phaser from "phaser";
import { chapter } from "../../data/chapters/ch01";
import { flipFor } from "../../data/chapters/ch01/facing";
import { t } from "../../localization";
import { createStage } from "../stage";
import { currentChapter, saveNow } from "../state";
import { addButton, addText } from "../ui/components";

export class ResolutionScene extends Phaser.Scene {
  private text!: Phaser.GameObjects.BitmapText;
  private resultText!: Phaser.GameObjects.BitmapText;
  private speakerText!: Phaser.GameObjects.BitmapText;
  private progressText!: Phaser.GameObjects.BitmapText;
  private missText!: Phaser.GameObjects.BitmapText;
  private portrait!: Phaser.GameObjects.Image;
  private askBackButton?: Phaser.GameObjects.Container;
  private askBackShown = "";
  private readonly onEvidenceOffer = (evidenceId: string): void => {
    this.handleOffer(evidenceId);
  };

  constructor() {
    super("Resolution");
  }

  create(): void {
    const { world, ui } = createStage(this);
    this.cameras.main.setBackgroundColor("#0b0b10");

    const bg = this.add.image(160, 90, "bg_shotengai_office").setDisplaySize(320, 180);
    world.add(bg);

    const frame = this.add.rectangle(30, 336, 900, 136, 0x12121a, 0.95).setOrigin(0, 0);
    frame.setStrokeStyle(2, 0xe8d9a0, 0.8);
    frame.setInteractive({ useHandCursor: true });
    frame.on("pointerdown", () => {
      const engine = currentChapter().resolution;
      const block = engine?.current;
      if (block && !block.gap) {
        engine?.advance();
        this.afterStep();
      }
    });
    ui.add(frame);

    this.portrait = this.add.image(800, 150, "face_goda_normal").setDisplaySize(220, 276);
    ui.add(this.portrait);

    this.speakerText = addText(this, ui, 24, 300, "");
    this.progressText = addText(this, ui, 330, 300, "");
    this.missText = addText(this, ui, 750, 300, "").setTint(0xd9525b);
    this.text = addText(this, ui, 56, 356, "");
    this.text.setMaxWidth(850);
    this.resultText = addText(this, ui, 56, 438, "").setTint(0xe8d9a0);
    this.resultText.setMaxWidth(850);

    this.askBackButton = addButton(this, ui, 24, 480, "ui.resolution.askBack", {
      width: 170,
      height: 52,
      onClick: () => this.doAskBack(),
    });
    addButton(this, ui, 210, 480, "ui.resolution.offer", {
      width: 170,
      height: 52,
      onClick: () => this.scene.launch("Evidence", { mode: "offer" }),
    });
    this.game.events.on("evidence-offer", this.onEvidenceOffer);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off("evidence-offer", this.onEvidenceOffer);
    });

    this.refresh();
    saveNow();
  }

  private speakerId(): string {
    return currentChapter().resolution?.currentSpeaker ?? "";
  }

  private refresh(): void {
    const state = currentChapter();
    const engine = state.resolution;
    const block = engine?.current ?? null;
    if (!engine || engine.isFinished || !block) return;
    const speaker = engine?.currentSpeaker ?? "";
    const progress = engine?.progress ?? { index: 0, total: 0 };

    this.speakerText.setText(t(`speaker.${speaker}` as never));
    this.progressText.setText(`証言 ${progress.index}/${progress.total}`);
    this.missText.setText(t("log.miss", { count: state.misses.count, limit: state.missLimit }));

    this.text.setText(block ? t(block.textKey) : "");

    const id = this.speakerId();
    if (id) {
      this.portrait.setTexture(`face_${id}_normal`);
      this.portrait.setFlipX(flipFor(id, "left"));
    }
    this.askBackButton?.setVisible(block?.askBackKey !== undefined);
    this.askBackShown = "";
    this.resultText.setText("");
  }

  private doAskBack(): void {
    const engine = currentChapter().resolution;
    const key = engine?.askBack();
    if (!key || key === this.askBackShown) return;
    this.askBackShown = key;
    this.resultText.setText(`——${t(key)}`);
  }

  private handleOffer(evidenceId: string): void {
    const state = currentChapter();
    const engine = state.resolution;
    if (!engine) return;

    const successKey = engine.current?.gap?.successKey;
    const result = engine.offer(evidenceId);

    if (result.outcome === "correct") {
      this.resultText.setText(successKey ? t(successKey) : "");
      this.afterStep();
      return;
    }
    if (result.outcome === "gameover") {
      if (result.failureKey) this.resultText.setText(t(result.failureKey));
      this.missText.setText(t("log.miss", { count: state.misses.count, limit: state.missLimit }));
      this.scene.launch("GameOver");
      return;
    }
    if (result.failureKey) this.resultText.setText(t(result.failureKey));
    this.missText.setText(t("log.miss", { count: state.misses.count, limit: state.missLimit }));
  }

  private afterStep(): void {
    const state = currentChapter();
    const engine = state.resolution;
    if (!engine) return;
    if (engine.isFinished) {
      const error = state.finishResolution();
      if (!error) {
        saveNow();
        this.scene.start("Story", { phase: "epilogue" });
        return;
      }
    }
    this.refresh();
  }
}

export function evidenceCountText(): string {
  return t("ui.evidence.count", { have: 0, total: chapter.evidence.length });
}
