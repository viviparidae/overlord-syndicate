---

title: データスキーマ（対話・イベント）
description: ゲーム内で使用する構造化データの定義とスキーマ。
status: draft
version: "0.2"
category: architecture
tags:
- data
- schema
- dialogue
- events
  traces_to:
- docs/design/mechanics.md
  implemented_by:
- src/data/dialogue/phase1.ts
- src/data/events/phase1.ts
  verified_by:
- tests/integration/game-loop.test.ts
- tests/integration/event-system.test.ts

---

# データスキーマ

## 1. `src/data/dialogue/`

### 1.1 `phase1.ts`

Phase 1 のNPC対話マスターデータ。

```typescript
export interface DialogueEntry {
  id: string;
  speaker: string;
  text: string;
  options?: DialogueOption[];
}

export interface DialogueOption {
  text: string;
  action: string;
  nextId?: string;
}
```

### 1.2 構造方針

- Phase 1 では型安全な TypeScript データ定義として管理。
- 各NPC（子供・主婦・サラリーマン・悪徳地主）の初期台詞および選択肢（店に入る / 噂を聞く / 裏工作パネルを開く / 立ち去る）を定義。

## 2. `src/data/events/`

### 2.1 `phase1.ts`

```typescript
export interface EventEntry {
  id: string;
  title: string;
  description: string;
  trigger: string;
  effect: {
    resources: { funds?: number; fear?: number; faith?: number; suspect?: number };
    phaseAdvance?: boolean;
  };
}
```

### 2.2 イベント定義ポリシー

- イベントトリガーは各アクション（`runShop`, `spreadRumor`, `spreadRumorWithWork`）に対応。
- `effect.resources` はリソース変化量への数値マッピング。
