import type { GameEngine } from "@core/GameEngine";
import { formatCurrency, t } from "@localization/index";
import { SCENE_KEYS } from "@phaser/config";
import { getGameContext } from "@phaser/GameContext";
import Phaser from "phaser";

// z-depthレイヤー（docs/architecture/ui-layer.md参照）
// 値を調整してゲーム画面が隠れるのを防ぐ
const DEPTH = {
  STATUS: 500,     // 下げてゲーム世界と重ならないように
  LOG_BG: 600,     // 下げてゲーム世界と重ならないように
  LOG_TEXT: 610,   // 下げてゲーム世界と重ならないように
  COMMAND: 700,    // ステータスバーより上に表示
  GAMEOVER: 10000,
} as const;

interface LogEntry {
  text: Phaser.GameObjects.Text;
  type: "system" | "success" | "warning" | "error";
}

export class HudScene extends Phaser.Scene {
  private engine!: GameEngine;

  // --- Status Bar ---
  private statusBg!: Phaser.GameObjects.Rectangle;
  private fundsText!: Phaser.GameObjects.Text;
  private fearText!: Phaser.GameObjects.Text;
  private faithText!: Phaser.GameObjects.Text;
  private suspectText!: Phaser.GameObjects.Text;
  private phaseText!: Phaser.GameObjects.Text;

  // --- Log Console ---
  private logBg!: Phaser.GameObjects.Rectangle;
  private logEntries: LogEntry[] = [];

  // --- Game Over ---
  private gameOverOverlay!: Phaser.GameObjects.Rectangle;
  private gameOverTitle!: Phaser.GameObjects.Text;
  private gameOverReason!: Phaser.GameObjects.Text;

  // --- Command Panel ---
  // Background and buttons are created in createCommandPanel()
  // Button hit areas are handled in createCommandPanel()

  constructor() {
    super({ key: SCENE_KEYS.HUD, active: true });
  }

  create(): void {
    const engine = getGameContext().engine;
    const resources = getGameContext().resources;
    this.engine = engine;
    const { width, height } = this.scale;

    this.createStatusBar(width);
    this.createLogConsole(width, height);

    this.subscribeEngineEvents(resources);

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0);
    overlay.fillRect(0, 0, width, height);
    overlay.setDepth(DEPTH.GAMEOVER + 1);
    overlay.visible = false;
    this.gameOverOverlay = overlay as unknown as Phaser.GameObjects.Rectangle;
    // Pre-create game-over modal (hidden)
    this.createGameOverModal(width, height);
    this.createCommandPanel(width, height);

