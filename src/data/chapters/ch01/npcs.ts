import type { LocKey } from "../../../localization";

export interface DialogueLine {
  speaker: LocKey;
  text: LocKey;
}

export interface Npc {
  id: string;
  hotspotId: string;
  charId: string;
  x: number;
  script: DialogueLine[];
  evidenceId?: string;
}

const ryo = "speaker.ryo" as const;

export const npcs: Npc[] = [
  {
    id: "kenta",
    hotspotId: "hs_tofu_shop",
    charId: "kenta",
    x: 82,
    script: [
      { speaker: "speaker.kenta", text: "talk.kenta.01.a" },
      { speaker: ryo, text: "talk.kenta.01.b" },
      { speaker: "speaker.kenta", text: "talk.kenta.01.c" },
      { speaker: ryo, text: "talk.kenta.01.d" },
    ],
    evidenceId: "ev_kenta_sighting",
  },
  {
    id: "matsutani",
    hotspotId: "hs_liquor_shop",
    charId: "matsutani",
    x: 216,
    script: [
      { speaker: "speaker.matsutani", text: "talk.matsutani.01.a" },
      { speaker: ryo, text: "talk.matsutani.01.b" },
      { speaker: "speaker.matsutani", text: "talk.matsutani.01.c" },
      { speaker: ryo, text: "talk.matsutani.01.d" },
    ],
    evidenceId: "ev_matsutani_report",
  },
  {
    id: "chinatsu",
    hotspotId: "hs_photo_studio",
    charId: "chinatsu",
    x: 350,
    script: [
      { speaker: "speaker.chinatsu", text: "talk.chiaki.01.a" },
      { speaker: ryo, text: "talk.chiaki.01.b" },
      { speaker: "speaker.chinatsu", text: "talk.chiaki.01.c" },
      { speaker: ryo, text: "talk.chiaki.01.d" },
    ],
    evidenceId: "ev_vhs_tape",
  },
  {
    id: "goda",
    hotspotId: "hs_goda_office",
    charId: "goda",
    x: 524,
    script: [
      { speaker: "speaker.goda", text: "talk.goda.01.a" },
      { speaker: ryo, text: "talk.goda.01.b" },
      { speaker: "speaker.goda", text: "talk.goda.01.c" },
      { speaker: ryo, text: "talk.goda.01.d" },
    ],
    evidenceId: "ev_goda_statement",
  },
];

export function npcByHotspot(hotspotId: string): Npc | undefined {
  return npcs.find((npc) => npc.hotspotId === hotspotId);
}
