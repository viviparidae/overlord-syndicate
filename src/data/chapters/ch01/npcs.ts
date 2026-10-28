import type { LocKey } from "../../../localization";

export interface Npc {
  id: string;
  hotspotId: string;
  charId: string;
  x: number;
  speakerKey: LocKey;
  lines: LocKey[];
  evidenceId?: string;
}

export const npcs: Npc[] = [
  {
    id: "kenta",
    hotspotId: "hs_tofu_shop",
    charId: "kenta",
    x: 82,
    speakerKey: "speaker.kenta",
    lines: ["talk.kenta.01.a", "talk.kenta.01.b"],
    evidenceId: "ev_kenta_sighting",
  },
  {
    id: "matsutani",
    hotspotId: "hs_liquor_shop",
    charId: "matsutani",
    x: 216,
    speakerKey: "speaker.matsutani",
    lines: ["talk.matsutani.01.a", "talk.matsutani.01.b"],
    evidenceId: "ev_matsutani_report",
  },
  {
    id: "chinatsu",
    hotspotId: "hs_photo_studio",
    charId: "chinatsu",
    x: 350,
    speakerKey: "speaker.chinatsu",
    lines: ["talk.chiaki.01.a", "talk.chiaki.01.b"],
    evidenceId: "ev_vhs_tape",
  },
  {
    id: "goda",
    hotspotId: "hs_goda_office",
    charId: "goda",
    x: 524,
    speakerKey: "speaker.goda",
    lines: ["talk.goda.01.a", "talk.goda.01.b"],
    evidenceId: "ev_goda_statement",
  },
];

export function npcByHotspot(hotspotId: string): Npc | undefined {
  return npcs.find((npc) => npc.hotspotId === hotspotId);
}
