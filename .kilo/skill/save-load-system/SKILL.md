# Skill: save-load-system

## 説明
ゲーム状態を localStorage にシリアライズ/デシリアライズし、バージョニングとマイグレーションを行う。

## 主要ファイル
- `src/core/save/Serializer.ts` — `save()`、`load()`、`clear()`、`migrate()`
- `src/core/save/migrations/v1-migrate.ts` — アイデンティティマイグレーション (初期)

## 形式
```json
{
  "version": 1,
  "timestamp": "1997-04-20T12:00:00.000Z",
  "resources": { "funds": 10000, "fear": 5, "faith": 2, "suspect": 0 },
  "phase": 1,
  "flags": { "shopEstablished": true }
}
```

## 制約
- すべての `GameEngine.execute()` 完了後に自動保存
- 最大 5 スロット (localStorage キー: `overlord_syndicate_v1_slot0..4`)
- バージョン不一致時は、現在のバージョンから対象バージョンまでマイグレーションチェーンを実行
- 保存状態は循環参照や DOM ノードを含んではならない
- RNG シードは決定論的な復元のため保存データに含める
- Phaser Game オブジェクトをシリアライズしない — プレーンな JSON データのみ