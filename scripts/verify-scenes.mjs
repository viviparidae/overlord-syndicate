import { chromium } from "playwright";

const browser = await chromium.launch({
  headless: true,
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 960, height: 720 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto("http://localhost:4173/?e2e=1", { waitUntil: "domcontentloaded" });
await page.waitForSelector("#game-container canvas", { timeout: 15000 });
await page.waitForTimeout(2500);

// shop scene
await page.keyboard.down("e");
await page.waitForTimeout(250);
await page.keyboard.up("e");
await page.waitForTimeout(800);
await page.screenshot({ path: "test-results/verified-shop.png" });
const fundsBefore = await page.locator("#funds").textContent();
await page.keyboard.down("Space");
await page.waitForTimeout(250);
await page.keyboard.up("Space");
await page.waitForTimeout(700);
const fundsAfter = await page.locator("#funds").textContent();
console.log("SHOP funds:", fundsBefore, "->", fundsAfter);

await page.keyboard.down("Escape");
await page.waitForTimeout(250);
await page.keyboard.up("Escape");
await page.waitForTimeout(700);

// terminal scene
await page.keyboard.down("t");
await page.waitForTimeout(250);
await page.keyboard.up("t");
await page.waitForTimeout(900);
console.log(
  "TERMINAL scene:",
  await page.evaluate(() => window.__OVERLORD__?.getSceneKey() ?? null),
);
await page.screenshot({ path: "test-results/verified-terminal.png" });

console.log("ERRORS:", JSON.stringify(errors));
await browser.close();
