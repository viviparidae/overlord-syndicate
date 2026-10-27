export const NPC_POSITIONS = [
  { x: 320, y: 0, label: "子供", key: "npc_child" },
  { x: 480, y: 0, label: "主婦", key: "npc_housewife" },
  { x: 640, y: 0, label: "サラリーマン", key: "npc_salaryman" },
  { x: 800, y: 0, label: "悪徳地主", key: "npc_landlord" },
] as const;

export type NpcKey = "npc_child" | "npc_housewife" | "npc_salaryman" | "npc_landlord";

export const getNpcPosition = (key: NpcKey) => NPC_POSITIONS.find((p) => p.key === key);

export const getAllNpcPositions = () => [...NPC_POSITIONS];
