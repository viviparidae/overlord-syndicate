---

title: リソース定義とフェーズ進行
description: 資金/恐怖/狂信/警戒度の定義、フェーズ遷移条件、勝敗条件、二面性パラメーター仕様。
status: draft
version: "0.1"
category: design
tags:
- resources
- phases
- balance
- game-design
  traces_to:
- docs/design/game-loop.md
- docs/balance/costs.md
- docs/balance/thresholds.md
  implemented_by:
- src/core/Resources.ts
- src/core/GameState.ts
- src/balance/Costs.ts
- src/balance/Thresholds.ts
  verified_by:
- tests/unit/Resources.test.ts
- tests/unit/GameState.test.ts

---

# リソース定義とフェーズ進行

## 1. 核心リソース（4リソース）

| 内部名    | 表示名     | 型       | 範囲           | 役割                               | 上昇時の副作用                                                           |
| --------- | ---------- | -------- | -------------- | ---------------------------------- | ------------------------------------------------------------------------ |
| `funds`   | 資金 (JPY) | `number` | `0 ~ Infinity` | 店運営・賄賂・不動産・工作資金     | なし                                                                     |
| `fear`    | 恐怖       | `number` | `0 ~ Infinity` | NPC を脅迫・屈服させる力           | **警戒度 `suspect` が悪化**（`Thresholds.fearToSuspectRate` 倍率で加算） |
| `faith`   | 狂信       | `number` | `0 ~ 100`      | 民衆の熱狂。無償手駒・支持率に変換 | なし                                                                     |
| `suspect` | 警戒度     | `number` | `0 ~ 100`      | 警察/行政の注目度                  | **100 でゲームオーバー**                                                 |

> **注意:** すべてのリソース変更は `Resources` クラス経由で行う。直接代入（`state.funds = 100`）禁止。

### 1.1 リソース変更 API（`src/core/Resources.ts`）

```typescript
class Resources {
  addFunds(amount: number): void; // 資金増減
  addFear(amount: number): void; // 恐怖増加 → 内部で suspect も増加
  addFaith(amount: number): void; // 狂信増加
  addSuspect(amount: number): void; // 警戒度直接操作（稀）
  getFunds(): number;
  getFear(): number;
  getFaith(): number;
  getSuspect(): number;
  snapshot(): ResourcesSnapshot; // セーブ用
}
```

### 1.2 恐怖 → 警戒度の変換式

```typescript
// Thresholds.ts に定義
const FEAR_TO_SUSPECT_RATE = 0.15; // 恐怖 +100 → 警戒度 +15
suspect += fearDelta * FEAR_TO_SUSPECT_RATE;
```

---

## 2. フェーズ進行（4 Phase）

| Phase | 名称             | 舞台                   | 主たる手段                             | 警戒度上限 | 昇格条件（`Thresholds.ts`）        |
| ----- | ---------------- | ---------------------- | -------------------------------------- | ---------- | ---------------------------------- |
| 1     | シャッター商店街 | 実家の文房具店、商店街 | 噂収集、悪徳地主の追放、店経営         | 30         | `funds >= 50000 && faith >= 50`    |
| 2     | 地方都市         | 深夜ラジオ、ローカルTV | 電波ジャック、演説、デモ誘導           | 60         | `funds >= 200000 && faith >= 150`  |
| 3     | 首都・国家       | 全国ネット、大企業     | メディア支配、企業買収、大規模デモ統制 | 85         | `funds >= 1000000 && faith >= 300` |
| 4     | グローバル       | 世界金融・情報網       | 金融ハック、情報網掌握                 | 100 (敗北) | グローバル支配完了                 |

> **実装ルール:** フェーズ昇格条件は `GameEngine.applyPhaseAdvance()` 内で `meetsThreshold` を呼び出して評価する。

### 2.1 フェーズごとのアンロック要素

| Phase | 新規アクション                             | 新規イベント                       | 新規エリア                   |
| ----- | ------------------------------------------ | ---------------------------------- | ---------------------------- |
| 1     | `runShop`, `spreadRumor`, `intimidate`     | 商店街の噂イベント                 | 文房具店、路地裏、商店街通り |
| 2     | `broadcastRadio`, `politicalSpeech`        | 深夜ラジオイベント、地方局ジャック | 放送局、繁華街、住宅地       |
| 3     | `buyCompany`, `controlDemonstration`       | 全国ネットイベント、企業買収劇     | テレビ局、大企業本社、国会前 |
| 4     | `globalFinanceHack`, `infoNetworkDominate` | 世界金融イベント                   | 世界銀行、衛星ネットワーク   |

---

## 3. 勝敗条件

### 3.1 勝利条件

- **Phase 4 到達** かつ 警戒度 100 未満を維持して世界支配を完了

### 3.2 敗北条件（Game Over）

- **警戒度 `suspect >= 100`** 到達時点（警察介入）
- 実装: `Resources.isGameOver()` または `GameState.isGameOver()`

---

## 4. 二面性パラメーター仕様

### 4.1 表の顔（Public / 日常パート）

| アクション             | 費用       | 効果                       | 警戒度変化 |
| ---------------------- | ---------- | -------------------------- | ---------- |
| 店番をする (`runShop`) | 時間コスト | `funds +2000` / `faith +1` | なし       |

### 4.2 裏の顔（Private / 侵食パート）

| アクション                             | 費用           | 効果                     | 警戒度変化 |
| -------------------------------------- | -------------- | ------------------------ | ---------- |
| 噂を流す (`spreadRumor`)               | `funds -500`   | `faith +5` / `fear +3`   | `+2`       |
| 裏工作付き噂 (`spreadRumorWithWork`)   | `funds -500`   | `faith +5` / `fear +3`   | `+7`       |
| 地主を脅迫する (`intimidate`)          | `funds -1000`  | `fear +8` / `faith -2`   | `+5`       |
| 電波ジャック (`broadcastRadio`) (予定) | `funds -5000`  | `faith +25` / `fear +15` | `+12`      |
| 街頭演説 (`politicalSpeech`) (予定)    | `funds -20000` | `faith +40` / `fear +10` | `+15`      |

> **設計意図:** 表の顔で「時間」を使って警戒度を下げ資金を稼ぎ、裏の顔で「資金・恐怖」を使って狂信を稼ぐが警戒度が上がる。この **時間 vs 警戒度** のトレードオフが核心ループ。

---

## 5. Balanceテーブル参照（`src/balance/` と対応）

| ファイル        | 定義内容                                          | このドキュメントの該当節  |
| --------------- | ------------------------------------------------- | ------------------------- |
| `Costs.ts`      | 各アクションのコスト（資金/恐怖/時間）            | §4.1, §4.2 表の「費用」列 |
| `Thresholds.ts` | 恐怖→警戒度レート、フェーズ昇格条件、GameOver閾値 | §1.2, §2 表、§3           |

> 実装時は **数値をハードコードせず、必ず `Costs` / `Thresholds` から読む** こと。
