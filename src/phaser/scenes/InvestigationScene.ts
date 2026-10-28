import Phaser from "phaser";
import { createStage } from "../stage";
import { addButton, addText } from "../ui/components";
import { currentChapter, saveNow } from "../state";
import { chapter } from "../../data/chapters/ch01";
import { t } from "../../localization";
import { WALK_SPEED } from "../../balance/constants";

export class InvestigationScene extends Phaser.Scene {
  private direction = 0;
  private playerX = 160;
  private player!: Phaser.GameObjects.Image;
  private background!: Phaser.GameObjects.Image;
  private uiLayer!: Phaser.GameObjects.Container;
  private prompt!: Phaser.GameObjects.Container;
  private promptLabel!: Phaser.GameObjects.BitmapText;
  private logText!: Phaser.GameObjects.BitmapText;
  private counterText!: Phaser.GameObjects.BitmapText;
  private currentArea = "arcade_center";
  private areaLabel!: Phaser.GameObjects.BitmapText;
  private nearHotspotId: string | null = null;

  constructor() {
    super("Investigation");
  }

  create(): void {
    const { world, ui } = createStage(this);
    this.uiLayer = ui;
    this.cameras.main.setBackgroundColor("#0b0b10");

    this.background = this.add.image(160, 90, "bg_arcade_center_mid").setDisplaySize(320, 180);
    world.add(this.background);

    this.player = this.add.image(this.playerX, 150, "char_ryo").setOrigin(0.5, 1);
    world.add(this.player);

    const frame = this.add.rectangle(24, 372, 600, 120, 0x12121a, 0.94).setOrigin(0, 0);
    frame.setStrokeStyle(2, 0xe8d9a0, 0.7);
    ui.add(frame);
    this.logText = addText(this, ui, 40, 388, "");
    this.logText.setMaxWidth(560);

    this.counterText = addText(this, ui, 760, 20, "");
    this.refreshCounter();

    addText(this, ui, 24, 20, t("chapter.ch01.title")).setTint(0xe8d9a0);
    this.areaLabel = addText(this, ui, 24, 44, "商店街・中央通り");

    addButton(this, ui, 24, 492, "ui.investigation.insight", {
      width: 120,
      height: 40,
      onClick: () => {
        const on = currentChapter().investigation.toggleInsight();
        this.cameras.main.setBackgroundColor(on ? "#1a2433" : "#0b0b10");
        this.logText.setText(on ? "洞察の視点" : "");
      },
    });

    addButton(this, ui, 800, 20, "ui.investigation.evidence", {
      width: 130,
      height: 40,
      onClick: () => this.scene.launch("Evidence", { mode: "view" }),
    });

    this.createMoveButton(24, 430, "◀", -1);
    this.createMoveButton(120, 430, "▶", 1);

    this.prompt = this.add.container(0, 0);
    const promptBg = this.add
      .rectangle(0, 0, 120, 40, 0x2a2a38, 0.95)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0xe8d9a0, 0.9)
      .setInteractive({ useHandCursor: true });
    this.promptLabel = this.add
      .bitmapText(8, 10, "pixelmplus16", t("ui.investigation.inspect"), 12)
      .setOrigin(0, 0);
    promptBg.on("pointerdown", () => this.interactNearby());
    this.prompt.add([promptBg, this.promptLabel]);
    this.prompt.setVisible(false);
    ui.add(this.prompt);

    this.input.keyboard?.on("keydown-LEFT", () => (this.direction = -1));
    this.input.keyboard?.on("keydown-RIGHT", () => (this.direction = 1));
    this.input.keyboard?.on("keyup-LEFT", () => (this.direction = 0));
    this.input.keyboard?.on("keyup-RIGHT", () => (this.direction = 0));
    this.input.keyboard?.on("keydown-C", () => this.interactNearby());

