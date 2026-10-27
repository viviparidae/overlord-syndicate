import { SCENE_KEYS } from "@phaser/config";
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

    for (const npcData of npcPositions) {
      const npc = new NPC(this, npcData.x, npcData.y, npcData.key);
      npc.setOrigin(0.5, 1);
      npc.setDepth(150);
      npc.setDisplaySize(72, 128);
      this.add
        .text(npcData.x, npcData.y - 136, npcData.label, {
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

  update() {
    const speed = 100;
    const delta = this.game.loop.delta / 1000;
    let moved = false;

    const leftKey = this.cursors.left?.isDown || this.keyA.isDown;
    const rightKey = this.cursors.right?.isDown || this.keyD.isDown;

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

    // SPACE: NPC dialogue / shop action when near NPC
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.currentTarget === "npc") {
      this.handleInteraction();
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

  private updateTarget() {
    const px = this.player.x;
    if (px >= 20 && px <= 300) {
      this.currentTarget = "shop";
      this.shopArea.setTint(0x4ade80);
      this.alleyArea.setTint(0xf87171);
      this.promptText.setText("E: 文房具店に入る  /  ← → 移動");
      this.promptText.setColor("#4ade80");
    } else if (px >= this.scale.width - 300 && px <= this.scale.width - 20) {
      this.currentTarget = "terminal";
      this.shopArea.setTint(0xf87171);
      this.alleyArea.setTint(0x4ade80);
      this.promptText.setText("T: 裏工作パネルを開く  /  ← → 移動");
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
}
