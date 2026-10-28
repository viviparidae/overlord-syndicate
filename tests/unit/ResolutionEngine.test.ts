import { describe, expect, it } from "vitest";
import { MissCounter } from "../../src/core/resolution/MissCounter";
import { ResolutionEngine } from "../../src/core/resolution/ResolutionEngine";
import type { Testimony } from "../../src/core/state/types";

const testimonies: Testimony[] = [
  {
    id: "t_a",
    speaker: "goda",
    blocks: [
      { id: "a1", textKey: "testimony.goda.01.text" },
      {
        id: "a2",
        textKey: "testimony.goda.02.text",
        askBackKey: "testimony.goda.02.askBack",
        gap: {
          evidenceId: "ev_vhs_tape",
          acceptAnyOf: [],
          successKey: "testimony.goda.02.success",
          failKey: "testimony.goda.02.fail",
        },
      },
    ],
  },
  {
    id: "t_b",
    speaker: "wataru",
    blocks: [{ id: "b1", textKey: "testimony.wataru.01.text" }],
  },
];

describe("弁論の進行", () => {
  it("正しい証拠を差し出すと次の証言へ進む", () => {
    const engine = new ResolutionEngine(testimonies, new MissCounter(3));
    engine.advance();

    const result = engine.offer("ev_vhs_tape");

    expect(result.outcome).toBe("correct");
    expect(engine.current?.id).toBe("b1");
  });

  it("誤った証拠を差し出すとミスが増え、同じ証言に留まる", () => {
    const misses = new MissCounter(3);
    const engine = new ResolutionEngine(testimonies, misses);
    engine.advance();

    const result = engine.offer("ev_ledger_theft");

    expect(result.outcome).toBe("wrong");
    expect(misses.count).toBe(1);
    expect(engine.current?.id).toBe("a2");
  });

  it("ミスが上限に達するとゲームオーバーになる", () => {
    const misses = new MissCounter(1);
    const engine = new ResolutionEngine(testimonies, misses);
    engine.advance();

    const result = engine.offer("ev_ledger_theft");

    expect(result.outcome).toBe("gameover");
    expect(misses.isLimitReached).toBe(true);
  });

  it("ほころびのない証言に差し出すとミスになる", () => {
    const misses = new MissCounter(3);
    const engine = new ResolutionEngine(testimonies, misses);

    const result = engine.offer("ev_vhs_tape");

    expect(result.outcome).toBe("wrong");
    expect(misses.count).toBe(1);
  });

  it("問い返しのテキストは証言ブロックが持つ", () => {
    const engine = new ResolutionEngine(testimonies, new MissCounter(3));

    expect(engine.askBack()).toBeNull();

    engine.advance();

    expect(engine.askBack()).toBe("testimony.goda.02.askBack");
  });

  it("最後の証言を抜けると終了状態になる", () => {
    const engine = new ResolutionEngine(testimonies, new MissCounter(3));

    engine.advance();
    engine.offer("ev_vhs_tape");
    engine.advance();

    expect(engine.isFinished).toBe(true);
    expect(engine.current).toBeNull();
  });
});
