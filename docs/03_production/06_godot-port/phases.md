# 移植フェーズ・タスク分解

## フェーズ概要

| フェーズ | 期間目安 | 主成果物 | 完了基準 |
|----------|----------|----------|----------|
| **Phase 0: 基盤構築** | 3-5日 | Godotプロジェクト、CI、ディレクトリ構造 | `godot --headless --quit` 成功、CIグリーン |
| **Phase 1: Resourceクラス実装** | 5-7日 | `scripts/resources/*.gd` 全クラス、バリデーター | 全 `.tres` 読み込み・検証通過 |
| **Phase 2: コアロジック移植** | 10-14日 | `scripts/core/` 全モジュール、単体テスト | GUT全テスト通過、型チェック通過 |
| **Phase 3: データ変換・投入** | 5-7日 | 変換ツール、全チャプター `.tres`、ローダー | 既存全データが `.tres` 化、ローダーで読み込みOK |
| **Phase 4: ローカライズ** | 3-5日 | CSV/`.translation`、TranslationServer統合 | ja/en 切替動作、全キー網羅 |
| **Phase 5: UI・シーン実装** | 15-20日 | 7シーン + 共通コンポーネント、遷移フロー | 全フロー手動通しプレイ可能 |
| **Phase 6: アセット統合** | 5-7日 | インポート設定、アトラス、フォント | 全背景・立ち絵・UI・証拠表示OK |
| **Phase 7: セーブ/ロード** | 3-5日 | ConfigFileベース永続化、スロット管理 | セーブ→再起動→ロードで状態復元 |
| **Phase 8: QA・仕上げ** | 5-7日 | チェックリスト消化、Webビルド、パフォーマンス | 回帰ゼロ、Web動作、メモリ/CPU許容範囲 |

**合計目安: 54-70日 (約11-14週間)**

---

## Phase 0: 基盤構築

### タスク
- [ ] Godot 4.3+ プロジェクト作成 (`godot --headless --editor --quit` またはエディタで新規)
- [ ] `project.godot` 設定
  - `rendering/renderer/rendering_method = "mobile"` (Web/軽量対応)
  - `application/run/main_scene = "res://scenes/Boot.tscn"`
  - `autoload` 登録: `GameState`, `ChapterLoader`, `Localization`
- [ ] ディレクトリ構造作成
  ```
  scripts/
  ├── autoload/
  ├── core/
  ├── resources/
  ├── ui/
  │   └── components/
  ├── data/
  ├── tools/
  └── scenes/
  resources/
  └── data/
      └── chapters/
  assets/
  └── (public/assets からコピー)
  ```
- [ ] GitHub Actions CI (`.github/workflows/ci.yml`)
  - `godot-ci/godot-build` でヘッドレステスト・エクスポート検証
- [ ] `.gitignore` (Godot用: `.godot/`, `*.uid`, `*.translation`, 等)
- [ ] `README_GODOT.md` (開発環境セットアップ手順)

### 成果物確認
```bash
godot --headless --quit                    # エラーなし
godot --headless --script res://scripts/tools/validate_all.gd  # 検証通過 (後で作成)
```

---

## Phase 1: Resourceクラス実装

### タスク
- [ ] `scripts/resources/evidence_item.gd`
- [ ] `scripts/resources/gap.gd`
- [ ] `scripts/resources/testimony_block.gd`
- [ ] `scripts/resources/testimony.gd`
- [ ] `scripts/resources/hotspot.gd`
- [ ] `scripts/resources/chapter_data.gd`
- [ ] `scripts/tools/resource_validator.gd` (@tool)
- [ ] サンプル `.tres` 手作成 (ch01 の 1証拠・1証言・1ホットスポット)
- [ ] バリデーター実行でエラーなし

### 単体テスト (GUT)
```gdscript
# tests/resources/evidence_item_test.gd
func test_evidence_item_creation():
    var ev = EvidenceItem.new()
    ev.id = "test_01"
    ev.name_key = "ev.test.name"
    ev.desc_key = "ev.test.desc"
    ev.icon = "res://assets/evidence/icon_test.png"
    assert_not_null(ev)
    assert_eq(ev.id, "test_01")
```

---

## Phase 2: コアロジック移植

### 移植対象マッピング (`src/core/` → `scripts/core/`)

