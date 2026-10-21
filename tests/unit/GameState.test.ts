import { GameState } from "@core/GameState";
import { describe, expect, it } from "vitest";

describe("GameState", () => {
  it("starts at phase 1", () => {
    const state = new GameState();
    expect(state.phase).toBe(1);
  });

  it("advances phase correctly", () => {
    const state = new GameState();
    state.advance();
    expect(state.phase).toBe(2);
    state.advance();
    expect(state.phase).toBe(3);
    state.advance();
    expect(state.phase).toBe(4);
  });

  it("does not advance beyond phase 4", () => {
    const state = new GameState();
    state.setPhase(4);
    state.advance();
    expect(state.phase).toBe(4);
  });

  it("snapshot/restore preserves state", () => {
    const state = new GameState(999);
    state.setPhase(3);
    state.setFlag("shopEstablished", true);
    const snap = state.snapshot();
    const state2 = new GameState();
    state2.restore(snap);
    expect(state2.phase).toBe(3);
    expect(state2.seed).toBe(999);
    expect(state2.getFlag("shopEstablished")).toBe(true);
  });

  it("canAdvanceTo returns correct values", () => {
    const state = new GameState();
    expect(state.canAdvanceTo(2)).toBe(true);
    expect(state.canAdvanceTo(1)).toBe(false);
    expect(state.canAdvanceTo(4)).toBe(true);
  });
});
