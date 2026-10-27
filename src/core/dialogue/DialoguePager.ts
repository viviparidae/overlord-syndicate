export interface DialoguePagerState {
  entryId: string;
  speaker: string;
  pages: string[];
  pageIndex: number;
  isFinished: boolean;
}

export const MAX_PAGE_CHARS = 60;

export function splitDialogueText(text: string, maxChars = MAX_PAGE_CHARS): string[] {
  const sentences = text.split(/(?<=[。！？])/).filter((s) => s.length > 0);
  const pages: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if (sentence.length > maxChars) {
      if (current.length > 0) {
        pages.push(current);
        current = "";
      }
      for (let i = 0; i < sentence.length; i += maxChars) {
        pages.push(sentence.slice(i, i + maxChars));
      }
      continue;
    }
    if (current.length + sentence.length > maxChars) {
      pages.push(current);
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current.length > 0) {
    pages.push(current);
  }
  return pages.length > 0 ? pages : [""];
}

export function openPager(entry: {
  id: string;
  speaker: string;
  text: string;
}): DialoguePagerState {
  return {
    entryId: entry.id,
    speaker: entry.speaker,
    pages: splitDialogueText(entry.text),
    pageIndex: 0,
    isFinished: false,
  };
}

export function advancePager(state: DialoguePagerState): DialoguePagerState {
  if (state.isFinished) return state;
  if (state.pageIndex >= state.pages.length - 1) {
    state.isFinished = true;
    return state;
  }
  state.pageIndex += 1;
  return state;
}

export function currentPageText(state: DialoguePagerState): string {
  return state.pages[state.pageIndex] ?? "";
}
