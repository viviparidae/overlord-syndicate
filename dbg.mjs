import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto("http://localhost:4173/?e2e=1", { waitUntil: "domcontentloaded" });
  await page.locator("#game-container canvas").waitFor({ state: "visible" });
  await page.waitForTimeout(2000);
  console.log("Bridge exists:", await page.evaluate(() => !!window.__OVERLORD__));
  console.log(
    "executeOverlordAction:",
    await page.evaluate(() => typeof window.executeOverlordAction),
  );
  console.log(
    "State before:",
    await page.evaluate(() => window.__OVERLORD__?.getState?.() ?? null),
  );
  await page.click("#btn-e");
  await page.waitForTimeout(500);
  console.log(
    "After btn-e state:",
    await page.evaluate(() => window.__OVERLORD__?.getState?.() ?? null),
  );
  await page.click("#btn-t");
  await page.waitForTimeout(500);
  console.log(
    "After btn-t state:",
    await page.evaluate(() => window.__OVERLORD__?.getState?.() ?? null),
  );
  await browser.close();
})();
