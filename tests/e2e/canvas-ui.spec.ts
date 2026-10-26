import { expect, test } from "@playwright/test";

test("Canvas 描画が初期化されゲームが開始される", async ({ page }) => {
  await page.goto("/?e2e=1", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  const canvas = page.locator("#game-container canvas");
  await canvas.waitFor({ state: "visible" });
  // Phaser ゲームが初期化され、StreetScene がアクティブになるまで待機
  await expect.poll(async () => {
    return page.evaluate(() => (window as any).__OVERLORD__?.getSceneKey() ?? null);
  }, { timeout: 15000 }).toBe("StreetScene");
  // プレイヤー位置が取得できる = ゲームループが回っている
  await expect.poll(async () => {
    return page.evaluate(() => (window as any).__OVERLORD__?.getPlayerX() ?? null);
  }, { timeout: 5000 }).not.toBeNull();
});