import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/fonts.googleapis.com/**", (route) => route.abort());
  await page.route("**/fonts.gstatic.com/**", (route) => route.abort());
  await page.goto("/?e2e=1", { waitUntil: "domcontentloaded" });
});

test("セーブとロードで状態が復元される", async ({ page }) => {
  await page.waitForTimeout(500);
  const state = await page.evaluate(() => (window as any).__OVERLORD__?.getState());
  expect(state.funds).toBeGreaterThanOrEqual(10000);
  expect(state.phase).toBeGreaterThanOrEqual(1);
});
