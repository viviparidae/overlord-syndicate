export type PhaseType = 'story' | 'investigation' | 'trial' | 'resolution';

export interface ScenarioMetadata {
  id: string;
  title: string;
  chapter: number;
  phase: PhaseType;
  estimatedDurationMinutes: number;
}

export interface FlagCondition {
  flag: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'has' | 'lacks';
  value: boolean | number | string;
}

export interface BranchCondition {
  id: string;
  conditions: FlagCondition[];
  targetNodeId: string;
  priority: number;
}

export interface DialogueNode {
  id: string;
  speakerId: string;
  textKey: string;
  portrait?: string;
  background?: string;
  choices?: DialogueChoice[];
  autoAdvance?: boolean;
  delayMs?: number;
  onEnter?: string[];
  onExit?: string[];
}

export interface DialogueChoice {
  id: string;
  textKey: string;
  targetNodeId: string;
  conditions?: FlagCondition[];
  effects?: FlagEffect[];
  isObjection?: boolean;
  evidenceId?: string;
}

export interface FlagEffect {
  flag: string;
  operation: 'set' | 'add' | 'sub' | 'toggle';
  value: boolean | number | string;
}

export interface Evidence {
  id: string;
  nameKey: string;
  descriptionKey: string;
  iconPath: string;
  category: 'document' | 'item' | 'testimony' | 'profile' | 'other';
  isObtained: boolean;
  obtainedAtNodeId?: string;
  canPresent: boolean;
  relatedFlags?: string[];
}

export interface Location {
  id: string;
  nameKey: string;
  backgroundPath: string;
  musicKey?: string;
  nodes: string[];
  connectedLocations: string[];
  isUnlocked: boolean;
}

export interface CharacterProfile {
  id: string;
  nameKey: string;
  descriptionKey: string;
  portraitPath: string;
  relationship: 'ally' | 'neutral' | 'hostile' | 'unknown';
  knownFacts: string[];
  unlockConditions?: FlagCondition[];
}

export interface ScenarioData {
  metadata: ScenarioMetadata;
  flags: Record<string, boolean | number | string>;
  dialogueNodes: Record<string, DialogueNode>;
  branchConditions: BranchCondition[];
  evidence: Record<string, Evidence>;
  locations: Record<string, Location>;
  characters: Record<string, CharacterProfile>;
  startNodeId: string;
  trialScriptId?: string;
}

export interface TrialScript {
  id: string;
  title: string;
  phases: TrialPhase[];
}

export interface TrialPhase {
  id: string;
  type: 'testimony' | 'cross-examination' | 'rebuttal' | 'verdict';
  witnessId: string;
  statements: TrialStatement[];
  contradictions: Contradiction[];
}

export interface TrialStatement {
  id: string;
  textKey: string;
  evidenceId?: string;
  isPressable: boolean;
  pressReactionKey?: string;
}

export interface Contradiction {
  statementId: string;
  evidenceId: string;
  explanationKey: string;
  penaltyOnFail: number;
}

export interface InvestigationState {
  currentLocationId: string;
  visitedLocations: string[];
  obtainedEvidence: string[];
  talkedCharacters: Record<string, string[]>;
  flags: Record<string, boolean | number | string>;
  playtimeSeconds: number;
}