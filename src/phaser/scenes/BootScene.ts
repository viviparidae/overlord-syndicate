import Phaser from "phaser";
import { chapter } from "../../data/chapters/ch01";

const AREA_BACKGROUNDS: Record<string, string> = {
  arcade_west: "bg_arcade_west_mid",
  arcade_center: "bg_arcade_center_mid",
  arcade_east: "bg_arcade_east_mid",
  shotengai_office: "bg_shotengai_office",
};

const MID_BACKGROUNDS = [
  "bg_arcade_west_mid",
  "bg_arcade_center_mid",
  "bg_arcade_east_mid",
  "bg_shotengai_office",
];
const FAR_BACKGROUNDS = [
  "bg_arcade_west_far",
  "bg_arcade_center_far",
  "bg_arcade_east_far",
  "bg_shotengai_office_far",
];

export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  preload(): void {
    this.load.bitmapFont(
      "pixelmplus24",
      "assets/fonts/pixelmplus24.png",
      "assets/fonts/pixelmplus24.xml",
    );
    for (const bg of [...MID_BACKGROUNDS, ...FAR_BACKGROUNDS]) {
      this.load.image(bg, `assets/backgrounds/${bg}.png`);
    }
    this.load.image(
      "bg_story_arcade_center_mid",
      "assets/backgrounds/story_bg_arcade_center_mid.png",
    );
    this.load.image(
      "bg_story_shotengai_office",
      "assets/backgrounds/story_bg_shotengai_office.png",
    );
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
