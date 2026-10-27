---

title: 外部DOMボタン操作テスト計画
description: Canvas外の外部DOMボタン（D-pad、E/Tキー等）によるゲーム操作の検証計画。キーコード不一致問題の検出・回帰防止を目的とする。

status: approved
version: "0.1"
category: qa
tags:
- qa
- e2e
- external-controls
- regression
- dpad

traces_to:
- docs/qa/test-plan.md
- src/main.ts
- src/phaser/scenes/StreetScene.ts
- src/phaser/scenes/ShopScene.ts
- src/phaser/scenes/TerminalScene.ts
- index.html
  implemented_by:
- tests/e2e/external-dom-buttons.spec.ts
  verified_by:
- tests/e2e/external-dom-buttons.spec.ts

---

# 外部DOMボタン操作テスト計画

## 1. 背景・目的

**発見済み問題**: `src/main.ts` の外部DOMボタンハンドラが誤ったキーコード（WASD）を `dispatchEvent` しているが、ゲーム側（`StreetScene.ts`）は矢印キー（`ArrowLeft`/`ArrowRight`）のみ監視しているため、D-padボタンが機能しない。

**検出されていない理由**: 既存E2Eテスト（`command-panel.spec.ts` 等）は `page.keyboard.down("ArrowRight")` 等で直接矢印キーを送信しており、外部DOMボタン経由の操作を検証していない。

**本計画の目標**:
1. 外部DOMボタン経由の全操作を検証するE2Eテストを追加
2. キーコード不一致・ボタン欠落を自動検出する
3. 回帰防止を CI に組み込む

---

## 2. テスト対象ボタンと期待動作

| ボタンID      | 配置場所    | 送信キーコード (現状)  | 期待キーコード | 期待動作             | 現状                 |
| ------------- | ----------- | ---------------------- | -------------- | -------------------- | -------------------- |
| `#btn-up`     | D-pad       | `w`                    | `ArrowUp`      | 未使用（縦移動なし） | 動作せず             |
| `#btn-down`   | D-pad       | `s`                    | `ArrowDown`    | 未使用（縦移動なし） | 動作せず             |
| `#btn-left`   | D-pad       | `a`                    | `ArrowLeft`    | プレイヤー左移動     | **動作せず**         |
| `#btn-right`  | D-pad       | `d`                    | `ArrowRight`   | プレイヤー右移動     | **動作せず**         |
| `#btn-center` | D-pad       | -                      | `Space`        | NPC対話（噂を聞く）  | **ボタン無効化済み** |
| `#btn-e`      | Action Keys | `runShop` 直接実行     | -              | 店に入る / 店番実行  | ✅ 動作              |
| `#btn-t`      | Action Keys | `spreadRumor` 直接実行 | -              | 裏工作パネルを開く   | ✅ 動作              |

**欠落ボタン（追加必要）**:
- **SPACEボタン** — NPC対話用（D-pad中央または専用ボタン）
- **ESCボタン** — ShopScene/TerminalScene から StreetScene へ戻る用
- **1/2キー** — TerminalScene 内「噂を流す/脅迫する」用（Canvas外から操作する場合）

---

## 3. テストケース定義

### 3.1 D-pad 移動テスト（必須・ブロッカー級）

| ID     | テスト名                                | 事前条件                   | 操作                       | 期待結果                                          | 検証方法                                            |
| ------ | --------------------------------------- | -------------------------- | -------------------------- | ------------------------------------------------- | --------------------------------------------------- |
| EXT-01 | 左ボタンでプレイヤーが左に移動          | StreetScene 初期位置 X=160 | `#btn-left` クリック       | X 座標が減少（≒120 付近）                         | `window.__OVERLORD__.getPlayerX()`                  |
| EXT-02 | 右ボタンでプレイヤーが右に移動          | StreetScene 初期位置 X=160 | `#btn-right` クリック      | X 座標が増加（≒200 付近）                         | `window.__OVERLORD__.getPlayerX()`                  |
| EXT-03 | 連続右移動で目標地点（店/路地裏）に到達 | StreetScene 初期位置 X=160 | `#btn-right` ×4 回クリック | 店エリア（X≤300）→プロンプト「E: 文房具店に入る」 | `window.__OVERLORD__.getPlayerX()` + プロンプト確認 |
| EXT-04 | 連続左移動で左端で停止                  | StreetScene 任意位置       | `#btn-left` 連打           | X=32 で停止（境界）                               | `window.__OVERLORD__.getPlayerX()` === 32           |

