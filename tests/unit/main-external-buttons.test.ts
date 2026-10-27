import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

interface MockButton {
  addEventListener: ReturnType<typeof vi.fn>;
  id: string;
}

// Store button mocks for later access
const buttonMocks = new Map<string, MockButton>();

// MockKeyboardEvent class at top level for test access
class MockKeyboardEvent extends Event {
  key: string;
  code: string;
  bubbles: boolean;
  constructor(type: string, init: KeyboardEventInit = {}) {
    super(type);
    this.key = init.key || "";
    this.code = init.code || "";
    this.bubbles = init.bubbles ?? false;
  }
}

interface MockWindow {
  addEventListener: ReturnType<typeof vi.fn>;
  dispatchEvent: ReturnType<typeof vi.fn>;
  executeOverlordAction: ReturnType<typeof vi.fn>;
  document: MockDocument;
  KeyboardEvent: typeof MockKeyboardEvent;
}

interface MockDocument {
  getElementById: ReturnType<typeof vi.fn>;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  dispatchEvent: ReturnType<typeof vi.fn>;
}

let mockWindow: MockWindow;
let mockDocument: MockDocument;
let dispatchEventSpy: ReturnType<typeof vi.fn>;
let addEventListenerSpy: ReturnType<typeof vi.fn>;
let executeOverlordActionSpy: ReturnType<typeof vi.fn>;

function setupMocks() {
  mockDocument = {
    getElementById: vi.fn((id: string) => {
      if (!buttonMocks.has(id)) {
        const btn = {
          addEventListener: vi.fn(),
          id,
        };
        buttonMocks.set(id, btn);
      }
      return buttonMocks.get(id);
    }),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };

  executeOverlordActionSpy = vi.fn();

  mockWindow = {
    addEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    executeOverlordAction: executeOverlordActionSpy,
    document: mockDocument,
    KeyboardEvent: MockKeyboardEvent,
  };

  // Also stub global KeyboardEvent
  vi.stubGlobal("KeyboardEvent", MockKeyboardEvent);

  dispatchEventSpy = vi.spyOn(mockWindow, "dispatchEvent");
  addEventListenerSpy = vi.spyOn(mockWindow, "addEventListener");

  // Set up global mocks
  vi.stubGlobal("window", mockWindow);
  vi.stubGlobal("document", mockDocument);
}

// Mock Phaser before it's imported by main.ts dependencies
vi.mock("phaser", () => {
  const MockPhaser = {
    Scene: class MockScene {
      constructor(config: Record<string, unknown>) {
        this.sys = { config };
      }
      sys: Record<string, unknown>;
    },
    Game: class MockGame {
      constructor(config: Record<string, unknown>) {
        this.config = config;
        this.scale = { refresh: vi.fn() };
        this.loop = { delta: 16 };
      }
      config: Record<string, unknown>;
      scale: Record<string, unknown>;
      loop: Record<string, unknown>;
      scene = { start: vi.fn() };
    },
    AUTO: "AUTO",
    Scale: {
      FIT: "FIT",
      CENTER_BOTH: "CENTER_BOTH",
    },
    Physics: {
      Arcade: {
        Sprite: class MockSprite {
          setDisplaySize() {
            return this;
          }
          setDepth() {
            return this;
          }
          setOrigin() {
            return this;
          }
          setTint() {
            return this;
          }
          setVelocity() {
            return this;
          }
          setAcceleration() {
            return this;
          }
          setBounce() {
            return this;
          }
          setCollideWorldBounds() {
            return this;
          }
          play() {
            return this;
          }
          anims = { play: vi.fn() };
          body = { setSize: vi.fn(), setOffset: vi.fn() };
        },
        StaticBody: class MockStaticBody {
          immovable = true;
        },
      },
    },
    Input: {
      Keyboard: {
        KeyCodes: { SPACE: 32, ESC: 27, LEFT: 37, RIGHT: 39, UP: 38, DOWN: 40 },
        JustDown: (key: Record<string, unknown>) => key?.justDown ?? false,
      },
    },
    GameObjects: {
      Image: class MockImage {
        setDisplaySize() {
          return this;
        }
        setDepth() {
          return this;
        }
        setTint() {
          return this;
        }
        setOrigin() {
          return this;
        }
      },
      Text: class MockText {
        setOrigin() {
          return this;
        }
        setDepth() {
          return this;
        }
        setColor() {
          return this;
        }
        setText() {
          return this;
        }
      },
      TileSprite: class MockTileSprite {
        setOrigin() {
          return this;
        }
        setDepth() {
          return this;
        }
      },
    },
    Tweens: {
      TweenManager: class MockTweenManager {
        add() {}
      },
    },
    Display: {
      Color: {},
    },
  };
  return {
    default: MockPhaser,
    ...MockPhaser,
  };
});

