import Phaser from "phaser";

export const GAME_CONFIG: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 960,
  height: 540,
  parent: "game-container",
  pixelArt: true,
  roundPixels: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

export const SCENE_KEYS = {
  BOOT: "BootScene",
  STREET: "StreetScene",
  SHOP: "ShopScene",
  TERMINAL: "TerminalScene",
} as const;