    saveNow();
  }

  private static readonly AREAS = ["arcade_west", "arcade_center", "arcade_east", "shotengai_office"];
  private static readonly AREA_LABELS: Record<string, string> = {
    arcade_west: "商店街・西口",
    arcade_center: "商店街・中央通り",
    arcade_east: "商店街・東口",
    shotengai_office: "組合事務所",
  };

  private moveToArea(delta: number): void {
    const index = InvestigationScene.AREAS.indexOf(this.currentArea);
    const next = index + delta;
    if (next < 0 || next >= InvestigationScene.AREAS.length) return;
    this.currentArea = InvestigationScene.AREAS[next] ?? this.currentArea;
    const texture = this.currentArea === "shotengai_office" ? "bg_shotengai_office" : `bg_${this.currentArea}_mid`;
    if (this.textures.exists(texture)) {
      this.background.setTexture(texture);
    }
    this.areaLabel.setText(InvestigationScene.AREA_LABELS[this.currentArea] ?? "");
    this.playerX = delta > 0 ? 12 : 308;
    this.edgeLock = true;
  }

  private createMoveButton(x: number, y: number, label: string, dir: number): void {
    const bg = this.add
      .rectangle(x, y, 88, 56, 0x12121a, 0.92)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0xe8d9a0, 0.7)
      .setInteractive({ useHandCursor: true });
    const text = this.add.bitmapText(x + 32, y + 16, "pixelmplus16", label, 24);
    this.uiLayer.add([bg, text]);
    const start = () => (this.direction = dir);
    const stop = () => (this.direction = 0);
    bg.on("pointerdown", start);
    bg.on("pointerup", stop);
    bg.on("pointerout", stop);
  }

  override update(_time: number, delta: number): void {
    if (this.direction === 0) {
      this.edgeLock = false;
    }
    if (this.direction !== 0) {
      this.playerX = this.playerX + this.direction * WALK_SPEED * (delta / 1000);
      if (!this.edgeLock && this.playerX <= 12 && this.direction < 0) {
        this.moveToArea(-1);
      } else if (!this.edgeLock && this.playerX >= 308 && this.direction > 0) {
        this.moveToArea(1);
      }
      this.playerX = Phaser.Math.Clamp(this.playerX, 12, 308);
      this.player.setX(this.playerX);
      this.player.setFlipX(this.direction < 0);
    }

    const enabled = this.direction === 0;
    const state = currentChapter();
    const near = enabled ? state.investigation.hotspotNear(this.currentArea, this.playerX) : null;
    this.nearHotspotId = near?.id ?? null;
    if (near) {
      const hotspot = near;
      const screenX = hotspot.x * 3;
      const screenY = 120;
      this.prompt.setPosition(screenX, screenY);
      this.promptLabel.setText(t(hotspot.kind === "talk" ? "ui.investigation.talk" : "ui.investigation.inspect"));
      this.prompt.setVisible(true);
    } else {
      this.prompt.setVisible(false);
    }

    if (state.canStartResolution) {
      this.showResolutionEntry();
    }
  }

  private resolutionEntryShown = false;
  private edgeLock = false;

  private showResolutionEntry(): void {
    if (this.resolutionEntryShown) return;
    this.resolutionEntryShown = true;
    addButton(this, this.uiLayer, 700, 470, "venue.assembly", {
      width: 220,
      height: 56,
      onClick: () => {
        const state = currentChapter();
        const error = state.startResolution();
        if (error) {
          this.logText.setText("まだ材料が足りない");
          return;
        }
        saveNow();
        this.scene.start("Resolution");
      },
    });
  }

  private interactNearby(): void {
    const id = this.nearHotspotId;
    if (!id) return;
    const state = currentChapter();
    const result = state.investigation.interact(id);
    if (result.kind === "evidence") {
      const gained = state.collectEvidence(result.evidenceId);
      const item = chapter.evidence.find((e) => e.id === result.evidenceId);
      if (gained && item) {
        this.logText.setText(t("log.evidence.obtained", { name: t(item.nameKey) }));
        this.refreshCounter();
      } else {
        this.logText.setText(t("log.evidence.already"));
      }
      return;
    }
    if (result.kind === "text") {
      this.logText.setText(t(result.textKey));
      return;
    }
    if (result.kind === "move") {
      this.moveToArea(this.currentArea === "arcade_center" ? 1 : 0);
      this.currentArea = "shotengai_office";
      this.background.setTexture("bg_shotengai_office");
      this.areaLabel.setText(InvestigationScene.AREA_LABELS.shotengai_office ?? "");
      this.playerX = 24;
    }
  }

  private refreshCounter(): void {
    const state = currentChapter();
    this.counterText.setText(
      t("ui.evidence.count", { have: state.evidence.length, total: chapter.evidence.length }),
    );
  }
}