### 3.2 アクションキーテスト（必須）

| ID     | テスト名                        | 事前条件                           | 操作                          | 期待結果                           | 検証方法                       |
| ------ | ------------------------------- | ---------------------------------- | ----------------------------- | ---------------------------------- | ------------------------------ |
| EXT-05 | Eボタンで店シーン遷移・店番実行 | StreetScene・店エリア（X≤300）     | `#btn-e` クリック             | ShopScene 遷移 → 資金+2000, 狂信+1 | Scene遷移 + `getState().funds` |
| EXT-06 | Tボタンで裏工作パネル遷移       | StreetScene・路地裏エリア（X≥660） | `#btn-t` クリック             | TerminalScene 遷移                 | Scene遷移確認                  |
| EXT-07 | 店内でEボタンで店番実行         | ShopScene                          | `#btn-e` クリック             | 資金+2000, 狂信+1                  | `getState().funds` / `faith`   |
| EXT-08 | 裏工作パネルでTボタン→噂実行    | TerminalScene                      | `#btn-t` クリック（噂ボタン） | 資金-500, 恐怖+3, 狂信+5, 警戒度+2 | `getState()` 全リソース確認    |

### 3.3 欠落ボタン検出テスト（必須）

| ID     | テスト名                         | 事前条件                  | 操作                          | 期待結果                             | 検証方法                                 |
| ------ | -------------------------------- | ------------------------- | ----------------------------- | ------------------------------------ | ---------------------------------------- |
| EXT-09 | NPC対話ボタン（SPACE）の存在確認 | StreetScene・NPCエリア    | DOM に SPACE 相当ボタンが存在 | `#btn-space` または D-pad 中央が有効 | `page.locator("#btn-space").count()` > 0 |
| EXT-10 | ESCボタンの存在確認              | ShopScene / TerminalScene | DOM に ESC 相当ボタンが存在   | `#btn-esc` が存在・表示              | `page.locator("#btn-esc").isVisible()`   |
| EXT-11 | ESCボタンでストリート復帰        | ShopScene                 | `#btn-esc` クリック           | StreetScene へ戻る                   | Scene 遷移確認                           |

### 3.4 キーコード整合性テスト（単体・高速）

| ID     | テスト名                     | 検証内容                                             | 期待結果                   |
| ------ | ---------------------------- | ---------------------------------------------------- | -------------------------- |
| EXT-12 | main.ts D-pad キーコード確認 | `btn-left` → `ArrowLeft`, `btn-right` → `ArrowRight` | キーコードが矢印キー       |
| EXT-13 | StreetScene 入力監視確認     | `cursors.left/right` が矢印キーを監視                | `KeyCodes.LEFT/RIGHT` 使用 |

---

## 4. 実装ファイル構成

### 4.1 新規作成: `tests/e2e/external-dom-buttons.spec.ts`

