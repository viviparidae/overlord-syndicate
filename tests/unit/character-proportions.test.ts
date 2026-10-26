import { Player } from "@phaser/entities/Player";

describe("Character Proportions", () => {
  it("should have cell ratio with 128px height and 7.5+ head ratio", () => {
    const player = new Player(undefined as any, 100, 200);
    // Verify cell height is 128px for proper character proportion
    expect(player.displayHeight).toBeGreaterThanOrEqual(128);
    // Verify head ratio is 7.5+ (head should be proportionally sized)
    const headRatio = player.height / 128;
    expect(headRatio).toBeGreaterThanOrEqual(7.5);
  });
});
