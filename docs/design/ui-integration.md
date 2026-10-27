---

title: UI統合設計（DOMコントローラー＋Canvas UIハイブリッド）
description: Canvas内（ステータスバー・ログコンソール）＋ Canvas外DOMコントローラー（D-pad / E / T / SPACE / ESC）のハイブリッドUI設計。
status: approved
version: "0.4"
category: design
tags:
- design
- ui-integration
- phaser
- hybrid
  traces_to:
- docs/architecture/ui-layer.md
- docs/architecture/input-system.md
- docs/architecture/overview.md
  implemented_by:
- src/main.ts
- src/phaser/scenes/HudScene.ts
- src/phaser/scenes/StreetScene.ts
  verified_by:
- scripts/validate-docs.mjs
- tests/e2e/external-dom-buttons.spec.ts

---

# UI統合設計（DOMコントローラー＋Canvas UIハイブリッド）

> **目的:** Canvas内（ステータスバー・ログコンソール）＋ Canvas外DOMコントローラー（D-pad + アクションキー）のハイブリッドUI設計。外部ボタンクリックをPhaserおよびエンジンに結線する設計と責務分界を定義する。

## ── UIレイヤー構成

```text
┌────────────────────────────────────────────────────────┐
│ Layer 1: Game Scene (Street/Shop/Terminal)             │ z=0
├────────────────────────────────────────────────────────┤
│ Layer 2: Status Bar (Canvas内）                          │ z=500
│ Layer 3: Log Console (Canvas内）                         │ z=600
├────────────────────────────────────────────────────────┤
│ Layer 4: External Controls (Canvas外DOMコントローラー) │ 別座標系
│   ├── D-pad: #btn-up, #btn-down, #btn-left, #btn-right  │ 矢印キー
│   ├── #btn-space → SPACE (NPC対話 / 店番)               │ Spaceキー
│   ├── #btn-esc   → Escape (ストリート復帰)               │ Escapeキー
│   ├── #btn-e     → execute("runShop") / 店番・入店      │ アクション
│   └── #btn-t     → execute("spreadRumor") / 裏工作     │ アクション
└────────────────────────────────────────────────────────┘
```

## ── 責務分界

| 項目                       | 責務                                                             | 実装場所                            |
| :------------------------- | :--------------------------------------------------------------- | :---------------------------------- |
| **ステータスバー描画**     | 資金/恐怖/狂信/警戒度をCanvas内に描画                            | `src/phaser/scenes/HudScene.ts`     |
| **ログコンソール描画**     | システムログ・行動ログをCanvas内に表示                           | `src/phaser/scenes/HudScene.ts`     |
| **外部コントローラー描画** | D-pad + E/T/SPACE/ESC ボタンをDOM配置                            | `index.html` (`.external-controls`) |
| **キーイベント中継**       | D-pad/SPACE/ESC を `window.dispatchEvent` で中継                 | `src/main.ts`                       |
| **アクション実行**         | `#btn-e` / `#btn-t` を `window.executeOverlordAction` 経由で実行 | `src/main.ts`                       |

## ── イベント結線 (`src/main.ts`)

```typescript
// D-pad (Arrow keys)
document.getElementById("btn-left")?.addEventListener("click", () => {
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
});
document.getElementById("btn-right")?.addEventListener("click", () => {
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
});

// SPACE / ESC
document.getElementById("btn-space")?.addEventListener("click", () => {
  window.dispatchEvent(new KeyboardEvent("keydown", { key: " ", code: "Space", bubbles: true }));
});
document.getElementById("btn-esc")?.addEventListener("click", () => {
  window.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Escape", code: "Escape", bubbles: true }),
  );
});

// Direct Actions
document.getElementById("btn-e")?.addEventListener("click", () => {
  window.executeOverlordAction("runShop");
});
document.getElementById("btn-t")?.addEventListener("click", () => {
  window.executeOverlordAction("spreadRumor");
});
```

## ── トレーサビリティ

- [[docs/architecture/ui-layer.md]] — UIレイヤー設計
- [[docs/architecture/input-system.md]] — 入力システム設計
- [[docs/architecture/overview.md]] — アーキテクチャ概要
- [[src/phaser/scenes/StreetScene.ts]] — StreetScene実装
- [[src/phaser/scenes/HudScene.ts]] — HUD UI実装
- [[src/main.ts]] — エントリポイント
