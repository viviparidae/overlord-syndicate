import { migrateV1 } from "./v1-migrate";

export const VERSION = 1;

export interface SnapshotVersion {
  version: number;
  migrate: (data: unknown) => unknown;
}

export class SaveManager {
  constructor() {
    this.detectVersion();
  }

  private detectVersion(): void {
    // To be implemented: check localStorage for existing save and its version
  }

  migrateData(data: unknown): unknown {
    if (data === null || data === undefined) {
      return data;
    }

    const result = migrateV1(data);
    return result;
  }
}
