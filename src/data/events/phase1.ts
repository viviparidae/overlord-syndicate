import type { DialogueEntry } from "@data/dialogue/phase1";

export type { DialogueEntry };

export interface EventEntry {
  id: string;
  title: string;
  description: string;
  trigger: string;
  effect: {
    resources: { funds?: number; fear?: number; faith?: number; suspect?: number };
    phaseAdvance?: boolean;
  };
}

export const events: EventEntry[] = [
  {
    id: "rumor_discovery",
    title: "靫の収集",
    description: "街の人々から有用な情報を得る。",
    trigger: "runShop",
    effect: { resources: { faith: 2 } },
  },
  {
    id: "media_hack",
    title: "メディアハック",
    description: "夜に局の電波をジャックする。",
    trigger: "spreadRumor",
    effect: { resources: { funds: -200, faith: 5, suspect: 1 } },
  },
  {
    id: "work_discovery",
    title: "裏工作の発見",
    description: "裏工作パネルを開いて情報を得る。",
    trigger: "spreadRumorWithWork",
    effect: { resources: { suspect: 5 } },
  },
];
