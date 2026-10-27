import { test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/fonts.googleapis.com/**", (route) => route.abort());
  await page.route("**/fonts.gstatic.com/**", (route) => route.abort());
  await page.goto("/?e2e=1", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.locator("#game-container canvas").waitFor({ state: "visible" });
});

test("debug: check button existence and visibility", async ({ page }) => {
  const btnE = page.locator("#btn-e");
  const btnT = page.locator("#btn-t");
  const btnShop = page.locator("#btn-shop");
  
  console.log("btn-e count:", await btnE.count());
  console.log("btn-e isVisible:", await btnE.isVisible());
  console.log("btn-t count:", await btnT.count());
  console.log("btn-t isVisible:", await btnT.isVisible());
  console.log("btn-shop count:", await btnShop.count());
  console.log("btn-shop isVisible:", await btnShop.isVisible());
  
  // Also check body HTML for button references
  const bodyHTML = await page.locator("body").innerHTML();
  console.log("body contains btn-e:", bodyHTML.includes("btn-e"));
  console.log("body contains external-controls:", bodyHTML.includes("external-controls"));
  console.log("body contains command-buttons:", bodyHTML.includes("command-buttons"));
});
