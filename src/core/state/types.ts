import type { LocKey } from "../../localization";

export type ChapterPhase = "intro" | "investigation" | "resolution" | "epilogue" | "cleared";

export type OfferOutcome = "correct" | "wrong" | "gameover";

export interface EvidenceItem {
  id: string;
  nameKey: LocKey;
  descKey: LocKey;
  icon: string;
}

export interface Gap {
  evidenceId: string;
  acceptAnyOf: string[];
  successKey: LocKey;
  failKey: LocKey;
}

export interface TestimonyBlock {
  id: string;
  textKey: LocKey;
  askBackKey?: LocKey;
  gap?: Gap;
}

export interface Testimony {
  id: string;
  speaker: string;
  blocks: TestimonyBlock[];
}

export type HotspotKind = "inspect" | "talk" | "move" | "locked";

export interface Hotspot {
  id: string;
  areaId: string;
  kind: HotspotKind;
  labelKey: LocKey;
  textKey?: LocKey;
  evidenceId?: string;
  insightOnly?: boolean;
  x: number;
  width: number;
}

export type InteractionResult =
  | { kind: "evidence"; evidenceId: string; textKey?: LocKey }
  | { kind: "text"; textKey: LocKey }
  | { kind: "move"; areaId: string }
  | { kind: "none" };

export type TransitionErrorCode = "invalid-transition" | "missing-evidence";

export class TransitionError extends Error {
  constructor(readonly code: TransitionErrorCode) {
    super(code);
    this.name = "TransitionError";
  }
}
