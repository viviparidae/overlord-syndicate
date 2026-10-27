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
  await page.waitForTimeout(500);
  const out = {};
  const sceneKey = () => page.evaluate(() => window.__OVERLORD__.getSceneKey());

  // --- 1. A / D horizontal movement (bug 1) ---
  const x0 = await page.evaluate(() => window.__OVERLORD__.getPlayerX?.() ?? null);
  await page.keyboard.down("KeyD");
  await page.waitForTimeout(700);
  await page.keyboard.up("KeyD");
  await page.waitForTimeout(300);
  const xD = await page.evaluate(() => window.__OVERLORD__.getPlayerX?.() ?? null);
  await page.keyboard.down("KeyA");
  await page.waitForTimeout(700);
  await page.keyboard.up("KeyA");
  await page.waitForTimeout(300);
  const xA = await page.evaluate(() => window.__OVERLORD__.getPlayerX?.() ?? null);
  out.movement = { x0, afterD: xD, afterA: xA, D_moved: xD > x0, A_moved: xA < xD };

  // --- 2. NPC label positions vs sprite tops (bugs 3/4/5) ---
  out.npcLabels = await page.evaluate(() => {
    const s = window.__OVERLORD__?.game?.scene?.getScene("StreetScene");
    if (!s?.children?.list) return null;
    const names = ["子供", "主婦", "サラリーマン", "悪徳地主"];
    const labels = s.children.list
      .filter((o) => o.type === "Text" && names.includes(o.text))
      .map((o) => ({ text: o.text, x: Math.round(o.x), y: Math.round(o.y) }));
    const sprites = s.children.list
      .filter((o) => o.texture && /npc_/.test(o.texture.key))
      .map((o) => ({
        key: o.texture.key,
        x: Math.round(o.x),
        y: Math.round(o.y),
        w: Math.round(o.displayWidth),
        h: Math.round(o.displayHeight),
        top: Math.round(o.y - o.displayHeight),
      }));
    return { labels, sprites };
  });

  // --- 3. HUD status bar (bug 3) ---
  out.hud = await page.evaluate(() => {
    const h = window.__OVERLORD__?.game?.scene?.getScene("HudScene");
    if (!h?.children?.list) return null;
    return h.children.list
      .filter((o) => o.type === "Text" && o.text)
      .map((o) => {
        const b = o.getBounds();
        return {
          text: o.text,
          left: Math.round(b.left),
          right: Math.round(b.right),
          x: Math.round(o.x),
          y: Math.round(o.y),
        };
      });
  });

  await page.screenshot({ path: "/home/tone/git/overlord-syndicate/verify-root-street.png" });

  // --- 4. E key -> shop scene (bug 1) ---
  await page.keyboard.press("KeyE");
  await page.waitForTimeout(700);
  out.afterE = await sceneKey();
  await page.screenshot({ path: "/home/tone/git/overlord-syndicate/verify-root-shop.png" });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(700);
  out.backFromShop = await sceneKey();

  // --- 5. T key -> terminal scene (bug 1) ---
  await page.keyboard.press("KeyT");
  await page.waitForTimeout(700);
  out.afterT = await sceneKey();
  await page.screenshot({ path: "/home/tone/git/overlord-syndicate/verify-root-terminal.png" });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(700);
  out.backFromTerminal = await sceneKey();

  // --- 6. external DOM buttons btn-e / btn-t (bug 2) ---
  await page.click("#btn-e");
  await page.waitForTimeout(700);
  out.afterBtnE = await sceneKey();
  await page.keyboard.press("Escape");
  await page.waitForTimeout(700);
  await page.click("#btn-t");
  await page.waitForTimeout(700);
  out.afterBtnT = await sceneKey();
  await page.keyboard.press("Escape");
  await page.waitForTimeout(700);

  // --- 7. game over overlay (bug 7) ---
  await page.evaluate(() => {
    for (let i = 0; i < 40; i++) window.executeOverlordAction("runShop");
  });
  await page.waitForTimeout(900);
  out.gameOver = await page.evaluate(() => {
    const st = window.__OVERLORD__?.getState?.() ?? null;
    const h = window.__OVERLORD__?.game?.scene?.getScene("HudScene");
    const overlay = h?.children?.list?.find(
      (o) => o.type === "Graphics" && o.visible && o.alpha !== undefined && o.alpha > 0,
    );
    const modal = h?.children?.list?.filter((o) => o.type === "Rectangle" && o.visible);
    return {
      suspect: st?.resources?.suspect ?? st?.suspect ?? null,
      overlaysVisible:
        h?.children?.list?.filter((o) => o.type === "Graphics" && o.visible).length ?? 0,
      modalsVisible: modal?.length ?? 0,
      overlayAlpha: overlay?.alpha ?? null,
      modalSizes: (modal ?? []).map((m) => [Math.round(m.width), Math.round(m.height)]),
    };
  });
  await page.screenshot({ path: "/home/tone/git/overlord-syndicate/verify-root-gameover.png" });

  out.errors = errors;
  console.log(JSON.stringify(out, null, 2));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
