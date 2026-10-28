import Phaser from "phaser";
import { chapter } from "../../data/chapters/ch01";

const AREA_BACKGROUNDS: Record<string, string> = {
  arcade_west: "bg_arcade_west_mid",
  arcade_center: "bg_arcade_center_mid",
  arcade_east: "bg_arcade_east_mid",
  shotengai_office: "bg_shotengai_office",
};

export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  preload(): void {
    this.load.bitmapFont(
      "pixelmplus16",
      "assets/fonts/pixelmplus16.png",
      "assets/fonts/pixelmplus16.xml",
    );
    for (const area of Object.values(AREA_BACKGROUNDS)) {
      this.load.image(area, `assets/backgrounds/${area}.png`);
    }
    this.load.image("bg_arcade_center_far", "assets/backgrounds/bg_arcade_center_far.png");
    for (const item of chapter.evidence) {
      this.load.image(`icon_${item.id}`, `assets/evidence/icon_${item.id}.png`);
    }
    for (const id of [
      "ryo",
      "goda",
      "wataru",
      "matsutani",
      "chinatsu",
      "okada",
      "tatsumi",
      "kenta",
    ]) {
      this.load.image(`char_${id}`, `assets/characters/char_${id}.png`);
      this.load.image(`face_${id}_normal`, `assets/portraits/face_${id}_normal.png`);
      this.load.image(`face_${id}_down`, `assets/portraits/face_${id}_down.png`);
    }
    this.load.image("ui_frame", "assets/ui/ui_frame.png");
  }

  create(): void {
    this.scene.start("Title");
  }
}

export { AREA_BACKGROUNDS };
