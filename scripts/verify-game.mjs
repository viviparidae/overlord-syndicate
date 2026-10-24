import { chromium } from "playwright";

const browser = await chromium.launch({
  headless: true,
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 960, height: 720 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => {
  if (m.type() === "error") errors.push("console: " + m.text());
});

await page.goto("http://localhost:4173/?e2e=1", { waitUntil: "domcontentloaded" });
await page.waitForSelector("#game-container canvas", { timeout: 15000 });
await page.waitForTimeout(3000);

const state = await page.evaluate(() => {
  const b = window.__OVERLORD__;
  return b ? { scene: b.getSceneKey(), playerX: b.getPlayerX(), ...b.getState() } : null;
});
console.log("STATE:", JSON.stringify(state));

const before = state?.playerX ?? null;
await page.keyboard.down("ArrowRight");
await page.waitForTimeout(700);
await page.keyboard.up("ArrowRight");
await page.waitForTimeout(300);
const after = await page.evaluate(() => window.__OVERLORD__?.getPlayerX() ?? null);
console.log("PLAYER_X:", before, "->", after);

await page.keyboard.down("e");
await page.waitForTimeout(250);
await page.keyboard.up("e");
await page.waitForTimeout(800);
const sceneAfterE = await page.evaluate(() => window.__OVERLORD__?.getSceneKey() ?? null);
console.log("SCENE_AFTER_E:", sceneAfterE);

if (sceneAfterE === "ShopScene") {
  await page.keyboard.down("Escape");
  await page.waitForTimeout(250);
  await page.keyboard.up("Escape");
}
await page.waitForTimeout(800);
console.log("SCENE_BACK:", await page.evaluate(() => window.__OVERLORD__?.getSceneKey() ?? null));

await page.screenshot({ path: "test-results/verified-game.png", fullPage: true });
const canvas = await page.$("#game-container canvas");
if (canvas) await canvas.screenshot({ path: "test-results/verified-canvas.png" });
console.log("ERRORS:", JSON.stringify(errors));
await browser.close();
