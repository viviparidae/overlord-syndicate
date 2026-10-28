import type { Hotspot, InteractionResult } from "../state/types";

export class InvestigationState {
  private readonly found = new Set<string>();

  constructor(private readonly hotspots: Hotspot[]) {}

  visibleHotspots(areaId: string): Hotspot[] {
    return this.hotspots.filter((h) => h.areaId === areaId);
  }

  hotspotNear(areaId: string, x: number): Hotspot | null {
    const candidates = this.visibleHotspots(areaId).filter(
      (h) => x >= h.x - 8 && x <= h.x + h.width + 8,
    );
    const actionable = candidates.filter(
      (h) => h.evidenceId !== undefined || h.textKey !== undefined,
    );
    if (actionable.length === 0) return null;
    return actionable.reduce((a, b) => {
      const da = Math.abs(a.x + a.width / 2 - x);
      const db = Math.abs(b.x + b.width / 2 - x);
      return da <= db ? a : b;
    });
  }

  interact(hotspotId: string): InteractionResult {
    const hotspot = this.hotspots.find((h) => h.id === hotspotId);
    if (!hotspot) return { kind: "none" };
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
