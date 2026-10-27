import { TrialScript, TrialPhase, TrialStatement, Evidence, FlagEffect } from '../scenario/Scenario';

export type TrialPhaseType = 'testimony' | 'cross-examination' | 'rebuttal' | 'verdict';

export interface TrialState {
  currentPhaseIndex: number;
  currentStatementIndex: number;
  health: number;
  maxHealth: number;
  presentedEvidence: string[];
  pressedStatements: string[];
  isGameOver: boolean;
  verdict: 'pending' | 'guilty' | 'not-guilty' | 'true-ending';
}

export interface TrialActionResult {
  success: boolean;
  messageKey: string;
  healthDelta?: number;
  phaseComplete?: boolean;
  trialComplete?: boolean;
  verdict?: TrialState['verdict'];
}

export class TrialEngine {
  private trialScript: TrialScript;
  private evidence: Record<string, Evidence>;
  private state: TrialState;
  private onFlagChange?: (effects: FlagEffect[]) => void;

  constructor(trialScript: TrialScript, evidence: Record<string, Evidence>, onFlagChange?: (effects: FlagEffect[]) => void) {
    this.trialScript = trialScript;
    this.evidence = evidence;
    this.onFlagChange = onFlagChange;
    this.state = this.createInitialState();
  }

  private createInitialState(): TrialState {
    return {
      currentPhaseIndex: 0,
      currentStatementIndex: 0,
      health: 5,
      maxHealth: 5,
      presentedEvidence: [],
      pressedStatements: [],
      isGameOver: false,
      verdict: 'pending',
    };
  }

  getCurrentPhase(): TrialPhase | null {
    return this.trialScript.phases[this.state.currentPhaseIndex] || null;
  }

  getCurrentStatement(): TrialStatement | null {
    const phase = this.getCurrentPhase();
    if (!phase) return null;
    return phase.statements[this.state.currentStatementIndex] || null;
  }

  getState(): Readonly<TrialState> {
    return { ...this.state };
  }

  getAvailableEvidence(): Evidence[] {
    return Object.values(this.evidence).filter(e => e.isObtained && e.canPresent);
  }

  pressStatement(): TrialActionResult {
    const statement = this.getCurrentStatement();
    if (!statement) return { success: false, messageKey: 'trial.no_statement' };

    if (!statement.isPressable) {
      return { success: false, messageKey: 'trial.cannot_press' };
    }

    if (this.state.pressedStatements.includes(statement.id)) {
      return { success: false, messageKey: 'trial.already_pressed' };
    }

    this.state.pressedStatements.push(statement.id);

    if (statement.pressReactionKey) {
      return {
        success: true,
        messageKey: statement.pressReactionKey,
      };
    }

    return { success: true, messageKey: 'trial.pressed' };
  }

  presentEvidence(evidenceId: string): TrialActionResult {
    const statement = this.getCurrentStatement();
    const phase = this.getCurrentPhase();
    if (!statement || !phase) return { success: false, messageKey: 'trial.no_statement' };

    const contradiction = phase.contradictions.find(c => c.statementId === statement.id && c.evidenceId === evidenceId);
    if (!contradiction) {
      this.state.health -= 1;
      const isGameOver = this.state.health <= 0;
      this.state.isGameOver = isGameOver;

      return {
        success: false,
        messageKey: 'trial.objection_overruled',
        healthDelta: -1,
        trialComplete: isGameOver,
        verdict: isGameOver ? 'guilty' : undefined,
      };
    }

    this.state.presentedEvidence.push(evidenceId);
    this.state.currentStatementIndex++;

    if (this.onFlagChange) {
      this.onFlagChange([{ flag: `trial_${phase.id}_${statement.id}_resolved`, operation: 'set', value: true }]);
    }

    const phaseComplete = this.state.currentStatementIndex >= phase.statements.length;
    if (phaseComplete) {
      this.state.currentPhaseIndex++;
      this.state.currentStatementIndex = 0;

      const trialComplete = this.state.currentPhaseIndex >= this.trialScript.phases.length;
      if (trialComplete) {
        this.state.isGameOver = true;
        this.state.verdict = 'not-guilty';
      }

      return {
        success: true,
        messageKey: contradiction.explanationKey,
        phaseComplete: true,
        trialComplete,
        verdict: trialComplete ? 'not-guilty' : undefined,
      };
    }

    return {
      success: true,
      messageKey: contradiction.explanationKey,
    };
  }

  getHealthPercentage(): number {
    return this.state.health / this.state.maxHealth;
  }

  canPresentEvidence(evidenceId: string): boolean {
    const statement = this.getCurrentStatement();
    const phase = this.getCurrentPhase();
    if (!statement || !phase) return false;

    return phase.contradictions.some(c => c.statementId === statement.id && c.evidenceId === evidenceId);
  }

  getCurrentPhaseType(): TrialPhaseType | null {
    const phase = this.getCurrentPhase();
    return phase?.type || null;
  }

  getWitnessId(): string | null {
    const phase = this.getCurrentPhase();
    return phase?.witnessId || null;
  }
}