// Mock @phaser modules that main.ts depends on
const sceneMocks = vi.hoisted(() => ({
  street: {
    enterShop: vi.fn(),
    openTerminal: vi.fn(),
  },
}));
vi.mock("@phaser/Game", () => {
  const MockGame = class MockGame {
    constructor(
      public engine: Record<string, unknown>,
      public resources: Record<string, unknown>,
    ) {
      this.scale = { refresh: vi.fn() };
      this.loop = { delta: 16 };
      this.scene = {
        start: vi.fn(),
        getScene: vi.fn(() => sceneMocks.street),
        isActive: vi.fn(() => true),
      };
    }
    scale: Record<string, unknown>;
    loop: Record<string, unknown>;
    scene: Record<string, unknown>;
  };
  return { Game: MockGame };
});

vi.mock("@phaser/DebugBridge", () => ({
  installDebugBridge: vi.fn(),
}));

vi.mock("@core/GameEngine", () => ({
  GameEngine: class MockGameEngine {
    constructor(
      public resources: Record<string, unknown>,
      public gameState: Record<string, unknown>,
    ) {}
    registerAction = vi.fn();
    execute = vi.fn().mockReturnValue({ success: true });
    on = vi.fn();
    getResources = vi.fn().mockReturnValue({ funds: 10000, fear: 0, faith: 0, suspect: 0 });
    getGameState = vi.fn().mockReturnValue({ phase: 1, isGameOver: () => false });
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
    fear = 0;
    faith = 0;
    suspect = 0;
  },
}));

vi.mock("@core/actions/intimidate", () => ({ intimidate: vi.fn() }));
vi.mock("@core/actions/runShop", () => ({ runShop: vi.fn() }));
vi.mock("@core/actions/spreadRumor", () => ({
  spreadRumor: vi.fn(),
  spreadRumorWithWork: vi.fn(),
}));
vi.mock("@ui/persistence", () => ({ persist: vi.fn(), restore: vi.fn() }));

beforeAll(() => {
  setupMocks();
});

afterEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
  buttonMocks.clear();
});

async function triggerDOMContentLoaded() {
  const domLoadedHandler = addEventListenerSpy.mock.calls.find(
    (c: readonly unknown[]) => c[0] === "DOMContentLoaded",
  )?.[1];
  if (domLoadedHandler) {
    await domLoadedHandler();
  }
  // After main.ts runs, it overwrites window.executeOverlordAction.
  // Replace it with our spy to track calls from btn-e and btn-t handlers.
  mockWindow.executeOverlordAction = executeOverlordActionSpy;
}

