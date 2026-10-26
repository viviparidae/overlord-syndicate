import { expect, test } from "@playwright/test";
import { pressKeyWithFrames } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.route("**/fonts.googleapis.com/**", (route) => route.abort());
  await page.route("**/fonts.gstatic.com/**", (route) => route.abort());
  await page.goto("/?e2e=1", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.locator("#game-container canvas").waitFor({ state: "visible" });
});

test("店番を重ねるとフェーズ2に昇格する", async ({ page }) => {
  test.setTimeout(60000);
  for (let i = 0; i < 50; i++) {
    await pressKeyWithFrames(page, "e");
    await pressKeyWithFrames(page, "Space");
    await pressKeyWithFrames(page, "Escape");
  }

  await expect.poll(async () => {
    return page.evaluate(() => (window as any).__OVERLORD__?.getState().funds);
  }).toBe(110000);

  await expect.poll(async () => {
    return page.evaluate(() => (window as any).__OVERLORD__?.getState().faith);
  }).toBe(50);

  const phase = await page.evaluate(() => (window as any).__OVERLORD__?.getState().phase ?? 0);
  expect(phase).toBe(2);
});