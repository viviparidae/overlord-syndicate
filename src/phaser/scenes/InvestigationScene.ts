import Phaser from "phaser";
import { WALK_SPEED, ZOOM } from "../../balance/constants";
import { chapter } from "../../data/chapters/ch01";
import { t } from "../../localization";
import { createStage } from "../stage";
import { currentChapter, saveNow } from "../state";
import { addButton, addText } from "../ui/components";

const AREA_WIDTH = 640;
const SCREEN_WIDTH = 320;
const EDGE_LEFT = 12;
const EDGE_RIGHT = AREA_WIDTH - 12;
const FEET_Y = 124;

export class InvestigationScene extends Phaser.Scene {
  private direction = 0;
  private playerX = 160;
  private player!: Phaser.GameObjects.Image;
  private world!: Phaser.GameObjects.Container;
  private farLayer!: Phaser.GameObjects.Container;
  private midTiles: Phaser.GameObjects.Image[] = [];
  private farTiles: Phaser.GameObjects.Image[] = [];
  private uiLayer!: Phaser.GameObjects.Container;
  private prompt!: Phaser.GameObjects.Container;
  private promptLabel!: Phaser.GameObjects.BitmapText;
  private logText!: Phaser.GameObjects.BitmapText;
  private counterText!: Phaser.GameObjects.BitmapText;
  private currentArea = "arcade_center";
  private areaLabel!: Phaser.GameObjects.BitmapText;
  private nearHotspotId: string | null = null;
  private resolutionEntryShown = false;
  private edgeLock = false;

  constructor() {
    super("Investigation");
  }

  create(): void {
    const { world, ui } = createStage(this);
    this.world = world;
    this.uiLayer = ui;
    this.cameras.main.setBackgroundColor("#0b0b10");

    this.farLayer = this.add.container(0, 0);
    for (let i = 0; i < 2; i += 1) {
      const tile = this.add
        .image(160 + i * SCREEN_WIDTH, 90, "bg_arcade_center_far")
        .setDisplaySize(SCREEN_WIDTH, 180)
        .setTint(0x8a8aa0);
      this.farTiles.push(tile);
      this.farLayer.add(tile);
    }
    world.add(this.farLayer);

    for (let i = 0; i < 2; i += 1) {
      const tile = this.add
        .image(160 + i * SCREEN_WIDTH, 90, "bg_arcade_center_mid")
        .setDisplaySize(SCREEN_WIDTH, 180);
      this.midTiles.push(tile);
      world.add(tile);
    }

    this.player = this.add.image(this.playerX, FEET_Y, "char_ryo").setOrigin(0.5, 1);
    world.add(this.player);

    const frame = this.add.rectangle(16, 364, 928, 112, 0x12121a, 0.94).setOrigin(0, 0);
    frame.setStrokeStyle(2, 0xe8d9a0, 0.7);
    ui.add(frame);
    this.logText = addText(this, ui, 32, 380, "");
    this.logText.setMaxWidth(890);

    this.counterText = addText(this, ui, 690, 24, "");
    this.refreshCounter();

    const hudPanel = this.add.rectangle(10, 8, 470, 84, 0x0b0b10, 0.82).setOrigin(0, 0);
    hudPanel.setStrokeStyle(2, 0x4a4a55, 0.8);
    ui.add(hudPanel);
    addText(this, ui, 24, 18, t("chapter.ch01.title")).setTint(0xe8d9a0);
    this.areaLabel = addText(this, ui, 24, 52, "商店街・中央通り");

    addButton(this, ui, 276, 480, "ui.investigation.insight", {
      width: 170,
      height: 56,
      onClick: () => {
        const on = currentChapter().investigation.toggleInsight();
        this.cameras.main.setBackgroundColor(on ? "#141c2b" : "#0b0b10");
        this.logText.setText(on ? "洞察の視点" : "");
      },
    });

    addButton(this, ui, 776, 18, "ui.investigation.evidence", {
      width: 170,
      height: 52,
      onClick: () => this.scene.launch("Evidence", { mode: "view" }),
    });

    this.createMoveButton(16, 480, "◀", -1);
    this.createMoveButton(144, 480, "▶", 1);

    this.prompt = this.add.container(0, 0);
    const promptBg = this.add
      .rectangle(0, 0, 170, 56, 0x2a2a38, 0.95)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0xe8d9a0, 0.9)
      .setInteractive({ useHandCursor: true });
    this.promptLabel = this.add
      .bitmapText(12, 14, "pixelmplus24", t("ui.investigation.inspect"), 24)
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

