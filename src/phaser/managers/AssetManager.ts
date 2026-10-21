import type Phaser from "phaser";

export class AssetManager {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  generatePlaceholderTexture(
    key: string,
    color: number,
    width: number = 32,
    height: number = 32,
  ): void {
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(color);
    graphics.fillRect(0, 0, width, height);
    graphics.generateTexture(key, width, height);
    graphics.destroy();
  }

  generatePlayerTexture(): void {
    this.generatePlaceholderTexture("player", 0x00d1ff, 24, 36);
  }

  generateNPCTexture(): void {
    this.generatePlaceholderTexture("npc", 0xffce00, 20, 32);
  }

  generateGroundTexture(): void {
    this.generatePlaceholderTexture("ground", 0x1a1a2e, 960, 60);
  }

  loadAssets(): void {
    this.generatePlayerTexture();
    this.generateNPCTexture();
    this.generateGroundTexture();
  }
}
