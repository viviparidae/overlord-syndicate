import { readFileSync } from "node:fs";
import { join } from "node:path";
import assets from "@data/assets.json";
import { describe, expect, it } from "vitest";

/**
 * Regression guard for the "characters look squashed" bug: StreetScene used to
 * override the sprites' 72x128 display size with 72x72, squashing tall pixel art
 * into a square. Every character atlas frame is 72x128, so rendering at any other
 * size distorts the art. These tests read the real atlas metadata shipped in
 * public/ instead of hard-coding numbers, so a frame change is caught here.
 *
 * Pure data assertions only — no Phaser, per the repo rule that Vitest covers
 * logic/data and Playwright covers rendering.
 */
const CHARACTER_KEYS = ["player", "npc_child", "npc_housewife", "npc_salaryman", "npc_landlord"];
const PROJECT_ROOT = process.cwd();

type Frame = { frame: { x: number; y: number; w: number; h: number } };
type CharacterAsset = { key: string; type: string; path: string; atlas?: string };

const characterAssets = (assets.assets as CharacterAsset[]).filter((a) =>
  CHARACTER_KEYS.includes(a.key),
);

function loadFrames(asset: CharacterAsset): Record<string, Frame> {
  if (!asset.atlas) throw new Error(`${asset.key} has no atlas`);
  const file = join(PROJECT_ROOT, "public", asset.atlas);
  return (JSON.parse(readFileSync(file, "utf8")) as { frames: Record<string, Frame> }).frames;
}

const atlases = characterAssets.map((asset) => ({ asset, frames: loadFrames(asset) }));

describe("Character sprite proportions", () => {
  it("ships an atlas for every character key", () => {
    expect(characterAssets.map((a) => a.key).sort()).toEqual([...CHARACTER_KEYS].sort());
  });

  it("uses 72x128 portrait frames for every character", () => {
    for (const { asset, frames } of atlases) {
      const list = Object.values(frames);
      expect(list.length, `${asset.key} has frames`).toBeGreaterThan(0);
      for (const f of list) {
        expect(f.frame.w, `${asset.key} frame width`).toBe(72);
        expect(f.frame.h, `${asset.key} frame height`).toBe(128);
      }
    }
  });

  it("renders taller than wide, so a square display size would distort the art", () => {
    for (const { asset, frames } of atlases) {
      const first = Object.values(frames)[0];
      expect(first.frame.h / first.frame.w, `${asset.key} aspect`).toBeGreaterThan(1.5);
    }
  });
});

describe("Walk animation frames", () => {
  it("provides every walk direction used by Player/NPC animation keys", () => {
    for (const { asset, frames } of atlases) {
      const names = Object.keys(frames);
      for (const dir of ["down", "left", "right", "up"]) {
        expect(names, `${asset.key} missing walk_${dir}_0`).toContain(`walk_${dir}_0`);
        expect(names, `${asset.key} missing walk_${dir}_1`).toContain(`walk_${dir}_1`);
      }
    }
  });
});
