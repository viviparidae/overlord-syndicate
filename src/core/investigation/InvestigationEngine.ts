import { ScenarioEngine } from '../scenario/ScenarioEngine';
import { Location, InvestigationState, DialogueNode, DialogueChoice } from '../scenario/Scenario';

export interface InvestigationAction {
  type: 'move' | 'examine' | 'talk' | 'present' | 'deduce';
  targetId: string;
  evidenceId?: string;
}

export interface ExaminationResult {
  success: boolean;
  messageKey: string;
  obtainedEvidence?: string[];
  flags?: Record<string, boolean | number | string>;
}

export class InvestigationEngine {
  private scenarioEngine: ScenarioEngine;

  constructor(scenarioEngine: ScenarioEngine) {
    this.scenarioEngine = scenarioEngine;
  }

  getCurrentLocation(): Location | null {
    return this.scenarioEngine.getCurrentLocation();
  }

  getConnectedLocations(): Location[] {
    const current = this.getCurrentLocation();
    if (!current) return [];

    const scenario = this.scenarioEngine.getScenario();
    return current.connectedLocations
      .map(id => scenario.locations[id])
      .filter((loc): loc is Location => loc !== undefined && loc.isUnlocked);
  }

  getAvailableCharacters(): string[] {
    const current = this.getCurrentLocation();
    if (!current) return [];

    const scenario = this.scenarioEngine.getScenario();
    return current.nodes
      .map(nodeId => scenario.dialogueNodes[nodeId])
      .filter((node): node is DialogueNode => node !== undefined)
      .map(node => node.speakerId)
      .filter((id, index, arr) => arr.indexOf(id) === index);
  }

  startDialogue(characterId: string): DialogueNode | null {
    const current = this.getCurrentLocation();
    if (!current) return null;

    const scenario = this.scenarioEngine.getScenario();
    const nodeId = current.nodes.find(nodeId => {
      const node = scenario.dialogueNodes[nodeId];
      return node?.speakerId === characterId;
    });

    if (!nodeId) return null;

    this.scenarioEngine.advanceToNode(nodeId);
    return this.scenarioEngine.getCurrentNode();
  }

  getCurrentDialogue(): DialogueNode | null {
    return this.scenarioEngine.getCurrentNode();
  }

  getDialogueChoices(): DialogueChoice[] {
    return this.scenarioEngine.getAvailableChoices() || [];
  }

  selectChoice(choiceId: string): boolean {
    const choices = this.getDialogueChoices();
    const choice = choices.find(c => c.id === choiceId);
    if (!choice) return false;

    if (choice.effects) {
      // Effects applied by advanceToNode
    }

    return this.scenarioEngine.advanceToNode(choice.targetNodeId, choice.effects);
  }

  examine(targetId: string): ExaminationResult {
    const scenario = this.scenarioEngine.getScenario();
    const current = this.getCurrentLocation();
    if (!current) return { success: false, messageKey: 'investigation.no_location' };

    const node = scenario.dialogueNodes[targetId];
    if (!node) return { success: false, messageKey: 'investigation.not_found' };

    const obtainedEvidence: string[] = [];
    const flags: Record<string, boolean | number | string> = {};

    if (node.onEnter) {
      node.onEnter.forEach(flag => {
        flags[flag] = true;
        // Check if this flag triggers evidence
        Object.values(scenario.evidence).forEach(evidence => {
          if (evidence.relatedFlags?.includes(flag) && !evidence.isObtained) {
            this.scenarioEngine.obtainEvidence(evidence.id);
            obtainedEvidence.push(evidence.id);
          }
        });
      });
    }

    return {
      success: true,
      messageKey: node.textKey,
      obtainedEvidence: obtainedEvidence.length > 0 ? obtainedEvidence : undefined,
      flags: Object.keys(flags).length > 0 ? flags : undefined,
    };
  }

  presentEvidence(evidenceId: string, targetCharacterId: string): ExaminationResult {
    const state = this.scenarioEngine.getState();
    if (!state.obtainedEvidence.includes(evidenceId)) {
      return { success: false, messageKey: 'investigation.not_obtained' };
    }

    const scenario = this.scenarioEngine.getScenario();
    const evidence = scenario.evidence[evidenceId];
    if (!evidence || !evidence.canPresent) {
      return { success: false, messageKey: 'investigation.cannot_present' };
    }

    const currentNode = this.scenarioEngine.getCurrentNode();
    if (!currentNode || currentNode.speakerId !== targetCharacterId) {
      return { success: false, messageKey: 'investigation.wrong_target' };
    }

    const choice = currentNode.choices?.find(c => c.evidenceId === evidenceId && c.isObjection);
    if (choice) {
      this.selectChoice(choice.id);
      return { success: true, messageKey: 'investigation.presented_success' };
    }

    return { success: false, messageKey: 'investigation.no_reaction' };
  }

  deduce(): ExaminationResult {
    const state = this.scenarioEngine.getState();
    const scenario = this.scenarioEngine.getScenario();

    const newDeductions = Object.values(scenario.evidence).filter(e =>
      e.relatedFlags?.some(flag => state.flags[flag]) &&
      !state.obtainedEvidence.includes(e.id)
    );

    if (newDeductions.length > 0) {
      newDeductions.forEach(e => this.scenarioEngine.obtainEvidence(e.id));
      return {
        success: true,
        messageKey: 'investigation.deduction_success',
        obtainedEvidence: newDeductions.map(e => e.id),
      };
    }

    return { success: false, messageKey: 'investigation.nothing_new' };
  }

  canProceedToTrial(): boolean {
    const scenario = this.scenarioEngine.getScenario();
    const requiredEvidence = Object.values(scenario.evidence)
      .filter(e => e.category === 'document' || e.category === 'item')
      .map(e => e.id);

    return requiredEvidence.every(id => this.scenarioEngine.hasEvidence(id));
  }

  getState(): Readonly<InvestigationState> {
    return this.scenarioEngine.getState();
  }

  addPlaytime(seconds: number): void {
    this.scenarioEngine.addPlaytime(seconds);
  }
}