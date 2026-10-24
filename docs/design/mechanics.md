---

title: アクション・イベント仕様
description: 純粋アクション関数の仕様、イベントシステム、RNG決定論、セーブ/ロード要件、ActionResult型定義。
status: draft
version: "0.1"
category: design
tags:
- mechanics
- actions
- events
- rng
- save-load
- game-design
  traces_to:
- docs/design/resources.md
- docs/architecture/save-format.md
  implemented_by:
- src/core/GameEngine.ts
- src/core/actions/types.ts
- src/core/actions/registry.ts
- src/core/actions/runShop.ts
- src/core/actions/spreadRumor.ts
- src/core/actions/intimidate.ts
- src/core/EventSystem.ts
- src/core/RNG.ts
- src/core/save/Serializer.ts
  verified_by:
- tests/unit/Resources.test.ts
- tests/unit/actions.runShop.test.ts
- tests/integration/event-system.test.ts
- tests/integration/game-loop.test.ts

---

# アクション・イベント仕様

## 1. アクション処理のアーキテクチャ

```
UI (Phaser Canvas / CommandPanel) → GameEngine.execute(actionId, context)
                           ↓
                    actions/{actionId}.ts (純粋関数)
                           ↓
                    ActionResult を返す
                           ↓
                    GameEngine が Resources + GameState を適用
                           ↓
                    EventSystem.emit('resourcesChanged' | 'phaseChanged' | ...)
                           ↓
                    src/phaser/scenes/ (Canvas内UI) が購読して再描画
                           ↓
                    GameState.snapshot() → localStorage 自動保存
```

> **制約:** `src/core/actions/*.ts` は **純粋関数**。副作用（状態変更・I/O・乱数生成）を持たない。`ActionResult` のみ返す。

---

## 2. 共通型定義

### 2.1 `ActionContext`（アクション実行時の読み取り専用コンテキスト）

```typescript
// src/core/actions/types.ts
interface ActionContext {
  readonly resources: Readonly<ResourcesSnapshot>;
  readonly gameState: Readonly<GameStateSnapshot>;
  readonly rng: RNG; // 決定論的乱数（シード固定）
  readonly phase: PhaseNumber; // 1 | 2 | 3 | 4
  readonly timestamp: number; // ゲーム内経過ターン数
}
```

### 2.2 `ActionResult`（アクションの戻り値）

```typescript
// src/core/actions/types.ts
interface ActionResult {
  readonly success: boolean; // 成否
  readonly resourceDelta: ResourceDelta; // リソース変化量
  readonly narrativeKey?: string; // 表示用ローカライズキー
  readonly narrativeParams?: Record<string, string | number>;
  readonly unlocks?: string[]; // アンロック要素ID
  readonly flags?: Record<string, boolean>; // フラグ操作
}

interface ResourceDelta {
  funds?: number;
  fear?: number;
  faith?: number;
  suspect?: number;
}
```

> **ルール:** `resourceDelta` は正負両方許容。`GameEngine` が `Resources` に適用する。

---

## 3. 定義済みアクション仕様（`src/core/actions/`）

### 3.1 `runShop.ts` — 店番をする（表の顔）

| 項目         | 値                                                                |
| ------------ | ----------------------------------------------------------------- |
| **ID**       | `runShop`                                                         |
| **前提条件** | Phase 1 以上、営業時間内                                          |
| **コスト**   | 時間 1 ターン、`funds` 変化なし                                   |
| **効果**     | `funds +500~2000`（RNG）、`faith +1~3`、`suspect -2`              |
| **失敗条件** | なし（常に成功）                                                  |
| **RNG使用**  | `rng.nextInt(500, 2000)` for funds, `rng.nextInt(1, 3)` for faith |

### 3.2 `spreadRumor.ts` — 噂を流す（裏の顔）

| 項目         | 値                                                                  |
| ------------ | ------------------------------------------------------------------- |
| **ID**       | `spreadRumor`                                                       |
| **前提条件** | `funds >= Costs.spreadRumor`、噂ストック ≥ 1                        |
| **コスト**   | `funds -10000`、噂ストック -1                                       |
| **効果**     | `faith +15`、対象 `fear +20`、`suspect +8`                          |
| **失敗条件** | RNG `< 0.1` で「噂が広まらなかった」→ `faith +0`, `suspect +3` のみ |
| **RNG使用**  | `rng.nextFloat() < 0.9` で成功判定                                  |

### 3.3 `intimidate.ts` — 脅迫する（裏の顔）

| 項目         | 値                                                                                  |
| ------------ | ----------------------------------------------------------------------------------- |
| **ID**       | `intimidate`                                                                        |
| **前提条件** | `fear >= Costs.intimidate.fear`、ターゲットが「脅迫可能」状態                       |
| **コスト**   | `fear -30`                                                                          |
| **効果**     | `funds +50000`、ターゲット屈服フラグ `flags.targetSubdued = true`、`suspect +15`    |
| **失敗条件** | ターゲットの `fearResist > rng.nextFloat()` → `funds +0`, `suspect +25`、フラグなし |
| **RNG使用**  | 抵抗判定に使用                                                                      |

### 3.4 Phase 2 以降で追加されるアクション（予定）

