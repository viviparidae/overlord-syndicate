import type { Page } from "@playwright/test";

export function extractNumber(text: string | null | undefined): number {
  const raw = text ?? "";
  return parseInt(raw.replace(/\D+/g, ""), 10);
}

/**
 * キーを押下し、Phaser のゲームループ（rAF）を少なくとも 2 フレーム進めてから離す。
 * wall-clock 待機では初回アセット読み込み時のフレーム遅延で keydown/keyup が同一フレームで処理され、
 * `JustDown` が取りこぼされるため。
 */
export async function pressKeyWithFrames(page: Page, key: string, frames = 2): Promise<void> {
  await page.keyboard.down(key);
  for (let i = 0; i < frames; i++) {
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
  }
  await page.keyboard.up(key);
}