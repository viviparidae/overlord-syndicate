import type { LocKey } from "../../localization";

export class StoryRunner {
  private cursor = 0;

  constructor(
    private readonly lines: LocKey[],
    private readonly seen: Set<string> = new Set(),
  ) {}

  get current(): LocKey | null {
    return this.lines[this.cursor] ?? null;
  }

  get isDone(): boolean {
    return this.cursor >= this.lines.length;
  }

  get index(): number {
    return this.cursor;
  }

  get total(): number {
    return this.lines.length;
  }

  next(): LocKey | null {
    const line = this.current;
    if (line) this.seen.add(line);
    this.cursor += 1;
    return this.current;
  }

  skipSeen(): number {
    let skipped = 0;
    while (this.current && this.seen.has(this.current)) {
      this.cursor += 1;
      skipped += 1;
    }
    return skipped;
  }

  seenLines(): string[] {
    return [...this.seen];
  }
}
