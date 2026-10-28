---
title: 全体アーキテクチャ・設計思想
description: 単一Canvas構成、世界とUIの2カメラ、状態管理（ポーリング）、シーン構成、型安全な章データの方針。
status: draft
version: "0.3"
category: architecture
tags: [architecture, design, core, phaser, resolution]
traces_to:
- docs/03_production/01_conventions/directory-structure.md
- docs/02_game-spec/02_system-rules/game-loop.md
implemented_by: []
verified_by: []
---

# 全体アーキテクチャ・設計思想

本ドキュメントは設計方針のみを定める。実装は行わない。

## 1. 基本思想

1. **ロジックは core に閉じる。** 描画層は core の状態を読んで描くだけ。
2. **状態は1箇所。** 章進行状態（`ChapterState`）を単一の保持者に集約し、各層は参照のみ。
3. **データは宣言的に。** 章・証拠・証言はデータで表現し、コードに物語を書かない。
4. **失敗は明示的に。** ゲームオーバーは core が判定し、UIは表示するだけ。
5. **決定性。** 乱数を使わない（本作に乱数要素はない）。同じ入力は同じ結果になる。
6. **演出の進行はPhaser、判定はcore。** フラッシュやズームの「何秒目か」は描画層が持ち、正誤とミスはcoreだけが決める。

## 2. 単一Canvasと2カメラ

**すべてPhaserの1つのCanvasで描く。DOMオーバーレイは使わない。**

| カメラ | 見る範囲 | 拡大 | 描くもの |
| --- | --- | --- | --- |
| `worldCamera` | 320 × 180 | `zoom: 3` | 背景、キャラ、ホットスポット、エフェクト |
| `uiCamera` | 960 × 540 | `zoom: 1` | テキスト、HUD、メニュー、証拠品一覧、ボタン |

- ゲームサイズは 960 × 540（`Scale.FIT` + `pixelArt: true` + `roundPixels: true`）。
- 世界レイヤのオブジェクトを `uiCamera.ignore()`、UIレイヤを `worldCamera.ignore()` に登録して分離する。
- 世界座標（320×180）とUI座標（960×540）の比率は 3:1。ホットスポットの当たり判定は世界座標で持つ。
- 文字はUIカメラ側で描くため、**ビットマップフォント**（`.fnt`/`.xml` + PNG）を使う。Phaserの `Text`（Canvas描画）は最終手段とし、ピクセル感が崩れる場合は使わない。
- 文字サイズ設定（100/125/150%）はUIレイヤのスケールで実現する。

### 2.1 なぜ2カメラか

1つのカメラで世界も文字も拡大すると、文字が3倍に引き伸ばされて読めない。
世界だけ3倍・UIは等倍にすることで、**ドットの粗さと可読性を両立**し、かつDOMを排除できる。

## 3. レイヤ

| レイヤ | 責務 | 依存先 | 禁止 |
| --- | --- | --- | --- |
| `src/data` | 章・証言・会話・アセット定義 | なし | ロジック、条件分岐 |
| `src/localization` | 文言リソース（`ja.json` + `LocKey` 型） | なし | ロジック |
| `src/balance` | 定数表（ミス上限、速度、時間） | なし | 条件分岐 |
| `src/core` | 状態遷移、判定、保存 | data / balance / localization | Phaser / DOM / ブラウザAPI |
| `src/phaser` | 描画、入力、演出タイマー | core / data / balance | ゲームロジック、状態の直接変更 |

アセットパイプライン: `scripts/process-assets.py` が `assets-src/generated/` の原画を
`public/assets/` の確定アセットへ変換する。**`public/assets` は生成物**であり、
`assets-src` を改変して再生成できる。生成スクリプトを消さない限り再生可能。

## 4. core のモジュール構成（予定）

| モジュール | 役割 | 主要な型 |
| --- | --- | --- |
| `story/StoryRunner` | テキスト送り、カーソル管理、既読管理 | `StoryScript`, `StoryCursor` |
| `investigation/InvestigationState` | エリア、ホットスポット、証拠入手 | `Hotspot`, `AreaState` |
| `investigation/InsightMode` | 洞察視点の切替と表示対象の決定 | `InsightFilter` |
| `resolution/ResolutionEngine` | 証言ブロック進行、差し出し判定、ミス | `Testimony`, `OfferResult` |
| `resolution/MissCounter` | ミス加算と上限判定 | `MissState` |
| `state/ChapterState` | 章全体の状態保持（`scale`/`venueKey`/`roleKey` 含む） | `ChapterState` |
| `save/SaveRepository` | スナップショットの保存・読込 | `GameSnapshot` |
| `save/migrations/` | バージョン変換 | `Migration` |

