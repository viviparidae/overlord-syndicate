import { expect, test } from "@playwright/test";
import { extractNumber } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.route("**/fonts.googleapis.com/**", (route) => route.abort());
  await page.route("**/fonts.gstatic.com/**", (route) => route.abort());
});

test.afterEach(async ({ page }) => {
  await page.unroute("**/fonts.googleapis.com/**");
  await page.unroute("**/fonts.gstatic.com/**");
});

test("ゲーム画面が描画される", async ({ page }) => {
  await page.goto("/?e2e=1", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#game-container canvas")).toBeVisible();
});

test("E2E ブリッジが window に公開される", async ({ page }) => {
  await page.goto("/?e2e=1", { waitUntil: "domcontentloaded" });
  await expect
    .poll(() =>
      page.evaluate(
        () => typeof (window as unknown as { __OVERLORD__?: unknown }).__OVERLORD__,
      ),
    )
    .toBe("object");
});

test("E2E ブリッジは通常起動では公開されない", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const bridgeType = await page.evaluate(
    () => typeof (window as unknown as { __OVERLORD__?: unknown }).__OVERLORD__,
  );
  expect(bridgeType).toBe("undefined");
});

test("初期状態のステータスが表示される", async ({ page }) => {
  await page.goto("/?e2e=1", { waitUntil: "domcontentloaded" });

  await expect.poll(async () => extractNumber(await page.locator("#funds").textContent())).toBe(10000);
  await expect.poll(async () => extractNumber(await page.locator("#fear").textContent())).toBe(0);
  await expect.poll(async () => extractNumber(await page.locator("#faith").textContent())).toBe(0);
  await expect.poll(async () => extractNumber(await page.locator("#suspect").textContent())).toBe(0);
  await expect(page.locator("#phase")).toContainText("フェーズ1");
});

test("初期ログが2行表示される", async ({ page }) => {
  await page.goto("/?e2e=1", { waitUntil: "domcontentloaded" });
  const entries = page.locator("#logConsole .log-entry");
  await expect(entries).toHaveCount(2);
  await expect(entries.first()).toContainText("1990年");
});
