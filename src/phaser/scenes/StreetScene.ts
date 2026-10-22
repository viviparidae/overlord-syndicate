import { SCENE_KEYS } from "@phaser/config";
import { NPC } from "@phaser/entities/NPCs";
import { Player } from "@phaser/entities/Player";
import { getGameContext } from "@phaser/GameContext";
import Phaser from "phaser";

export class StreetScene extends Phaser.Scene {
  private engine = getGameContext().engine;
  private player!: Player;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    space: Phaser.Input.Keyboard.Key;
    e: Phaser.Input.Keyboard.Key;
    t: Phaser.Input.Keyboard.Key;
  };
  private shopArea!: Phaser.GameObjects.Image;
  private alleyArea!: Phaser.GameObjects.Image;
  private currentTarget: "shop" | "npc" | "terminal" = "npc";
  private promptText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: SCENE_KEYS.STREET });
  }

  create() {
    const { width, height } = this.scale;

    this.physics.world.setBounds(0, 0, width, height);
    const ground = this.add.tileSprite(width / 2, height - 30, width, 60, "ground_tile");
    ground.setOrigin(0.5);
    this.physics.add.existing(ground, true);
    (ground.body as Phaser.Physics.Arcade.StaticBody).immovable = true;

    const shopArea = this.add.image(160, height - 120, "shop_front");
    shopArea.setDepth(100);
    this.shopArea = shopArea;
    this.add
      .text(160, height - 220, "日の出文房具店", {
        fontSize: "14px",
        color: "#4ade80",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);

    const alleyArea = this.add.image(width - 160, height - 120, "alley_front");
    alleyArea.setDepth(100);
    this.alleyArea = alleyArea;
    this.add
      .text(width - 160, height - 220, "怪しい路地裏", {
        fontSize: "14px",
        color: "#f87171",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);

    this.player = new Player(this, 160, height - 100);
    this.player.setOrigin(0.5, 1);
    this.player.setDepth(200);

    const npcPositions = [
      { x: 320, y: height - 100, label: "子供", key: "npc_child" },
      { x: 480, y: height - 100, label: "主婦", key: "npc_housewife" },
      { x: 640, y: height - 100, label: "サラリーマン", key: "npc_child" },
      { x: 800, y: height - 100, label: "悪徳地主", key: "npc_housewife" },
    ];

    for (const npcData of npcPositions) {
      const npc = new NPC(this, npcData.x, npcData.y, npcData.key);
      npc.setOrigin(0.5, 1);
      npc.setDepth(150);
      npc.setDisplaySize(48, 64);
      this.add
        .text(npcData.x, npcData.y + 6, npcData.label, {
          fontSize: "10px",
          color: "#cccccc",
          fontFamily: "monospace",
        })
        .setOrigin(0.5)
        .setDepth(160);
    }

    this.add
      .text(width / 2, 40, "シャッター商店街", {
        fontSize: "18px",
        color: "#e94560",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);

    this.promptText = this.add
      .text(
        width / 2,
        height - 40,
        "← → 移動  /  SPACE: 調べる  /  E: 店に入る  /  T: 裏工作パネル",
        {
          fontSize: "12px",
          color: "#888888",
          fontFamily: "monospace",
        },
      )
      .setOrigin(0.5);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      space: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      e: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      t: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.T),
    };

    this.updateTarget();
  }

  update() {
    const speed = 100;
    const delta = this.game.loop.delta / 1000;
    let moved = false;

    if (this.cursors.left?.isDown || this.wasd.left?.isDown) {
      this.player.x = Math.max(32, Math.min(this.scale.width - 32, this.player.x - speed * delta));
      this.player.walk("left");
      moved = true;
    }
    if (this.cursors.right?.isDown || this.wasd.right?.isDown) {
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

    if (Phaser.Input.Keyboard.JustDown(this.wasd.space)) {
      this.handleInteraction();
    }
    if (Phaser.Input.Keyboard.JustDown(this.wasd.e)) {
      this.enterShop();
    }
    if (Phaser.Input.Keyboard.JustDown(this.wasd.t)) {
      this.openTerminal();
    }
  }

  getPlayerX(): number {
    return this.player.x;
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

  private enterShop() {
    this.scene.start(SCENE_KEYS.SHOP);
  }

  private openTerminal() {
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
