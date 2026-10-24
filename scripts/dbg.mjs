import { chromium } from "playwright";

const browser = await chromium.launch({
  headless: true,
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--no-sandbox"],
});
const page = await browser.newPage();
page.on("pageerror", (e) => console.log("PAGEERROR", String(e)));
page.on("console", (m) => {
  if (m.type() === "error") console.log("CERR", m.text());
});
await page.goto("http://localhost:4173/?e2e=1", { waitUntil: "domcontentloaded" });
await page.waitForSelector("#game-container canvas");
await page.waitForTimeout(2000);
console.log("before", JSON.stringify(await page.evaluate(() => window.__OVERLORD__?.getState())));
await page.locator("#shopBtn").click();
await page.waitForTimeout(800);
console.log(
  "after click",
  JSON.stringify(await page.evaluate(() => window.__OVERLORD__?.getState())),
);
console.log("funds text", await page.locator("#funds").textContent());
await browser.close();
