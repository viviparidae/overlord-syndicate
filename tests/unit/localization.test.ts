import { describe, expect, it } from "vitest";
import en from "../../src/localization/en.json";
import ja from "../../src/localization/ja.json";

describe("ローカライズ", () => {
  it("英語リソースに日本語と同じキーが揃っている", () => {
    const jaKeys = Object.keys(ja).sort();
    const enKeys = Object.keys(en).sort();

    expect(enKeys).toEqual(jaKeys);
  });

  it("空の文言がない", () => {
    const empty = Object.entries(ja).filter(([, value]) => value.trim() === "");

    expect(empty).toEqual([]);
  });
});
