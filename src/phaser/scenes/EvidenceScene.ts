import Phaser from "phaser";
import { chapter } from "../../data/chapters/ch01";
import { t } from "../../localization";
import { createStage } from "../stage";
import { currentChapter } from "../state";
import { addButton, addText } from "../ui/components";

export interface EvidenceData {
  mode: "view" | "offer";
}

export class EvidenceScene extends Phaser.Scene {
  private mode: "view" | "offer" = "view";

  constructor() {
    super("Evidence");
  }

  init(data: EvidenceData): void {
    this.mode = data.mode;
  }

  create(): void {
    const { ui } = createStage(this);
    const state = currentChapter();
    const owned = chapter.evidence.filter((item) => state.hasEvidence(item.id));

    ui.add(this.add.rectangle(0, 0, 960, 540, 0x05050a, 0.82).setOrigin(0, 0).setInteractive());

    addText(
      this,
      ui,
      60,
      48,
      t("ui.evidence.count", { have: owned.length, total: chapter.evidence.length }),
    ).setTint(0xe8d9a0);

    if (owned.length === 0) {
      addText(this, ui, 60, 90, t("ui.evidence.empty"));
    }

    owned.forEach((item, index) => {
      const column = index % 5;
      const row = Math.floor(index / 5);
      const x = 60 + column * 120;
      const y = 96 + row * 132;

      const tile = this.add
        .rectangle(x, y, 96, 96, 0x12121a, 0.95)
        .setOrigin(0, 0)
        .setStrokeStyle(2, 0x4a4a55, 1)
        .setInteractive({ useHandCursor: true });
      const icon = this.add.image(x + 48, y + 40, `icon_${item.id}`).setDisplaySize(48, 48);
      const name = this.add
        .bitmapText(x + 4, y + 72, "pixelmplus16", t(item.nameKey), 12)
        .setMaxWidth(88);

      tile.on("pointerdown", () => {
        if (this.mode === "offer") {
          this.game.events.emit("evidence-offer", item.id);
          this.scene.stop();
          return;
        }
        addText(this, ui, 60, 470, t(item.descKey)).setMaxWidth(840);
      });

      ui.add([tile, icon, name]);
    });

    addButton(this, ui, 800, 470, "ui.resolution.close", {
      width: 120,
      height: 44,
      onClick: () => this.scene.stop(),
    });
  }
}
