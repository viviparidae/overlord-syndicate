import { MissCounter } from "../resolution/MissCounter";
import { ResolutionEngine } from "../resolution/ResolutionEngine";
import { InvestigationState } from "../investigation/InvestigationState";
import type { ChapterPhase, Hotspot, Testimony, TransitionErrorCode } from "./types";
import { TransitionError } from "./types";

export interface ChapterInit {
  chapterId: string;
  missLimit: number;
  requiredEvidence: string[];
  scale: 1 | 2 | 3 | 4;
  venueKey: string;
  roleKey: string;
  hotspots: Hotspot[];
  testimonies: Testimony[];
}

export class ChapterState {
  private phaseValue: ChapterPhase = "intro";
  private readonly evidenceIds = new Set<string>();
  private readonly flagMap = new Map<string, boolean>();
  private readonly missCounter: MissCounter;
  private investigationState: InvestigationState;
  private resolutionEngine: ResolutionEngine | null = null;

  constructor(readonly init: ChapterInit) {
    this.missCounter = new MissCounter(init.missLimit);
    this.investigationState = new InvestigationState(init.hotspots);
  }

  get phase(): ChapterPhase {
    return this.phaseValue;
  }

  get misses(): MissCounter {
    return this.missCounter;
  }

  get investigation(): InvestigationState {
    return this.investigationState;
  }

  get resolution(): ResolutionEngine | null {
    return this.resolutionEngine;
  }

  get evidence(): string[] {
    return [...this.evidenceIds];
  }

  hasEvidence(id: string): boolean {
    return this.evidenceIds.has(id);
  }

  get missingRequiredEvidence(): string[] {
    return this.init.requiredEvidence.filter((id) => !this.evidenceIds.has(id));
  }

  get canStartResolution(): boolean {
    return this.missingRequiredEvidence.length === 0;
  }

  flag(name: string): boolean {
    return this.flagMap.get(name) ?? false;
  }

  setFlag(name: string, value = true): void {
    this.flagMap.set(name, value);
  }

  startInvestigation(): TransitionError | null {
    if (this.phaseValue !== "intro") {
      return new TransitionError("invalid-transition");
    }
    this.phaseValue = "investigation";
    return null;
  }

  collectEvidence(id: string): boolean {
    if (this.phaseValue !== "investigation") return false;
    if (this.evidenceIds.has(id)) return false;
    this.evidenceIds.add(id);
    return true;
  }

  startResolution(): TransitionError | null {
    if (this.phaseValue !== "investigation") {
      return new TransitionError("invalid-transition");
    }
    if (!this.canStartResolution) {
      return new TransitionError("missing-evidence");
    }
    this.phaseValue = "resolution";
    this.resolutionEngine = new ResolutionEngine(this.init.testimonies, this.missCounter);
    return null;
  }

  addMiss(): boolean {
    return this.missCounter.add();
  }

  retryResolution(): void {
    this.missCounter.reset();
    this.resolutionEngine = new ResolutionEngine(this.init.testimonies, this.missCounter);
  }

  finishResolution(): TransitionError | null {
    if (this.phaseValue !== "resolution") {
      return new TransitionError("invalid-transition");
    }
    if (!this.resolutionEngine?.isFinished) {
      return new TransitionError("invalid-transition");
    }
    this.phaseValue = "epilogue";
    return null;
  }

  clearChapter(): TransitionError | null {
    if (this.phaseValue !== "epilogue") {
      return new TransitionError("invalid-transition");
    }
    this.phaseValue = "cleared";
    return null;
  }

  isGameOver(): boolean {
    return this.missCounter.isLimitReached;
  }

  errorCode(error: TransitionError | null): TransitionErrorCode | null {
    return error?.code ?? null;
  }
}
