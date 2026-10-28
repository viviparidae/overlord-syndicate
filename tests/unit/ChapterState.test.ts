import { describe, expect, it } from "vitest";
import { ChapterState } from "../../src/core/state/ChapterState";
import type { Hotspot, Testimony } from "../../src/core/state/types";

const hotspots: Hotspot[] = [
  {
    id: "h1",
    areaId: "a",
    kind: "inspect",
    labelKey: "ui.investigation.inspect",
    x: 10,
    width: 10,
  },
  {
    id: "h2",
    areaId: "a",
    kind: "inspect",
    labelKey: "ui.investigation.inspect",
    x: 40,
    width: 10,
  },
];

const testimonies: Testimony[] = [
  { id: "t", speaker: "goda", blocks: [{ id: "b1", textKey: "testimony.goda.01.text" }] },
];

function createState(): ChapterState {
  return new ChapterState({
    chapterId: "ch01",
    missLimit: 3,
    requiredEvidence: ["ev_ledger_theft", "ev_vhs_tape"],
    scale: 1,
    venueKey: "venue.assembly",
    roleKey: "role.summarizer",
    hotspots,
    testimonies,
  });
}

describe("章の進行", () => {
  it("導入から調査へ進める", () => {
    const state = createState();

    const error = state.startInvestigation();

    expect(error).toBeNull();
    expect(state.phase).toBe("investigation");
  });

  it("調査の前に弁論へは進めない", () => {
    const state = createState();

    const error = state.startResolution();

    expect(error?.code).toBe("invalid-transition");
    expect(state.phase).toBe("intro");
  });

  it("必須証拠が揃うまで弁論を始められない", () => {
    const state = createState();
    state.startInvestigation();
    state.collectEvidence("ev_ledger_theft");

    const error = state.startResolution();

    expect(error?.code).toBe("missing-evidence");
    expect(state.missingRequiredEvidence).toEqual(["ev_vhs_tape"]);
  });

  it("必須証拠が揃えば弁論を始められる", () => {
    const state = createState();
    state.startInvestigation();
    state.collectEvidence("ev_ledger_theft");
    state.collectEvidence("ev_vhs_tape");

    const error = state.startResolution();

    expect(error).toBeNull();
    expect(state.phase).toBe("resolution");
    expect(state.resolution).not.toBeNull();
  });

  it("調査中でなければ証拠を集められない", () => {
    const state = createState();

    expect(state.collectEvidence("ev_ledger_theft")).toBe(false);
    expect(state.evidence).toEqual([]);
  });

  it("同じ証拠は二度集められない", () => {
    const state = createState();
    state.startInvestigation();

    expect(state.collectEvidence("ev_ledger_theft")).toBe(true);
    expect(state.collectEvidence("ev_ledger_theft")).toBe(false);
  });

  it("ミスが上限に達するとゲームオーバーと判定される", () => {
    const state = createState();
    state.addMiss();
    state.addMiss();
    state.addMiss();

    expect(state.isGameOver()).toBe(true);
  });

  it("リトライするとミスが0に戻る", () => {
    const state = createState();
    state.startInvestigation();
    state.collectEvidence("ev_ledger_theft");
    state.collectEvidence("ev_vhs_tape");
    state.startResolution();
    state.addMiss();

    state.retryResolution();

    expect(state.misses.count).toBe(0);
  });
});
