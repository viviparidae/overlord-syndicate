// Chapter 1 プロローグ ― 葬儀の後、平成九年三月
import type { DialogueEntry } from "@data/dialogue/phase1";

export const prologue: DialogueEntry[] = [
  {
    id: "prologue_1",
    speaker: "母",
    text: "お父さん、この子が継ぐって。……頼もしいわね",
    options: [
      { text: "母さん。店、守るよ。安心して", action: "prologue_2" },
    ],
  },
  {
    id: "prologue_2",
    speaker: "母",
    text: "そう。……じゃあ、明日からよろしくね。開店準備、手伝って",
    options: [
      { text: "うん、任せて", action: "prologue_end" },
    ],
  },
  {
    id: "prologue_end",
    speaker: "システム",
    text: "> 日の出文房具店、店主代理として営業開始します。\n> 表の顔：優等生の息子。裏の顔：――まだ、誰にも見せない。",
    options: [],
  },
];