export class MissCounter {
  private value = 0;

  constructor(readonly limit: number) {}

  get count(): number {
    return this.value;
  }

  get isLimitReached(): boolean {
    return this.value >= this.limit;
  }

  add(): boolean {
    this.value += 1;
    return this.isLimitReached;
  }

  reset(): void {
    this.value = 0;
  }
}
