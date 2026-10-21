import Phaser from "phaser";

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "player");
    scene.add.existing(this);
    scene.physics.add.existing(this);
  }

  move(direction: "left" | "right") {
    const speed = 100;
    this.setVelocityX(direction === "left" ? -speed : speed);
  }

  stopMovement(): void {
    this.setVelocityX(0);
  }
}
