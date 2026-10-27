const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1024, height: 720 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("http://localhost:4173/?e2e", { waitUntil: "networkidle" });
  await page.waitForFunction(
    () => window.__OVERLORD__ && window.__OVERLORD__.getSceneKey() === "StreetScene",
    null,
    { timeout: 10000 },
  );
  await page.waitForTimeout(400);
  const out = {};

  async function hold(key, ms) {
    await page.keyboard.down(key);
    await page.waitForTimeout(ms);
    await page.keyboard.up(key);
    await page.waitForTimeout(500);
  }

  await hold("KeyE", 120);
  out.afterE_hold = await page.evaluate(() => window.__OVERLORD__.getSceneKey());
  await page.keyboard.down("Escape");
  await page.waitForTimeout(120);
  await page.keyboard.up("Escape");
  await page.waitForTimeout(500);
  out.backFromShop = await page.evaluate(() => window.__OVERLORD__.getSceneKey());

  await hold("KeyT", 120);
  out.afterT_hold = await page.evaluate(() => window.__OVERLORD__.getSceneKey());
  await page.screenshot({ path: "/home/tone/git/overlord-syndicate/verify-terminal.png" });
  await page.keyboard.down("Escape");
  await page.waitForTimeout(120);
  await page.keyboard.up("Escape");
  await page.waitForTimeout(500);
  out.backFromTerminal = await page.evaluate(() => window.__OVERLORD__.getSceneKey());
  out.errors = errors;
  console.log(JSON.stringify(out, null, 2));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
