import type { LocKey } from "../../localization";
import type { OfferOutcome, Testimony, TestimonyBlock } from "../state/types";
import type { MissCounter } from "./MissCounter";

export interface OfferResult {
  outcome: OfferOutcome;
  failureKey?: LocKey;
}

export interface ResolutionProgress {
  index: number;
  total: number;
}

const EMPTY: ResolutionProgress = { index: 0, total: 0 };

export class ResolutionEngine {
  private speakerIndex = 0;
  private blockIndex = 0;

  constructor(
    private readonly testimonies: Testimony[],
    private readonly misses: MissCounter,
  ) {}

  get isFinished(): boolean {
    return this.speakerIndex >= this.testimonies.length;
  }

  get current(): TestimonyBlock | null {
    const testimony = this.testimonies[this.speakerIndex];
    if (!testimony) return null;
    return testimony.blocks[this.blockIndex] ?? null;
  }

  get currentSpeaker(): string | null {
    return this.testimonies[this.speakerIndex]?.speaker ?? null;
  }

  get progress(): ResolutionProgress {
    const testimony = this.testimonies[this.speakerIndex];
    if (!testimony) return EMPTY;
    return { index: this.blockIndex + 1, total: testimony.blocks.length };
  }

  askBack(): LocKey | null {
    return this.current?.askBackKey ?? null;
  }

  offer(evidenceId: string): OfferResult {
    const block = this.current;
    if (!block) return { outcome: "wrong" };

    const gap = block.gap;
    const accepted =
      gap !== undefined && (evidenceId === gap.evidenceId || gap.acceptAnyOf.includes(evidenceId));
    if (accepted) {
      this.advance();
      return { outcome: "correct" };
    }

    const reachedLimit = this.misses.add();
    const failureKey = gap?.failKey;
    return reachedLimit
      ? { outcome: "gameover", ...(failureKey ? { failureKey } : {}) }
      : { outcome: "wrong", ...(failureKey ? { failureKey } : {}) };
  }

  advance(): boolean {
    const testimony = this.testimonies[this.speakerIndex];
    if (!testimony) return false;
    if (this.blockIndex + 1 < testimony.blocks.length) {
      this.blockIndex += 1;
      return true;
    }
    this.speakerIndex += 1;
    this.blockIndex = 0;
    return this.speakerIndex < this.testimonies.length;
  }
}