  private static readonly AREAS = [
    "arcade_west",
    "arcade_center",
    "arcade_east",
    "shotengai_office",
  ];
  private static readonly AREA_LABELS: Record<string, string> = {
    arcade_west: "商店街・西口",
    arcade_center: "商店街・中央通り",
    arcade_east: "商店街・東口",
    shotengai_office: "組合事務所",
  };

  private textureFor(area: string, layer: "mid" | "far"): string {
    const base = area === "shotengai_office" ? "bg_shotengai_office" : `bg_${area}_${layer}`;
    return this.textures.exists(base) ? base : "bg_arcade_center_far";
  }

  private setAreaTextures(area: string): void {
    const mid = this.textureFor(area, "mid");
    const far = this.textureFor(area, "far");
    for (const tile of this.midTiles) tile.setTexture(mid);
    for (const tile of this.farTiles) tile.setTexture(far);
  }

  private moveToArea(delta: number): void {
    const index = InvestigationScene.AREAS.indexOf(this.currentArea);
    const next = index + delta;
    if (next < 0 || next >= InvestigationScene.AREAS.length) return;
    this.currentArea = InvestigationScene.AREAS[next] ?? this.currentArea;
    this.setAreaTextures(this.currentArea);
    this.areaLabel.setText(InvestigationScene.AREA_LABELS[this.currentArea] ?? "");
    this.playerX = delta > 0 ? EDGE_LEFT + 20 : EDGE_RIGHT - 20;
    this.edgeLock = true;
    this.applyScroll();
  }

  private createMoveButton(x: number, y: number, label: string, dir: number): void {
    const bg = this.add
      .rectangle(x, y, 112, 64, 0x12121a, 0.92)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0xe8d9a0, 0.7)
      .setInteractive({ useHandCursor: true });
    const text = this.add.bitmapText(x + 56, y + 32, "pixelmplus24", label, 32).setOrigin(0.5, 0.5);
    this.uiLayer.add([bg, text]);
    const start = () => (this.direction = dir);
    const stop = () => (this.direction = 0);
    bg.on("pointerdown", start);
    bg.on("pointerup", stop);
    bg.on("pointerout", stop);
  }

  private scrollX(): number {
    return Phaser.Math.Clamp(this.playerX - SCREEN_WIDTH / 2, 0, AREA_WIDTH - SCREEN_WIDTH);
  }

  private applyScroll(): void {
    const scroll = this.scrollX();
    this.world.setX(-scroll * ZOOM);
    this.farLayer.setX((this.playerX - SCREEN_WIDTH / 2 - scroll) * ZOOM);
  }

  override update(_time: number, delta: number): void {
    if (this.direction === 0) {
      this.edgeLock = false;
    }
    if (this.direction !== 0) {
      this.playerX = this.playerX + this.direction * WALK_SPEED * (delta / 1000);
      if (!this.edgeLock && this.playerX <= EDGE_LEFT) {
        this.moveToArea(-1);
      } else if (!this.edgeLock && this.playerX >= EDGE_RIGHT) {
        this.moveToArea(1);
      }
      this.playerX = Phaser.Math.Clamp(this.playerX, EDGE_LEFT, EDGE_RIGHT);
      this.player.setX(this.playerX);
      this.player.setFlipX(this.direction < 0);
      this.applyScroll();
    }

    const enabled = this.direction === 0;
    const state = currentChapter();
    const near = enabled ? state.investigation.hotspotNear(this.currentArea, this.playerX) : null;
    this.nearHotspotId = near?.id ?? null;
    if (near) {
      const screenX = (this.playerX - this.scrollX()) * ZOOM - 85;
      this.prompt.setPosition(Phaser.Math.Clamp(screenX, 8, 782), 150);
      this.promptLabel.setText(
        t(near.kind === "talk" ? "ui.investigation.talk" : "ui.investigation.inspect"),
      );
      this.prompt.setVisible(true);
    } else {
      this.prompt.setVisible(false);
    }

    if (state.canStartResolution) {
      this.showResolutionEntry();
    }
  }

  private showResolutionEntry(): void {
    if (this.resolutionEntryShown) return;
    this.resolutionEntryShown = true;
    addButton(this, this.uiLayer, 660, 470, "venue.assembly", {
      width: 270,
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
      this.currentArea = "shotengai_office";
      this.setAreaTextures(this.currentArea);
      this.areaLabel.setText(InvestigationScene.AREA_LABELS.shotengai_office ?? "");
      this.playerX = EDGE_LEFT + 20;
      this.edgeLock = false;
      this.applyScroll();
    }
  }

  private refreshCounter(): void {
    const state = currentChapter();
    this.counterText.setText(
      t("ui.evidence.count", { have: state.evidence.length, total: chapter.evidence.length }),
    );
  }
}
