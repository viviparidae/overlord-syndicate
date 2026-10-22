import { expect, test, type Page } from "@playwright/test";
import { extractNumber, pressKeyWithFrames } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.route("**/fonts.googleapis.com/**", (route) => route.abort());
  await page.route("**/fonts.gstatic.com/**", (route) => route.abort());
  await page.goto("/?e2e=1", { waitUntil: "domcontentloaded" });
  await page.locator("#game-container canvas").waitFor({ state: "visible" });
  await waitForSceneReady(page);
});

async function waitForSceneReady(page: Page): Promise<void> {
  await expect
    .poll(() => page.evaluate(() => window.__OVERLORD__?.getPlayerX() ?? null))
    .not.toBeNull();
}

async function sceneKey(page: Page): Promise<string | null> {
  return page.evaluate(() => window.__OVERLORD__?.getSceneKey() ?? null);
}

test("初期シーンは StreetScene", async ({ page }) => {
  await expect.poll(() => sceneKey(page)).toBe("StreetScene");
});

test("E キーで店に入り SPACE で店番し ESC で戻る", async ({ page }) => {
  await pressKeyWithFrames(page, "e");
  await expect.poll(() => sceneKey(page)).toBe("ShopScene");

  await pressKeyWithFrames(page, "Space");
  await expect
    .poll(async () => extractNumber(await page.locator("#funds").textContent()))
    .toBe(12000);

  await pressKeyWithFrames(page, "Escape");
  await expect.poll(() => sceneKey(page)).toBe("StreetScene");
});

test("T キーで裏工作パネルを開き操作できる", async ({ page }) => {
  await pressKeyWithFrames(page, "t");
  await expect.poll(() => sceneKey(page)).toBe("TerminalScene");

  await pressKeyWithFrames(page, "1");
  await expect
    .poll(async () => extractNumber(await page.locator("#funds").textContent()))
    .toBe(9500);

  await pressKeyWithFrames(page, "2");
  await expect
    .poll(async () => extractNumber(await page.locator("#funds").textContent()))
    .toBe(8500);

  await pressKeyWithFrames(page, "Escape");
  await expect.poll(() => sceneKey(page)).toBe("StreetScene");
});

test("右方向キーでプレイヤーが移動する", async ({ page }) => {
  await expect.poll(() => sceneKey(page)).toBe("StreetScene");

  const before = await page.evaluate(() => window.__OVERLORD__?.getPlayerX() ?? null);
  await pressKeyWithFrames(page, "ArrowRight", 30);
  const after = await page.evaluate(() => window.__OVERLORD__?.getPlayerX() ?? null);

  expect(before).not.toBeNull();
  expect(after).not.toBeNull();
  expect(after ?? 0).toBeGreaterThan(before ?? 0);
});
