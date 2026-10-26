import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/fonts.googleapis.com/**", (route) => route.abort());
  await page.route("**/fonts.gstatic.com/**", (route) => route.abort());
  await page.goto("/?e2e=1", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.locator("#game-container canvas").waitFor({ state: "visible" });
});

test("debug: click btn-e and check scene", async ({ page }) => {
  const btnE = page.locator("#btn-e");
  console.log("btn-e count:", await btnE.count());
  console.log("btn-e isVisible:", await btnE.isVisible());
  
  // Click the button
  await btnE.click();
  
  // Check scene immediately
  const scene = await page.evaluate(() => (window as any).__OVERLORD__?.getSceneKey() ?? null);
  console.log("Scene after click:", scene);
  
  // Also check funds
  const funds = await page.evaluate(() => (window as any).__OVERLORD__?.getState().funds);
  console.log("Funds after click:", funds);
});
