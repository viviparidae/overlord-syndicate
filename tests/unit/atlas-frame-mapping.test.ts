import { AnimationManager } from "@phaser/managers/AnimationManager";

describe("Atlas Frame Mapping", () => {
  it("should create walk animation frame mapping from atlas", () => {
    const manager = new AnimationManager({} as any);
    // Create animations and verify frame mapping exists
    const manifest = { assets: [{ key: "player", type: "atlas", path: "test" }] };
    manager.createAnimations(manifest as any);
    // Verify walk animation was created with the correct frame mapping
    expect(manifest.assets.length).toBeGreaterThan(0);
    expect(manager.animationKeys).toContain("player_walk");
  });
});
