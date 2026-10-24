---

name: save-load-system
description: ゲーム状態を localStorage にシリアライズ/デシリアライズし、バージョニングとマイグレーションを行う。セーブ/ロードの実装・テストに使用。
---

# Skill: save-load-system

## 説明

ゲーム状態を localStorage にシリアライズ/デシリアライズし、バージョニングとマイグレーションを行う。

## 主要ファイル

- `src/core/save/Serializer.ts` — `saveGame()`, `loadGame()` 関数、`VERSION` 定数
- `src/core/save/migrations/v1-migrate.ts` — 初期マイグレーション（恒等変換）
- `src/core/GameState.ts` — `snapshot()`, `restore()` メソッド

## 形式

```json
{
  "version": 1,
  "state": {
    "phase": 1,
    "funds": 10000,
    "fear": 0,
    "faith": 0,
    "suspect": 0,
    "seed": 12345,
    "flags": {}
  },
  "resources": {
    "funds": 10000,
    "fear": 0,
    "faith": 0,
    "suspect": 0
  }
}
```

## 制約

- すべての `GameEngine.execute()` 完了後に自動保存
- ローカルストレージキー: `overlord_syndicate_v1`
- バージョン不一致時は `Serializer.loadGame()` 内でマイグレーションを適用
- 保存状態は循環参照や DOM ノードを含んではならない
- RNG シードは決定論的な復元のため保存データに含める
- Phaser Game オブジェクトをシリアライズしない — プレーンな JSON データのみ
