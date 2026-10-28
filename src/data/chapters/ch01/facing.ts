export type Facing = "left" | "right";

// 生成素材ごとの実際の向き（目視確認済み）
const SOURCE_FACING: Record<string, Facing> = {
  ryo: "left",
  goda: "right",
  wataru: "left",
  matsutani: "left",
  chinatsu: "left",
  okada: "left",
  tatsumi: "left",
  kenta: "left",
};

export function sourceFacing(charId: string): Facing {
  return SOURCE_FACING[charId] ?? "left";
}

export function flipFor(charId: string, desired: Facing): boolean {
  return sourceFacing(charId) !== desired;
}
