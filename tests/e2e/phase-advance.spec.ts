import { expect, test, type Page } from "@playwright/test";
import { extractNumber } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.route("**/fonts.googleapis.com/**", (route) => route.abort());
  await page.route("**/fonts.gstatic.com/**", (route) => route.abort());
  await page.goto("/?e2e=1", { waitUntil: "domcontentloaded" });
});

async function readResource(page: Page, id: string): Promise<number> {
  return extractNumber(await page.locator(`#${id}`).textContent());
}

test("店番を重ねるとフェーズ2に昇格する", async ({ page }) => {
  for (let i = 0; i < 50; i++) {
    await page.locator("#shopBtn").click();
  }

  await expect.poll(() => readResource(page, "funds")).toBe(110000);
  await expect.poll(() => readResource(page, "faith")).toBe(50);

  const phase = await page.evaluate(() => window.__OVERLORD__?.getState().phase ?? 0);
  expect(phase).toBe(2);

  await expect(page.locator("#phase")).toContainText("フェーズ2");
  await expect(page.locator("#phase")).toContainText("地方都市");
  await expect(page.locator("#logConsole")).toContainText("フェーズ遷移");
});