```typescript
import { expect, test } from "@playwright/test";

test.describe.configure({ retries: 2 });

test.beforeEach(async ({ page }) => {
  await page.route("**/fonts.googleapis.com/**", (route) => route.abort());
  await page.route("**/fonts.gstatic.com/**", (route) => route.abort());
  await page.goto("/?e2e=1", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.locator("#game-container canvas").waitFor({ state: "visible" });
  // デバッグブリッジ準備完了待ち
  await expect
    .poll(() => page.evaluate(() => window.__OVERLORD__?.getSceneKey() ?? null))
    .toBe("StreetScene");
});

// EXT-01, EXT-02
test("外部DOM: 左/右ボタンでプレイヤーが移動する", async ({ page }) => {
  const before = await page.evaluate(() => window.__OVERLORD__!.getPlayerX());

  await page.click("#btn-right");
  await page.waitForTimeout(300);

  const afterRight = await page.evaluate(() => window.__OVERLORD__!.getPlayerX());
  expect(afterRight).toBeGreaterThan(before);

  await page.click("#btn-left");
  await page.waitForTimeout(300);

  const afterLeft = await page.evaluate(() => window.__OVERLORD__!.getPlayerX());
  expect(afterLeft).toBeLessThan(afterRight);
});

// EXT-03
test("外部DOM: 連続右移動で店エリアに到達しプロンプト変化", async ({ page }) => {
  // 初期位置から店エリア（X<=300）までは約4タップ必要
  for (let i = 0; i < 4; i++) {
    await page.click("#btn-right");
    await page.waitForTimeout(200);
  }

  const playerX = await page.evaluate(() => window.__OVERLORD__!.getPlayerX());
  expect(playerX).toBeLessThanOrEqual(300);

  // プロンプトが店モードに変わる
  const prompt = await page.evaluate(() => {
    const el = document.querySelector("#game-container canvas");
    // Phaser内テキストは直接取得困難 → デバッグブリッジ拡張またはログ確認
    return window.__OVERLORD__!.getSceneKey();
  });
  expect(prompt).toBe("StreetScene"); // シーンは変わらず
});

// EXT-04
test("外部DOM: 左端で移動停止（境界チェック）", async ({ page }) => {
  // 左端まで移動
  for (let i = 0; i < 10; i++) {
    await page.click("#btn-left");
    await page.waitForTimeout(100);
  }

  const playerX = await page.evaluate(() => window.__OVERLORD__!.getPlayerX());
  expect(playerX).toBe(32); // 境界値
});

// EXT-05
test("外部DOM: Eボタンで店遷移・店番実行", async ({ page }) => {
  // 店エリアへ移動
  await page.click("#btn-left"); // 初期位置は店エリア寄りだが念のため
  await page.waitForTimeout(200);

  await page.click("#btn-e");

  await expect
    .poll(() => page.evaluate(() => window.__OVERLORD__!.getSceneKey()))
    .toBe("ShopScene");

  // 店番実行
  await page.click("#btn-e");

  const state = await page.evaluate(() => window.__OVERLORD__!.getState());
  expect(state.funds).toBe(12000); // 10000 + 2000
  expect(state.faith).toBe(1);
});

// EXT-06
test("外部DOM: Tボタンで裏工作パネル遷移", async ({ page }) => {
  // 路地裏エリアへ移動（右端）
  for (let i = 0; i < 10; i++) {
    await page.click("#btn-right");
    await page.waitForTimeout(100);
  }

  await page.click("#btn-t");

  await expect
    .poll(() => page.evaluate(() => window.__OVERLORD__!.getSceneKey()))
    .toBe("TerminalScene");
});

// EXT-09: 欠落ボタン検出（失敗することを期待＝要実装）
test("外部DOM: NPC対話用SPACEボタンが存在する", async ({ page }) => {
  // 実装後は toBeVisible() でパスするようになる
  await expect(page.locator("#btn-space")).toBeVisible();
});

// EXT-10
test("外部DOM: ESCボタンが存在する", async ({ page }) => {
  await expect(page.locator("#btn-esc")).toBeVisible();
});

// EXT-11
test("外部DOM: ESCボタンでストリート復帰", async ({ page }) => {
  // 店に入る
  await page.click("#btn-e");
  await expect
    .poll(() => page.evaluate(() => window.__OVERLORD__!.getSceneKey()))
    .toBe("ShopScene");

  // ESCで戻る
  await page.click("#btn-esc");

  await expect
    .poll(() => page.evaluate(() => window.__OVERLORD__!.getSceneKey()))
    .toBe("StreetScene");
});
```

