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

test("店番で資金と狂信が増える", async ({ page }) => {
  await page.locator("#shopBtn").click();

  await expect.poll(() => readResource(page, "funds")).toBe(12000);
  await expect.poll(() => readResource(page, "faith")).toBe(1);
  await expect(page.locator("#logConsole")).toContainText("店番を行いました");
});

test("噂を流すと資金が減り恐怖と狂信と警戒度が増える", async ({ page }) => {
  await page.locator("#rumorBtn").click();

  await expect.poll(() => readResource(page, "funds")).toBe(9500);
  await expect.poll(() => readResource(page, "fear")).toBe(3);
  await expect.poll(() => readResource(page, "faith")).toBe(5);
  await expect.poll(() => readResource(page, "suspect")).toBe(2);
  await expect(page.locator("#logConsole")).toContainText("噂を流した");
});

test("脅迫すると恐怖が増え狂信が減り警戒度が増える", async ({ page }) => {
  await page.locator("#intimidateBtn").click();

  await expect.poll(() => readResource(page, "funds")).toBe(9000);
  await expect.poll(() => readResource(page, "fear")).toBe(8);
  await expect.poll(() => readResource(page, "faith")).toBe(0);
  await expect.poll(() => readResource(page, "suspect")).toBe(5);
  await expect(page.locator("#logConsole")).toContainText("脅迫した");
});

test("資金が足りないと操作が失敗し状態が変化しない", async ({ page }) => {
  for (let i = 0; i < 10; i++) {
    await page.locator("#intimidateBtn").click();
  }

  await expect.poll(() => readResource(page, "funds")).toBe(0);
  await expect.poll(() => readResource(page, "suspect")).toBe(50);

  await page.locator("#intimidateBtn").click();

  await expect(page.locator("#logConsole")).toContainText("用地代が足りない");
  await expect.poll(() => readResource(page, "funds")).toBe(0);
  await expect.poll(() => readResource(page, "suspect")).toBe(50);
});
