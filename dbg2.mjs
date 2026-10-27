import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on("console", (m) => console.log("[console]", m.type(), m.text()));
  await page.goto("http://localhost:4173/?e2e=1", { waitUntil: "domcontentloaded" });
  await page.locator("#game-container canvas").waitFor({ state: "visible" });
  await page.waitForTimeout(3000);
  console.log("state before:", await page.evaluate(() => window.__OVERLORD__?.getState?.()));
  console.log("click btn-e via eval call");
  await page.evaluate(() => window.executeOverlordAction?.("runShop"));
  await page.waitForTimeout(300);
  console.log(
    "state after direct call:",
    await page.evaluate(() => window.__OVERLORD__?.getState?.()),
  );
  console.log("Click btn-e via click");
  await page.click("#btn-e");
  await page.waitForTimeout(500);
  console.log("state after click:", await page.evaluate(() => window.__OVERLORD__?.getState?.()));
  await browser.close();
})();
