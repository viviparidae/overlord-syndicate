import Phaser from "phaser";

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "player", "walk_down_0");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDisplaySize(72, 128);
    this.setOrigin(0.5, 1);
  }

  walk(direction: "left" | "right"): void {
    this.setFlipX(direction === "left");
    if (!this.anims?.isPlaying) {
      this.play("player_walk", true);
    }
  }

  idle(): void {
    if (this.anims?.isPlaying) {
      this.stop();
      this.setFrame("walk_down_0");
    }
  }

  move(direction: "left" | "right"): void {
    const speed = 100;
    this.setVelocityX(direction === "left" ? -speed : speed);
  }

  stopMovement(): void {
    this.setVelocityX(0);
  }
}
