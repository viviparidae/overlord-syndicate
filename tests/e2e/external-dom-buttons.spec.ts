import { expect, test, type Page } from "@playwright/test";

/**
 * Canvas 外コントローラ (dpad + E/T/SPACE/ESC) の実動作検証。
 * ボタンは Phaser の KeyboardEvent を合成せず、シーンの公開 API を直接呼ぶ。
 * 旧実装は合成 KeyboardEvent を dispatch していたが、Phaser は event.keyCode で
 * 判定するため keyCode=0 の合成イベントは無視され、タップしても移動しなかった。
 */

async function getPlayerX(page: Page): Promise<number | null> {
  return page.evaluate(() => (window as any).__OVERLORD__?.getPlayerX() ?? null);
}

async function getSceneKey(page: Page): Promise<string | null> {
  return page.evaluate(() => (window as any).__OVERLORD__?.getSceneKey() ?? null);
}

async function getState(page: Page) {
  return page.evaluate(() => (window as any).__OVERLORD__!.getState());
}

test.beforeEach(async ({ page }) => {
  await page.route("/fonts.googleapis.com/**", (route) => route.abort());
  await page.route("/fonts.gstatic.com/**", (route) => route.abort());
  await page.goto("/?e2e=1", { waitUntil: "domcontentloaded" });
  await page.locator("#game-container canvas").waitFor({ state: "visible" });
  await expect
    .poll(async () => getSceneKey(page), { timeout: 15000 })
    .toBe("StreetScene");
});

test("EXT-01: btn-right tap moves the player right", async ({ page }) => {
  const beforeX = await getPlayerX(page);
  expect(beforeX).not.toBeNull();

  await page.click("#btn-right");
  await page.waitForTimeout(250);

  const afterX = await getPlayerX(page);
  expect(afterX).toBeGreaterThan(beforeX! + 5);
});

test("EXT-02: btn-left tap moves the player left", async ({ page }) => {
  // 最初に右へ動かして左移動の余地を作る
  await page.click("#btn-right");
  await page.waitForTimeout(250);

  const beforeX = await getPlayerX(page);
  await page.click("#btn-left");
  await page.waitForTimeout(250);

  const afterX = await getPlayerX(page);
  expect(afterX).toBeLessThan(beforeX! - 5);
});

test("EXT-03: holding btn-right keeps the player moving", async ({ page }) => {
  const beforeX = await getPlayerX(page);

  await page.mouse.move((await page.locator("#btn-right").boundingBox())!.x + 20, (await page.locator("#btn-right").boundingBox())!.y + 20);
  await page.mouse.down();
  await page.waitForTimeout(600);
  await page.mouse.up();
  await page.waitForTimeout(250);

  const afterX = await getPlayerX(page);
  expect(afterX).toBeGreaterThan(beforeX! + 30);
});

test("EXT-04: releasing the dpad button stops the player", async ({ page }) => {
  const box = (await page.locator("#btn-right").boundingBox())!;
  await page.mouse.move(box.x + 20, box.y + 20);
  await page.mouse.down();
  await page.waitForTimeout(600);
  await page.mouse.up();

  // pointerup 後は入力が解除され、座標がそれ以上動かない
  const stoppedX = await getPlayerX(page);
  await page.waitForTimeout(400);
  expect(await getPlayerX(page)).toBeCloseTo(stoppedX!, 5);
});

test("EXT-05: btn-e enters the shop, btn-esc returns to the street", async ({ page }) => {
  await page.click("#btn-e");
  await expect.poll(async () => getSceneKey(page)).toBe("ShopScene");

  await page.click("#btn-esc");
  await expect.poll(async () => getSceneKey(page)).toBe("StreetScene");
});

test("EXT-06: btn-t opens the terminal, btn-esc returns to the street", async ({ page }) => {
  await page.click("#btn-t");
  await expect.poll(async () => getSceneKey(page)).toBe("TerminalScene");

  await page.click("#btn-esc");
  await expect.poll(async () => getSceneKey(page)).toBe("StreetScene");
});

test("EXT-07: SPACE in the shop runs the shop action", async ({ page }) => {
  await page.click("#btn-e");
  await expect.poll(async () => getSceneKey(page)).toBe("ShopScene");

  const before = await getState(page);
  await page.click("#btn-space");
  await page.waitForTimeout(300);

  const after = await getState(page);
  // runShop: funds +2000
  expect(after.funds).toBe(before.funds + 2000);
});

test("EXT-08: SPACE on the street near an NPC opens the dialogue window", async ({ page }) => {
  // NPC エリア (300..660) まで長押し移動してから SPACE
  const box = (await page.locator("#btn-right").boundingBox())!;
  const tap = async (ms: number) => {
    await page.mouse.move(box.x + 20, box.y + 20);
    await page.mouse.down();
    await page.waitForTimeout(ms);
    await page.mouse.up();
    await page.waitForTimeout(200);
  };
  while ((await getPlayerX(page))! < 340) {
    await tap(700);
  }

  const x = await getPlayerX(page);
  expect(x).toBeGreaterThanOrEqual(300);

  const before = await getState(page);
  await page.click("#btn-space");
  await page.waitForTimeout(300);

  // 会話ウィンドウが開き、リソースは変化しない
  const dlg = await page.evaluate(() => (window as any).__OVERLORD__?.getDialogue() ?? null);
  expect(dlg?.isOpen).toBe(true);
  const after = await getState(page);
  expect(after.funds).toBe(before.funds);
  expect(after.fear).toBe(before.fear);
});

test("EXT-09: btn-center exists but is disabled", async ({ page }) => {
  const btnCenter = page.locator("#btn-center");
  await expect(btnCenter).toHaveCount(1);
  await expect(btnCenter).toBeDisabled();
});

test("EXT-10: SPACE in the shop area enters the shop (context action)", async ({ page }) => {
  // 開始位置 (x≈160) は店エリア。SPACE が無反応だと「移動しかできない」状態になる。
  const x = await getPlayerX(page);
  expect(x).toBeLessThan(300);

  await page.click("#btn-space");
  await expect.poll(async () => getSceneKey(page)).toBe("ShopScene");
});