| TS ファイル | GDScript ファイル | 備考 |
|-------------|-------------------|------|
| `state/types.ts` | `core/state/types.gd` | 型定義・enum・エラー |
| `state/ChapterState.ts` | `core/state/chapter_state.gd` | チャプター進行状態 |
| `investigation/InvestigationState.ts` | `core/investigation/investigation_state.gd` | 捜査フェーズ状態 |
| `resolution/ResolutionEngine.ts` | `core/resolution/resolution_engine.gd` | 弁論ロジック (核心) |
| `resolution/MissCounter.ts` | `core/resolution/miss_counter.gd` | ミスカウント |
| `story/StoryRunner.ts` | `core/story/story_runner.gd` | ストーリー進行 |
| `save/SaveRepository.ts` | `core/save/save_repository.gd` | セーブ/ロード抽象化 |
| `balance/constants.ts` | `core/balance/constants.gd` | 定数群 |

### 移植ルール
- クラス名・メソッド名・シグネチャを極力維持 (`snake_case` 化のみ)
- `readonly` → `@export` または `_` プレフィックス慣習
- `Promise` 返却 → `Signal` 発行 + `await` パターン
- 純粋関数は `static func` または `RefCounted` クラスに
- 依存: `core/` 内部のみ、Godot API 非依存 (テスタビリティ確保)

### 単体テスト目標
- 全パブリックメソッド網羅
- エッジケース (空配列、不正遷移、欠落証拠) カバー
- 既存 vitest スナップショットと同等アサーション

---

## Phase 3: データ変換・投入

### 変換ツール (`scripts/tools/convert_json_to_tres.gd`)

```gdscript
@tool
class_name JsonToTresConverter extends EditorScript

@export var source_dir: String = "res://../src/data"  # 既存TSプロジェクト参照用
@export var target_dir: String = "res://resources/data"

func _run():
    convert_chapter("ch01")
    print("Conversion done")

func convert_chapter(chapter_id: String):
    # 1. TS → JSON 抽出 (別途Nodeスクリプトで吐き出したJSONを読む想定)
    # 2. JSON.parse → Resource インスタンス生成
    # 3. ResourceSaver.save() で .tres 出力
    pass
```

### 実行フロー
1. 既存 TS データ → JSON ファイル吐き出し (Nodeスクリプト、リポ外で実行)
2. JSON を `res://import_json/` に配置
3. 変換ツール実行 → `resources/data/chapters/ch01/` に `.tres` 生成
4. バリデーターで検証
5. CI に組み込み (PR時自動実行・コミット)

### タスク
- [ ] Node側 JSON 吐き出しスクリプト (`scripts/export_ts_data.mjs`)
- [ ] 変換ツール実装 (全リソースタイプ対応)
- [ ] ch01 全データ変換・検証
- [ ] ch02+ 以降も同手順で対応 (データ完成次第)
- [ ] `ChapterLoader` 実装・動作確認

---

## Phase 4: ローカライズ

### タスク
- [ ] 既存 `src/localization/` → CSV 変換 (`key,ja,en`)
- [ ] `translations/ja.csv`, `translations/en.csv` 作成
- [ ] `Localization` Autoload 実装
  - `TranslationServer` 初期化
  - `tr(key)`, `trn(key, n)` ヘルパー
  - 言語切替 `set_locale(locale)`
- [ ] UI シーンで `tr()` 使用に統一
- [ ] フォントフォールバック設定 (Noto Sans JP 等)

### CSV 形式例
```csv
key,ja,en
"chapter.ch01.title","第1章：商店街の影","Chapter 1: Shadow of Shopping Street"
"ev.goda_memo.name","合田メモ","Goda Memo"
"ev.goda_memo.desc","合田が残したメモ...","A memo left by Goda..."
"ui.save","セーブ","Save"
"ui.load","ロード","Load"
```

---

## Phase 5: UI・シーン実装

### シーン別タスク

#### Boot.tscn (Autoload初期化)
- [ ] `GameState`, `ChapterLoader`, `Localization`, `AudioManager` 登録
- [ ] 初期ロード画面 → Title.tscn 遷移

#### Title.tscn
- [ ] メニュー: New Game, Continue, Settings, Quit
- [ ] Continue: セーブスロット検出時のみ有効
- [ ] Settings: 言語切替、音量、フルスクリーン

#### ChapterSelect.tscn
- [ ] `ChapterLoader` から全チャプター取得
- [ ] カードUI: タイトル、クリア状態、プレビュー背景
- [ ] 選択 → `GameState.start_chapter(id)` → Story.tscn

