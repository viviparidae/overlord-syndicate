/**
 * GameEngine - Core game execution loop
 * Headless, Phaser-independent game logic
 */

import { meetsThreshold, thresholdTransitionForPhase } from "@balance/Thresholds";
import { ActionRegistry } from "@core/actions/registry";
import type { ActionContext, ActionResult } from "@core/actions/types";
import { EventSystem } from "./EventSystem";
import { GameState } from "./GameState";
import { Resources } from "./Resources";

export type GameEventMap = {
  actionExecuted: { actionId: string; result: ActionResult };
  resourcesChanged: { funds: number; fear: number; faith: number; suspect: number };
  phaseChanged: { from: number; to: number };
  gameOver: { reason: "suspect" };
};

export interface ActionExecutionResult {
  success: boolean;
  gameStateSnapshot: {
    phase: number;
    funds: number;
    fear: number;
    faith: number;
    suspect: number;
    seed: number;
    gameOver: boolean;
  };
  phaseChanged: boolean;
  messageKey: string;
  messageVars?: Record<string, unknown>;
}

export class GameEngine {
  private resources: Resources;
  private gameState: GameState;
  private registry: ActionRegistry;
  private events: EventSystem<GameEventMap>;

  constructor(resources?: Resources, gameState?: GameState) {
    this.resources = resources ?? new Resources();
    this.gameState = gameState ?? new GameState();
    this.registry = new ActionRegistry();
    this.events = new EventSystem<GameEventMap>();
  }

  registerAction(id: string, handler: (context: ActionContext) => ActionResult): void {
    this.registry.register(id, handler);
  }

  on<K extends keyof GameEventMap & string>(
    event: K,
    callback: (payload: GameEventMap[K]) => void,
  ): void {
    this.events.on(event, callback);
  }

  off<K extends keyof GameEventMap & string>(
    event: K,
    callback: (payload: GameEventMap[K]) => void,
  ): void {
    this.events.off(event, callback);
  }

  execute(actionId: string): ActionExecutionResult {
    const handler = this.registry.get(actionId);
    if (!handler) {
      return {
        success: false,
        gameStateSnapshot: this.snapshotOf(),
        phaseChanged: false,
        messageKey: "action.notFound",
        messageVars: { actionId },
      };
    }

    if (this.gameState.isGameOver()) {
      const rejection: ActionResult = {
        success: false,
        resources: [],
        events: ["action_rejected_game_over"],
        messageKey: "action.gameOver",
      };
      this.events.emit("actionExecuted", { actionId, result: rejection });
      return {
        success: false,
        gameStateSnapshot: this.snapshotOf(),
        phaseChanged: false,
        messageKey: rejection.messageKey,
        messageVars: rejection.messageVars,
      };
    }

    const result = handler({ resources: this.resources, gameState: this.gameState });

    this.gameState.incrementTurn();
    this.gameState.resources = this.resources.snapshot();

    this.events.emit("resourcesChanged", this.resources.snapshot());

    const phaseChanged = this.applyPhaseAdvance();

    if (this.resources.hasGameOvered()) {
      this.gameState.markGameOver();
      this.events.emit("gameOver", { reason: "suspect" });
    }

    this.events.emit("actionExecuted", { actionId, result });

    return {
      success: result.success,
      gameStateSnapshot: this.snapshotOf(),
      phaseChanged,
      messageKey: result.messageKey,
      messageVars: result.messageVars,
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

  private applyPhaseAdvance(): boolean {
    const transition = thresholdTransitionForPhase(this.gameState.phase);
    if (!transition) return false;

    const reached = meetsThreshold(transition.key, {
      faith: this.resources.faith,
      funds: this.resources.funds,
    });
    if (!reached) return false;

    const from = this.gameState.phase;
    this.gameState.setPhase(transition.to);
    this.events.emit("phaseChanged", { from, to: transition.to });
    return true;
  }

  private snapshotOf(): ActionExecutionResult["gameStateSnapshot"] {
    const snap = this.gameState.snapshot();
    return {
      phase: snap.phase,
      funds: snap.funds,
      fear: snap.fear,
      faith: snap.faith,
      suspect: snap.suspect,
      seed: snap.seed,
      gameOver: snap.gameOver,
    };
  }
}
