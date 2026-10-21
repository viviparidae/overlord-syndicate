import Phaser from "phaser";

export class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });
  }

  preload(): void {
    this.load.image("store", "assets/store.png");
    this.load.image("alley", "assets/alley.png");
    this.load.image("player", "assets/player.png");
    this.load.image("npc", "assets/npc.png");
  }

  create(): void {
    this.add.text(320, 200, "オーバーロード・シンジケート", {
      fontSize: "32px",
      color: "#ffffff",
      fontFamily: "monospace",
    });

    this.add.text(320, 250, "シャッター商店街 - Phase 1", {
      fontSize: "24px",
      color: "#cccccc",
      fontFamily: "monospace",
    });
  }

  update(): void {
    // Game loop - update every frame
  }
}

export default MainScene;
