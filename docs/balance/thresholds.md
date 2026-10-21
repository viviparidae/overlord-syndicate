---
title: Balanceリソース上昇・警戒度上昇の閾値

description: フェーズ遷移条件、恐怖から警戒度の変換、GameOver閾値。

status: draft
version: "0.1"
category: balance
tags:
  - thresholds
  - phase
  - fear-to-suspect
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

フェーズ昇格条件、恐怖→警戒度変換式、ゲームオーバーの最終条件を保持。

### 1.1 フェーズ昇格条件

| Phase | 条件（`canPromote(phase, resources)`） | 影響 |
|-------|--------------------------------------|------|
| 1→2 | `resources.funds >= 500000 && resources.faith >= 35 && resources.suspect <= 60` | 次の Phase へ遷移 |
| 2→3 | `resources.funds >= 5000000 && resources.faith >= 65 && resources.suspect <= 85` | 次の Phase へ遷移 |
| 3→4 | `resources.funds >= 50000000 && resources.faith >= 90 && resources.suspect >= 95` | 次の Phase へ遷移 (Phase 4) |

> **ルール:** Phase 1→2 はフェーズ昇格後の初回ターンで評価。`if (phase === 3)` のような直接比較を書かない。`Thresholds.canPromote()` を呼ぶ。

### 1.2 恐怖 → 警戒度の変換

```typescript
const FEAR_TO_SUSPECT_RATE = 0.15; // 0.15 (fear +100 → suspect +15)

suspect += fearDelta * FEAR_TO_SUSPECT_RATE;
```

### 1.3 ゲームオーバーの最終条件

```typescript
const GAME_OVER_SUSPECT = 100;
const SUSPECT_WARNING = 90; // 警告のみ
```

> **上限チェック:** `suspect >= GAME_OVER_SUSPECT` で即座に `gameOver()` を発火。

## 2. Phaseごとの警戒度上限（Phase 安全範囲）

| Phase | 警戒度上限 | 安全範囲 |
|-------|------------|--------|
| 1 | 30 | `suspect <= 30` |
| 2 | 60 | `suspect <= 60` |
| 3 | 85 | `suspect <= 85` |
| 4 | 100 | `suspect <= 95` で勝利、そうでないと Game Over |

> **Phase 1-3 での Phase 昇格条件:** Phase 上限（上記）を満たす必要がある。Phase 4 では勝利閾値 `suspect >= 95` が必要。

## 3. リソース上限値（ゲームバランス）

| リソース | 上限 | 備考 |
|----------|-----|------|
| `funds` | `Infinity` | 実用上は安全 | `Number.MAX_SAFE_INTEGER` |
| `fear` | `Infinity` | 上限なし。上昇 → 警戒度悪化 |
| `faith` | 100 | 100% で全住民を掌握 |
| `suspect` | 100 | 100 で Game Over |

> **上限チェック:** `fear` は上限なし。`faith` は `99.9` でほぼ満タン。`suspect` は `95` で警告、「100」以降で Game Over。

## 4. テストカバレッジ

- `GameState.test.ts` は `canPromote` と境界ケース（例: `suspect == 99`）をカバー
- `game-loop.test.ts` は Phase 遷移と最終昇格をカバー
- `pnpm test:run` で全 PASS → Thresholds の検証完了