- テキストの**カーソルは core が持ち、Phaser が経過時間で進める**（確定）。
- 用語は `OfferResult` / `askBackKey` / `gap`。旧名（`present`, `press`）は使用しない。

## 5. 状態遷移

```
IntroDone → Investigation(area, position) → Resolution(testimony, block) → Epilogue → ChapterCleared
                                  │                    │
                                  └─ evidence入手 ─────┘
                                                       └─ miss == limit → GameOver
```

- 遷移は `ChapterState` のメソッド経由のみ。`phase = "resolution"` の直接代入は禁止。
- 各遷移は `SaveRepository.save()` を呼ぶ（自動保存）。
- 遷移の妥当性（調査前に解決へ飛べない等）は core が検証し、不正なら例外ではなく `TransitionError` を返す。
- **通知方式は毎フレームの参照（ポーリング）にする**（確定）。イベント機関は作らない。描画層が `ChapterState` を読み、変化を自前で検知する。

## 6. 描画層

| シーン | 役割 |
| --- | --- |
| `BootScene` | アセット先読み、フォント読込 |
| `TitleScene` | タイトル、開始/再開 |
| `ChapterSelectScene` | 章一覧 |
| `StoryScene` | 導入とエピローグのADV描画（**共通**。`phase` で挙動を分ける） |
| `InvestigationScene` | 横スクロール、ホットスポット、洞察視点 |
| `ResolutionScene` | 弁論、立ち絵、証言UI、差し出し演出 |
| `PauseScene` / `GameOverScene` / `EvidenceDetailScene` | UIカメラ上のオーバーレイ（Phaserシーン、`launch` で重ねる） |

- `IntroScene` / `EpilogueScene` は **`StoryScene` に統合**（確定）。背景・立ち絵・テキスト送りのみを使うので共通化できる。
- シーンは core のインスタンスを受け取り、`update()` では**状態の読み取りと描画のみ**を行う。
- 1フレーム内でのオブジェクト生成は避け、プーリングを使う（目標60fps）。

## 7. 型安全な章データ

- 章データは**型付き TS**（確定）。JSON にしない。
- ローカライズキーは `src/localization/ja.json` から導出する。

```ts
import ja from "./ja.json";
export type LocKey = keyof typeof ja;
// 証言データの textKey などは LocKey で型付けする
```

- `ja.json` に存在しないキーをデータに書くと型エラーになる（typo を実装前に防ぐ）。
- `en.json` は同じキー構造を保つ（`Record<LocKey, string>` で検証）。

## 8. テスタビリティ

- core は headless でテスト可能（PhaserもDOMも触らない）。
- 差し出し判定、ミス上限、遷移妥当性、セーブ往復は unit テストの必須対象。
- E2E は `pnpm build` 後の `vite preview`（ポート 4173）に対して実行する。

## 8.1 テスト対象の優先順位

1. `ResolutionEngine` の判定（正解・不正解・上限）
2. `ChapterState` の遷移妥当性
3. `SaveRepository` の往復とマイグレーション
4. `InvestigationState` の証拠入手と必須証拠の充足

## 9. 確定済みの決定（旧未決事項）

| 項目 | 決定 |
| --- | --- |
| テキスト送りの駆動 | core がカーソルを持ち、Phaser が時間で進める |
| 証拠品詳細 | Phaserのオーバーレイシーン（UIカメラ） |
| 章データの形式 | 型付き TS。ローカライズキーは `LocKey` で型安全化 |
| 状態の通知 | 毎フレーム参照（イベント機関なし） |
| 解像度 | 単一Canvas。世界カメラ 320×180（zoom 3）＋ UIカメラ 960×540（zoom 1） |
| UIの実装 | すべてPhaser（DOMなし）。オーバーレイはシーンとして重ねる |
| シーン統合 | `Intro` / `Epilogue` を `StoryScene` に統合 |
