import { intimidate } from "@core/actions/intimidate";
import { runShop } from "@core/actions/runShop";
import { spreadRumor, spreadRumorWithWork } from "@core/actions/spreadRumor";
import { GameEngine } from "@core/GameEngine";
import { GameState } from "@core/GameState";
import { Resources } from "@core/Resources";
import { SCENE_KEYS } from "@phaser/config";
import { installDebugBridge } from "@phaser/DebugBridge";
import { Game } from "@phaser/Game";
import type { ShopScene } from "@phaser/scenes/ShopScene";
import type { StreetScene } from "@phaser/scenes/StreetScene";
import { persist, restore } from "@ui/persistence";

const START_SEED = 12345;

declare global {
  interface Window {
    executeOverlordAction: (action: string) => void;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const resources = new Resources();
  const gameState = new GameState(START_SEED);
  const engine = new GameEngine(resources, gameState);

  engine.registerAction("runShop", runShop);
  engine.registerAction("spreadRumor", spreadRumor);
  engine.registerAction("spreadRumorWithWork", spreadRumorWithWork);
  engine.registerAction("intimidate", intimidate);

  restore(engine);

  engine.on("actionExecuted", () => {
    persist(engine);
  });

  const game = new Game(engine, resources);
  installDebugBridge(game, engine);

  // Canvas 外のボタンからアクションを実行するためのエントリーポイント
  window.executeOverlordAction = (action: string): void => {
    const result = engine.execute(action);
    if (result.success) {
      persist(engine);
    }
  };

  // External DOM controller (dpad + E/T) — Canvas 外
  // Phaser は KeyboardEvent.keyCode で判定するため、合成 KeyboardEvent では入力できない。
  // そのためシーンの公開 API を直接呼ぶ。
  const activeStreet = (): StreetScene | null => {
    const scene = game.scene.getScene(SCENE_KEYS.STREET) as StreetScene | null;
    return scene && game.scene.isActive(SCENE_KEYS.STREET) ? scene : null;
  };

  // 押下開始から最低この時間は入力を保持し、素早いタップでも1歩は動かす
  const MIN_PRESS_MS = 120;

  const bindHold = (id: string, direction: "left" | "right"): void => {
    const button = document.getElementById(id);
    if (!button) return;

    let pressedAt = 0;
    let releaseTimer: number | null = null;

    const press = (event: Event): void => {
      event.preventDefault();
      if (releaseTimer !== null) {
        window.clearTimeout(releaseTimer);
        releaseTimer = null;
      }
      pressedAt = performance.now();
      activeStreet()?.setMoveInput(direction, true);
    };

    const release = (): void => {
      if (pressedAt === 0) return;
      const held = performance.now() - pressedAt;
      const finish = (): void => {
        activeStreet()?.setMoveInput(direction, false);
        pressedAt = 0;
        releaseTimer = null;
      };
      if (held < MIN_PRESS_MS) {
        releaseTimer = window.setTimeout(finish, MIN_PRESS_MS - held);
      } else {
        finish();
      }
    };

    button.addEventListener("pointerdown", press);
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("pointerleave", release);
  };

  bindHold("btn-left", "left");
  bindHold("btn-right", "right");

  // SPACE: 街では NPC 会話、店では店番
  document.getElementById("btn-space")?.addEventListener("click", () => {
    const street = activeStreet();
    if (street) {
      street.interact();
      return;
    }
    const shop = game.scene.getScene(SCENE_KEYS.SHOP) as ShopScene | null;
    if (shop && game.scene.isActive(SCENE_KEYS.SHOP)) {
      shop.runShopAction();
    }
  });

  // ESC: 店/裏工作パネルから街に戻る
  document.getElementById("btn-esc")?.addEventListener("click", () => {
    for (const key of [SCENE_KEYS.SHOP, SCENE_KEYS.TERMINAL]) {
      if (!game.scene.isActive(key)) continue;
      const scene = game.scene.getScene(key) as { exitToStreet?: () => void } | null;
      scene?.exitToStreet?.();
      return;
    }
  });
  // E key → shop scene transition (direct scene change, not engine action)
  document.getElementById("btn-e")?.addEventListener("click", () => {
    activeStreet()?.enterShop();
  });
  // T key → terminal (裏工作) panel scene transition
  document.getElementById("btn-t")?.addEventListener("click", () => {
    activeStreet()?.openTerminal();
  });
  // Canvas command panel buttons — for E2E test automation
  document.getElementById("btn-shop")?.addEventListener("click", () => {
    window.executeOverlordAction("runShop");
  });
  document.getElementById("btn-rumor")?.addEventListener("click", () => {
    window.executeOverlordAction("spreadRumor");
  });
  document.getElementById("btn-intimidate")?.addEventListener("click", () => {
    window.executeOverlordAction("intimidate");
  });

  window.addEventListener("resize", () => game.scale.refresh());
  requestAnimationFrame(() => game.scale.refresh());
});
