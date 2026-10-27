import type { GameEngine } from "@core/GameEngine";
import { SCENE_KEYS } from "@phaser/config";
import type { Game } from "@phaser/Game";
import type { StreetScene } from "@phaser/scenes/StreetScene";

export interface DebugState {
  phase: number;
  funds: number;
  fear: number;
  faith: number;
  suspect: number;
  turnCount: number;
  gameOver: boolean;
}

export interface DebugBridge {
  getState(): DebugState;
  getSceneKey(): string | null;
  getPlayerX(): number | null;
  getPlayerY(): number | null;
}

declare global {
  interface Window {
    __OVERLORD__?: DebugBridge;
  }
}

export function isDebugBridgeEnabled(): boolean {
  // Only enabled when explicitly allowed via VITE_DEBUG_BRIDGE env var (unset in production builds)
  // This prevents the ?e2e debug surface from being accessible in produced/previewed builds
  if (import.meta.env.VITE_DEBUG_BRIDGE !== "true") return false;
  return new URLSearchParams(window.location.search).has("e2e");
}

export function installDebugBridge(game: Game, engine: GameEngine): void {
  if (!isDebugBridgeEnabled()) return;

  window.__OVERLORD__ = {
    getState: (): DebugState => {
      const resources = engine.getResources();
      const gameState = engine.getGameState();
      return {
        phase: gameState.phase,
        funds: resources.funds,
        fear: resources.fear,
        faith: resources.faith,
        suspect: resources.suspect,
        turnCount: gameState.turnCount,
        gameOver: gameState.isGameOver(),
      };
    },
    getSceneKey: (): string | null => {
      const active = game.scene.getScenes(true);
      // HudScene is always active as overlay; skip it to get the main game scene
      const gameScene = active.find((s) => s.scene.key !== SCENE_KEYS.HUD);
      const scene = gameScene ?? active[active.length - 1];
      return scene ? scene.scene.key : null;
    },
    getPlayerX: (): number | null => {
      if (!game.scene.isActive(SCENE_KEYS.STREET)) return null;
      const street = game.scene.getScene(SCENE_KEYS.STREET) as StreetScene | null;
      return street ? street.getPlayerX() : null;
    },
    getPlayerY: (): number | null => {
      if (!game.scene.isActive(SCENE_KEYS.STREET)) return null;
      const street = game.scene.getScene(SCENE_KEYS.STREET) as StreetScene | null;
      return street ? street.getPlayerY() : null;
    },
  };
}
