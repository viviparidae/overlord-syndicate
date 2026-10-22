import { expect, test, type Page } from "@playwright/test";
import { extractNumber } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.route("**/fonts.googleapis.com/**", (route) => route.abort());
  await page.route("**/fonts.gstatic.com/**", (route) => route.abort());
  await page.goto("/?e2e=1", { waitUntil: "domcontentloaded" });
});

async function readResource(page: Page, id: string): Promise<number> {
  return extractNumber(await page.locator(`#${id}`).textContent());
}

test("警戒度が100に達するとゲームオーバーになる", async ({ page }) => {
  for (let i = 0; i < 19; i++) {
    await page.locator("#shopBtn").click();
  }
  await expect.poll(() => readResource(page, "funds")).toBe(48000);
  await expect.poll(() => readResource(page, "faith")).toBe(19);

  for (let i = 0; i < 20; i++) {
    await page.locator("#intimidateBtn").click();
  }

  await expect.poll(() => readResource(page, "suspect")).toBe(100);
  await expect(page.locator("#gameOverOverlay")).toBeVisible();
  await expect(page.locator("#gameOverOverlay")).toContainText("ゲームオーバー");
  await expect(page.locator("#logConsole")).toContainText("警戒度100");

  const gameOver = await page.evaluate(() => window.__OVERLORD__?.getState().gameOver ?? false);
  expect(gameOver).toBe(true);
});

test("ゲームオーバー後はコマンドが実行されない", async ({ page }) => {
  for (let i = 0; i < 19; i++) {
    await page.locator("#shopBtn").click();
  }
  for (let i = 0; i < 20; i++) {
    await page.locator("#intimidateBtn").click();
  }
  await expect(page.locator("#gameOverOverlay")).toBeVisible();

  const fundsBefore = await readResource(page, "funds");
  await page.locator("#shopBtn").click({ force: true });
  await page.waitForTimeout(100);

  await expect.poll(() => readResource(page, "funds")).toBe(fundsBefore);
  const gameOver = await page.evaluate(() => window.__OVERLORD__?.getState().gameOver ?? false);
  expect(gameOver).toBe(true);
});
