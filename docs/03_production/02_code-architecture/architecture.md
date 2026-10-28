---
title: 全体アーキテクチャ・設計思想
description: レイヤ構成、状態管理、シーン構成、決定性とテスタビリティの方針。
status: draft
version: "0.1"
category: architecture
tags: [architecture, design, core, phaser]
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

## 2. レイヤ

| レイヤ | 責務 | 依存先 | 禁止 |
| --- | --- | --- | --- |
| `src/data` | 章・証言・会話・アセット定義 | なし | ロジック、条件分岐 |
| `src/localization` | 文言リソース | なし | ロジック |
| `src/balance` | 定数表（ミス上限、速度、時間） | なし | 条件分岐 |
| `src/core` | 状態遷移、判定、保存 | data / balance / localization | Phaser / DOM / ブラウザAPI |
| `src/phaser` | 描画、入力、演出 | core / data / balance | ゲームロジック、状態の直接変更 |
| `src/ui` | DOMオーバーレイ（HUD、メニュー） | core（読み取り） | 状態の書き換え |

## 3. core のモジュール構成（予定）

| モジュール | 役割 | 主要な型 |
| --- | --- | --- |
| `story/StoryRunner` | テキスト送り、選択肢、既読管理 | `StoryScript`, `StoryCursor` |
| `investigation/InvestigationState` | エリア、ホットスポット、証拠入手 | `Hotspot`, `AreaState` |
| `investigation/InsightMode` | 洞察視点の切替と表示対象の決定 | `InsightFilter` |
| `resolution/ResolutionEngine` | 証言ブロック進行、差し出し判定、ミス | `Testimony`, `PresentResult` |
| `resolution/MissCounter` | ミス加算と上限判定 | `MissState` |
| `state/ChapterState` | 章全体の状態保持 | `ChapterState` |
| `save/SaveRepository` | スナップショットの保存・読込 | `GameSnapshot` |
| `save/migrations/` | バージョン変換 | `Migration` |

## 4. 状態遷移

```
IntroDone → Investigation(area, position) → Resolution(testimony, block) → Epilogue → ChapterCleared
                                  │                    │
                                  └─ evidence入手 ─────┘
                                                       └─ miss == limit → GameOver
```

- 遷移は `ChapterState` のメソッド経由のみ。`phase = "resolution"` の直接代入は禁止。
- 各遷移は `SaveRepository.save()` を呼ぶ（自動保存）。
- 遷移の妥当性（調査前に解決へ飛べない等）は core が検証し、不正なら例外ではなく `TransitionError` を返す。

## 5. 描画層

| シーン | 役割 |
| --- | --- |
| `BootScene` | アセット先読み、フォント読込 |
| `TitleScene` | タイトル、開始/再開 |
| `ChapterSelectScene` | 章一覧 |
| `IntroScene` | ADV描画 |
| `InvestigationScene` | 横スクロール、ホットスポット、洞察視点 |
| `ResolutionScene` | 弁論、証言UI、差し出し演出 |
| `EpilogueScene` | ADV描画 |
| `PauseOverlay` / `GameOverOverlay` | DOMオーバーレイ |

シーンは core のインスタンスを受け取り、`update()` では**状態の読み取りと描画のみ**を行う。
1フレーム内でのオブジェクト生成は避け、プーリングを使う（目標60fps）。

## 6. テスタビリティ

- core は headless でテスト可能。`happy-dom` 上でも DOM に触れない。
- 差し出し判定、ミス上限、遷移妥当性、セーブ往復は unit テストの必須対象。
- E2E は build + preview に対して実行し、画面遷移とキー入力を検証する。

## 6.1 テスト対象の優先順位

1. `ResolutionEngine` の判定（正解・不正解・上限）
2. `ChapterState` の遷移妥当性
3. `SaveRepository` の往復とマイグレーション
4. `InvestigationState` の証拠入手と必須証拠の充足

## 7. 未決事項

- ADVパートのテキスト送りを core と phaser のどちらが駆動するか（推奨: core がカーソルを持ち、phaser が時間で進める）。
- 証拠品詳細を DOM オーバーレイにするか Phaser 内で描くか（推奨: DOM。文字サイズ設定を反映しやすい）。
- 章データを JSON にするか TS にするか（推奨: 型付き TS。ローカライズキーの typo を型で防ぐ）。
