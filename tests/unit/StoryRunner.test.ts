import { describe, expect, it } from "vitest";
import { StoryRunner } from "../../src/core/story/StoryRunner";

describe("ストーリー送り", () => {
  it("最初は先頭の行を返す", () => {
    const runner = new StoryRunner(["intro.01", "intro.02"]);

    expect(runner.current).toBe("intro.01");
  });

  it("送ると次の行へ進む", () => {
    const runner = new StoryRunner(["intro.01", "intro.02"]);

    runner.next();

    expect(runner.current).toBe("intro.02");
  });

  it("最後まで送ると終了する", () => {
    const runner = new StoryRunner(["intro.01"]);
    runner.next();

    expect(runner.isDone).toBe(true);
    expect(runner.current).toBeNull();
  });

  it("既読の行はまとめて飛ばせる", () => {
    const runner = new StoryRunner(
      ["intro.01", "intro.02", "intro.03"],
      new Set(["intro.01", "intro.02"]),
    );

    const skipped = runner.skipSeen();

    expect(skipped).toBe(2);
    expect(runner.current).toBe("intro.03");
  });
});
