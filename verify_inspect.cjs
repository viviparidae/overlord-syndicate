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
  await page.waitForTimeout(500);
  const info = await page.evaluate(() => {
    const g = window.__GAME__;
    const hud = g.scene.getScene("HudScene");
    const street = g.scene.getScene("StreetScene");
    return {
      scale: { w: hud.scale.width, h: hud.scale.height },
      hudTexts: hud.children.list
        .filter((c) => c.type === "Text")
        .map((c) => ({
          t: c.text,
          x: c.x,
          y: c.y,
          visible: c.visible,
          depth: c.depth,
          w: c.width,
        })),
      hudRects: hud.children.list
        .filter((c) => c.type === "Rectangle")
        .map((c) => ({
          x: c.x,
          y: c.y,
          w: c.width,
          h: c.height,
          visible: c.visible,
          depth: c.depth,
        })),
      streetTexts: street.children.list
        .filter((c) => c.type === "Text")
        .map((c) => ({ t: c.text, x: c.x, y: c.y, w: c.width, depth: c.depth })),
      cameras: {
        hud: { scrollY: hud.cameras.main.scrollY, zoom: hud.cameras.main.zoom },
        street: { scrollY: street.cameras.main.scrollY },
      },
    };
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
