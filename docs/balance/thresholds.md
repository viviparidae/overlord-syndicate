---

title: Balanceリソース上昇・警戒度上昇の閾値
description: フェーズ遷移条件、リソース上限値、GameOver閾値。
status: approved
version: "0.2"
category: balance
tags:
- thresholds
- phase
- resource-caps
- game-over
  traces_to:
- docs/design/resources.md
- docs/design/mechanics.md
  implemented_by:
- src/balance/Thresholds.ts
  verified_by:
- tests/unit/GameState.test.ts
- tests/integration/game-loop.test.ts

---

# Balanceリソース上昇・警戒度上昇の閾値

## 1. `Thresholds.ts` 概要

フェーズ昇格条件、リソース上限値、ゲームオーバーの最終条件を保持。

### 1.1 フェーズ昇格条件 (`PhaseThresholds`)

```typescript
export const PhaseThresholds = {
  phase1To2: { faith: 50, funds: 50000 },
  phase2To3: { faith: 150, funds: 200000 },
  phase3To4: { faith: 300, funds: 1000000 },
} as const;
```

| 遷移            | 昇格条件 (`meetsThreshold`)          | 備考                 |
| :-------------- | :----------------------------------- | :------------------- |
| **Phase 1 → 2** | `funds >= 50,000 && faith >= 50`     | 地方都市へ進出       |
| **Phase 2 → 3** | `funds >= 200,000 && faith >= 150`   | 首都・国家規模へ拡大 |
| **Phase 3 → 4** | `funds >= 1,000,000 && faith >= 300` | グローバル支配へ到達 |

> **ルール:** フェーズ判定は `GameEngine.applyPhaseAdvance()` 内で `meetsThreshold` を呼び出して自動判定する。

### 1.2 ゲームオーバー条件

```typescript
const GAME_OVER_SUSPECT = 100;
```

- **条件:** `suspect >= 100`（警戒度 100 に到達）
- **結果:** 警察が介入し、即座にゲームオーバーとなる。

## 2. リソース上限値 (`ResourceCaps`)

| リソース           | 上限値     | 備考              |
| :----------------- | :--------- | :---------------- |
| `funds` (資金)     | `Infinity` | 上限なし          |
| `fear` (恐怖)      | `200`      | NPCを屈服させる力 |
| `faith` (狂信)     | `500`      | 民衆の熱狂度      |
| `suspect` (警戒度) | `100`      | 100 で Game Over  |

## 3. テストカバレッジ

- `tests/unit/GameState.test.ts` はフェーズ進行とスナップショットをカバー
- `tests/integration/game-loop.test.ts` はターン進行とリソース変動をカバー
- `tests/e2e/gameover.spec.ts` は警戒度100到達時のゲームオーバーを実ブラウザでカバー
