import { migrateV1 } from "@core/save/migrations/v1-migrate";
import { describe, expect, it } from "vitest";

describe("migrateV1", () => {
  it("初期データはそのまま保持される", () => {
    const data = { version: 1, funds: 10000 };
    expect(migrateV1(data)).toBe(data);
  });

  it("null と undefined はそのまま返される", () => {
    expect(migrateV1(null)).toBeNull();
    expect(migrateV1(undefined)).toBeUndefined();
  });
});