#### Story.tscn
- [ ] 背景表示 (パララックス対応)
- [ ] 立ち絵表示 (フェードイン/アウト、表情差分)
- [ ] メッセージウィンドウ: タイプライター効果、スキップ、ログ
- [ ] 選択肢表示 (分岐対応)
- [ ] 章フェーズ遷移: `intro` → `investigation` / `resolution` / `epilogue`

#### Investigation.tscn
- [ ] 背景 + ホットスポット配置 (Hotspot リソースから動的生成)
- [ ] カーソル/ポインタ操作 (マウス・タッチ・ゲームパッド)
- [ ] ホットスポット種別: `inspect` (テキスト/証拠取得), `talk` (証言開始), `move` (エリア移動), `locked` (条件未満)
- [ ] 証拠画面 (Evidence.tscn ポップアップ)
- [ ] メモ/メモ帳 UI (任意)

#### Resolution.tscn (弁論)
- [ ] 証言ブロック表示 (スクロール/ページング)
- [ ] 「問い返し」UI: 矛盾箇所選択 → 証拠提示スロット
- [ ] 判定アニメーション: 成功/失敗/ゲームオーバー
- [ ] `ResolutionEngine` 連携

#### GameOver.tscn
- [ ] 失敗理由表示、リトライ/タイトル/セーブロード

#### Evidence.tscn (共通ポップアップ)
- [ ] 証拠一覧グリッド、詳細表示、閉じる

### 共通コンポーネント (`scripts/ui/components/`)
- [ ] `DialogueBox.gd` - メッセージ表示、タイプライター、選択肢
- [ ] `CharacterPortrait.gd` - 立ち絵表示、表情切替、フェード
- [ ] `EvidenceSlot.gd` - 証拠アイコンスロット (ドラッグドロップ対応)
- [ ] `HotspotButton.gd` - ホットスポットクリック領域、ハイライト
- [ ] `ChapterCard.gd` - 章選択カード
- [ ] `SaveSlot.gd` - セーブスロット表示
- [ ] `SettingsPanel.gd` - 設定UI

---

## Phase 6: アセット統合

### タスク
- [ ] `public/assets/` → `assets/` コピー・整理
- [ ] インポートプリセット作成 (`.godot/import_presets/`)
  - 背景: `Texture2D`, `compress/mode=VRAM`, `BPTC`/`WebP`
  - 立ち絵: 同上、透過維持
  - UI: `Texture2D`, `NinePatch` 設定、アトラス化
  - 証拠アイコン: アトラス化 (`TextureAtlas`)
- [ ] フォント: `DynamicFont` + `DynamicFontData` (Noto Sans JP 可変フォント推奨)
- [ ] オーディオ: 後で追加時用にバス設定 (Master, BGM, SE, Voice)

### アセットカタログ確認
| 種別 | パス | 用途 |
|------|------|------|
| 背景 | `assets/backgrounds/` | Story/Investigation 背景、パララックスレイヤー |
| 立ち絵 | `assets/portraits/` | キャラ表示、表情差分 |
| UIフレーム | `assets/ui/` | 窓枠、ボタン、プログレスバー |
| 証拠アイコン | `assets/evidence/` | 証拠一覧、提示スロット |
| ストーリー専用背景 | `assets/backgrounds/story_*` | 特定シーン専用 |

---

## Phase 7: セーブ/ロード

### 実装詳細
```gdscript
# scripts/core/save/save_repository.gd
class_name SaveRepository extends RefCounted

const SAVE_DIR = "user://saves/"
const SLOT_COUNT = 10

static func save(slot: int, game_state: Dictionary) -> Error:
    var file = FileAccess.open("%s/slot_%d.save" % [SAVE_DIR, slot], FileAccess.WRITE)
    if not file: return Error.FAILED
    
    var config = ConfigFile.new()
    config.set_value("meta", "version", 1)
    config.set_value("meta", "timestamp", Time.get_unix_time_from_system())
    config.set_value("meta", "chapter", game_state.current_chapter)
    config.set_value("meta", "phase", game_state.current_phase)
    
    for k, v in game_state.evidence:
        config.set_value("evidence", k, v)
    for k, v in game_state.flags:
        config.set_value("flags", k, v)
    for k, v in game_state.progress:
        config.set_value("progress", k, v)
    
    var err = config.save(file.get_path())
    file.close()
    return err

static func load(slot: int) -> Dictionary:
    var path = "%s/slot_%d.save" % [SAVE_DIR, slot]
    if not FileAccess.file_exists(path): return {}
    
    var config = ConfigFile.new()
    var err = config.load(path)
    if err != Error.OK: return {}
    
    var state = {}
    state.current_chapter = config.get_value("meta", "chapter", "")
    state.current_phase = config.get_value("meta", "phase", "intro")
    state.evidence = _dict_from_section(config, "evidence")
    state.flags = _dict_from_section(config, "flags")
    state.progress = _dict_from_section(config, "progress")
    return state
```

