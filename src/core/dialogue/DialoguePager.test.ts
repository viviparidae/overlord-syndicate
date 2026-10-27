import {
  advancePager,
  currentPageText,
  openPager,
  splitDialogueText,
} from "@core/dialogue/DialoguePager";
import { describe, expect, it } from "vitest";

describe("splitDialogueText", () => {
  it("文を区切って複数ページに分割できる", () => {
    const pages = splitDialogueText("あいう。えお。かきく。", 6);
    expect(pages).toEqual(["あいう。", "えお。", "かきく。"]);
  });

  it("短い文は1ページにまとまる", () => {
    const pages = splitDialogueText("あ。い。", 20);
    expect(pages).toEqual(["あ。い。"]);
  });

  it("上限を超える文は固定文字数で分割される", () => {
    const pages = splitDialogueText("あいうえおかきくけこ", 4);
    expect(pages).toEqual(["あいうえ", "おかきく", "けこ"]);
  });

  it("空文字は空ページ1つになる", () => {
    expect(splitDialogueText("", 10)).toEqual([""]);
  });
});

describe("DialoguePager", () => {
  it("開くと最初のページを表示する", () => {
    const pager = openPager({ id: "npc_child", speaker: "子供", text: "こんにちは！元気？はい。" });
    expect(pager.pageIndex).toBe(0);
    expect(pager.isFinished).toBe(false);
    expect(pager.pages.length).toBe(3);
  });

  it("ボタンを押すと次のページへ進む", () => {
    const pager = openPager({ id: "npc_child", speaker: "子供", text: "あ。い。う。" });
    advancePager(pager);
    expect(pager.pageIndex).toBe(1);
    expect(currentPageText(pager)).toBe("い。");
  });

  it("最終ページで終了状態になり選択肢を出せる", () => {
    const pager = openPager({ id: "npc_child", speaker: "子供", text: "あ。い。" });
    advancePager(pager);
    advancePager(pager);
    expect(pager.isFinished).toBe(true);
    advancePager(pager);
    expect(pager.pageIndex).toBe(1);
  });

  it("1文だけの会話は即終了にできる", () => {
    const pager = openPager({ id: "npc_child", speaker: "子供", text: "あ。" });
    advancePager(pager);
    expect(pager.isFinished).toBe(true);
  });
});
