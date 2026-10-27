/**
 * NPC 近接判定モジュール
 * Phaser/DOM 非依存。純粋関数。
 * プレイヤー x 座標と NPC の座標リストから、範囲内最も近い NPC の ID を返す。
 */
export type NpcSnapshot = { id: string; x: number };

export const DEFAULT_TALK_RANGE = 64;

/**
 * プレイヤー x 座標と NPC 候補リストから、会話範囲内の最も近い NPC の id を返す。
 * 範囲外なら null を返す。
 */
export function findNearestNpc(
  playerX: number,
  npcs: readonly NpcSnapshot[],
  range = DEFAULT_TALK_RANGE,
): string | null {
  let nearest: string | null = null;
  let nearestDist = range + 1;

  for (const npc of npcs) {
    const dist = Math.abs(playerX - npc.x);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearest = npc.id;
    }
  }

  // どの NPC も範囲内にいなければ null
  if (nearestDist > range) return null;
  return nearest;
}
