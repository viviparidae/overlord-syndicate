import { GameState } from "@core/GameState";
import { describe, expect, it } from "vitest";

describe("GameState", () => {
  it("フェーズ1から開始する", () => {
    const state = new GameState();
    expect(state.phase).toBe(1);
  });

  it("フェーズを正しく進める", () => {
    const state = new GameState();
    state.advance();
    expect(state.phase).toBe(2);
    state.advance();
    expect(state.phase).toBe(3);
    state.advance();
    expect(state.phase).toBe(4);
  });

  it("フェーズ4より先には進まない", () => {
    const state = new GameState();
    state.setPhase(4);
    state.advance();
    expect(state.phase).toBe(4);
  });

  it("スナップショットから復元しても状態が保たれる", () => {
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

  it("昇格可否の判定が正しい", () => {
    const state = new GameState();
    expect(state.canAdvanceTo(2)).toBe(true);
    expect(state.canAdvanceTo(1)).toBe(false);
    expect(state.canAdvanceTo(4)).toBe(true);
  });

  it("gameOver フラグがスナップショットから復元される", () => {
    const state = new GameState();
    state.markGameOver();
    expect(state.isGameOver()).toBe(true);
    const snap = state.snapshot();
    expect(snap.gameOver).toBe(true);

    const state2 = new GameState();
    state2.restore(snap);
    expect(state2.isGameOver()).toBe(true);
  });

  it("ゲームオーバーを解除できる", () => {
    const state = new GameState();
    expect(state.isGameOver()).toBe(false);
    state.markGameOver();
    expect(state.isGameOver()).toBe(true);
    expect(state.snapshot().gameOver).toBe(true);
  });
});