| ID                    | 名称           | Phase | 概要                                                          |
| --------------------- | -------------- | ----- | ------------------------------------------------------------- |
| `radioBroadcast`      | 電波ジャック   | 2     | 深夜ラジオを乗っ取り `faith +100`, `fear +30`, `suspect +35`  |
| `stageSpeech`         | 街頭演説       | 2     | `funds -50000` で `faith +40`, 周囲 `fear +10`, `suspect +20` |
| `mediaTakeover`       | メディア支配   | 3     | 全国ネット掌握。大規模 `faith` 獲得                           |
| `corporateBuyout`     | 企業買収       | 3     | `funds` 大量消費で恒久的 `funds` 収入源獲得                   |
| `controlDemo`         | デモ統制       | 3     | 狂信を物理的力に変換                                          |
| `globalFinanceHack`   | 世界金融ハック | 4     | 勝利への最終アクション                                        |
| `infoNetworkDominate` | 情報網掌握     | 4     | 勝利への最終アクション                                        |

> 実装時は `Costs.ts` にコストを、`Thresholds.ts` に成功率・効果量を定義し、アクション関数内で参照する。

---

## 4. イベントシステム（`src/core/EventSystem.ts`）

### 4.1 イベント型定義

```typescript
// src/core/EventSystem.ts
type GameEventMap = {
  resourcesChanged: ResourcesSnapshot;
  phaseChanged: { from: PhaseNumber; to: PhaseNumber };
  actionExecuted: { actionId: string; result: ActionResult };
  gameOver: { reason: GameOverReason };
  victory: void;
  rumorAcquired: { rumorId: string; source: string };
  targetSubdued: { targetId: string };
};
```

### 4.2 購読/発行 API

```typescript
class EventSystem {
  on<K extends keyof GameEventMap>(
    event: K,
    listener: (payload: GameEventMap[K]) => void,
  ): () => void;
  off<K extends keyof GameEventMap>(event: K, listener: (payload: GameEventMap[K]) => void): void;
  emit<K extends keyof GameEventMap>(event: K, payload: GameEventMap[K]): void;
}
```

### 4.3 主な発行タイミング

| イベント               | 発行元                              | 購読側（主なもの）                                                       |
| ---------------------- | ----------------------------------- | ------------------------------------------------------------------------ |
| `resourcesChanged`     | `GameEngine.execute()` 後           | `src/phaser/scenes/`（StatusBar更新）                                    |
| `phaseChanged`         | `GameState.setPhase()`              | `src/phaser/scenes/`（Phase表示・ログ）, UIイベントブリッジ              |
| `actionExecuted`       | `GameEngine.execute()`              | `src/phaser/scenes/`（Log Console）, `src/ui/persistence.ts`（自動保存） |
| `gameOver` / `victory` | `GameState.checkGameOver/Victory()` | `src/phaser/scenes/`（GameOver Overlay）, UIイベントブリッジ             |

---

## 5. RNG・決定論（`src/core/RNG.ts`）

### 5.1 仕様

- アルゴリズム: **mulberry32**（高速・期間 2^32・種固定で完全決定論的）
- シード: ゲーム開始時（ニューゲーム/ロード時）に 1 回だけ設定
- 用途: アクション成功率、資金変動幅、イベント発生判定、会話分岐

### 5.2 インターフェース

```typescript
// src/core/RNG.ts
class RNG {
  constructor(seed: number);
  nextInt(min: number, maxInclusive: number): number; // [min, max]
  nextFloat(): number; // [0, 1)
  nextBoolean(probability: number): boolean; // true with prob
  clone(): RNG; // 分岐用（シミュレーション等）
  getState(): number; // シード値取得
}
```

### 5.3 リプレイ可能性要件

- 同一シード・同一操作列 → 完全同一結果
- セーブデータに `rngSeed` を含め、ロード時に復元
- デバッグ用に「シード表示・再生成」機能を持つ

---

## 6. セーブ/ロード要件（`src/core/save/`）

### 6.1 セーブ形式

```typescript
// src/core/save/types.ts
interface GameStateSnapshot {
  version: number; // 現在: 1
  rngSeed: number; // RNG 状態復元用
  phase: PhaseNumber;
  resources: ResourcesSnapshot; // funds, fear, faith, suspect
  flags: Record<string, boolean>; // フラグ（ターゲット屈服等）
  unlockedActions: string[]; // アンロック済みアクションID
  rumorStock: string[]; // 所持噂IDリスト
  timestamp: number; // ゲーム内ターン数
  playtimeMs: number; // 実プレイ時間
}
```

### 6.2 自動保存トリガー

- `GameEngine.execute(action, context)` が **正常完了** した直後
- フェーズ昇格時
- 手動保存コマンド実行時

### 6.3 マイグレーション方針

- `src/core/save/migrations/v{N}-migrate.ts` にバージョンごと配置
- `Serializer.deserialize()` 内で `version` 見て順番に適用
- 破壊的変更（フィールド削除・型変更）は新バージョンで吸収、旧セーブを壊さない

### 6.4 セーブキー・ストレージ

- キー: `overlord_syndicate_v1`
- ストレージ: `localStorage`
- 容量制限: 5MB 未満（JSON 圧縮なしで十分）

---

## 7. テスト観点（QA 参照）

| 観点              | 確認内容                                            |
| ----------------- | --------------------------------------------------- |
| アクション純粋性  | 同一 `ActionContext` で同一 `ActionResult` を返す   |
| リソース不変性    | `Resources` 経由以外で値が変わらない                |
| 決定論性          | 同一シード・同一操作で同一ログ・同一セーブ          |
| セーブ/ロード循環 | セーブ→ロード→セーブ で同一スナップショット         |
| フェーズ遷移      | `Thresholds.canPromote()` 境界値（上限・下限）      |
| GameOver 判定     | `suspect == 99` → 安全、`suspect == 100` → GameOver |

> `src/core/` のユニットテストは `happy-dom` 不要で実行可能。`pnpm test:run` で全 PASS・カバレッジ 80% 以上を維持（AGENTS.md §6）。
