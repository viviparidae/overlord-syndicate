import type { Hotspot, InteractionResult } from "../state/types";
import type { LocKey } from "../../localization";

export class InvestigationState {
  private insight = false;
  private readonly found = new Set<string>();

  constructor(private readonly hotspots: Hotspot[]) {}

  get isInsightOn(): boolean {
    return this.insight;
  }

  toggleInsight(): boolean {
    this.insight = !this.insight;
    return this.insight;
  }

  isVisible(hotspot: Hotspot): boolean {
    return !hotspot.insightOnly || this.insight;
  }

  visibleHotspots(areaId: string): Hotspot[] {
    return this.hotspots.filter((h) => h.areaId === areaId && this.isVisible(h));
  }

  hotspotNear(areaId: string, x: number): Hotspot | null {
    const candidates = this.visibleHotspots(areaId).filter(
      (h) => x >= h.x - 8 && x <= h.x + h.width + 8,
    );
    return candidates[0] ?? null;
  }

  interact(hotspotId: string): InteractionResult {
    const hotspot = this.hotspots.find((h) => h.id === hotspotId);
    if (!hotspot || !this.isVisible(hotspot)) return { kind: "none" };
    if (hotspot.kind === "move") {
      return { kind: "move", areaId: hotspot.areaId };
    }
    if (hotspot.kind === "locked") {
      return hotspot.textKey ? { kind: "text", textKey: hotspot.textKey } : { kind: "none" };
    }
    if (hotspot.evidenceId) {
      const first = !this.found.has(hotspot.evidenceId);
      this.found.add(hotspot.evidenceId);
      return {
        kind: "evidence",
        evidenceId: hotspot.evidenceId,
        ...(hotspot.textKey && first ? { textKey: hotspot.textKey } : {}),
      };
    }
    return hotspot.textKey ? { kind: "text", textKey: hotspot.textKey } : { kind: "none" };
  }

  get foundEvidence(): string[] {
    return [...this.found];
  }
}

export function hotspotLabelKey(hotspot: Hotspot): LocKey {
  return hotspot.labelKey;
}
