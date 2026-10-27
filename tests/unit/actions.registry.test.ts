import { ActionRegistry } from "@core/actions/registry";
import { GameState } from "@core/GameState";
import { Resources } from "@core/Resources";
import { SeededRNG } from "@core/RNG";
import { describe, expect, it } from "vitest";

function makeContext() {
  return { resources: new Resources(), gameState: new GameState(), rng: new SeededRNG(12345) };
}

describe("ActionRegistry", () => {
  it("登録したアクションを実行できる", () => {
    const registry = new ActionRegistry();
    registry.register("noop", () => ({
      success: true,
      resources: [],
      events: [],
      messageKey: "action.noop",
    }));

    const result = registry.execute("noop", makeContext());
    expect(result.success).toBe(true);
    expect(result.messageKey).toBe("action.noop");
  });

  it("未登録のアクションは失敗を返す", () => {
    const registry = new ActionRegistry();
    const result = registry.execute("missing", makeContext());
    expect(result.success).toBe(false);
    expect(result.messageKey).toBe("action.notFound");
    expect(result.messageVars).toEqual({ actionId: "missing" });
  });

  it("登録済みアクションの一覧を返す", () => {
    const registry = new ActionRegistry();
    registry.register("a", () => ({ success: true, resources: [], events: [], messageKey: "a" }));
    registry.register("b", () => ({ success: true, resources: [], events: [], messageKey: "b" }));
    expect(registry.list()).toEqual(["a", "b"]);
  });

  it("登録されたハンドラを取得できる", () => {
    const registry = new ActionRegistry();
    const handler = () => ({ success: true, resources: [], events: [], messageKey: "x" });
    registry.register("x", handler);
    expect(registry.get("x")).toBe(handler);
    expect(registry.get("y")).toBeUndefined();
  });
});
