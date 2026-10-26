import { expect, test } from "@playwright/test";
import { pressKeyWithFrames } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.route("**/fonts.googleapis.com/**", (route) => route.abort());
  await page.route("**/fonts.gstatic.com/**", (route) => route.abort());
  await page.goto("/?e2e=1", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.locator("#game-container canvas").waitFor({ state: "visible" });
});

test("警戒度が100に達するとゲームオーバーになる", async ({ page }) => {
  test.setTimeout(120000);
  // 19回、店に入り店番してStreetSceneに戻す
  for (let i = 0; i < 19; i++) {
    await pressKeyWithFrames(page, "e");
    await expect.poll(async () => {
      return page.evaluate(() => window.__OVERLORD__?.getSceneKey());
    }).toBe("ShopScene");
    await pressKeyWithFrames(page, "Space");
    await expect.poll(() => page.evaluate(() => window.__OVERLORD__!.getState().funds)).toBeGreaterThan(10000);
    await pressKeyWithFrames(page, "Escape");
    await expect.poll(async () => {
      return page.evaluate(() => window.__OVERLORD__?.getSceneKey());
    }).toBe("StreetScene");
  }

  // さらに1回だけ店番してFundsを増やす
  await pressKeyWithFrames(page, "e");
  await expect.poll(async () => {
    return page.evaluate(() => window.__OVERLORD__?.getSceneKey());
  }).toBe("ShopScene");
  await pressKeyWithFrames(page, "Space");

  await expect.poll(() => page.evaluate(() => (window as any).__OVERLORD__?.getState().funds)).toBe(50000);
  await expect.poll(() => page.evaluate(() => (window as any).__OVERLORD__?.getState().faith)).toBe(20);

  for (let i = 0; i < 20; i++) {
    await page.evaluate(() => window.executeOverlordAction?.("intimidate") ?? null);
    await page.waitForTimeout(50);
  }
  await expect.poll(() => page.evaluate(() => (window as any).__OVERLORD__?.getState().suspect)).toBe(100);

  await expect.poll(() => page.evaluate(() => (window as any).__OVERLORD__?.getState().gameOver)).toBe(true);
});

test("ゲームオーバー後はコマンドが実行されない", async ({ page }) => {
  // Game over to 100 suspicion
  for (let i = 0; i < 19; i++) {
    await pressKeyWithFrames(page, "e");
    await expect.poll(async () => {
      return page.evaluate(() => window.__OVERLORD__?.getSceneKey());
    }).toBe("ShopScene");
    await pressKeyWithFrames(page, "Space");
    await pressKeyWithFrames(page, "Escape");
  }

  // One more shop run
  await pressKeyWithFrames(page, "e");
  await expect.poll(async () => {
    return page.evaluate(() => window.__OVERLORD__?.getSceneKey());
  }).toBe("ShopScene");
  await pressKeyWithFrames(page, "Space");

  await expect.poll(() => page.evaluate(() => (window as any).__OVERLORD__?.getState().funds)).toBe(50000);
  await expect.poll(() => page.evaluate(() => (window as any).__OVERLORD__?.getState().faith)).toBe(20);

  for (let i = 0; i < 20; i++) {
    await page.evaluate(() => window.executeOverlordAction?.("intimidate") ?? null);
    await page.waitForTimeout(50);
  }
  await expect.poll(() => page.evaluate(() => (window as any).__OVERLORD__?.getState().gameOver)).toBe(true);

  const fundsBefore = await page.evaluate(() => (window as any).__OVERLORD__?.getState().funds);
  await pressKeyWithFrames(page, "e");
  await page.waitForTimeout(100);
  const fundsAfter = await page.evaluate(() => (window as any).__OVERLORD__?.getState().funds);
  expect(fundsAfter).toBe(fundsBefore);
});