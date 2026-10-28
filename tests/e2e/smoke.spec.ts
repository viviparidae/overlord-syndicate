import { expect, test } from "@playwright/test";

type GameLike = {
  scene: { getScenes(active: boolean): { scene: { key: string } }[] };
};

async function activeScenes(page: import("@playwright/test").Page): Promise<string[]> {
  return page.evaluate(() => {
    const game = (window as unknown as { __game: GameLike }).__game;
    return game.scene.getScenes(true).map((s) => s.scene.key);
  });
}

test("タイトルから第1章の導入が開始できる", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("canvas")).toBeVisible();

  await page.locator("canvas").click({ position: { x: 160, y: 282 } });

  await expect.poll(() => activeScenes(page)).toContain("Story");
});

test("導入を送りきると調査パートへ進む", async ({ page }) => {
  await page.goto("/");
  await page.locator("canvas").click({ position: { x: 160, y: 282 } });
  await expect.poll(() => activeScenes(page)).toContain("Story");

  for (let i = 0; i < 6; i += 1) {
    await page.locator("canvas").click({ position: { x: 480, y: 430 } });
  }

  await expect.poll(() => activeScenes(page)).toContain("Investigation");
});

test("タッチ操作で調査パートの移動ボタンが反応する", async ({ page }) => {
  await page.goto("/");
  await page.locator("canvas").click({ position: { x: 160, y: 282 } });
  for (let i = 0; i < 6; i += 1) {
    await page.locator("canvas").click({ position: { x: 480, y: 430 } });
  }
  await expect.poll(() => activeScenes(page)).toContain("Investigation");

  const before = await page.evaluate(() => {
    const game = (window as unknown as { __game: GameLike }).__game;
    const scene = game.scene.getScenes(true)[0] as unknown as { playerX: number } | undefined;
    return scene?.playerX ?? 0;
  });

  await page.touchscreen.tap(76, 470);

  expect(before).toBeGreaterThan(0);
});
