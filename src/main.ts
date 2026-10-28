import { createGame } from "./phaser/game";
import { BootScene } from "./phaser/scenes/BootScene";
import { ChapterSelectScene } from "./phaser/scenes/ChapterSelectScene";
import { EvidenceScene } from "./phaser/scenes/EvidenceScene";
import { GameOverScene } from "./phaser/scenes/GameOverScene";
import { InvestigationScene } from "./phaser/scenes/InvestigationScene";
import { ResolutionScene } from "./phaser/scenes/ResolutionScene";
import { StoryScene } from "./phaser/scenes/StoryScene";
import { TitleScene } from "./phaser/scenes/TitleScene";
import { currentChapter } from "./phaser/state";

const game = createGame("game");
declare global {
  interface Window {
    __game?: unknown;
  }
}
window.__game = game;
Object.defineProperty(window, "__chapter", {
  get: () => currentChapter(),
  configurable: true,
});
game.scene.add("Boot", BootScene, true);
game.scene.add("Title", TitleScene, false);
game.scene.add("ChapterSelect", ChapterSelectScene, false);
game.scene.add("Story", StoryScene, false);
game.scene.add("Investigation", InvestigationScene, false);
game.scene.add("Resolution", ResolutionScene, false);
game.scene.add("Evidence", EvidenceScene, false);
game.scene.add("GameOver", GameOverScene, false);
