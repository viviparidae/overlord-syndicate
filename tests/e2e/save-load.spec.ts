import { expect, test } from "@playwright/test";
import { extractNumber } from "./helpers";

const SAVE_KEY = "overlord_syndicate_v1";

test.beforeEach(async ({ page }) => {
  await page.route("**/fonts.googleapis.com/**", (route) => route.abort());
  await page.route("**/fonts.gstatic.com/**", (route) => route.abort());
  await page.goto("/?e2e=1", { waitUntil: "domcontentloaded" });
});

test("アクション後にセーブが書き込まれる", async ({ page }) => {
  await page.locator("#shopBtn").click();
  await expect
    .poll(async () => extractNumber(await page.locator("#funds").textContent()))
    .toBe(12000);

  const raw = await page.evaluate((key) => localStorage.getItem(key), SAVE_KEY);
  expect(raw).not.toBeNull();

  const parsed = JSON.parse(raw ?? "{}");
  expect(parsed.version).toBe(1);
  expect(parsed.state.funds).toBe(12000);
  expect(parsed.resources.funds).toBe(12000);
});

test("リロード後も資金が保持される", async ({ page }) => {
  await page.locator("#shopBtn").click();
  await expect
    .poll(async () => extractNumber(await page.locator("#funds").textContent()))
    .toBe(12000);

  await page.reload({ waitUntil: "domcontentloaded" });

  await expect
    .poll(async () => extractNumber(await page.locator("#funds").textContent()))
    .toBe(12000);
});

test("破損したセーブでも起動でき初期状態に戻る", async ({ page }) => {
  await page.evaluate((key) => {
    localStorage.setItem(key, "{ this is not json");
  }, SAVE_KEY);

  await page.reload({ waitUntil: "domcontentloaded" });

  await expect
    .poll(async () => extractNumber(await page.locator("#funds").textContent()))
    .toBe(10000);
  await expect(page.locator("#gameOverOverlay")).toBeHidden();

  const phase = await page.evaluate(() => window.__OVERLORD__?.getState().phase ?? 0);
  expect(phase).toBe(1);
});
