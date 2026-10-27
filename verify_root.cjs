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
  const out = {};
  out.initialScene = await page.evaluate(() => window.__OVERLORD__.getSceneKey());
  await page.waitForTimeout(400);
  await page.screenshot({ path: "/home/tone/git/overlord-syndicate/verify-street.png" });

  const x0 = await page.evaluate(() => window.__OVERLORD__.getPlayerX());
  await page.keyboard.down("KeyD");
  await page.waitForTimeout(400);
  await page.keyboard.up("KeyD");
  await page.waitForTimeout(100);
  const x1 = await page.evaluate(() => window.__OVERLORD__.getPlayerX());
  await page.keyboard.down("KeyA");
  await page.waitForTimeout(300);
  await page.keyboard.up("KeyA");
  await page.waitForTimeout(100);
  const x2 = await page.evaluate(() => window.__OVERLORD__.getPlayerX());
  out.move = { x0, afterD: x1, afterA: x2, rightWorks: x1 > x0 + 5, leftWorks: x2 < x1 - 5 };

  await page.keyboard.press("KeyE");
  await page.waitForTimeout(600);
  out.afterE = await page.evaluate(() => window.__OVERLORD__.getSceneKey());
  await page.screenshot({ path: "/home/tone/git/overlord-syndicate/verify-shop.png" });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(600);
  out.afterEsc = await page.evaluate(() => window.__OVERLORD__.getSceneKey());

  await page.keyboard.press("KeyT");
  await page.waitForTimeout(600);
  out.afterT = await page.evaluate(() => window.__OVERLORD__.getSceneKey());
  await page.screenshot({ path: "/home/tone/git/overlord-syndicate/verify-terminal.png" });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(600);

  const funds0 = await page.evaluate(() => window.__OVERLORD__.getState().funds);
  await page.click("#btn-e");
  await page.waitForTimeout(600);
  out.btnE = await page.evaluate(() => window.__OVERLORD__.getSceneKey());
  out.btnEfundsDelta = (await page.evaluate(() => window.__OVERLORD__.getState().funds)) - funds0;
  await page.keyboard.press("Escape");
  await page.waitForTimeout(600);
  await page.click("#btn-t");
  await page.waitForTimeout(600);
  out.btnT = await page.evaluate(() => window.__OVERLORD__.getSceneKey());
  await page.keyboard.press("Escape");
  await page.waitForTimeout(600);
  out.finalScene = await page.evaluate(() => window.__OVERLORD__.getSceneKey());
  await page.screenshot({ path: "/home/tone/git/overlord-syndicate/verify-hud.png" });
  out.errors = errors;
  console.log(JSON.stringify(out, null, 2));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
