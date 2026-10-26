import { test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/fonts.googleapis.com/**", (route) => route.abort());
  await page.route("**/fonts.gstatic.com/**", (route) => route.abort());
  await page.goto("/?e2e=1", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.locator("#game-container canvas").waitFor({ state: "visible" });
});

test("debug: multiple right moves", async ({ page }) => {
  const initialX = await page.evaluate(() => (window as any).__OVERLORD__?.getPlayerX() ?? null);
  console.log("Initial X:", initialX);
  
  // 5 right presses
  for (let i = 0; i < 5; i++) {
    await page.keyboard.down("ArrowRight");
    await page.waitForTimeout(200);
    await page.keyboard.up("ArrowRight");
    await page.waitForTimeout(200);
  }
  
  const afterX = await page.evaluate(() => (window as any).__OVERLORD__?.getPlayerX() ?? null);
  console.log("After 5 right presses:", afterX);
});