### タスク
- [ ] `SaveRepository` 実装・テスト
- [ ] `GameState` に `save(slot)`, `load(slot)` 統合
- [ ] Title/ChapterSelect/GameOver でスロットUI連携
- [ ] オートセーブ (章フェーズ遷移時、重要分岐後)
- [ ] セーブデータバージョニング・マイグレーション方針

---

## Phase 8: QA・仕上げ

### 手動チェックリスト (抜粋)
- [ ] **全フロー通し**: Title → ChapterSelect → Story全フェーズ → GameOver/クリア
- [ ] **セーブ/ロード**: 各フェーズでセーブ→再起動→ロード→継続
- [ ] **多言語**: 全画面で ja/en 切替、文字欠けなし、溢れなし
- [ ] **弁論**: 全矛盾パターン (正解/不正解/ゲームオーバー) 検証
- [ ] **捜査**: 全ホットスポット到達、証拠取得、移動、ロック解除
- [ ] **Webビルド**: `godot --headless --export-release "Web" build/web/index.html` 動作
- [ ] **パフォーマンス**: 60fps 維持 (Web/デスクトップ)、メモリ < 500MB、起動 < 3s
- [ ] **アクセシビリティ**: キーボード/ゲームパッド操作、テキストサイズ、コントラスト

### 既知の制約・技術的負債 (移植後に対応)
- [ ] Web で `FileAccess` 永続化 → IndexedDB ラッパー必要
- [ ] 大量テクスチャ同時ロードでモバイルWeb OOM 対策 (ストリーミング/遅延ロード)
- [ ] フォントサブセット化で初期ロード軽量化
- [ ] ストーリー分岐のテスト自動化 (シナリオグラフベース)

---

## マイルストーン・ゲート

| マイルストーン | 判定基準 | 時期目安 |
|----------------|----------|----------|
| **M1: 基盤完成** | Phase 0-1 完了、CIグリーン、サンプル `.tres` 読み込みOK | 週2 |
| **M2: コアロジック完成** | Phase 2 完了、全単体テスト通過、既存TSテストケース互換 | 週5 |
| **M3: データ投入完成** | Phase 3-4 完了、全チャプターデータ `.tres` 化、多言語動作 | 週7 |
| **M4: 型枠完成 (Vertical Slice)** | ch01 のみ: Title→Story→Investigation→Resolution→Epilogue 通し動作 | 週10 |
| **M5: 全チャプター実装** | Phase 5-6 完了、全シーン・アセット統合 | 週13 |
| **M6: リリース候補** | Phase 7-8 完了、チェックリスト全項目合格、Webビルド配布可能 | 週14 |

---

## 並列化可能な作業

| 並列グループ | タスク |
|--------------|--------|
| **A: データ・ロジック** | Phase 1, 2, 3 (Resourceクラス・コア移植・変換ツールは独立) |
| **B: UI基盤** | Phase 0 完了後: 共通コンポーネント (`DialogueBox`, `CharacterPortrait` 等) 先行実装 |
| **C: アセット** | Phase 0 完了後: インポート設定・アトラス化は独立作業可 |
| **D: ローカライズ** | Phase 3 完了後: CSV作成・TranslationServer統合は独立 |

---

## リスク・対策

| リスク | 影響度 | 対策 |
|--------|--------|------|
| ResolutionEngine 移植バグ (核心ロジック) | 高 | 既存 vitest ケースを GUT に完全移植、プロパティベーステスト追加 |
| Webエクスポートで動作差異 | 中 | 早期 (M2時点) で Web ビルド検証、専用CIジョブ |
| アセット容量超過 (Web 制限) | 中 | テクスチャ圧縮・アトラス・遅延ロード、進捗監視 |
| GDScript 型安全性不足でランタイムエラー | 低 | 型ヒント徹底、GUTで網羅、静的解析 (`gdscript --check`) CI組み込み |
| データ変換ツールのメンテコスト | 低 | `@tool` スクリプトでエディタ統合、CIで自動検証 |