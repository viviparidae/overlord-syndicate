import assets from "@data/assets.json";
import { NPC_POSITIONS } from "@phaser/scenes/npc-config";
import { describe, expect, it } from "vitest";

/**
 * Guards the sprite-assignment bug where サラリーマン was drawn with the
 * housewife atlas and 悪徳地主 with another character's sheet: every NPC's
 * configured key must exist in the asset manifest, and each must be distinct.
 */
describe("NPC sprite assignment", () => {
  const assetKeys = assets.assets.map((a) => a.key);

  it("uses only keys declared in the asset manifest", () => {
    for (const npc of NPC_POSITIONS) {
      expect(assetKeys, `NPC "${npc.label}" uses unknown asset key "${npc.key}"`).toContain(
        npc.key,
      );
    }
  });

  it("maps each NPC to a distinct texture", () => {
    const keys = NPC_POSITIONS.map((npc) => npc.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("has a dedicated salaryman and landlord texture", () => {
    expect(assetKeys).toContain("npc_salaryman");
    expect(assetKeys).toContain("npc_landlord");
  });

  it("keeps the label-to-key pairing from drifting", () => {
    expect(NPC_POSITIONS.find((n) => n.label === "サラリーマン")?.key).toBe("npc_salaryman");
    expect(NPC_POSITIONS.find((n) => n.label === "悪徳地主")?.key).toBe("npc_landlord");
    expect(NPC_POSITIONS.find((n) => n.label === "子供")?.key).toBe("npc_child");
    expect(NPC_POSITIONS.find((n) => n.label === "主婦")?.key).toBe("npc_housewife");
  });

  it("places NPCs left-to-right in ascending x order", () => {
    const xs = NPC_POSITIONS.map((n) => n.x);
    expect(new Set(xs).size).toBe(xs.length);
    expect([...xs].sort((a, b) => a - b)).toEqual(xs);
  });
});
