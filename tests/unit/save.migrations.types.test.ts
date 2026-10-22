import { SaveManager } from "@core/save/migrations/types";
import { describe, expect, it } from "vitest";

describe("SaveManager", () => {
  it("インスタンス生成時にバージョン判定が実行される", () => {
    const manager = new SaveManager();
    expect(manager).toBeInstanceOf(SaveManager);
  });

  it("migrateData で初期化データをそのまま返す", () => {
    const manager = new SaveManager();
    expect(manager.migrateData({ version: 1 })).toEqual({ version: 1 });
  });

  it("null / undefined を渡すとそのまま返す", () => {
    const manager = new SaveManager();
    expect(manager.migrateData(null)).toBeNull();
    expect(manager.migrateData(undefined)).toBeUndefined();
  });
});
