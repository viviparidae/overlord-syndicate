import type { GameEngine } from "@core/GameEngine";
import type { GameState } from "@core/GameState";
import type { Resources } from "@core/Resources";
import { formatCurrency } from "@localization/index";

function updateStatusBar(resources: Resources): void {
  const fundsEl = document.getElementById("funds");
  const fearEl = document.getElementById("fear");
  const faithEl = document.getElementById("faith");
  const suspectEl = document.getElementById("suspect");

  if (fundsEl) fundsEl.textContent = formatCurrency(resources.funds);
  if (fearEl) fearEl.textContent = String(resources.fear);
  if (faithEl) faithEl.textContent = String(resources.faith);
  if (suspectEl) suspectEl.textContent = `${resources.suspect}%`;
}

function addLogEntry(message: string): void {
  const consoleEl = document.getElementById("logConsole");
  if (!consoleEl) return;

  const entry = document.createElement("div");
  entry.textContent = message;
  entry.style.color = "#e9e9e9";
  entry.style.padding = "2px 0";
  entry.style.borderBottom = "1px solid #333";
  consoleEl.appendChild(entry);
  consoleEl.scrollTop = consoleEl.scrollHeight;
}

function setupCommandListeners(
  resources: Resources,
  _gameState: GameState,
  engine: GameEngine,
): void {
  const shopBtn = document.getElementById("shopBtn") as HTMLButtonElement | null;
  const rumorBtn = document.getElementById("rumorBtn") as HTMLButtonElement | null;
  const intimidateBtn = document.getElementById("intimidateBtn") as HTMLButtonElement | null;

  function onAction(result: ReturnType<(typeof engine)["execute"]>): void {
    updateStatusBar(resources);
    addLogEntry("実行しました");
    if (result.phaseChanged) {
      addLogEntry(`フェーズ遷移: ${result.gameStateSnapshot.phase}`);
    }
  }

  if (shopBtn) {
    shopBtn.addEventListener("click", () => {
      const result = engine.execute("runShop");
      onAction(result);
    });
  }
  if (rumorBtn) {
    rumorBtn.addEventListener("click", () => {
      const result = engine.execute("spreadRumor");
      onAction(result);
    });
  }
  if (intimidateBtn) {
    intimidateBtn.addEventListener("click", () => {
      const result = engine.execute("intimidate");
      onAction(result);
    });
  }
}

export function initUI(resources: Resources, gameState: GameState, engine: GameEngine): void {
  updateStatusBar(resources);
  setupCommandListeners(resources, gameState, engine);
}
