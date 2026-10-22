/**
 * GameState - State machine for game phases
 * Manages phase transitions and phase-specific limits
 * Constructor accepts optional seed number for deterministic RNG
 */
export enum Phase {
  Phase1 = 1,
  Phase2 = 2,
  Phase3 = 3,
  Phase4 = 4,
}

export interface PhaseConfig {
  maxSuspect: number;
  name: string;
  description: string;
}

export const PhaseConfigs: Record<number, PhaseConfig> = {
  [Phase.Phase1]: {
    maxSuspect: 30,
    name: "シャッター商店街",
    description: "実家の文房具店を拠点に、地域の噂・スキャンダルを収集",
  },
  [Phase.Phase2]: {
    maxSuspect: 60,
    name: "地方都市",
    description: "深夜ラジオ・地方局の電波ジャック、演説で世論を狂信へ",
  },
  [Phase.Phase3]: {
    maxSuspect: 85,
    name: "首都・国家",
    description: "全国ネットメディア支配、大企業買収、大規模デモのコントロール",
  },
  [Phase.Phase4]: {
    maxSuspect: 100,
    name: "グローバル",
    description: "世界金融・情報網の掌握、新世界秩序の樹立",
  },
};

export interface GameStateSnapshot {
  phase: number;
  funds: number;
  fear: number;
  faith: number;
  suspect: number;
  seed: number;
  flags: Record<string, boolean>;
  gameOver: boolean;
}

export class GameState {
  phase: number;
  seed: number;
  flags: Record<string, boolean>;
  resources: { funds: number; fear: number; faith: number; suspect: number };
  turnCount: number;
  gameOver: boolean;

  constructor(seed?: number) {
    this.seed = seed ?? 12345;
    this.phase = 1;
    this.flags = {};
    this.resources = { funds: 10000, fear: 0, faith: 0, suspect: 0 };
    this.turnCount = 0;
    this.gameOver = false;
  }

  incrementTurn(): void {
    this.turnCount += 1;
  }

  markGameOver(): void {
    this.gameOver = true;
  }

  isGameOver(): boolean {
    return this.gameOver;
  }

  canAdvanceTo(n: number): boolean {
    return n > this.phase && n <= 4;
  }

  advance(): void {
    if (this.phase < 4) {
      this.phase += 1;
    }
  }

  setPhase(n: number): void {
    if (n >= 1 && n <= 4) {
      this.phase = n;
    }
  }

  setFlag(key: string, val: boolean): void {
    this.flags[key] = val;
  }

  getFlag(key: string): boolean | undefined {
    return this.flags[key];
  }

  snapshot(): GameStateSnapshot {
    return {
      phase: this.phase,
      funds: this.resources.funds,
      fear: this.resources.fear,
      faith: this.resources.faith,
      suspect: this.resources.suspect,
      seed: this.seed,
      flags: { ...this.flags },
      gameOver: this.gameOver,
    };
  }

  restore(snap: {
    phase: number;
    funds: number;
    fear: number;
    faith: number;
    suspect: number;
    seed: number;
    flags: Record<string, boolean>;
    gameOver?: boolean;
  }): void {
    this.phase = snap.phase;
    this.resources = {
      funds: snap.funds,
      fear: snap.fear,
      faith: snap.faith,
      suspect: snap.suspect,
    };
    this.seed = snap.seed;
    this.flags = { ...snap.flags };
    this.gameOver = snap.gameOver ?? false;
  }
}
