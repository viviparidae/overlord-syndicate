---

title: UI統合設計（DOMボタン＋Canvas UIハイブリッド）
description: Canvas内（ステータスバー・ログコンソール）＋ Canvas外DOM（コマンドボタン）のハイブリッドUI設計。DOMボタンとPhaserエンジンのイベント結線、責務分界、遷移設計を含む。
status: approved
version: "0.3"
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

---

# UI統合設計（DOMボタン＋Canvas UIハイブリッド）

> **目的:** Canvas内（ステータスバー・ログコンソール）＋ Canvas外DOM（コマンドボタン）のハイブリッドUI設計。DOMボタンクリックをPhaserエンジンのactionに結線する設計と責務分界を定義する。

## ── UIレイヤー構成

```text
┌─────────────────────────────────────────────────┐
│ Layer 1: Game Scene (Street/Shop/Terminal)      │ z=0
├─────────────────────────────────────────────────┤
│ Layer 2: Status Bar (Canvas内）                   │ z=800
│ Layer 3: Log Console (Canvas内）                  │ z=900
├─────────────────────────────────────────────────┤
│ Layer 4: Command Panel (Canvas外DOMボタン)        │ 別座標系
│   ├── #btn-shop    → engine.execute("runShop")
│   ├── #btn-rumor   → engine.execute("spreadRumor")
│   └── #btn-intimidate → engine.execute("intimidate")
└─────────────────────────────────────────────────┘
```

## ── 責務分界

| 項目               | 責務                                            | 実装場所                        |
| ------------------ | ----------------------------------------------- | ------------------------------- |
| ステータスバー描画 | 資金/恐怖/狂信/警戒度をCanvas内に描画           | `src/phaser/scenes/HudScene.ts` |
| ログコンソール描画 | システムログをCanvas内に表示                    | `src/phaser/scenes/HudScene.ts` |
| コマンドボタン描画 | 3つのDOMボタンを配置                            | `index.html`                    |
| ボタンクリック処理 | クリックイベントを`engine.execute()`に結線      | `src/main.ts`                   |
| アクション実行     | `runShop`/`spreadRumor`/`intimidate`のstate遷移 | `src/core/actions/`             |

## ── イベント結線

```typescript
// src/main.ts
document.getElementById("btn-shop")!.addEventListener("click", () => {
  engine.execute("runShop");
});
document.getElementById("btn-rumor")!.addEventListener("click", () => {
  engine.execute("spreadRumor");
});
document.getElementById("btn-intimidate")!.addEventListener("click", () => {
  engine.execute("intimidate");
});
```

`engine.execute(actionId)` は `src/core/actions/` に登録されたアクションを実行し、state（funds/fear/faith/suspect）を更新。更新はEventSystemを介してHudSceneのステータスバー・ログコンソールに反映される。

## ── 実装ステップ

1. `index.html`に`#command-panel`と3つのDOMボタンを追加
2. `src/main.ts`でボタンクリック→`engine.execute()`を結線
3. `src/phaser/scenes/HudScene.ts`からCanvas内コマンドパネルを削除
4. `src/core/actions/`のrunShop/spreadRumor/intimidateを実装

## ── トレーサビリティ

- [[docs/architecture/ui-layer.md]] — UIレイヤー設計
- [[docs/architecture/input-system.md]] — 入力システム設計
- [[docs/architecture/overview.md]] — アーキテクチャ概要
- [[src/phaser/scenes/StreetScene.ts]] — StreetScene実装
- [[src/phaser/scenes/HudScene.ts]] — HUD UI実装
- [[src/main.ts]] — エントリポイント
