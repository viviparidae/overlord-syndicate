import type { LocKey } from "../../../localization";
import type { EvidenceItem, Hotspot, Testimony } from "../../../core/state/types";

export const chapterId = "ch01";
export const chapterTitleKey: LocKey = "chapter.ch01.title";
export const missLimit = 3;
export const scale = 1 as const;
export const venueKey = "venue.assembly";
export const roleKey = "role.summarizer";

export const requiredEvidence = [
  "ev_ledger_theft",
  "ev_vhs_tape",
  "ev_notebook_page",
  "ev_shop_receipt",
];

export const evidence: EvidenceItem[] = [
  {
    id: "ev_ledger_theft",
    nameKey: "evidence.ledger_theft.name",
    descKey: "evidence.ledger_theft.desc",
    icon: "ledger_theft",
  },
  {
    id: "ev_vhs_tape",
    nameKey: "evidence.vhs_tape.name",
    descKey: "evidence.vhs_tape.desc",
    icon: "vhs_tape",
  },
  {
    id: "ev_notebook_page",
    nameKey: "evidence.notebook_page.name",
    descKey: "evidence.notebook_page.desc",
    icon: "notebook_page",
  },
  {
    id: "ev_shop_receipt",
    nameKey: "evidence.shop_receipt.name",
    descKey: "evidence.shop_receipt.desc",
    icon: "shop_receipt",
  },
  {
    id: "ev_kenta_sighting",
    nameKey: "evidence.kenta_sighting.name",
    descKey: "evidence.kenta_sighting.desc",
    icon: "kenta_sighting",
  },
  {
    id: "ev_matsutani_report",
    nameKey: "evidence.matsutani_report.name",
    descKey: "evidence.matsutani_report.desc",
    icon: "matsutani_report",
  },
  {
    id: "ev_goda_statement",
    nameKey: "evidence.goda_statement.name",
    descKey: "evidence.goda_statement.desc",
    icon: "goda_statement",
  },
  {
    id: "ev_past_settlement",
    nameKey: "evidence.past_settlement.name",
    descKey: "evidence.past_settlement.desc",
    icon: "past_settlement",
  },
  {
    id: "ev_goda_memo",
    nameKey: "evidence.goda_memo.name",
    descKey: "evidence.goda_memo.desc",
    icon: "goda_memo",
  },
];

export function evidenceById(id: string): EvidenceItem | undefined {
  return evidence.find((item) => item.id === id);
}

export const hotspots: Hotspot[] = [
  {
    id: "hs_shop_counter",
    areaId: "arcade_west",
    kind: "inspect",
    labelKey: "ui.investigation.inspect",
    textKey: "inspect.ledger",
    evidenceId: "ev_ledger_theft",
    x: 120,
    width: 40,
  },
  {
    id: "hs_shop_window",
    areaId: "arcade_west",
    kind: "inspect",
    labelKey: "ui.investigation.inspect",
    textKey: "inspect.ledger",
    x: 240,
    width: 40,
  },
  {
    id: "hs_counter_slips",
    areaId: "arcade_west",
    kind: "inspect",
    labelKey: "ui.investigation.inspect",
    textKey: "inspect.slips",
    evidenceId: "ev_shop_receipt",
    insightOnly: true,
    x: 300,
    width: 40,
  },
  {
    id: "hs_arcade_light",
    areaId: "arcade_center",
    kind: "inspect",
    labelKey: "ui.investigation.inspect",
    x: 300,
    width: 40,
  },
  {
    id: "hs_board",
    areaId: "arcade_center",
    kind: "inspect",
    labelKey: "ui.investigation.inspect",
    x: 520,
    width: 48,
  },
  {
    id: "hs_payphone",
    areaId: "arcade_center",
    kind: "inspect",
    labelKey: "ui.investigation.inspect",
    x: 680,
    width: 32,
  },
  {
    id: "hs_office_door",
    areaId: "arcade_center",
    kind: "move",
    labelKey: "ui.investigation.inspect",
    x: 860,
    width: 48,
  },
  {
    id: "hs_tofu_shop",
    areaId: "arcade_east",
    kind: "talk",
    labelKey: "ui.investigation.talk",
    evidenceId: "ev_kenta_sighting",
    x: 100,
    width: 48,
  },
  {
    id: "hs_liquor_shop",
    areaId: "arcade_east",
    kind: "talk",
    labelKey: "ui.investigation.talk",
    evidenceId: "ev_matsutani_report",
    x: 300,
    width: 48,
  },
  {
    id: "hs_photo_studio",
    areaId: "arcade_east",
    kind: "talk",
    labelKey: "ui.investigation.talk",
    evidenceId: "ev_vhs_tape",
    x: 500,
    width: 48,
  },
  {
    id: "hs_goda_office",
    areaId: "arcade_east",
    kind: "talk",
    labelKey: "ui.investigation.talk",
    evidenceId: "ev_goda_statement",
    x: 760,
    width: 60,
  },
  {
    id: "hs_desk",
    areaId: "shotengai_office",
    kind: "inspect",
    labelKey: "ui.investigation.inspect",
    textKey: "inspect.settlement",
    evidenceId: "ev_past_settlement",
    x: 220,
    width: 48,
  },
  {
    id: "hs_phone_office",
    areaId: "shotengai_office",
    kind: "inspect",
    labelKey: "ui.investigation.inspect",
    textKey: "inspect.memo",
    evidenceId: "ev_goda_memo",
    x: 380,
    width: 40,
  },
  {
    id: "hs_waiting_chair",
    areaId: "shotengai_office",
    kind: "inspect",
    labelKey: "ui.investigation.inspect",
    textKey: "inspect.notebook",
    evidenceId: "ev_notebook_page",
    x: 640,
    width: 48,
  },
];

