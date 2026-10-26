import { Player } from "@phaser/entities/Player";

describe("Character Render", () => {
  it("should have sprite size 72, 128 and origin 0.5, 1", () => {
    const player = new Player(undefined as any, 100, 200);
    // The Player constructor sets displaySize to 72, 128 and origin to (0.5, 1)
    expect(player.displaySize).toEqual(72, 128);
    expect(player.origin).toEqual([0.5, 1]);
  });
});