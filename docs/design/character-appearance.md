---

title: キャラクター外観設計
description: キャラクターアセット（プレイヤー・NPC）の外観仕様、アトラス構造、レンダリング設定。
status: draft
version: "0.1"
category: design
tags:
- character-appearance
- design
- assets
  traces_to:
- docs/design/asset-pipeline.md
- docs/asset-licenses.md
- docs/design/ui-integration.md
  implemented_by:
- src/phaser/entities/Player.ts
- src/phaser/entities/NPCs.ts
- src/phaser/scenes/StreetScene.ts
- src/data/assets.json
  verified_by:
- scripts/validate-docs.mjs

---

# キャラクター外観設計

## 1. キャラクター一覧

| キー            | タイプ | アトラスパス                                                 | サイズ | 方向  | 使途            |
| --------------- | ------ | ------------------------------------------------------------ | ------ | ----- | --------------- |
| `player`        | atlas  | `assets/characters/charWorkshopIDemo/20250303demoChar00.png` | 3×4    | 4 dir | プレイヤー      |
| `npc_child`     | atlas  | `assets/characters/charWorkshopIDemo/20250303demoChar01.png` | 3×4    | 4 dir | 子供NPC         |
| `npc_housewife` | atlas  | `assets/characters/charWorkshopIDemo/20250303demoChar02.png` | 3×4    | 4 dir | 主婦NPC         |
| `npc_salaryman` | atlas  | `assets/characters/charWorkshopIDemo/20250303demoChar03.png` | 3×4    | 4 dir | サラリーマンNPC |
| `npc_landlord`  | atlas  | `assets/characters/charWorkshopIDemo/20250303demoChar04.png` | 3×4    | 4 dir | 家主NPC         |

## 2. レンダリング設定

- `setDisplaySize(72, 128)` — プレイヤー / NPC（縦長ドットアスペクト比）
- `setOrigin(0.5, 1)` — 足元原点
- `setDepth(200)` — プレイヤー > NPC > 背景
- `Phaser.Physics.Arcade.Sprite` — 物理対応

> **リンク:** [[docs/design/asset-pipeline]] — アセットパイプライン
