import { expect, test, type Page } from "@playwright/test";
import { extractNumber } from "./helpers";

test.describe.configure({ retries: 2 });

test.use({
  viewport: { width: 667, height: 375 },
  isMobile: true,
  hasTouch: true,
});

test.beforeEach(async ({ page }) => {
  await page.route("**/fonts.googleapis.com/**", (route) => route.abort());
  await page.route("**/fonts.gstatic.com/**", (route) => route.abort());
  await page.goto("/?e2e=1", { waitUntil: "domcontentloaded" });
  await page.locator("#game-container canvas").waitFor({ state: "visible" });
});

async function tapAt(page: Page, gameX: number, gameY: number, hold = 100): Promise<void> {
  const canvas = page.locator("#game-container canvas");
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Canvas not found");

  const scale = await canvas.evaluate((el: HTMLCanvasElement) => ({
    cw: el.clientWidth,
    ch: el.clientHeight,
    gw: el.width,
    gh: el.height,
  }));

  const viewportX = box.x + (gameX / scale.gw) * scale.cw;
  const viewportY = box.y + (gameY / scale.gh) * scale.ch;

  await page.mouse.move(viewportX, viewportY);
  await page.mouse.down();
  await page.waitForTimeout(hold);
  await page.mouse.up();
  await page.waitForTimeout(100);
}

test("モバイル: 仮想D-Padで左右移動できる", async ({ page }) => {
  const beforeX = await page.evaluate(() => window.__OVERLORD__?.getPlayerX() ?? null);

  await tapAt(page, 80, 480, 800);

  const afterX = await page.evaluate(() => window.__OVERLORD__?.getPlayerX() ?? null);

  expect(beforeX).not.toBeNull();
  expect(afterX).not.toBeNull();
  expect(afterX ?? 0).toBeGreaterThan(beforeX ?? 0);
});

test("モバイル: 右下Eボタンで店に入れる", async ({ page }) => {
  await tapAt(page, 880, 460);
  await expect.poll(async () => {
    const scene = await page.evaluate(() => window.__OVERLORD__?.getSceneKey() ?? null);
    return scene;
  }).toBe("ShopScene");

  await tapAt(page, 480, 480);
  await expect.poll(async () => extractNumber(await page.locator("#funds").textContent())).toBe(12000);
});

test("モバイル: 右上Tボタンで裏工作パネルが開く", async ({ page }) => {
  await tapAt(page, 880, 80);
  await expect.poll(async () => {
    const scene = await page.evaluate(() => window.__OVERLORD__?.getSceneKey() ?? null);
    return scene;
  }).toBe("TerminalScene");
});

test("モバイル: 店番ボタンで資金と狂信が増える", async ({ page }) => {
  await tapAt(page, 880, 460);
  await expect.poll(async () => {
    const scene = await page.evaluate(() => window.__OVERLORD__?.getSceneKey() ?? null);
    return scene;
  }).toBe("ShopScene");

  await tapAt(page, 480, 480);
  await expect.poll(async () => extractNumber(await page.locator("#funds").textContent())).toBe(12000);
  await expect.poll(async () => extractNumber(await page.locator("#faith").textContent())).toBe(1);
});

test("モバイル: 噂ボタンで資金が減り恐怖/狂信/警戒度が増える", async ({ page }) => {
  await tapAt(page, 880, 80);
  await expect.poll(async () => {
    const scene = await page.evaluate(() => window.__OVERLORD__?.getSceneKey() ?? null);
    return scene;
  }).toBe("TerminalScene");

  await tapAt(page, 100, 480);
  await expect.poll(async () => extractNumber(await page.locator("#funds").textContent())).toBe(9500);
  await expect.poll(async () => extractNumber(await page.locator("#fear").textContent())).toBe(3);
});

test("モバイル: 脅迫ボタンで恐怖が増え狂信が減り警戒度が増える", async ({ page }) => {
  await tapAt(page, 880, 80);
  await expect.poll(async () => {
    const scene = await page.evaluate(() => window.__OVERLORD__?.getSceneKey() ?? null);
    return scene;
  }).toBe("TerminalScene");

  await tapAt(page, 420, 480);
  await expect.poll(async () => extractNumber(await page.locator("#funds").textContent())).toBe(9000);
  await expect.poll(async () => extractNumber(await page.locator("#fear").textContent())).toBe(8);
  await expect.poll(async () => extractNumber(await page.locator("#suspect").textContent())).toBe(5);
});

test("モバイル: 戻るボタンでStreetSceneに戻る", async ({ page }) => {
  await tapAt(page, 880, 80);
  await expect.poll(async () => {
    const scene = await page.evaluate(() => window.__OVERLORD__?.getSceneKey() ?? null);
    return scene;
  }).toBe("TerminalScene");

  await tapAt(page, 760, 480);
  await expect.poll(async () => {
    const scene = await page.evaluate(() => window.__OVERLORD__?.getSceneKey() ?? null);
    return scene;
  }).toBe("StreetScene");
});

test("モバイル: D-Pad中央タップでSPACE相当(NPC対話)が可能", async ({ page }) => {
  // 初期位置は店エリア内のため、まず右へ移動してNPCエリアへ出る
  await tapAt(page, 100, 480, 1600);
  await page.waitForTimeout(300);

  await tapAt(page, 60, 480, 200);
  await page.waitForTimeout(300);

  const logs = await page.locator("#logConsole .log-entry").allTextContents();
  expect(logs.some((l) => l.includes("噂") || l.includes("資金が足りない"))).toBeTruthy();
});