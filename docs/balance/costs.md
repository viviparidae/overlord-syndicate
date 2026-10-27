---

title: Balanceコストテーブル
description: 各アクションのコストとリワードを定義。Phase 1-4 の経済モデル。
status: approved
version: "0.2"
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

各アクションの実行に必要なコスト（`ActionCosts`）および実行時のリソース変動量（`ActionRewards`）を一元管理する。

### 1.1 コスト定数 (`ActionCosts`)

```typescript
export const ActionCosts = {
  runShop: { funds: 0, time: 1 },
  spreadRumor: { funds: 500, time: 1 },
  intimidate: { funds: 1000, time: 2 },
  broadcastRadio: { funds: 5000, time: 2 },
  politicalSpeech: { funds: 20000, time: 3 },
  buyCompany: { funds: 500000, time: 5 },
  controlDemonstration: { funds: 100000, time: 3 },
} as const;
```

### 1.2 リワード・変動定数 (`ActionRewards`)

```typescript
export const ActionRewards = {
  runShop: { funds: 2000, fear: 0, faith: 1, suspect: 0 },
  spreadRumor: { funds: -500, fear: 3, faith: 5, suspect: 2 },
  intimidate: { funds: -1000, fear: 8, faith: -2, suspect: 5 },
  broadcastRadio: { funds: 0, fear: 15, faith: 25, suspect: 12 },
  politicalSpeech: { funds: 0, fear: 10, faith: 40, suspect: 15 },
  buyCompany: { funds: 0, fear: 30, faith: 50, suspect: 20 },
  controlDemonstration: { funds: 0, fear: 25, faith: 60, suspect: 25 },
} as const;
```

## 2. Phase 1 基本アクション一覧

| アクション名     | 内部ID                | 資金コスト/収入     | 恐怖変化 | 狂信変化 | 警戒度変化 | 備考                           |
| :--------------- | :-------------------- | :------------------ | :------- | :------- | :--------- | :----------------------------- |
| **店番をする**   | `runShop`             | +2,000 JPY (収入)   | 0        | +1       | 0          | 表の顔。安定した資金・評判獲得 |
| **噂を流す**     | `spreadRumor`         | -500 JPY (コスト)   | +3       | +5       | +2         | 裏の顔。安価な民衆煽動         |
| **裏工作付き噂** | `spreadRumorWithWork` | -500 JPY (コスト)   | +3       | +5       | +7 (+2+5)  | リスクを負って工作を進める     |
| **地主を脅迫**   | `intimidate`          | -1,000 JPY (コスト) | +8       | -2       | +5         | 恐怖を武器に対象を屈服させる   |

> **設計思想:** 表の顔（店番）で資金を稼ぎ、裏の顔（噂・脅迫）で狂信・恐怖を拡大する。裏の工作は警戒度を上昇させるため、バランスが重要となる。
