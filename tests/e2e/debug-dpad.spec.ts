import { test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/fonts.googleapis.com/**", (route) => route.abort());
  await page.route("**/fonts.gstatic.com/**", (route) => route.abort());
  await page.goto("/?e2e=1", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.locator("#game-container canvas").waitFor({ state: "visible" });
});

test("debug: D-pad movement positions", async ({ page }) => {
  const initialX = await page.evaluate(() => (window as any).__OVERLORD__?.getPlayerX() ?? null);
  console.log("Initial X:", initialX);
  
  // Move right
  await page.keyboard.down("ArrowRight");
  await page.waitForTimeout(500);
  await page.keyboard.up("ArrowRight");
  
  const afterRight = await page.evaluate(() => (window as any).__OVERLORD__?.getPlayerX() ?? null);
  console.log("After right:", afterRight);
  
  // Move left
  await page.keyboard.down("ArrowLeft");
  await page.waitForTimeout(500);
  await page.keyboard.up("ArrowLeft");
  
  const afterLeft = await page.evaluate(() => (window as any).__OVERLORD__?.getPlayerX() ?? null);
  console.log("After left:", afterLeft);
});
