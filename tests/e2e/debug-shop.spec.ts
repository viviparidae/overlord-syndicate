import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/fonts.googleapis.com/**", (route) => route.abort());
  await page.route("**/fonts.gstatic.com/**", (route) => route.abort());
  await page.goto("/?e2e=1", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.locator("#game-container canvas").waitFor({ state: "visible" });
});

test("debug: single e key shop", async ({ page }) => {
  const initialFunds = await page.evaluate(() => (window as any).__OVERLORD__?.getState().funds);
  const initialScene = await page.evaluate(() => (window as any).__OVERLORD__?.getSceneKey() ?? null);
  console.log("Initial funds:", initialFunds);
  console.log("Initial scene:", initialScene);
  
  // Single e key dispatch
  await page.keyboard.down("e");
  await page.waitForTimeout(100);
  await page.keyboard.up("e");
  
  const after1Funds = await page.evaluate(() => (window as any).__OVERLORD__?.getState().funds);
  const after1Scene = await page.evaluate(() => (window as any).__OVERLORD__?.getSceneKey() ?? null);
  console.log("After 1st e: funds:", after1Funds, "scene:", after1Scene);
  
  // Second e key dispatch
  await page.keyboard.down("e");
  await page.waitForTimeout(100);
  await page.keyboard.up("e");
  
  const after2Funds = await page.evaluate(() => (window as any).__OVERLORD__?.getState().funds);
  const after2Scene = await page.evaluate(() => (window as any).__OVERLORD__?.getSceneKey() ?? null);
  console.log("After 2nd e: funds:", after2Funds, "scene:", after2Scene);
});
