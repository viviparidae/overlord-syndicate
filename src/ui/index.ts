import type { GameEngine } from "@core/GameEngine";
import type { GameState } from "@core/GameState";
import type { Resources } from "@core/Resources";
import { formatCurrency, t } from "@localization/index";

interface ResourceView {
  funds: number;
  fear: number;
  faith: number;
  suspect: number;
}

function toTemplateVars(
  vars: Record<string, unknown> | undefined,
): Record<string, string | number> {
  const result: Record<string, string | number> = {};
  if (!vars) return result;
  for (const key of Object.keys(vars)) {
    const value = vars[key];
    if (typeof value === "number" || typeof value === "string") {
      result[key] = value;
    }
  }
  return result;
}

function updateStatusBar(resources: ResourceView): void {
  const fundsEl = document.getElementById("funds");
  const fearEl = document.getElementById("fear");
  const faithEl = document.getElementById("faith");
  const suspectEl = document.getElementById("suspect");

  if (fundsEl) fundsEl.textContent = t("status.funds", { amount: formatCurrency(resources.funds) });
  if (fearEl) fearEl.textContent = t("status.fear", { level: resources.fear });
  if (faithEl) faithEl.textContent = t("status.faith", { level: resources.faith });
  if (suspectEl) suspectEl.textContent = t("status.suspect", { level: resources.suspect });
}

function updatePhase(phase: number): void {
  const phaseEl = document.getElementById("phase");
  if (!phaseEl) return;
  phaseEl.textContent = t("status.phase", { phase, name: t(`phase.${phase}.name`) });
}

function addLogEntry(message: string): void {
  const consoleEl = document.getElementById("logConsole");
  if (!consoleEl) return;

  const entry = document.createElement("div");
  entry.className = "log-entry";
  entry.textContent = message;
  entry.style.color = "#e9e9e9";
  entry.style.padding = "2px 0";
  entry.style.borderBottom = "1px solid #333";
  consoleEl.appendChild(entry);
  consoleEl.scrollTop = consoleEl.scrollHeight;
}

function showGameOver(): void {
  const overlay = document.getElementById("gameOverOverlay");
  const titleEl = document.getElementById("gameOverTitle");
  const reasonEl = document.getElementById("gameOverReason");

  if (titleEl) titleEl.textContent = t("gameover.title");
  if (reasonEl) reasonEl.textContent = t("gameover.suspect");
  if (overlay) overlay.hidden = false;
}

function setCommandsDisabled(disabled: boolean): void {
  for (const id of ["shopBtn", "rumorBtn", "intimidateBtn"]) {
    const button = document.getElementById(id) as HTMLButtonElement | null;
    if (button) button.disabled = disabled;
  }
}

function setupCommandListeners(engine: GameEngine): void {
  const shopBtn = document.getElementById("shopBtn") as HTMLButtonElement | null;
  const rumorBtn = document.getElementById("rumorBtn") as HTMLButtonElement | null;
  const intimidateBtn = document.getElementById("intimidateBtn") as HTMLButtonElement | null;

  if (shopBtn) {
    shopBtn.addEventListener("click", () => {
      engine.execute("runShop");
    });
  }
  if (rumorBtn) {
    rumorBtn.addEventListener("click", () => {
      engine.execute("spreadRumor");
    });
  }
  if (intimidateBtn) {
    intimidateBtn.addEventListener("click", () => {
      engine.execute("intimidate");
    });
  }
}

export function initUI(resources: Resources, gameState: GameState, engine: GameEngine): void {
  updateStatusBar(resources);
  updatePhase(gameState.phase);
  setupCommandListeners(engine);

  engine.on("resourcesChanged", (payload) => {
    updateStatusBar(payload);
  });

  engine.on("actionExecuted", ({ result }) => {
    addLogEntry(t(result.messageKey, toTemplateVars(result.messageVars)));
  });

  engine.on("phaseChanged", ({ to }) => {
    updatePhase(to);
    addLogEntry(t("log.phaseChanged", { phase: to, name: t(`phase.${to}.name`) }));
  });

  engine.on("gameOver", () => {
    showGameOver();
    setCommandsDisabled(true);
    addLogEntry(t("log.gameOver"));
  });
}
