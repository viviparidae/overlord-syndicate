import Phaser from "phaser";

export class NPC extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string = "npc_child") {
    super(scene, x, y, texture, "walk_down_0");
    scene.add.existing(this);
    scene.physics.add.existing(this);
  }
}
