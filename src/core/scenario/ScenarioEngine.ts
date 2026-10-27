import { ScenarioData, DialogueNode, Location, FlagCondition, FlagEffect, InvestigationState } from './Scenario';

export class ScenarioEngine {
  private scenario: ScenarioData;
  private state: InvestigationState;
  private currentNodeId: string;

  constructor(scenario: ScenarioData) {
    this.scenario = scenario;
    this.currentNodeId = scenario.startNodeId;
    this.state = this.createInitialState();
  }

  private createInitialState(): InvestigationState {
    return {
      currentLocationId: Object.keys(this.scenario.locations)[0] || '',
      visitedLocations: [],
      obtainedEvidence: [],
      talkedCharacters: {},
      flags: { ...this.scenario.flags },
      playtimeSeconds: 0,
    };
  }

  getCurrentNode(): DialogueNode | null {
    return this.scenario.dialogueNodes[this.currentNodeId] || null;
  }

  getCurrentLocation(): Location | null {
    return this.scenario.locations[this.state.currentLocationId] || null;
  }

  getAvailableChoices(): DialogueNode['choices'] {
    const node = this.getCurrentNode();
    if (!node?.choices) return [];

    return node.choices.filter(choice => this.evaluateConditions(choice.conditions));
  }

  evaluateConditions(conditions?: FlagCondition[]): boolean {
    if (!conditions || conditions.length === 0) return true;

    return conditions.every(cond => {
      const flagValue = this.state.flags[cond.flag];
      if (flagValue === undefined) return false;

      switch (cond.operator) {
        case 'eq': return flagValue === cond.value;
        case 'neq': return flagValue !== cond.value;
        case 'gt': return Number(flagValue) > Number(cond.value);
        case 'gte': return Number(flagValue) >= Number(cond.value);
        case 'lt': return Number(flagValue) < Number(cond.value);
        case 'lte': return Number(flagValue) <= Number(cond.value);
        case 'has': return Boolean(flagValue);
        case 'lacks': return !Boolean(flagValue);
        default: return false;
      }
    });
  }

  applyEffects(effects?: FlagEffect[]): void {
    if (!effects) return;

    effects.forEach(effect => {
      const current = this.state.flags[effect.flag];
      switch (effect.operation) {
        case 'set':
          this.state.flags[effect.flag] = effect.value;
          break;
        case 'add':
          this.state.flags[effect.flag] = (Number(current) || 0) + Number(effect.value);
          break;
        case 'sub':
          this.state.flags[effect.flag] = (Number(current) || 0) - Number(effect.value);
          break;
        case 'toggle':
          this.state.flags[effect.flag] = !Boolean(current);
          break;
      }
    });
  }

  advanceToNode(nodeId: string, effects?: FlagEffect[]): boolean {
    const targetNode = this.scenario.dialogueNodes[nodeId];
    if (!targetNode) return false;

    if (effects) this.applyEffects(effects);

    const currentNode = this.getCurrentNode();
    if (currentNode?.onExit) {
      currentNode.onExit.forEach(flag => this.applyEffects([{ flag, operation: 'set', value: true }]));
    }

    this.currentNodeId = nodeId;

    if (targetNode.onEnter) {
      targetNode.onEnter.forEach(flag => this.applyEffects([{ flag, operation: 'set', value: true }]));
    }

    this.updateTalkedCharacters(targetNode.speakerId);
    return true;
  }

  private updateTalkedCharacters(speakerId: string): void {
    if (!this.state.talkedCharacters[speakerId]) {
      this.state.talkedCharacters[speakerId] = [];
    }
    if (!this.state.talkedCharacters[speakerId].includes(this.currentNodeId)) {
      this.state.talkedCharacters[speakerId].push(this.currentNodeId);
    }
  }

  obtainEvidence(evidenceId: string): boolean {
    const evidence = this.scenario.evidence[evidenceId];
    if (!evidence || evidence.isObtained) return false;

    evidence.isObtained = true;
    evidence.obtainedAtNodeId = this.currentNodeId;
    this.state.obtainedEvidence.push(evidenceId);
    return true;
  }

  hasEvidence(evidenceId: string): boolean {
    return this.state.obtainedEvidence.includes(evidenceId);
  }

  moveToLocation(locationId: string): boolean {
    const location = this.scenario.locations[locationId];
    if (!location || !location.isUnlocked) return false;

    const currentLoc = this.getCurrentLocation();
    if (currentLoc && !currentLoc.connectedLocations.includes(locationId)) {
      return false;
    }

    this.state.currentLocationId = locationId;
    if (!this.state.visitedLocations.includes(locationId)) {
      this.state.visitedLocations.push(locationId);
    }
    return true;
  }

  unlockLocation(locationId: string): void {
    if (this.scenario.locations[locationId]) {
      this.scenario.locations[locationId].isUnlocked = true;
    }
  }

  getState(): Readonly<InvestigationState> {
    return { ...this.state };
  }

  getScenario(): Readonly<ScenarioData> {
    return this.scenario;
  }

  addPlaytime(seconds: number): void {
    this.state.playtimeSeconds += seconds;
  }
}