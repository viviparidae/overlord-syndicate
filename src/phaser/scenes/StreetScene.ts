import {
  advancePager,
  currentPageText,
  type DialoguePagerState,
  openPager,
} from "@core/dialogue/DialoguePager";
import {
  createDialogueSession,
  type DialogueSessionState,
  openDialogue,
} from "@core/dialogue/DialogueSession";
import { DEFAULT_TALK_RANGE, findNearestNpc } from "@core/dialogue/proximity";
import { resolveOption } from "@core/dialogue/resolveOption";
import { dialogues } from "@data/dialogue/phase1";
import { SCENE_KEYS } from "@phaser/config";
import type { DialogueDebugState } from "@phaser/DebugBridge";
import { NPC } from "@phaser/entities/NPCs";
import { Player } from "@phaser/entities/Player";
import { getGameContext } from "@phaser/GameContext";
import Phaser from "phaser";

export class StreetScene extends Phaser.Scene {
  private engine = getGameContext().engine;
  private player!: Player;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private shopArea!: Phaser.GameObjects.Image;
  private alleyArea!: Phaser.GameObjects.Image;
  private currentTarget: "shop" | "npc" | "terminal" = "npc";
  private promptText!: Phaser.GameObjects.Text;
  private dialogueSession: DialogueSessionState | null = null;
  private pager: DialoguePagerState | null = null;
  private dialogueEntry: {
    id: string;
    speaker: string;
    text: string;
    options?: { text: string; action: string; nextId?: string }[];
  } | null = null;
  private dlgObjects: Phaser.GameObjects.GameObject[] = [];
  private dlgText!: Phaser.GameObjects.Text;
  private dlgArrow!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: SCENE_KEYS.STREET });
  }

  create() {
    const { width, height } = this.scale;
    // ゲーム世界を上にずらしてHUDログコンソール（下端120px）と重ならないように
    const SHIFT_Y = -140;

    this.physics.world.setBounds(0, 0, width, height);
    const ground = this.add.tileSprite(width / 2, height - 30 + SHIFT_Y, width, 60, "ground_tile");
    ground.setOrigin(0.5);
    this.physics.add.existing(ground, true);
    (ground.body as Phaser.Physics.Arcade.StaticBody).immovable = true;

    const shopArea = this.add.image(160, height - 120 + SHIFT_Y, "shop_front");
    shopArea.setDisplaySize(48, 48);
    shopArea.setDepth(100);
    this.shopArea = shopArea;
    this.add
      .text(160, height - 220 + SHIFT_Y, "日の出文房具店", {
        fontSize: "14px",
        color: "#4ade80",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);

    const alleyArea = this.add.image(width - 160, height - 120 + SHIFT_Y, "alley_front");
    alleyArea.setDisplaySize(48, 48);
    alleyArea.setDepth(100);
    this.alleyArea = alleyArea;
    this.add
      .text(width - 160, height - 220 + SHIFT_Y, "怪しい路地裏", {
        fontSize: "14px",
        color: "#f87171",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);

    this.player = new Player(this, 160, height - 60 + SHIFT_Y);
    this.player.setDisplaySize(72, 128);
    this.player.setOrigin(0.5, 1);
    this.player.setDepth(200);

    const npcPositions = [
      { x: 320, y: height - 60 + SHIFT_Y, label: "子供", key: "npc_child" },
      { x: 480, y: height - 60 + SHIFT_Y, label: "主婦", key: "npc_housewife" },
      { x: 640, y: height - 60 + SHIFT_Y, label: "サラリーマン", key: "npc_salaryman" },
      { x: 800, y: height - 60 + SHIFT_Y, label: "悪徳地主", key: "npc_landlord" },
    ];

    // Character art occupies only ~57px..112px of each 72x128 atlas frame (transparent
    // padding above/below), so anchor the label to the visible head rather than the box top.
    const SPRITE_HEAD_OFFSET = 82;

    for (const npcData of npcPositions) {
      const npc = new NPC(this, npcData.x, npcData.y, npcData.key);
      npc.setOrigin(0.5, 1);
      npc.setDepth(150);
      npc.setDisplaySize(72, 128);
      this.add
        .text(npcData.x, npcData.y - SPRITE_HEAD_OFFSET, npcData.label, {
          fontSize: "10px",
          color: "#cccccc",
          fontFamily: "monospace",
        })
        .setOrigin(0.5)
        .setDepth(160);
    }

    this.add
      .text(width / 2, 90, "シャッター商店街", {
        fontSize: "18px",
        color: "#e94560",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);

    this.promptText = this.add
      .text(
        width / 2,
        height - 40 + SHIFT_Y,
        "← → 移動  /  SPACE: 調べる  /  E: 店に入る  /  T: 裏工作パネル",
        {
          fontSize: "12px",
          color: "#888888",
          fontFamily: "monospace",
        },
      )
      .setOrigin(0.5);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.keyE = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keyT = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.T);
    this.keyA = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    this.updateTarget();
  }

  private spaceKey!: Phaser.Input.Keyboard.Key;
  private escKey!: Phaser.Input.Keyboard.Key;
  private keyE!: Phaser.Input.Keyboard.Key;
  private keyT!: Phaser.Input.Keyboard.Key;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;

  // Canvas 外の DOM コントローラ (dpad) からの入力。キー状態の合成ではなく直接フラグを立てる。
  private holdLeft = false;
  private holdRight = false;

  /**
   * Canvas 外の dpad ボタンから移動入力を与える。
   * キーボードの Key.isDown を合成イベントで再現すると Phaser は event.keyCode を見るため
   * 反応しない。そのため直接フラグを操作する。
   */
  public setMoveInput(direction: "left" | "right", active: boolean): void {
    if (direction === "left") {
      this.holdLeft = active;
    } else {
      this.holdRight = active;
    }
  }

  /** Canvas 外の SPACE ボタン用。現在地に応じた行動を実行する。 */
  public interact(): void {
    if (this.pager) {
      this.advanceDialogue();
      return;
    }

    // NPC が近接しているか判定（id は dialogue データの id と対応させる）
    const npcs = [
      { id: "npc_shota", x: 320 },
      { id: "npc_mother", x: 480 },
      { id: "npc_salaryman", x: 640 },
      { id: "npc_landlord", x: 800 },
    ];
    const nearestId = findNearestNpc(this.player.x, npcs, DEFAULT_TALK_RANGE);

    if (nearestId) {
      // 会話を開く
      this.dialogueSession = createDialogueSession();
      openDialogue(this.dialogueSession, npcs, this.player.x, DEFAULT_TALK_RANGE);
      this.showDialoguePanel(nearestId);
      this.setMoveInput("left", false);
      this.setMoveInput("right", false);
      return;
    }

    // NPC が近くにいない場合は従来の挙動
    if (this.currentTarget === "shop") {
      this.enterShop();
      return;
    }
    if (this.currentTarget === "terminal") {
      this.openTerminal();
      return;
    }
    // デフォルトは噂を聞く（従来互換）
    this.handleInteraction();
  }

  update() {
    if (this.pager) {
      this.player.idle();
      if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        this.advanceDialogue();
      }
      return;
    }

    const speed = 100;
    const delta = this.game.loop.delta / 1000;
    let moved = false;

    const leftKey = this.cursors.left?.isDown || this.keyA.isDown || this.holdLeft;
    const rightKey = this.cursors.right?.isDown || this.keyD.isDown || this.holdRight;

    if (leftKey) {
      this.player.x = Math.max(32, Math.min(this.scale.width - 32, this.player.x - speed * delta));
      this.player.walk("left");
      moved = true;
    }
    if (rightKey) {
      this.player.x = Math.max(32, Math.min(this.scale.width - 32, this.player.x + speed * delta));
      this.player.walk("right");
      moved = true;
    }
    if (!moved) {
      this.player.idle();
    }

    if (moved) {
      this.updateTarget();
    }

    // SPACE: 現在地に応じた行動（NPC近接なら会話ウィンドウ）
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.interact();
    }

    // E: enter the stationery shop
    if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
      this.enterShop();
    }

    // T: open the terminal (裏工作) panel
    if (Phaser.Input.Keyboard.JustDown(this.keyT)) {
      this.openTerminal();
    }

    // ESC: Return to street (no-op in StreetScene, handled by other scenes)
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      // In StreetScene, ESC does nothing (already on street)
      // Other scenes (Shop, Terminal) should handle ESC to return to StreetScene
    }
  }

  getPlayerX(): number {
    return this.player.x;
  }

  getPlayerY(): number {
    return this.player.y;
  }

  getDialogueInfo(): DialogueDebugState | null {
    if (!this.pager) return null;
    return {
      isOpen: this.dialogueSession?.isOpen ?? false,
      pageIndex: this.pager.pageIndex,
      isFinished: this.pager.isFinished,
      optionCount: this.pager.isFinished ? (this.dialogueEntry?.options?.length ?? 0) : 0,
    };
  }

  private updateTarget() {
    const px = this.player.x;
    if (px >= 20 && px <= 300) {
      this.currentTarget = "shop";
      this.shopArea.setTint(0x4ade80);
      this.alleyArea.setTint(0xf87171);
      this.promptText.setText("SPACE: 店に入る  /  ← → 移動  /  E: 店  /  T: 裏工作");
      this.promptText.setColor("#4ade80");
    } else if (px >= this.scale.width - 300 && px <= this.scale.width - 20) {
      this.currentTarget = "terminal";
      this.shopArea.setTint(0xf87171);
      this.alleyArea.setTint(0x4ade80);
      this.promptText.setText("SPACE: 裏工作パネルを開く  /  ← → 移動");
      this.promptText.setColor("#f87171");
    } else {
      this.currentTarget = "npc";
      this.shopArea.setTint(0x4ade80);
      this.alleyArea.setTint(0xf87171);
      this.promptText.setText("SPACE: 噂を聞く  /  ← → 移動  /  E: 店 /  T: 裏工作");
      this.promptText.setColor("#888888");
    }
  }

  private handleInteraction() {
    if (this.currentTarget === "npc") {
      this.listenToRumor();
    }
  }

  private listenToRumor() {
    const result = this.engine.execute("spreadRumor");
    if (result.success) {
      this.showMessage("噂を聞いた...街の空気が変わった気がする", "#fbbf24");
    } else {
      this.showMessage("資金が足りない...", "#f87171");
    }
  }

  public enterShop() {
    this.scene.start(SCENE_KEYS.SHOP);
  }

  public openTerminal() {
    this.scene.start(SCENE_KEYS.TERMINAL);
  }

  private showMessage(text: string, color: string) {
    const msg = this.add
      .text(this.scale.width / 2, this.scale.height / 2, text, {
        fontSize: "16px",
        color,
        fontFamily: "monospace",
        backgroundColor: "rgba(13, 13, 26, 0.9)",
        padding: { x: 16, y: 8 },
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: msg,
      alpha: 0,
      y: msg.y - 40,
      duration: 1500,
      ease: "Power2",
      onComplete: () => msg.destroy(),
    });
  }

  private static readonly DLG_DEPTH = 650;

  /** 会話ウィンドウ（Phaser 描画）を表示。 ▼点滅つきページ送り。 */
  private showDialoguePanel(npcId: string): void {
    const entry = dialogues.find((d) => d.id === npcId);
    if (!entry) return;

    this.dialogueEntry = entry;
    this.pager = openPager(entry);
    this.dialogueSession!.isOpen = true;
    this.setMoveInput("left", false);
    this.setMoveInput("right", false);
    this.renderDialogueWindow();
  }

  private renderDialogueWindow(): void {
    const { width, height } = this.scale;
    const winH = 110;
    const winY = height - 125 - winH;
    const font = { fontFamily: "DotGothic16, monospace" };

    if (this.dlgObjects.length === 0) {
      const bg = this.add
        .rectangle(0, winY, width, winH, 0x0f0f1a)
        .setOrigin(0, 0)
        .setDepth(StreetScene.DLG_DEPTH)
        .setStrokeStyle(1, 0x444466)
        .setInteractive({ useHandCursor: true });
      bg.on("pointerup", () => this.advanceDialogue());

      const speaker = this.add
        .text(12, winY + 6, "", { ...font, fontSize: "12px", color: "#22d3ee" })
        .setDepth(StreetScene.DLG_DEPTH + 1);

      this.dlgText = this.add
        .text(12, winY + 26, "", {
          ...font,
          fontSize: "13px",
          color: "#e9e9e9",
          wordWrap: { width: width - 24 },
        })
        .setDepth(StreetScene.DLG_DEPTH + 1);

      this.dlgArrow = this.add
        .text(width - 20, winY + winH - 14, "▼", {
          ...font,
          fontSize: "12px",
          color: "#e9e9e9",
        })
        .setOrigin(0.5)
        .setDepth(StreetScene.DLG_DEPTH + 1);
      this.tweens.add({
        targets: this.dlgArrow,
        alpha: 0,
        duration: 400,
        yoyo: true,
        repeat: -1,
      });

      this.dlgObjects = [bg, speaker, this.dlgText, this.dlgArrow];
      this.dlgSpeaker = speaker;
    }

    const pager = this.pager!;
    this.dlgSpeaker.setText(pager.speaker);
    this.dlgText.setText(currentPageText(pager));
    this.dlgArrow.setVisible(!pager.isFinished);

    this.clearDialogueOptions();
    if (pager.isFinished && this.dialogueEntry?.options) {
      const optionsEl = this.dialogueEntry.options;
      const startX = width / 2 - (optionsEl.length * 130) / 2 + 65;
      optionsEl.forEach((opt, i) => {
        const btn = this.add
          .text(startX + i * 130, winY + winH - 16, opt.text, {
            ...font,
            fontSize: "11px",
            color: "#4ade80",
            backgroundColor: "#1a1a2e",
            padding: { x: 6, y: 3 },
          })
          .setOrigin(0.5)
          .setDepth(StreetScene.DLG_DEPTH + 2)
          .setInteractive({ useHandCursor: true });
        btn.on("pointerup", () => this.selectDialogueOption(opt));
        this.dlgObjects.push(btn);
        this.dlgOptionTexts.push(btn);
      });
    }
  }

  private dlgSpeaker!: Phaser.GameObjects.Text;
  private dlgOptionTexts: Phaser.GameObjects.Text[] = [];

  private clearDialogueOptions(): void {
    for (const btn of this.dlgOptionTexts) {
      this.dlgObjects = this.dlgObjects.filter((o) => o !== btn);
      btn.destroy();
    }
    this.dlgOptionTexts = [];
  }

  private advanceDialogue(): void {
    if (!this.pager) return;
    advancePager(this.pager);
    this.renderDialogueWindow();
  }

  private closeDialogueWindow(): void {
    this.tweens.killTweensOf(this.dlgArrow);
    for (const obj of this.dlgObjects) {
      (obj as Phaser.GameObjects.GameObject).destroy();
    }
    this.dlgObjects = [];
    this.dlgOptionTexts = [];
    this.pager = null;
    this.dialogueEntry = null;
  }

  private selectDialogueOption(option: { text: string; action: string }): void {
    this.closeDialogueWindow();
    this.dialogueSession!.isOpen = false;
    this.dialogueSession = null;

    const resolved = resolveOption(option);
    if (resolved.kind === "close") return;
    if (resolved.kind === "scene") {
      if (resolved.sceneId === "shop") {
        this.enterShop();
        return;
      }
      if (resolved.sceneId === "terminal") {
        this.openTerminal();
        return;
      }
    }
    if (resolved.kind === "action") {
      this.engine.execute(resolved.actionId);
    }
  }
}
