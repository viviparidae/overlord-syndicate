import Phaser from "phaser";
import { WALK_SPEED, ZOOM } from "../../balance/constants";
import { chapter } from "../../data/chapters/ch01";
import { type Npc, npcByHotspot, npcs } from "../../data/chapters/ch01/npcs";
import { t } from "../../localization";
import { createStage } from "../stage";
import { currentChapter, saveNow } from "../state";
import { addButton, addText } from "../ui/components";

const AREA_WIDTH = 640;
const SCREEN_WIDTH = 320;
const EDGE_LEFT = 12;
const EDGE_RIGHT = AREA_WIDTH - 12;
const FEET_Y = 135;

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
  private logFrame!: Phaser.GameObjects.Rectangle;
  private speakerText!: Phaser.GameObjects.BitmapText;
  private npcSprites: { npc: Npc; sprite: Phaser.GameObjects.Image }[] = [];
  private dialogue: { npc: Npc; index: number } | null = null;
  private portraitRyo!: Phaser.GameObjects.Image;
  private portraitNpc!: Phaser.GameObjects.Image;
  private moveButtons: Phaser.GameObjects.Container[] = [];
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

    for (const npc of npcs) {
      const sprite = this.add
        .image(npc.x, FEET_Y, `char_${npc.charId}`)
        .setOrigin(0.5, 1)
        .setVisible(false);
      this.npcSprites.push({ npc, sprite });
      world.add(sprite);
    }

    this.player = this.add.image(this.playerX, FEET_Y, "char_ryo").setOrigin(0.5, 1);
    world.add(this.player);

    this.logFrame = this.add.rectangle(16, 352, 928, 188, 0x12121a, 0.94).setOrigin(0, 0);
    this.logFrame.setStrokeStyle(2, 0xe8d9a0, 0.7);
    this.logFrame.setVisible(false);
    ui.add(this.logFrame);
    this.speakerText = addText(this, ui, 32, 358, "");
    this.speakerText.setVisible(false);
    this.logText = addText(this, ui, 32, 390, "");
    this.logText.setMaxWidth(890);
    this.logText.setVisible(false);
    this.logFrame.setInteractive({ useHandCursor: true });
    this.logFrame.on("pointerdown", () => this.advanceDialogue());

    this.portraitRyo = this.add
      .image(195, 238, "face_ryo_normal")
      .setDisplaySize(210, 240)
      .setFlipX(true)
      .setVisible(false);
    this.portraitNpc = this.add
      .image(765, 238, "face_kenta_normal")
      .setDisplaySize(210, 240)
      .setVisible(false);
    ui.add(this.portraitRyo);
    ui.add(this.portraitNpc);

    const counterPanel = this.add.rectangle(676, 14, 92, 44, 0x0b0b10, 0.82).setOrigin(0, 0);
    ui.add(counterPanel);
    this.counterText = addText(this, ui, 690, 24, "");
    this.refreshCounter();

    const hudPanel = this.add.rectangle(10, 8, 470, 84, 0x0b0b10, 0.82).setOrigin(0, 0);
    hudPanel.setStrokeStyle(2, 0x4a4a55, 0.8);
    ui.add(hudPanel);
    addText(this, ui, 24, 18, t("chapter.ch01.title")).setTint(0xe8d9a0);
    this.areaLabel = addText(this, ui, 24, 52, "商店街・中央通り");

    addButton(this, ui, 776, 18, "ui.investigation.evidence", {
      width: 170,
      height: 52,
      onClick: () => this.scene.launch("Evidence", { mode: "view" }),
    });

    this.moveButtons.push(this.createMoveButton(16, 480, "◀", -1));
    this.moveButtons.push(this.createMoveButton(144, 480, "▶", 1));

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

  private createMoveButton(
    x: number,
    y: number,
    label: string,
    dir: number,
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const bg = this.add
      .rectangle(0, 0, 112, 64, 0x12121a, 0.92)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0xe8d9a0, 0.7)
      .setInteractive({ useHandCursor: true });
    const text = this.add.bitmapText(56, 32, "pixelmplus24", label, 32).setOrigin(0.5, 0.5);
    container.add([bg, text]);
    this.uiLayer.add(container);
    const start = () => (this.direction = dir);
    const stop = () => (this.direction = 0);
    bg.on("pointerdown", start);
    bg.on("pointerup", stop);
    bg.on("pointerout", stop);
    return container;
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
    this.refreshNpcs();
    if (this.dialogue) {
      this.direction = 0;
      this.prompt.setVisible(false);
      return;
    }
    if (this.direction === 0) {
      this.edgeLock = false;
    }
    if (this.direction !== 0) {
      this.hideLog();
      this.playerX = this.playerX + this.direction * WALK_SPEED * (delta / 1000);
      if (!this.edgeLock && this.playerX <= EDGE_LEFT) {
        this.moveToArea(-1);
      } else if (!this.edgeLock && this.playerX >= EDGE_RIGHT) {
        this.moveToArea(1);
      }
      this.playerX = Phaser.Math.Clamp(this.playerX, EDGE_LEFT, EDGE_RIGHT);
      this.player.setX(this.playerX);
      this.player.setFlipX(this.direction > 0);
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
          this.showLog("まだ材料が足りない");
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
      const npc = npcByHotspot(id);
      if (npc) {
        this.startDialogue(npc);
        return;
      }
      const gained = state.collectEvidence(result.evidenceId);
      const item = chapter.evidence.find((e) => e.id === result.evidenceId);
      if (gained && item) {
        this.showLog(t("log.evidence.obtained", { name: t(item.nameKey) }));
        this.refreshCounter();
      } else {
        this.showLog(t("log.evidence.already"));
      }
      return;
    }
    if (result.kind === "text") {
      this.showLog(t(result.textKey));
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

  private refreshNpcs(): void {
    const areaOfHotspot = (hotspotId: string) =>
      chapter.hotspots.find((h) => h.id === hotspotId)?.areaId;
    for (const { npc, sprite } of this.npcSprites) {
      const visible = areaOfHotspot(npc.hotspotId) === this.currentArea;
      sprite.setVisible(visible);
      if (visible) sprite.setFlipX(this.playerX > npc.x);
    }
  }

  private startDialogue(npc: Npc): void {
    this.dialogue = { npc, index: 0 };
    this.direction = 0;
    this.speakerText.setVisible(true);
    this.portraitNpc.setTexture(`face_${npc.charId}_normal`);
    this.showEntry(0);
    this.prompt.setVisible(false);
    this.setControlsVisible(false);
  }

  private setControlsVisible(visible: boolean): void {
    for (const button of this.moveButtons) button.setVisible(visible);
  }

  private showEntry(index: number): void {
    if (!this.dialogue) return;
    const entry = this.dialogue.npc.script[index];
    if (!entry) return;
    this.speakerText.setText(t(entry.speaker));
    this.showLog(t(entry.text));
    const isRyo = entry.speaker === "speaker.ryo";
    this.portraitRyo.setVisible(isRyo);
    this.portraitNpc.setVisible(!isRyo);
  }

  private advanceDialogue(): void {
    if (!this.dialogue) return;
    const { npc, index } = this.dialogue;
    const next = npc.script[index + 1];
    if (next) {
      this.dialogue.index = index + 1;
      this.showEntry(index + 1);
      return;
    }
    if (npc.evidenceId) {
      const gained = currentChapter().collectEvidence(npc.evidenceId);
      const item = chapter.evidence.find((e) => e.id === npc.evidenceId);
      if (gained && item) {
        this.refreshCounter();
        this.showLog(t("log.evidence.obtained", { name: t(item.nameKey) }));
        this.time.delayedCall(900, () => this.closeDialogue());
        return;
      }
    }
    this.closeDialogue();
  }

  private closeDialogue(): void {
    this.dialogue = null;
    this.portraitRyo.setVisible(false);
    this.portraitNpc.setVisible(false);
    this.setControlsVisible(true);
    this.speakerText.setVisible(false);
    this.hideLog();
  }

  private showLog(message: string): void {
    this.logText.setText(message);
    this.logText.setVisible(message !== "");
    this.logFrame.setVisible(message !== "");
  }

  private hideLog(): void {
    this.logText.setVisible(false);
    this.logFrame.setVisible(false);
  }

  private refreshCounter(): void {
    const state = currentChapter();
    this.counterText.setText(
      t("ui.evidence.count", { have: state.evidence.length, total: chapter.evidence.length }),
    );
  }
}
