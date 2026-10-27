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
  await page.waitForTimeout(600);
  const info = await page.evaluate(() => {
    const hud = window.__GAME__.scene.getScene("HudScene");
    const t = hud.children.list.find((c) => c.type === "Text");
    const bg = hud.children.list.find((c) => c.type === "Rectangle");
    const c = hud.cameras.main;
    return {
      text: {
        txt: t.text,
        alpha: t.alpha,
        tint: t.tintTopLeft,
        styleColor: t.style.color,
        font: t.style.fontFamily,
        scale: t.scale,
        renderFlags: t.renderFlags,
        parentContainer: !!t.parentContainer,
      },
      bg: { alpha: bg.alpha, fillAlpha: bg.fillAlpha, visible: bg.visible },
      cam: {
        visible: c.visible,
        alpha: c.alpha,
        x: c.x,
        y: c.y,
        width: c.width,
        height: c.height,
        zoom: c.zoom,
      },
      scenes: window.__GAME__.scene.scenes.map((s) => ({
        key: s.scene.key,
        active: s.scene.isActive(),
        visible: s.scene.isVisible(),
        index: window.__GAME__.scene.getIndex(s),
      })),
      canvas: {
        w: window.__GAME__.canvas.width,
        h: window.__GAME__.canvas.height,
        rect: window.__GAME__.canvas.getBoundingClientRect().toJSON(),
      },
    };
  });
  console.log(JSON.stringify(info, null, 2));
  await page
    .locator("#game-container canvas")
    .screenshot({ path: "/home/tone/git/overlord-syndicate/verify-canvas.png" });
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
