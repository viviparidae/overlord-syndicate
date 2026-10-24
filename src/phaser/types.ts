export type TouchDirection = "none" | "left" | "right";

export interface TouchControls {
  dpad: Phaser.GameObjects.Zone;
  btnShop: Phaser.GameObjects.Zone;
  btnTerminal: Phaser.GameObjects.Zone;
  direction: TouchDirection;
  isTap: boolean;
}

export interface InputState {
  keyboardLeft: boolean;
  keyboardRight: boolean;
  keyboardSpace: boolean;
  keyboardE: boolean;
  keyboardT: boolean;
  touchLeft: boolean;
  touchRight: boolean;
  touchTap: boolean;
}
