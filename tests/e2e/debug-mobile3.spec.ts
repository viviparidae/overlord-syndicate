import { test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/fonts.googleapis.com/**", (route) => route.abort());
  await page.route("**/fonts.gstatic.com/**", (route) => route.abort());
  await page.goto("/?e2e=1", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.locator("#game-container canvas").waitFor({ state: "visible" });
});

test("debug: full flow - click btn-e, check scene and funds", async ({ page }) => {
  // First, check initial state
  const initialFunds = await page.evaluate(() => (window as any).__OVERLORD__?.getState().funds);
  const initialScene = await page.evaluate(() => (window as any).__OVERLORD__?.getSceneKey() ?? null);
  console.log("Initial funds:", initialFunds);
  console.log("Initial scene:", initialScene);
  
  // Click btn-e
  await page.click("#btn-e");
  
  // Check immediately
  const afterFunds = await page.evaluate(() => (window as any).__OVERLORD__?.getState().funds);
  const afterScene = await page.evaluate(() => (window as any).__OVERLORD__?.getSceneKey() ?? null);
  console.log("After click funds:", afterFunds);
  console.log("After click scene:", afterScene);
  
  // Wait a bit and check again
  await page.waitForTimeout(1000);
  const laterFunds = await page.evaluate(() => (window as any).__OVERLORD__?.getState().funds);
  const laterScene = await page.evaluate(() => (window as any).__OVERLORD__?.getSceneKey() ?? null);
  console.log("After 1s funds:", laterFunds);
  console.log("After 1s scene:", laterScene);
});
