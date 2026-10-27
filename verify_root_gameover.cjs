const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1024, height: 720 } });
  const errs = [];
  p.on("pageerror", (e) => errs.push(String(e)));
  await p.goto("http://localhost:4173/?e2e", { waitUntil: "networkidle" });
  await p.waitForFunction(() => window.__OVERLORD__?.getSceneKey() === "StreetScene", null, {
    timeout: 10000,
  });
  await p.waitForTimeout(400);
  const trail = [];
  for (let i = 0; i < 120; i++) {
    await p.evaluate(() => {
      window.executeOverlordAction("runShop");
      window.executeOverlordAction("intimidate");
    });
    await p.waitForTimeout(40);
    const s = await p.evaluate(() => window.__OVERLORD__.getState());
    trail.push({
      i: i + 1,
      funds: s.funds,
      fear: s.fear,
      suspect: s.suspect,
      gameOver: s.gameOver,
    });
    if (s.gameOver) break;
  }
  await p.waitForTimeout(1200);
  const state = await p.evaluate(() => window.__OVERLORD__.getState());
  console.log(JSON.stringify({ last: trail.slice(-3), steps: trail.length, state, errs }, null, 2));
  await p.screenshot({ path: "/home/tone/git/overlord-syndicate/verify-root-gameover.png" });
  await b.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
