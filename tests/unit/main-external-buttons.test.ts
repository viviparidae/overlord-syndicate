import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

interface MockButton {
  id: string;
  listeners: Map<string, (event: Event) => void>;
  addEventListener: ReturnType<typeof vi.fn>;
}

const buttons = new Map<string, MockButton>();
const windowListeners = new Map<string, (event: Event) => void>();

function getButton(id: string): MockButton {
  const existing = buttons.get(id);
  if (existing) return existing;

  const button: MockButton = {
    id,
    listeners: new Map(),
    addEventListener: vi.fn((type: string, handler: (event: Event) => void) => {
      button.listeners.set(type, handler);
    }),
  };
  buttons.set(id, button);
  return button;
}

function fire(id: string, type: string, event: Partial<Event> = {}): void {
  const handler = getButton(id).listeners.get(type);
  if (!handler) throw new Error(`${id} has no "${type}" listener`);
  handler({ preventDefault: vi.fn(), ...event } as unknown as Event);
}

const sceneMocks = vi.hoisted(() => ({
  street: { setMoveInput: vi.fn(), interact: vi.fn(), enterShop: vi.fn(), openTerminal: vi.fn() },
  shop: { runShopAction: vi.fn(), exitToStreet: vi.fn() },
  terminal: { exitToStreet: vi.fn() },
  active: { street: true, shop: false, terminal: false },
}));

vi.mock("@phaser/config", () => ({
  SCENE_KEYS: {
    STREET: "StreetScene",
    SHOP: "ShopScene",
    TERMINAL: "TerminalScene",
    HUD: "HudScene",
  },
}));

vi.mock("@phaser/Game", () => ({
  Game: class MockGame {
    scale = { refresh: vi.fn() };
    scene = {
      start: vi.fn(),
      getScene: vi.fn((key: string) => {
        if (key === "StreetScene") return sceneMocks.street;
        if (key === "ShopScene") return sceneMocks.shop;
        if (key === "TerminalScene") return sceneMocks.terminal;
        return null;
      }),
      isActive: vi.fn((key: string) => {
        if (key === "StreetScene") return sceneMocks.active.street;
        if (key === "ShopScene") return sceneMocks.active.shop;
        if (key === "TerminalScene") return sceneMocks.active.terminal;
        return false;
      }),
    };
  },
}));

vi.mock("@phaser/DebugBridge", () => ({ installDebugBridge: vi.fn() }));

vi.mock("@core/GameEngine", () => ({
  GameEngine: class MockGameEngine {
    registerAction = vi.fn();
    execute = vi.fn().mockReturnValue({ success: true });
    on = vi.fn();
  },
}));

vi.mock("@core/GameState", () => ({
  GameState: class MockGameState {
    constructor(public seed: number) {}
  },
}));

vi.mock("@core/Resources", () => ({
  Resources: class MockResources {
    funds = 10000;
  },
}));

vi.mock("@core/actions/intimidate", () => ({ intimidate: vi.fn() }));
vi.mock("@core/actions/runShop", () => ({ runShop: vi.fn() }));
vi.mock("@core/actions/spreadRumor", () => ({
  spreadRumor: vi.fn(),
  spreadRumorWithWork: vi.fn(),
}));
vi.mock("@ui/persistence", () => ({ persist: vi.fn(), restore: vi.fn() }));

let dispatchEventSpy: ReturnType<typeof vi.fn>;

async function loadMain(): Promise<void> {
  vi.resetModules();
  await import("../../src/main");
  const onDomReady = windowListeners.get("DOMContentLoaded");
  if (!onDomReady) throw new Error("main.ts did not register DOMContentLoaded");
  onDomReady(new Event("DOMContentLoaded"));
}

beforeEach(() => {
  sceneMocks.active.street = true;
  sceneMocks.active.shop = false;
  sceneMocks.active.terminal = false;

  buttons.clear();
  windowListeners.clear();
  dispatchEventSpy = vi.fn();

  const mockWindow = {
    addEventListener: vi.fn((type: string, handler: (event: Event) => void) => {
      windowListeners.set(type, handler);
    }),
    dispatchEvent: dispatchEventSpy,
    setTimeout: globalThis.setTimeout.bind(globalThis),
    clearTimeout: globalThis.clearTimeout.bind(globalThis),
  };

  const mockDocument = {
    getElementById: vi.fn((id: string) => getButton(id)),
  };

  vi.stubGlobal("window", mockWindow);
  vi.stubGlobal("document", mockDocument);
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("main.ts external controller wiring", () => {
  it("drives street movement directly instead of synthesising KeyboardEvents", async () => {
    await loadMain();

    fire("btn-right", "pointerdown");
    expect(sceneMocks.street.setMoveInput).toHaveBeenCalledWith("right", true);

    fire("btn-right", "pointerup");
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(sceneMocks.street.setMoveInput).toHaveBeenCalledWith("right", false);

    const keyboardEvents = dispatchEventSpy.mock.calls.filter(
      (call) => call[0] instanceof KeyboardEvent,
    );
    expect(keyboardEvents).toHaveLength(0);
  });

  it("keeps a quick tap pressed for the minimum hold duration", async () => {
    await loadMain();

    fire("btn-left", "pointerdown");
    fire("btn-left", "pointerup");
    // pointerup 直後は解除されていない（MIN_PRESS_MS の間は入力を保持）
    expect(sceneMocks.street.setMoveInput).not.toHaveBeenCalledWith("left", false);

    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(sceneMocks.street.setMoveInput).toHaveBeenCalledWith("left", false);
  });

  it("releases movement on pointercancel so the player never runs away", async () => {
    await loadMain();

    fire("btn-right", "pointerdown");
    fire("btn-right", "pointercancel");
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(sceneMocks.street.setMoveInput).toHaveBeenLastCalledWith("right", false);
  });

  it("routes the SPACE button to NPC interaction on the street", async () => {
    await loadMain();
    fire("btn-space", "click");
    expect(sceneMocks.street.interact).toHaveBeenCalledTimes(1);
    expect(sceneMocks.shop.runShopAction).not.toHaveBeenCalled();
  });

  it("routes the SPACE button to runShop while the shop scene is active", async () => {
    await loadMain();
    sceneMocks.active.street = false;
    sceneMocks.active.shop = true;

    fire("btn-space", "click");
    expect(sceneMocks.shop.runShopAction).toHaveBeenCalledTimes(1);
    expect(sceneMocks.street.interact).not.toHaveBeenCalled();
  });

  it("routes the ESC button to the active overlay scene", async () => {
    await loadMain();
    sceneMocks.active.street = false;
    sceneMocks.active.terminal = true;

    fire("btn-esc", "click");
    expect(sceneMocks.terminal.exitToStreet).toHaveBeenCalledTimes(1);
    expect(sceneMocks.shop.exitToStreet).not.toHaveBeenCalled();
  });

  it("enters the shop and the terminal panel from the street", async () => {
    await loadMain();
    fire("btn-e", "click");
    expect(sceneMocks.street.enterShop).toHaveBeenCalledTimes(1);
    fire("btn-t", "click");
    expect(sceneMocks.street.openTerminal).toHaveBeenCalledTimes(1);
  });
});
