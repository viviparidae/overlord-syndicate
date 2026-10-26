/**
 * Resources - Core game resource management
 * Manages funds, fear, faith, and suspect levels
 * All resource changes must go through this class
 */
export interface ResourceChange {
  name: string;
  delta: number;
}

export class Resources {
  funds: number;
  fear: number;
  faith: number;
  suspect: number;

  constructor(initial: { funds?: number; fear?: number; faith?: number; suspect?: number } = {}) {
    this.funds = initial.funds ?? 10000;
    this.fear = initial.fear ?? 0;
    this.faith = initial.faith ?? 0;
    this.suspect = initial.suspect ?? 0;
  }

  addFunds(amount: number): ResourceChange {
    this.funds = Math.max(0, this.funds + amount);
    return { name: "funds", delta: amount };
  }

  addFear(amount: number): void {
    this.fear = Math.max(0, Math.min(100, this.fear + amount));
  }

  addFaith(amount: number): void {
    this.faith = Math.max(0, this.faith + amount);
  }

  addSuspect(amount: number): void {
    this.suspect = Math.min(100, this.suspect + amount);
  }

  reduceFunds(amount: number): void {
    this.funds = Math.max(0, this.funds - amount);
  }

  hasGameOvered(): boolean {
    return this.suspect >= 100;
  }

  isGameOver(): boolean {
    return this.suspect >= 100;
  }

  snapshot(): { funds: number; fear: number; faith: number; suspect: number } {
    return {
      funds: this.funds,
      fear: this.fear,
      faith: this.faith,
      suspect: this.suspect,
    };
  }

  restore(snapshot: { funds: number; fear: number; faith: number; suspect: number }): void {
    this.funds = snapshot.funds;
    this.fear = snapshot.fear;
    this.faith = snapshot.faith;
    this.suspect = snapshot.suspect;
  }
}
