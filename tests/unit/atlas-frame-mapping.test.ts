import { readFileSync } from "node:fs";
import { join } from "node:path";
import assets from "@data/assets.json";
import { NPC_POSITIONS } from "@phaser/scenes/npc-config";
import { describe, expect, it } from "vitest";

/**
 * Verifies the mapping between the animation keys requested at runtime and the
 * frames that actually exist in the shipped atlases. A wrong frame name shows up
 * as a blank sprite at runtime, which type checking cannot catch.
 */
const PROJECT_ROOT = process.cwd();

type Frame = { frame: { x: number; y: number; w: number; h: number } };
type Asset = { key: string; type: string; atlas?: string };

function loadAtlas(atlasPath: string): Record<string, Frame> {
  const file = join(PROJECT_ROOT, "public", atlasPath);
  return (JSON.parse(readFileSync(file, "utf8")) as { frames: Record<string, Frame> }).frames;
}

const atlases = new Map<string, Record<string, Frame>>();
for (const asset of assets.assets as Asset[]) {
  if (asset.type === "atlas" && asset.atlas) {
    atlases.set(asset.key, loadAtlas(asset.atlas));
  }
}

describe("Atlas frame mapping", () => {
  it("registers a walk animation key for the player and every NPC", () => {
    const animationKeys = [...atlases.keys()].map((key) => `${key}_walk`);
    expect(animationKeys).toContain("player_walk");
    for (const npc of NPC_POSITIONS) {
      expect(animationKeys, `${npc.label} walk key`).toContain(`${npc.key}_walk`);
    }
  });

  it("has the frame Player/NPCs request at construction and on idle", () => {
    for (const [key, frames] of atlases) {
      expect(Object.keys(frames), `${key} start frame`).toContain("walk_down_0");
    }
  });

  it("declares uniform frame rectangles aligned to the sheet grid", () => {
    for (const [key, frames] of atlases) {
      const list = Object.values(frames);
      const widths = new Set(list.map((f) => f.frame.w));
      const heights = new Set(list.map((f) => f.frame.h));
      expect(widths.size, `${key} mixed frame widths`).toBe(1);
      expect(heights.size, `${key} mixed frame heights`).toBe(1);
      for (const f of list) {
        expect(f.frame.x % f.frame.w, `${key} frame x off-grid`).toBe(0);
        expect(f.frame.y % f.frame.h, `${key} frame y off-grid`).toBe(0);
      }
    }
  });
});
