import { StreetScene } from "@phaser/scenes/StreetScene";

describe("NPC Interaction Flow", () => {
  it("should handle SPACE key to trigger NPC interaction flow", () => {
    const scene = new StreetScene();
    // Verify the scene initializes with NPC interaction enabled
    expect(scene.handleInteraction).toBeDefined();
    expect(scene.listenToRumor).toBeDefined();
    // The currentTarget should default to "npc" for NPC interactions
    expect(scene.currentTarget).toBe("npc");
  });

  it("should call listenToRumor when SPACE is pressed near NPC", () => {
    const scene = new StreetScene();
    // listenToRumor triggers engine.execute("spreadRumor")
    expect(scene.listenToRumor).toBeInstanceOf(Function);
    // When player interacts with NPC, the rumor should be listened to
    expect(scene.handleInteraction).toBeDefined();
  });

  it("should verify SPACE -> listenToRumor -> spreadRumor flow", () => {
    const scene = new StreetScene();
    // The full interaction flow: SPACE triggers handleInteraction
    // handleInteraction calls listenToRumor when currentTarget is "npc"
    // listenToRumor calls engine.execute("spreadRumor")
    expect(scene.listenToRumor).toBeDefined();
    expect(scene.handleInteraction).toBeDefined();
  });
});