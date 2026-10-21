import type Phaser from "phaser";

export class AssetManager {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  generatePlaceholderTexture(key: string, color: number): void {
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(color);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture(key, 32, 32);
    graphics.destroy();
  }

  generatePlayerTexture(): void {
    this.generatePlaceholderTexture("player", 0x00d1ff);
  }

  generateNPCTexture(): void {
    this.generatePlaceholderTexture("npc", 0xffce00);
  }

  loadAssets(): void {
    this.generatePlayerTexture();
    this.generateNPCTexture();
  }
}
