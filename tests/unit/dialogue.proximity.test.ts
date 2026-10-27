import type { NpcSnapshot } from "@core/dialogue/proximity";
import { findNearestNpc } from "@core/dialogue/proximity";
import { describe, expect, it } from "vitest";

function npc(x: number, id: string): NpcSnapshot {
  return { id, x };
}

describe("findNearestNpc", () => {
  it("64px以内で最寄りNPCを返す", () => {
    const npcs = [npc(320, "npc_child"), npc(480, "npc_housewife")];
    const result = findNearestNpc(320, npcs);
    expect(result).not.toBeNull();
    expect(result).toBe("npc_child");
  });

  it("範囲外ならnullを返す", () => {
    const npcs = [npc(320, "npc_child")];
    expect(findNearestNpc(200, npcs)).toBeNull();
    expect(findNearestNpc(400, npcs)).toBeNull();
  });

  it("複数NPCの中から距離が近い方を選ぶ", () => {
    const npcs = [npc(300, "npc_child"), npc(400, "npc_housewife")];
    expect(findNearestNpc(340, npcs)).toBe("npc_child");
    expect(findNearestNpc(360, npcs)).toBe("npc_housewife");
  });

  it("NPCが空ならnullを返す", () => {
    expect(findNearestNpc(160, [])).toBeNull();
  });

  it("距離が等しい場合は先頭のNPCを返す", () => {
    const npcs = [npc(320, "npc_child"), npc(480, "npc_housewife")];
    // 400 は両方とも 80px 離れている（範囲外）
    expect(findNearestNpc(400, npcs)).toBeNull();
  });
});
