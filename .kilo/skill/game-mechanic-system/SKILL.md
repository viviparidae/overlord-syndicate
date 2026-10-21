---
name: game-mechanic-system
description: Overlord Syndicate の純粋ゲームロジックレイヤーを実装・テストする。リソース追跡、フェーズステートマシン、アクション処理、イベントシステム、RNG など。
---
# Skill: game-mechanic-system

## 説明
Overlord Syndicate の純粋ゲームロジックレイヤーを実装・テストする。

## 使用時
- リソース追跡、フェーズステートマシン、アクション処理、イベントシステム、RNG など。

## 主要ファイル
- `src/core/Resources.ts` — 資金/恐怖/狂信/警戒度トラッカークラス
- `src/core/GameState.ts` — フェーズFSM (1→2→3→4)、勝敗条件
- `src/core/EventSystem.ts` — 型付きエミッタ (on/off/emit)
- `src/core/RNG.ts` — シード付きの mulberry32
- `src/core/actions/*.ts` — 純粋アクション処理 (runShop, spreadRumor, intimidate)

## データフロー
1. プレイヤークリック → `src/ui/index.ts` の `setupCommandListeners()`
2. アクション → `GameEngine.execute(action, context)`
3. `GameEngine` が純粋 `actions/*.ts` を呼び出し
4. アクションが `Resources` + `GameState` を変更
5. イベント発行 → UI がイベント購読で更新
6. `GameState.snapshot()` を localStorage に自動保存

## 制約
- `src/core/` 内で Phaser 禁止
- すべてのアクションは純粋関数、`ActionResult` のみ返す
- RNG はゲーム開始時にシードして決定論を保証
- すべてのリソース変更は `Resources` クラス経由（直接代入禁止）
- 状態の直接操作禁止: `Resources.addFunds()`、`GameState.setPhase()` を使用