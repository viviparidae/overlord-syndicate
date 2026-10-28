import { describe, expect, it } from "vitest";
import { InvestigationState } from "../../src/core/investigation/InvestigationState";
import type { Hotspot } from "../../src/core/state/types";

const hotspots: Hotspot[] = [
  {
    id: "hs_ledger",
    areaId: "west",
    kind: "inspect",
    labelKey: "ui.investigation.inspect",
    evidenceId: "ev_ledger_theft",
    x: 100,
    width: 20,
  },
  {
    id: "hs_slips",
    areaId: "west",
    kind: "inspect",
    labelKey: "ui.investigation.inspect",
    evidenceId: "ev_shop_receipt",
    insightOnly: true,
    x: 200,
    width: 20,
  },
  {
    id: "hs_door",
    areaId: "west",
    kind: "move",
    labelKey: "ui.investigation.inspect",
    x: 300,
    width: 20,
  },
];

describe("調査パート", () => {
  it("洞察視点を切ると洞察専用の対象は見えない", () => {
    const state = new InvestigationState(hotspots);

    const visible = state.visibleHotspots("west");

    expect(visible.map((h) => h.id)).toEqual(["hs_ledger", "hs_door"]);
  });

  it("洞察視点を入れると洞察専用の対象が見える", () => {
    const state = new InvestigationState(hotspots);
    state.toggleInsight();

    const visible = state.visibleHotspots("west");

    expect(visible.map((h) => h.id)).toEqual(["hs_ledger", "hs_slips", "hs_door"]);
  });

  it("調べると証拠が手に入る", () => {
    const state = new InvestigationState(hotspots);

    const result = state.interact("hs_ledger");

    expect(result.kind).toBe("evidence");
    expect(state.foundEvidence).toEqual(["ev_ledger_theft"]);
  });

  it("洞察視点なしでは洞察専用の対象を調べられない", () => {
    const state = new InvestigationState(hotspots);

    const result = state.interact("hs_slips");

    expect(result.kind).toBe("none");
    expect(state.foundEvidence).toEqual([]);
  });

  it("近くの対象を返す", () => {
    const state = new InvestigationState(hotspots);

    expect(state.hotspotNear("west", 105)?.id).toBe("hs_ledger");
    expect(state.hotspotNear("west", 150)).toBeNull();
  });
});