export const testimonies: Testimony[] = [
  {
    id: "t_goda",
    speaker: "goda",
    blocks: [
      { id: "tg_01", textKey: "testimony.goda.01.text", askBackKey: "testimony.goda.01.askBack" },
      {
        id: "tg_02",
        textKey: "testimony.goda.02.text",
        askBackKey: "testimony.goda.02.askBack",
        gap: {
          evidenceId: "ev_vhs_tape",
          acceptAnyOf: [],
          successKey: "testimony.goda.02.success",
          failKey: "testimony.goda.02.fail",
        },
      },
      {
        id: "tg_03",
        textKey: "testimony.goda.03.text",
        askBackKey: "testimony.goda.03.askBack",
        gap: {
          evidenceId: "ev_ledger_theft",
          acceptAnyOf: [],
          successKey: "testimony.goda.03.success",
          failKey: "testimony.goda.03.fail",
        },
      },
      { id: "tg_04", textKey: "testimony.goda.04.text", askBackKey: "testimony.goda.04.askBack" },
    ],
  },
  {
    id: "t_matsutani",
    speaker: "matsutani",
    blocks: [
      {
        id: "tm_01",
        textKey: "testimony.matsutani.01.text",
        askBackKey: "testimony.matsutani.01.askBack",
        gap: {
          evidenceId: "ev_ledger_theft",
          acceptAnyOf: [],
          successKey: "testimony.matsutani.01.success",
          failKey: "testimony.matsutani.01.fail",
        },
      },
      { id: "tm_02", textKey: "testimony.matsutani.02.text" },
    ],
  },
  {
    id: "t_wataru",
    speaker: "wataru",
    blocks: [
      { id: "tw_01", textKey: "testimony.wataru.01.text", askBackKey: "testimony.wataru.01.askBack" },
      { id: "tw_02", textKey: "testimony.wataru.02.text", askBackKey: "testimony.wataru.02.askBack" },
    ],
  },
  {
    id: "t_okada",
    speaker: "okada",
    blocks: [
      { id: "to_01", textKey: "testimony.okada.01.text", askBackKey: "testimony.okada.01.askBack" },
      { id: "to_02", textKey: "testimony.okada.02.text", askBackKey: "testimony.okada.02.askBack" },
    ],
  },
];

export const introLines: LocKey[] = [
  "intro.01",
  "intro.02",
  "intro.03",
  "intro.04",
  "intro.05",
];

export const epilogueLines: LocKey[] = ["epilogue.01", "epilogue.02", "epilogue.03", "epilogue.04"];

export const chapter = {
  id: chapterId,
  titleKey: chapterTitleKey,
  missLimit,
  scale,
  venueKey,
  roleKey,
  requiredEvidence,
  evidence,
  hotspots,
  testimonies,
  introLines,
  epilogueLines,
} as const;