    this.refreshStatusBar(resources);
    this.addLogEntry("> 1990年・裏社会侵食シミュレーションを開始します。", "system");
    this.addLogEntry("> コマンドを選択してください。", "system");
  }

  private createStatusBar(width: number): void {
    this.statusBg = this.add.rectangle(0, 0, width, 40, 0x0f0f1a).setOrigin(0, 0);
    this.statusBg.setDepth(DEPTH.STATUS);
    this.statusBg.setAlpha(0.8);
    const cfg: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: "14px",
      color: "#e9e9e9",
      fontFamily: "DotGothic16, monospace",
    };
    this.fundsText = this.add.text(16, 6, "", cfg).setDepth(DEPTH.STATUS + 1);
    this.fearText = this.add.text(180, 6, "", cfg).setDepth(DEPTH.STATUS + 1);
    this.faithText = this.add.text(344, 6, "", cfg).setDepth(DEPTH.STATUS + 1);
    this.suspectText = this.add.text(508, 6, "", cfg).setDepth(DEPTH.STATUS + 1);
    this.phaseText = this.add
      .text(width / 2, 6, "", { ...cfg, color: "#22d3ee" })
      .setOrigin(0.5, 0)
      .setDepth(DEPTH.STATUS + 1);
  }

  private createLogConsole(width: number, height: number): void {
    const logW = width;
    const logH = 120;
    const logY = height - logH;
    this.logBg = this.add.rectangle(0, logY, logW, logH, 0x0f0f1a).setOrigin(0, 0);
    this.logBg.setDepth(DEPTH.LOG_BG);
    this.logBg.setStrokeStyle(1, 0x222222);
    this.logBg.setAlpha(0.8);
  }

  private createGameOverModal(width: number, height: number): void {
    const modal = this.add.rectangle(width / 2, height / 2, 300, 120, 0x1a1a2e).setOrigin(0.5);
    modal.setDepth(DEPTH.GAMEOVER);
    modal.setStrokeStyle(2, 0xe94560);
    modal.visible = false;
    this.gameOverOverlay = modal as unknown as Phaser.GameObjects.Rectangle;

    this.gameOverTitle = this.add
      .text(width / 2, height / 2 - 20, "", {
        fontSize: "24px",
        color: "#e94560",
        fontFamily: "DotGothic16, monospace",
      })
      .setOrigin(0.5)
      .setDepth(DEPTH.GAMEOVER + 1);
    this.gameOverTitle.visible = false;

    this.gameOverReason = this.add
      .text(width / 2, height / 2 + 20, "", {
        fontSize: "13px",
        color: "#e9e9e9",
        fontFamily: "DotGothic16, monospace",
      })
      .setOrigin(0.5)
      .setDepth(DEPTH.GAMEOVER + 1);
    this.gameOverReason.visible = false;
  }

  private createCommandPanel(width: number, height: number): void {
    const panelH = 70;
    const panelY = height - panelH;
    const btnW = 120;
    const btnGap = 16;

    // Background (non-interactive; buttons handle hits)
    this.add.rectangle(0, panelY, width, panelH, 0x0f0f1a).setOrigin(0, 0).setDepth(DEPTH.COMMAND);

    // Buttons
    const btnShop = this.add
      .rectangle(btnW / 2, panelY + panelH / 2, btnW, 40, 0xe94560)
      .setOrigin(0.5);
    btnShop.setDepth(DEPTH.COMMAND + 1);
    const btnShopText = this.add
      .text(btnW / 2, panelY + panelH / 2, "店番をする", {
        fontSize: "12px",
        color: "#e9e9e9",
        fontFamily: "DotGothic16, monospace",
      })
      .setOrigin(0.5);
    btnShopText.setDepth(DEPTH.COMMAND + 2);

    const btnRumor = this.add
      .rectangle(btnW + btnGap + btnW / 2, panelY + panelH / 2, btnW, 40, 0x22d3ee)
      .setOrigin(0.5);
    btnRumor.setDepth(DEPTH.COMMAND + 1);
    const btnRumorText = this.add
      .text(btnW + btnGap + btnW / 2, panelY + panelH / 2, "噂を流す", {
        fontSize: "12px",
        color: "#1a1a2e",
        fontFamily: "DotGothic16, monospace",
      })
      .setOrigin(0.5);
    btnRumorText.setDepth(DEPTH.COMMAND + 2);

    const btnIntimidate = this.add
      .rectangle(btnW * 2 + btnGap + btnW / 2, panelY + panelH / 2, btnW, 40, 0xfbbf24)
      .setOrigin(0.5);
    btnIntimidate.setDepth(DEPTH.COMMAND + 1);
    const btnIntimidateText = this.add
      .text(btnW * 2 + btnGap + btnW / 2, panelY + panelH / 2, "脅迫する", {
        fontSize: "12px",
        color: "#1a1a2e",
        fontFamily: "DotGothic16, monospace",
      })
      .setOrigin(0.5);
    btnIntimidateText.setDepth(DEPTH.COMMAND + 2);

    // Button hit areas for clicks (rectangle overlays)
    const shopBtn = this.add
      .rectangle(0, panelY, btnW, 40, 0xff0000, 0)
      .setOrigin(0, 0)
      .setDepth(DEPTH.COMMAND + 3);
    shopBtn.setInteractive();
    shopBtn.on("pointerdown", () => {
      this.engine.execute("runShop");
    });

    const rumorBtn = this.add
      .rectangle(btnW + btnGap, panelY, btnW, 40, 0xff0000, 0)
      .setOrigin(0, 0)
      .setDepth(DEPTH.COMMAND + 3);
    rumorBtn.setInteractive();
    rumorBtn.on("pointerdown", () => {
      this.engine.execute("spreadRumor");
    });

    const intimidateBtn = this.add
      .rectangle(btnW * 2 + btnGap, panelY, btnW, 40, 0xff0000, 0)
      .setOrigin(0, 0)
      .setDepth(DEPTH.COMMAND + 3);
    intimidateBtn.setInteractive();
    intimidateBtn.on("pointerdown", () => {
      this.engine.execute("intimidate");
    });
  }

  private subscribeEngineEvents(resources: {
    funds: number;
    fear: number;
    faith: number;
    suspect: number;
    phase?: number;
  }): void {
    this.engine.on("resourcesChanged", (payload) => {
      this.refreshStatusBar({ ...payload, phase: resources.phase });
    });
    this.engine.on("phaseChanged", ({ to }) => {
      this.refreshStatusBar({
        funds: resources.funds,
        fear: resources.fear,
        faith: resources.faith,
        suspect: resources.suspect,
        phase: to,
      });
      this.addLogEntry(t("log.phaseChanged", { phase: to, name: t(`phase.${to}.name`) }), "system");
    });
    this.engine.on("actionExecuted", ({ result }) => {
      this.addLogEntry(
        t(result.messageKey, (result.messageVars || {}) as Record<string, string | number>),
        result.success ? "success" : "warning",
      );
    });
    this.engine.on("gameOver", () => {
      this.setGameOver();
    });
  }

  private refreshStatusBar(resources: {
    funds: number;
    fear: number;
    faith: number;
    suspect: number;
    phase?: number;
  }): void {
    this.fundsText.setText(t("status.funds", { amount: formatCurrency(resources.funds) }));
    this.fearText.setText(t("status.fear", { level: resources.fear }));
    this.faithText.setText(t("status.faith", { level: resources.faith }));
    this.suspectText.setText(t("status.suspect", { level: resources.suspect }));
    if (resources.phase !== undefined) {
      this.phaseText.setText(
        t("status.phase", { phase: resources.phase, name: t(`phase.${resources.phase}.name`) }),
      );
    }
  }

  private addLogEntry(message: string, type: LogEntry["type"] = "system"): void {
    const color: string =
      type === "system"
        ? "#4ade80"
        : type === "success"
          ? "#22d3ee"
          : type === "warning"
            ? "#fbbf24"
            : "#f87171";
    // ログコンソールの高さ（120px）内に収める計算
    const logEntryHeight = 14;
    const maxEntries = 12;
    const entryY = this.scale.height - 120 + 8; // log background の上部開始位置

    const entry = this.add
      .text(8, entryY + this.logEntries.length * logEntryHeight, message, {
        fontSize: "10px",
        color,
        fontFamily: "DotGothic16, monospace",
      })
      .setDepth(DEPTH.LOG_TEXT);
    entry.setOrigin(0, 0);
    this.logEntries.push({ text: entry, type });
    // Keep last maxEntries entries
    if (this.logEntries.length > maxEntries) {
      const removed = this.logEntries.shift()!;
      removed.text.destroy();
    }
    // 表示位置を調整: 最新のエントリが常に最後に来るように上部から描画
    // すでに描画済みのエントリの位置をリセット
    for (let i = 0; i < this.logEntries.length; i++) {
      this.logEntries[i].text.y = entryY + i * logEntryHeight;
    }
  }

  private setGameOver(): void {
    this.gameOverOverlay.setVisible(true);
    this.gameOverTitle.setText(t("gameover.title"));
    this.gameOverTitle.setVisible(true);
    this.gameOverReason.setText(t("gameover.suspect"));
    this.gameOverReason.setVisible(true);
  }
}
