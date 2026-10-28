import type Phaser from "phaser";
import { TAP_MIN_SIZE } from "../../balance/constants";
import { type LocKey, t } from "../../localization";

export interface ButtonOptions {
  width?: number;
  height?: number;
  onClick: () => void;
  testId?: string;
}

export function addButton(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  x: number,
  y: number,
  labelKey: LocKey,
  options: ButtonOptions,
): Phaser.GameObjects.Container {
  const width = options.width ?? 132;
  const height = Math.max(options.height ?? 44, TAP_MIN_SIZE);
  const button = scene.add.container(x, y);

  const background = scene.add
    .rectangle(0, 0, width, height, 0x12121a, 0.92)
    .setStrokeStyle(2, 0xe8d9a0, 0.8)
    .setOrigin(0, 0)
    .setInteractive({ useHandCursor: true });

  const label = scene.add
    .bitmapText(width / 2, height / 2 - 6, "pixelmplus16", t(labelKey), 12)
    .setOrigin(0.5, 0);

  background.on("pointerdown", options.onClick);
  background.on("pointerover", () => background.setFillStyle(0x2a2a38, 0.95));
  background.on("pointerout", () => background.setFillStyle(0x12121a, 0.92));

  button.add([background, label]);
  container.add(button);
  return button;
}

export function addText(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  x: number,
  y: number,
  value: string,
  size = 12,
): Phaser.GameObjects.BitmapText {
  const text = scene.add.bitmapText(x, y, "pixelmplus16", value, size);
  container.add(text);
  return text;
}
