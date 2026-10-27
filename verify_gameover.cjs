const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1024, height: 720 } });
  await page.goto("http://localhost:4173/?e2e", { waitUntil: "networkidle" });
  await page.waitForFunction(
    () => window.__OVERLORD__ && window.__OVERLORD__.getSceneKey() === "StreetScene",
    null,
    { timeout: 10000 },
  );
  const out = {};
  for (let i = 0; i < 60; i++) {
    await page.evaluate(() => window.executeOverlordAction("runShop"));
    await page.evaluate(() => window.executeOverlordAction("intimidate"));
    const s = await page.evaluate(() => window.__OVERLORD__.getState());
    if (s.gameOver) {
      out.iterations = i + 1;
      break;
    }
  }
  await page.waitForTimeout(800);
  out.state = await page.evaluate(() => window.__OVERLORD__.getState());
  await page.screenshot({ path: "/home/tone/git/overlord-syndicate/verify-gameover.png" });
  console.log(JSON.stringify(out, null, 2));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