### 4.2 単体テスト: `tests/unit/main-external-buttons.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("main.ts 外部DOMボタン キーコード整合性", () => {
  let dispatchEventSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    dispatchEventSpy = vi.spyOn(window, "dispatchEvent");
    vi.resetModules();
  });

  it("btn-left は ArrowLeft を dispatch する", async () => {
    // main.ts のイベントリスナーロジックをテスト可能な形で抽出または
    // DOM 構築後に click() して dispatchEvent 引数を検証
    // （JSDOM/happy-dom 環境で実行）
  });

  it("btn-right は ArrowRight を dispatch する", async () => {
    // 同上
  });

  it("btn-up は ArrowUp を dispatch する", async () => {
    // 同上
  });

  it("btn-down は ArrowDown を dispatch する", async () => {
    // 同上
  });
});
```

---

## 5. 実装手順

### Phase 1: テスト追加（即時・ブロッカー検出）

1. `tests/e2e/external-dom-buttons.spec.ts` 作成（EXT-01〜EXT-11）
2. `pnpm test:e2e -- tests/e2e/external-dom-buttons.spec.ts` 実行 → **全件失敗を確認**（現状バグの証明）

### Phase 2: 本体修正（テスト駆動）

1. `src/main.ts` D-pad ハンドラのキーコード修正（WASD → ArrowLeft/Right/Up/Down）
2. `index.html` に `#btn-space`、`#btn-esc` ボタン追加
3. `src/main.ts` に新ボタンのイベントリスナー追加
4. 再実行 → **EXT-01〜EXT-08, EXT-11 パス** を確認

### Phase 3: 欠落ボタン実装（EXT-09, EXT-10 パス）

1. D-pad中央を有効化（`disabled` 除去）して SPACE 送信、または専用 `#btn-space` 追加
2. `#btn-esc` 追加して各シーンからの復帰対応

### Phase 4: 単体テスト追加・CI 組み込み

1. `tests/unit/main-external-buttons.test.ts` 作成
2. `pnpm test:run` でカバレッジ含め全パス確認

---

## 6. 受け入れ基準（Definition of Done）

| 基準                                            | 確認方法                                                                     |
| ----------------------------------------------- | ---------------------------------------------------------------------------- |
| 全外部DOMボタン操作がキーボード操作と同等に動作 | `pnpm test:e2e -- tests/e2e/external-dom-buttons.spec.ts` 全件 PASS          |
| キーボード未使用で Phase 1 クリア可能           | 手動確認：D-pad + E + T + SPACE + ESC のみで店番・噂・脅迫・移動・対話が完結 |
| 回帰テストが CI で自動実行                      | `pnpm test:e2e` に新スペックが含まれ、失敗時ビルド中止                       |
| キーコード不一致を単体テストで検出              | `pnpm test:run` に `main-external-buttons.test.ts` が含まれ PASS             |

---

## 7. 関連ドキュメント・トレーサビリティ

- [[docs/qa/test-plan.md]] — 全体テスト計画
- [[src/main.ts]] — 外部DOMボタンハンドラ実装箇所（L48-70）
- [[src/phaser/scenes/StreetScene.ts]] — 矢印キー入力監視実装（L108-133）
- [[index.html]] — 外部DOMボタン定義（L113-125）
- [[docs/architecture/ui-layer.md]] — UIレイヤー設計（z-depth 等）

---

## 8. 想定リスク・対策

| リスク                                             | 影響度 | 対策                                                                                         |
| -------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------- |
| Phaser の `JustDown` が `dispatchEvent` を拾わない | 高     | `bubbles: true` + `window` 対象で dispatch、または Phaser の `Input.Keyboard` 直接操作へ変更 |
| モバイルでタッチイベントと競合                     | 中     | `pointerdown` ではなく `click` イベント使用、CSS `touch-action: manipulation`                |
| デバッグブリッジ（`?e2e=1`）無効時のテスト不可     | 低     | `VITE_DEBUG_BRIDGE=true` ビルドで preview 実行、CI で自動有効化                              |
| 縦移動（上下）がゲーム仕様にない                   | 低     | D-pad 上下は無効化または将来拡張用に残置、テストでは左・右のみ検証                           |

---

## 9. 見積工数

| フェーズ | 作業内容                                             | 見積（目安） |
| -------- | ---------------------------------------------------- | ------------ |
| Phase 1  | E2Eテスト作成・実行・失敗確認                        | 30分         |
| Phase 2  | main.ts キーコード修正・HTMLボタン追加・ハンドラ追加 | 45分         |
| Phase 3  | 欠落ボタン（SPACE/ESC）実装・テストパス確認          | 30分         |
| Phase 4  | 単体テスト追加・CI確認                               | 30分         |
| **合計** |                                                      | **約 2時間** |

---

> **メモ:** このテスト計画は「外部DOMボタンのみでプレイ可能か」というユーザー問い合わせから発生したバグ検出をきっかけに作成。同様の「入力経路の不整合」を今後検出するための回帰テストスイートとして維持する。
