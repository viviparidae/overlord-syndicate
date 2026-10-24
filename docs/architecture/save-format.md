---

title: セーブ形式とバージョン管理
description: セーブキー、Snapshotスキーマ、バージョン管理とマイグレーション方針。
status: draft
version: "0.2"
category: architecture
tags:
- save
- version
- migration
- snapshot
  traces_to:
- docs/design/mechanics.md
  implemented_by:
- src/core/save/Serializer.ts
- src/core/GameState.ts
- src/ui/persistence.ts
  verified_by:
- tests/unit/save.Serializer.test.ts
- tests/e2e/save-load.spec.ts

---

# セーブ形式とバージョン管理

## 1. セーブキー

ローカルストレージキー: `overlord_syndicate_v1`。

> **注:** `vX` サフィックスはメジャーバージョン（互換性変更）を示します。`localStorage` には最終的に最新バージョンのみ保持されますが、マイグレーションが未実行の場合、古いキーもサーバー側で取得してマージされます。

## 2. スナップショット形式

```typescript
export interface GameStateSnapshot {
  version: number; // セーブ形式のバージョン（`Serializer.VERSION` から）
  rngSeed: number; // シード固定の乱数生成用
  phase: PhaseNumber; // 現在のフェーズ (1-4)
  resources: ResourcesSnapshot; // 4コアリソースのスナップショット
  flags: Record<string, boolean>; // フラグ（ターゲット屈服等）
  unlockedActions: string[]; // アンロック済みアクションIDのリスト
  rumorStock: string[]; // 所持噂ID
  timestamp: number; // ゲーム内ターン数
  playtimeMs: number; // 実プレイ時間
}
```

### 2.1 リソーススナップショット

```typescript
export interface ResourcesSnapshot {
  funds: number;
  fear: number;
  faith: number;
  suspect: number;
}
```

### 2.2 セーブ時の追加ルール

- `rngSeed` は `src/core/RNG.ts` の `getState()` でシリアライズ
- `flags` には `targetSubdued`, `eventTrigger` などを格納
- `rumorStock` には `src/core/actions/spreadRumor.ts` の噂IDを格納（永続化により噂の「記憶」を可能にする）
- `timestamp` は `src/core/GameEngine.ts` の `currentTurn` から
- `playtimeMs` は `Date.now()` を使用して測定し、リアルタイム経過を保存

## 3. マイグレーション

`src/core/save/migrations/` にバージョンごとに置いておく:

| バージョン | 対象ファイル                             | 目的                             |
| ---------- | ---------------------------------------- | -------------------------------- |
| v1         | `src/core/save/migrations/v1-migrate.ts` | 新規ゲーム時の初期化             |
| v2         | `src/core/save/migrations/v2-migrate.ts` | 将来のフィールド追加・互換性変更 |

`src/core/save/Serializer.ts` に `VERSION` 定数を保持。`loadGame()` は `GameEngine.load()` を呼ぶが、その前に `Serializer.MIGRATIONS[VERSION]` を経由してマイグレーションを適用する。

### 3.1 v1 マイグレーション（例）

```typescript
// src/core/save/migrations/v1-migrate.ts

export function v1Migrate(data: unknown): GameStateSnapshot {
  // 初期データ → 現在のスキーマへの変換
  // 例: `updatedAt` → `timestamp`
  //      `pastEvents` → `flags`
  //      `unlockedEvents` → `unlockedActions`
  return {
    version: 1,
    rngSeed: 0,
    phase: 1,
    resources: {
      funds: 10000,
      fear: 0,
      faith: 0,
      suspect: 0,
    },
    flags: {},
    unlockedActions: [],
    rumorStock: [],
    timestamp: 0,
    playtimeMs: 0,
  };
}
```

> **ガイドライン:** マイグレーションは下流のみ（`vX+1` は `vX` の形式のデータを受け取る）。`v2` は `v1` の形式を受け取れるようにする。`v1` は初期化専用。

## 4. 自動保存ルール

- `GameEngine.execute(action, context)` 完了ごとに保存する
- 保存の実行者は **`actionExecuted` イベントを購読する UI 層アダプタ**（`src/ui/persistence.ts` の `persist(engine)`）である。`src/core/` はブラウザ API（`localStorage`）に依存しないため、core 側では保存しない
- 保存先はローカルストレージキー `overlord_syndicate_v1`
- 起動時は `restore(engine)` が保存データを読み込み、復元できない場合はキーを削除して新規ゲームとして開始する
- ネットワークステータスの下では `autosave: false` で手動保存のみ可能にする

### 4.1 実装済みの保存形式 (version 1)

```typescript
{
  version: 1,
  state: GameStateSnapshot,   // phase / funds / fear / faith / suspect / seed / flags / gameOver
  resources: ResourcesSnapshot // funds / fear / faith / suspect
}
```

> 上記 2. の概念スキーマ（`rngSeed` / `unlockedActions` / `rumorStock` / `playtimeMs`）との乖離は未解消であり、E2E テストは本節の version 1 形式を正として扱う。

## 5. テストカバレッジ

- `save.Serializer.test.ts` はシリアライズ/デシリアライズをカバー
- `GameState.test.ts` はスナップショット生成とセーブ統合をカバー
- `tests/e2e/save-load.spec.ts` は保存・復元・破損セーブからの復帰を実ブラウザでカバー
- `pnpm test:run` で全 PASS → セーブ形式の検証完了
