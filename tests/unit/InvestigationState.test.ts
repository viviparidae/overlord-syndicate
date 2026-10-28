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
  it("エリア内の対象をすべて返す", () => {
    const state = new InvestigationState(hotspots);

    expect(state.visibleHotspots("west").map((h) => h.id)).toEqual([
      "hs_ledger",
      "hs_slips",
      "hs_door",
    ]);
  });

  it("調べると証拠が手に入る", () => {
    const state = new InvestigationState(hotspots);

    const result = state.interact("hs_ledger");

    expect(result.kind).toBe("evidence");
    expect(state.foundEvidence).toEqual(["ev_ledger_theft"]);
  });

  it("近くの対象を返す", () => {
    const state = new InvestigationState(hotspots);

    expect(state.hotspotNear("west", 105)?.id).toBe("hs_ledger");
    expect(state.hotspotNear("west", 150)).toBeNull();
  });

  it("重なった対象では中心が近い方を返す", () => {
    const state = new InvestigationState(hotspots);

    expect(state.hotspotNear("west", 208)?.id).toBe("hs_slips");
  });

  it("移動ホットスポットは移動結果を返す", () => {
    const state = new InvestigationState(hotspots);

    expect(state.interact("hs_door")).toEqual({ kind: "move", areaId: "west" });
  });
});
