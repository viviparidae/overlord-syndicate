import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/fonts.googleapis.com/**", (route) => route.abort());
  await page.route("**/fonts.gstatic.com/**", (route) => route.abort());
  await page.goto("/?e2e=1", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.locator("#game-container canvas").waitFor({ state: "visible" });
});

test("debug: bridge exists and runShop", async ({ page }) => {
  const bridgeExists = await page.evaluate(() => !!window.__OVERLORD__);
  console.log("Bridge exists:", bridgeExists);
  
  if (bridgeExists) {
    // Execute runShop via bridge
    await page.evaluate(() => window.executeOverlordAction?.("runShop") ?? null);
    
    const funds = await page.evaluate(() => (window as any).__OVERLORD__?.getState().funds);
    const faith = await page.evaluate(() => (window as any).__OVERLORD__?.getState().faith);
    const scene = await page.evaluate(() => (window as any).__OVERLORD__?.getSceneKey() ?? null);
    console.log("After runShop: funds:", funds, "faith:", faith, "scene:", scene);
  }
});
