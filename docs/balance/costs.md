---
title: Balanceコストテーブル
description: 各アクションのコストとリワードを定義。Phase 1-4 の経済モデル。
status: draft
version: "0.1"
category: balance
tags:
  - costs
  - balance
  - economic-model
traces_to:
  - docs/design/resources.md
  - docs/design/mechanics.md
implemented_by:
  - src/balance/Costs.ts
verified_by:
  - tests/unit/actions.runShop.test.ts
  - tests/unit/Resources.test.ts
---

# Balanceコストテーブル

## 1. `Costs.ts` 概観

各アクションの実行に必要なリソース量（主に `funds`）を保持。Phase 1-4 でのリワード（狂信増加）も含まれる。

### 1.1 コスト定数

```typescript
export const Costs = {
  runShop: {
    funds: 0,
    fear: 0,
    faith: 0,
    suspect: 0,
    durationTurns: 1
  },
  spreadRumor: {
    funds: 10000,
    fear: 0,
    faith: 0,
    suspect: 0,
    rumorId: "rumor_001"
  },
  intimidate: {
    funds: 0,
    fear: 30,
    faith: 0,
    suspect: 0,
    targetRequired: true
  },
  stageSpeech: {
    funds: 50000,
    fear: 0,
    faith: 0,
    suspect: 0,
    phaseRequired: 2
  },
  radioBroadcast: {
    funds: 200000,
    fear: 0,
    faith: 0,
    suspect: 0,
    phaseRequired: 2,
    reputationThreshold: 10
  },
  mediaTakeover: {
    funds: 1000000,
    fear: 0,
    faith: 0,
    suspect: 0,
    phaseRequired: 3
  },
  corporateBuyout: {
    funds: 5000000,
    fear: 0,
    faith: 0,
    suspect: 0,
    phaseRequired: 3
  }
};
```

### 1.2 コスト計算ロジック

```typescript
function applyCost(context: ActionContext, actionId: string): number {
  const cost = Costs[actionId];
  if (!cost) throw new Error(`Cost not defined for ${actionId}`);

  // 実行前に所有リソースを確認し、エラーで停止
  // phase 指定がある場合は Phase 2-4 の制限
  // cost は `Resources.addFunds(-cost.funds)` などで適用
  return cost.funds;
}
```

## 2. Phase 1-4 でのコスト調整

| Phase | runShop | spreadRumor | intimidate | stageSpeech | radioBroadcast |
|-------|---------|-------------|------------|-------------|---------------|
| 1 | 資金変化なし | 100,000 | なし | なし | なし |
| 2 | 資金変化なし | 200,000 | なし | 500,000 | 2,000,000 |
| 3 | 資金変化なし | 300,000 | なし | 600,000 | 2,500,000 |
| 4 | 資金変化なし | 400,000 | なし | 700,000 | 3,000,000 |

*Phase 2-4 以降の `stageSpeech` / `radioBroadcast` は `phase` 条件を満たさないとエラーでキャンセルされる*

> **Balance Philosophy:** 「効率 vs リスク」バランスを調整。Phase 2 以降でコストを増加させつつ狂信リワードも増加し、戦略的拡張を促進する。

## 3. リワードテーブルの統合

リワード（`faith` 増加）は Balance テーブルではなくアクションロジック内で保持。例:

```typescript
// src/core/actions/spreadRumor.ts
const RUMOR_FIDELITY_GAIN = {
  1: 15,
  2: 20,
  3: 25,
  4: 30
}[context.phase];
```

> **ガイドライン:** Balance テーブルは入力コストのみ。リワードはロジック・段階・ランダム性から導出（ドキュメントからの派生ロジック禁止）。