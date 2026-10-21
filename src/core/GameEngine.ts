/**
 * GameEngine - Core game execution loop
 * Headless, Phaser-independent game logic
 */

import { ActionRegistry } from "@core/actions/registry";
import type { ActionContext, ActionResult } from "@core/actions/types";
import { GameState } from "./GameState";
import { Resources } from "./Resources";

export class GameEngine {
  private resources: Resources;
  private gameState: GameState;
  private registry: ActionRegistry;

  constructor(resources?: Resources, gameState?: GameState) {
    this.resources = resources ?? new Resources();
    this.gameState = gameState ?? new GameState();
    this.registry = new ActionRegistry();
  }

  registerAction(id: string, handler: (context: ActionContext) => ActionResult): void {
    this.registry.register(id, handler);
  }

  execute(actionId: string): {
    success: boolean;
    gameStateSnapshot: {
      phase: number;
      funds: number;
      fear: number;
      faith: number;
      suspect: number;
      seed: number;
    };
    phaseChanged: boolean;
  } {
    const handler = this.registry.get(actionId);
    if (!handler) {
      return {
        success: false,
        gameStateSnapshot: this.gameState.snapshot(),
        phaseChanged: false,
      };
    }

    const result = handler({ resources: this.resources, gameState: this.gameState });

    this.gameState.incrementTurn();
    this.gameState.resources = this.resources.snapshot();

    const phaseChanged = result.newPhase !== undefined && result.newPhase !== this.gameState.phase;

    return {
      success: result.success,
      gameStateSnapshot: this.gameState.snapshot(),
      phaseChanged,
    };
  }

  save(): string {
    const snapshot = {
      version: 1,
      state: this.gameState.snapshot(),
      resources: this.resources.snapshot(),
    };
    return JSON.stringify(snapshot);
  }

  load(json: string): void {
    const data = JSON.parse(json);
    if (data.version !== 1) throw new Error("Unsupported save version");
    this.gameState.restore(data.state);
    this.resources.restore(data.resources);
  }

  getResources(): Resources {
    return this.resources;
  }

  getGameState(): GameState {
    return this.gameState;
  }
}
