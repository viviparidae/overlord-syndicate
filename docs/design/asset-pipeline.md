---

title: アセットパイプライン
description: アセット読み込み・検証・レンダリングのパイプライン設計。
status: draft
version: "0.1"
category: design
tags:
- asset-pipeline
- design
- assets
  traces_to:
- docs/design/character-appearance.md
- docs/asset-licenses.md
- src/data/assets.ts
  implemented_by:
- src/data/assets.json
- src/phaser/Game.ts
- src/phaser/config.ts
  verified_by:
- scripts/validate-assets

---

# アセットパイプライン

## 1. 読み込み

`assets.json` → `Phaser.Loader` → Atlas（PNG + JSON）

## 2. 検証

- `scripts/validate-assets` — ライセンス確認
- `docs/asset-licenses.md` — 帰属情報

## 3. レンダリング

Phaser Canvas 内 UI（ステータスバー・ログ）と DOM ボタンのハイブリッド（[[docs/design/ui-integration]]）と連携。
