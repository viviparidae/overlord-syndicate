import { expect, test } from "@playwright/test";
import { pressKeyWithFrames } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.route("**/fonts.googleapis.com/**", (route) => route.abort());
  await page.route("**/fonts.gstatic.com/**", (route) => route.abort());
  await page.goto("/?e2e=1", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.goto("/?e2e=1", { waitUntil: "domcontentloaded" });
});

test.afterEach(async ({ page }) => {
  await page.unroute("**/fonts.googleapis.com/**");
  await page.unroute("**/fonts.gstatic.com/**");
});

async function moveToChildNpc(page: import("@playwright/test").Page): Promise<void> {
  await expect
    .poll(() => page.evaluate(() => typeof (window as unknown as { __OVERLORD__?: unknown }).__OVERLORD__))
    .toBe("object");
  const rightBtn = page.getByRole("button", { name: "右" });
  for (let i = 0; i < 40; i++) {
    const x = await page.evaluate(() => (window as any).__OVERLORD__?.getPlayerX());
    if (x !== null && x >= 256 && x <= 384) return;
    await rightBtn.dispatchEvent("pointerdown");
    await page.waitForTimeout(80);
    await rightBtn.dispatchEvent("pointerup");
    await page.waitForTimeout(50);
  }
  throw new Error("子供NPCまで移動できなかった");
}

test("NPCに近づいて会話ウィンドウが開く", async ({ page }) => {
  await moveToChildNpc(page);
  await pressKeyWithFrames(page, "Space");
  await page.waitForTimeout(300);
  await expect
    .poll(() => page.evaluate(() => (window as any).__OVERLORD__?.getDialogue()?.isOpen))
    .toBe(true);
  await expect
    .poll(() => page.evaluate(() => (window as any).__OVERLORD__?.getDialogue()?.isFinished))
    .toBe(false);
});

test("ボタンを押すと会話が進み最終ページで選択肢が出る", async ({ page }) => {
  await moveToChildNpc(page);
  await pressKeyWithFrames(page, "Space");
  await expect.poll(() => page.evaluate(() => (window as any).__OVERLORD__?.getDialogue()?.isOpen)).toBe(true);

  await pressKeyWithFrames(page, "Space");
  const state = await page.evaluate(() => (window as any).__OVERLORD__?.getDialogue());
  expect(state?.isFinished).toBe(true);
  expect(state?.optionCount).toBe(4);
});

test("選択肢を選ぶと会話ウィンドウが閉じる", async ({ page }) => {
  await moveToChildNpc(page);
  await pressKeyWithFrames(page, "Space");
  await expect.poll(() => page.evaluate(() => (window as any).__OVERLORD__?.getDialogue()?.isOpen)).toBe(true);
  await pressKeyWithFrames(page, "Space");
  await expect.poll(() => page.evaluate(() => (window as any).__OVERLORD__?.getDialogue()?.isFinished)).toBe(true);

  const canvas = page.locator("#game-container canvas");
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;
  const scaleX = box.width / 960;
  const scaleY = box.height / 540;
  const optionY = 540 - 125 - 110 + 110 - 16;
  await page.mouse.click(box.x + 675 * scaleX, box.y + optionY * scaleY);

  await expect.poll(() => page.evaluate(() => (window as any).__OVERLORD__?.getDialogue())).toBe(null);
});