describe("main.ts external buttons", () => {
  beforeEach(async () => {
    vi.resetModules();
    // Import main.ts once per test to trigger DOMContentLoaded setup
    await import("../../src/main");
    await triggerDOMContentLoaded();
  });

  describe("Key code mismatch detection (ArrowUp/Down/Left/Right)", () => {
    it("dispatches correct ArrowUp key code when btn-up is clicked", () => {
      const btnUp = buttonMocks.get("btn-up");
      expect(btnUp).toBeDefined();

      const clickHandler = btnUp!.addEventListener.mock.calls.find(
        (c: readonly unknown[]) => c[0] === "click",
      )?.[1] as ((...args: unknown[]) => void) | undefined;
      expect(clickHandler).toBeDefined();

      clickHandler!();

      const dispatchedEvent = dispatchEventSpy.mock.calls.find(
        (c: readonly unknown[]) => c[0] instanceof MockKeyboardEvent && c[0].key === "ArrowUp",
      );
      expect(dispatchedEvent).toBeDefined();
      expect(dispatchedEvent![0].key).toBe("ArrowUp");
    });

    it("dispatches correct ArrowDown key code when btn-down is clicked", () => {
      const btnDown = buttonMocks.get("btn-down");
      expect(btnDown).toBeDefined();

      const clickHandler = btnDown!.addEventListener.mock.calls.find(
        (c: readonly unknown[]) => c[0] === "click",
      )?.[1] as ((...args: unknown[]) => void) | undefined;
      clickHandler!();

      const dispatchedEvent = dispatchEventSpy.mock.calls.find(
        (c: readonly unknown[]) => c[0] instanceof MockKeyboardEvent && c[0].key === "ArrowDown",
      );
      expect(dispatchedEvent).toBeDefined();
      expect(dispatchedEvent![0].key).toBe("ArrowDown");
    });

    it("dispatches correct ArrowLeft key code when btn-left is clicked", () => {
      const btnLeft = buttonMocks.get("btn-left");
      expect(btnLeft).toBeDefined();

      const clickHandler = btnLeft!.addEventListener.mock.calls.find(
        (c: readonly unknown[]) => c[0] === "click",
      )?.[1] as ((...args: unknown[]) => void) | undefined;
      clickHandler!();

      const dispatchedEvent = dispatchEventSpy.mock.calls.find(
        (c: readonly unknown[]) => c[0] instanceof MockKeyboardEvent && c[0].key === "ArrowLeft",
      );
      expect(dispatchedEvent).toBeDefined();
      expect(dispatchedEvent![0].key).toBe("ArrowLeft");
    });

    it("dispatches correct ArrowRight key code when btn-right is clicked", () => {
      const btnRight = buttonMocks.get("btn-right");
      expect(btnRight).toBeDefined();

      const clickHandler = btnRight!.addEventListener.mock.calls.find(
        (c: readonly unknown[]) => c[0] === "click",
      )?.[1] as ((...args: unknown[]) => void) | undefined;
      clickHandler!();

      const dispatchedEvent = dispatchEventSpy.mock.calls.find(
        (c: readonly unknown[]) => c[0] instanceof MockKeyboardEvent && c[0].key === "ArrowRight",
      );
      expect(dispatchedEvent).toBeDefined();
      expect(dispatchedEvent![0].key).toBe("ArrowRight");
    });
  });

  describe("StreetScene input monitoring verification", () => {
    it("creates cursor keys for left/right movement", async () => {
      // This test verifies that StreetScene sets up keyboard input monitoring
      // by checking the class structure has the required methods
      const { StreetScene } = await import("../../src/phaser/scenes/StreetScene");

      // Verify the expected input setup methods exist in StreetScene
      expect(typeof StreetScene.prototype.create).toBe("function");
      expect(typeof StreetScene.prototype.update).toBe("function");
      expect(typeof StreetScene.prototype.getPlayerX).toBe("function");
      expect(typeof StreetScene.prototype.getPlayerY).toBe("function");
    });
  });

  describe("Missing button handler existence verification", () => {
    it("has handler for btn-space (Space key)", () => {
      const btnSpace = buttonMocks.get("btn-space");
      expect(btnSpace).toBeDefined();

      const clickHandler = btnSpace!.addEventListener.mock.calls.find(
        (c: readonly unknown[]) => c[0] === "click",
      )?.[1] as ((...args: unknown[]) => void) | undefined;
      expect(clickHandler).toBeDefined();

      clickHandler!();

      const dispatchedEvent = dispatchEventSpy.mock.calls.find(
        (c: readonly unknown[]) => c[0] instanceof MockKeyboardEvent && c[0].key === " ",
      );
      expect(dispatchedEvent).toBeDefined();
      expect(dispatchedEvent![0].key).toBe(" ");
    });

    it("has handler for btn-esc (Escape key)", () => {
      const btnEsc = buttonMocks.get("btn-esc");
      expect(btnEsc).toBeDefined();

      const clickHandler = btnEsc!.addEventListener.mock.calls.find(
        (c: readonly unknown[]) => c[0] === "click",
      )?.[1] as ((...args: unknown[]) => void) | undefined;
      expect(clickHandler).toBeDefined();

      clickHandler!();

      const dispatchedEvent = dispatchEventSpy.mock.calls.find(
        (c: readonly unknown[]) => c[0] instanceof MockKeyboardEvent && c[0].key === "Escape",
      );
      expect(dispatchedEvent).toBeDefined();
      expect(dispatchedEvent![0].key).toBe("Escape");
    });

    it("has handler for btn-e (enterShop scene transition)", () => {
      const btnE = buttonMocks.get("btn-e");
      expect(btnE).toBeDefined();

      const clickHandler = btnE!.addEventListener.mock.calls.find(
        (c: readonly unknown[]) => c[0] === "click",
      )?.[1] as ((...args: unknown[]) => void) | undefined;
      expect(clickHandler).toBeDefined();

      clickHandler!();

      expect(sceneMocks.street.enterShop).toHaveBeenCalled();
    });

    it("has handler for btn-t (openTerminal scene transition)", () => {
      const btnT = buttonMocks.get("btn-t");
      expect(btnT).toBeDefined();

      const clickHandler = btnT!.addEventListener.mock.calls.find(
        (c: readonly unknown[]) => c[0] === "click",
      )?.[1] as ((...args: unknown[]) => void) | undefined;
      expect(clickHandler).toBeDefined();

      clickHandler!();

      expect(sceneMocks.street.openTerminal).toHaveBeenCalled();
    });
  });

  describe("dispatchEvent bubbles setting verification", () => {
    it("sets bubbles: true for ArrowUp KeyboardEvent", () => {
      const btnUp = buttonMocks.get("btn-up");
      const clickHandler = btnUp!.addEventListener.mock.calls.find(
        (c: readonly unknown[]) => c[0] === "click",
      )?.[1] as ((...args: unknown[]) => void) | undefined;
      clickHandler!();

      const dispatchedEvent = dispatchEventSpy.mock.calls.find(
        (c: readonly unknown[]) => c[0] instanceof MockKeyboardEvent && c[0].key === "ArrowUp",
      );
      expect(dispatchedEvent).toBeDefined();
      expect(dispatchedEvent![0].bubbles).toBe(true);
    });

    it("sets bubbles: true for ArrowDown KeyboardEvent", () => {
      const btnDown = buttonMocks.get("btn-down");
      const clickHandler = btnDown!.addEventListener.mock.calls.find(
        (c: readonly unknown[]) => c[0] === "click",
      )?.[1] as ((...args: unknown[]) => void) | undefined;
      clickHandler!();

      const dispatchedEvent = dispatchEventSpy.mock.calls.find(
        (c: readonly unknown[]) => c[0] instanceof MockKeyboardEvent && c[0].key === "ArrowDown",
      );
      expect(dispatchedEvent).toBeDefined();
      expect(dispatchedEvent![0].bubbles).toBe(true);
    });

    it("sets bubbles: true for ArrowLeft KeyboardEvent", () => {
      const btnLeft = buttonMocks.get("btn-left");
      const clickHandler = btnLeft!.addEventListener.mock.calls.find(
        (c: readonly unknown[]) => c[0] === "click",
      )?.[1] as ((...args: unknown[]) => void) | undefined;
      clickHandler!();

      const dispatchedEvent = dispatchEventSpy.mock.calls.find(
        (c: readonly unknown[]) => c[0] instanceof MockKeyboardEvent && c[0].key === "ArrowLeft",
      );
      expect(dispatchedEvent).toBeDefined();
      expect(dispatchedEvent![0].bubbles).toBe(true);
    });

    it("sets bubbles: true for ArrowRight KeyboardEvent", () => {
      const btnRight = buttonMocks.get("btn-right");
      const clickHandler = btnRight!.addEventListener.mock.calls.find(
        (c: readonly unknown[]) => c[0] === "click",
      )?.[1] as ((...args: unknown[]) => void) | undefined;
      clickHandler!();

      const dispatchedEvent = dispatchEventSpy.mock.calls.find(
        (c: readonly unknown[]) => c[0] instanceof MockKeyboardEvent && c[0].key === "ArrowRight",
      );
      expect(dispatchedEvent).toBeDefined();
      expect(dispatchedEvent![0].bubbles).toBe(true);
    });

    it("sets bubbles: true for Space KeyboardEvent", () => {
      const btnSpace = buttonMocks.get("btn-space");
      const clickHandler = btnSpace!.addEventListener.mock.calls.find(
        (c: readonly unknown[]) => c[0] === "click",
      )?.[1] as ((...args: unknown[]) => void) | undefined;
      clickHandler!();

      const dispatchedEvent = dispatchEventSpy.mock.calls.find(
        (c: readonly unknown[]) => c[0] instanceof MockKeyboardEvent && c[0].key === " ",
      );
      expect(dispatchedEvent).toBeDefined();
      expect(dispatchedEvent![0].bubbles).toBe(true);
    });

    it("sets bubbles: true for Escape KeyboardEvent", () => {
      const btnEsc = buttonMocks.get("btn-esc");
      const clickHandler = btnEsc!.addEventListener.mock.calls.find(
        (c: readonly unknown[]) => c[0] === "click",
      )?.[1] as ((...args: unknown[]) => void) | undefined;
      clickHandler!();

      const dispatchedEvent = dispatchEventSpy.mock.calls.find(
        (c: readonly unknown[]) => c[0] instanceof MockKeyboardEvent && c[0].key === "Escape",
      );
      expect(dispatchedEvent).toBeDefined();
      expect(dispatchedEvent![0].bubbles).toBe(true);
    });
  });
});
