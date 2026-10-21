import type { ActionContext, ActionResult } from "./types";

export type ActionHandler = (context: ActionContext) => ActionResult;

export interface RegisteredAction {
  id: string;
  handler: ActionHandler;
}

export class ActionRegistry {
  private actions: Map<string, ActionHandler> = new Map();

  register(id: string, handler: ActionHandler): void {
    this.actions.set(id, handler);
  }

  get(id: string): ActionHandler | undefined {
    return this.actions.get(id);
  }

  execute(id: string, context: ActionContext): ActionResult {
    const handler = this.actions.get(id);
    if (!handler) {
      return {
        success: false,
        resources: [],
        events: ["action_not_found"],
        messageKey: "action.notFound",
        messageVars: { actionId: id },
      };
    }
    return handler(context);
  }

  list(): string[] {
    return Array.from(this.actions.keys());
  }
}
