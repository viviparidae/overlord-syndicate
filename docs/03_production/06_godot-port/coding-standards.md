# GDScript コーディング規約

## 基本方針
- **Godot 4.x 標準スタイル** に準拠 (`gdscript --check` 通過必須)
- **型ヒント必須**: 全変数・引数・戻り値に型指定
- **命名規則**: Godot 公式 (snake_case / PascalCase / UPPER_SNAKE) に従う
- **ドキュメント**: 公開APIは `##` コメントで説明

---

## 命名規則

| 種別 | 規則 | 例 |
|------|------|-----|
| ファイル名 | snake_case.gd | `chapter_loader.gd` |
| クラス名 (`class_name`) | PascalCase | `ChapterData`, `EvidenceItem` |
| 変数・関数・シグナル | snake_case | `current_chapter`, `load_chapter()`, `chapter_changed` |
| 定数・enum値 | UPPER_SNAKE | `MAX_SAVE_SLOTS`, `Kind.INSPECT` |
| プライベート変数 | `_` プレフィックス | `_internal_cache`, `_setup_ui()` |
| ブーリアン | `is_` / `has_` / `can_` 接頭辞 | `is_loaded`, `has_evidence` |
| シグナル | 過去分詞・受動態 | `chapter_completed`, `evidence_collected` |
| ノード名 (シーン内) | PascalCase | `DialogueBox`, `CharacterPortrait` |
| リソースパス | `res://` 始まり、小文字・ハイフン | `res://assets/backgrounds/bg_office.png` |

---

## 型ヒント・アノテーション

### 変数
```gdscript
# 基本型
var name: String
var count: int
var ratio: float
var flag: bool

# コレクション (型パラメータ必須)
var items: Array[String]
var lookup: Dictionary[String, int]
var evidence_set: Array[EvidenceItem]

# オプショナル (null許容)
var optional_data: String? = null
var nullable_resource: EvidenceItem? = null

# Callable
var callback: Callable
var typed_callback: Callable[[String, int], bool]
```

### 関数
```gdscript
# 戻り値型必須 (voidは省略可だが明示推奨)
func load_chapter(chapter_id: String) -> ChapterData:
    pass

func try_get_evidence(id: String) -> EvidenceItem?:
    pass

# 複雑な型
func process_testimonies(testimonies: Array[Testimony]) -> Dictionary[String, Array[Gap]]:
    pass
```

### シグナル
```gdscript
signal chapter_changed(chapter_id: String, phase: String)
signal evidence_collected(evidence: EvidenceItem)
signal resolution_result(success: bool, gaps_resolved: int)
```

---

## クラス設計パターン

### 1. データクラス (Resource継承)
```gdscript
# scripts/resources/evidence_item.gd
class_name EvidenceItem extends Resource

## 証拠アイテムデータ
## @param id 一意識別子
## @param name_key 表示名ローカライズキー
## @param desc_key 説明文ローカライズキー
## @param icon アイコンテクスチャパス
@export var id: String
@export var name_key: String
@export var desc_key: String
@export var icon: String

func _init(id: String = "", name_key: String = "", desc_key: String = "", icon: String = ""):
    self.id = id
    self.name_key = name_key
    self.desc_key = desc_key
    self.icon = icon
```

### 2. ロジッククラス (RefCounted継承)
```gdscript
# scripts/core/resolution/resolution_engine.gd
class_name ResolutionEngine extends RefCounted

## 弁論フェーズの核心ロジック
## ステートレス・決定論的・テスタブル

signal resolution_step_completed(step_index: int, success: bool)

var _miss_counter: MissCounter

func _init():
    _miss_counter = MissCounter.new()

## 矛盾突きつけ判定
## @param testimony 対象証言
## @param block_index 突きつけ対象ブロックIndex
## @param evidence_id 提示証拠ID
## @return 判定結果 (correct/wrong/gameover)
func present_evidence(testimony: Testimony, block_index: int, evidence_id: String) -> OfferOutcome:
    # 実装...
    pass
```

### 3. シングルトン/Autoload (Node継承)
```gdscript
# scripts/autoload/game_state.gd
class_name GameState extends Node

signal chapter_started(chapter_id: String)
signal phase_changed(phase: ChapterPhase)
signal evidence_added(evidence: EvidenceItem)
signal flag_changed(flag: String, value: bool)

@export var current_chapter: String = ""
@export var current_phase: ChapterPhase = ChapterPhase.INTRO
var evidence_inventory: Array[EvidenceItem] = []
var flags: Dictionary[String, bool] = {}
var progress: Dictionary = {}

func start_chapter(chapter_id: String) -> void:
    current_chapter = chapter_id
    current_phase = ChapterPhase.INTRO
    evidence_inventory.clear()
    flags.clear()
    progress.clear()
    emit_signal("chapter_started", chapter_id)
    _load_initial_data(chapter_id)

func _load_initial_data(chapter_id: String) -> void:
    var chapter = ChapterLoader.load_chapter(chapter_id)
    for flag_key, value in chapter.initial_flags:
        flags[flag_key] = value
    emit_signal("phase_changed", current_phase)
```

---

## 制御フロー・非同期

### await パターン
```gdscript
# タイマー待機
await get_tree().create_timer(1.0).timeout

# シグナル待機
await emission_completed  # 自シグナル
await other_node.signal_name  # 他ノードシグナル

# フレーム待機
await get_tree().process_frame
```

### 非ブロッキング実行
```gdscript
# 重い処理をフレーム分散
func heavy_computation(data: Array) -> void:
    for i, item in data:
        _process_item(item)
        if i % 10 == 0:
            await get_tree().process_frame  # 10件ごとに譲渡

# call_deferred で次フレーム実行
func on_button_pressed():
    call_deferred("_do_heavy_work")

func _do_heavy_work():
    # 重い処理
    pass
```

---

## エラーハンドリング

```gdscript
# Result 型パターン (Godot 4.2+)
func load_resource(path: String) -> Resource:
    var resource = ResourceLoader.load(path)
    if resource == null:
        push_error("Failed to load: %s" % path)
        return Resource.new()  # 空リソース返却 or エラー伝播
    return resource

# エラー型定義
class_name LoadError extends RefCounted
    var path: String
    var reason: String

# 例外的状況のみ assert
func get_evidence(id: String) -> EvidenceItem:
    var ev = evidence_inventory.find(lambda e: e.id == id)
    assert(ev != null, "Evidence not found: %s" % id)
    return ev
```

---

## エディタ・ツール連携

### @export ヒント
```gdscript
@export_file("*.tres") var chapter_resource: Resource
@export_dir var asset_folder: String
@export_enum("Easy", "Normal", "Hard") var difficulty: int
@export_range(0.0, 1.0, 0.01) var volume: float
@export_multiline var description: String
@export_group("UI Settings")
@export var show_portraits: bool = true
```

### @tool スクリプト
```gdscript
@tool
class_name MyEditorTool extends EditorScript

@export var target_folder: String = "res://assets"

func _run():
    # エディタ実行時のみ動作
    if not Engine.is_editor_hint():
        return
    # 処理...
```

---

## テスト記述 (GUT)

```gdscript
# tests/core/resolution_engine_test.gd
class_name ResolutionEngineTest extends GutTest

var engine: ResolutionEngine

func before_each():
    engine = ResolutionEngine.new()

func test_present_evidence_correct():
    var testimony = _create_test_testimony()
    var result = engine.present_evidence(testimony, 0, "ev_correct")
    assert_eq(result, OfferOutcome.CORRECT)

func test_present_evidence_wrong():
    var testimony = _create_test_testimony()
    var result = engine.present_evidence(testimony, 0, "ev_wrong")
    assert_eq(result, OfferOutcome.WRONG)

func _create_test_testimony() -> Testimony:
    # テスト用データ構築
    pass
```

---

## 静的解析・CI

```bash
# ローカル実行
gdscript --check scripts/                    # 構文・型チェック
gdscript --check --pedantic scripts/         # 厳格モード
godot --headless --run-tests                 # GUTテスト実行
godot --headless --script res://scripts/tools/validate_all.gd  # 検証
```

### `.github/workflows/lint.yml` 抜粋
```yaml
- name: GDScript Lint
  run: |
    godot --headless --script res://scripts/tools/lint_all.gd
    # または gdscript --check --pedantic scripts/
```

---

## 禁止・非推奨パターン

| 非推奨 | 推奨 | 理由 |
|--------|------|------|
| `var x` (型なし) | `var x: Type` | 型安全性・補完・静的解析 |
| `func foo():` (戻り値型なし) | `func foo() -> Type:` | 同左 |
| `yield()` | `await` | Godot 4 非推奨 |
| `get_node()` 連打 | `@onready` / `unique_name` | パフォーマンス・保守性 |
| 文字列キー直書き | `enum` / 定数 / `@export_enum` | タイポ防止・リファクタ対応 |
| `Dictionary` 型パラメータなし | `Dictionary[K, V]` | 型安全性 |
| `print()` デバッグ残し | `push_debug()` / ログレベル | 本番混入防止 |

---

## ファイルヘッダー テンプレート
```gdscript
# scripts/core/state/chapter_state.gd
# ChapterState - チャプター進行状態管理
# 
# 責務: 現在フェーズ、証拠所持、フラグ、進行度の保持
# 依存: なし (純粋データクラス)
# 
# 移植元: src/core/state/ChapterState.ts

class_name ChapterState extends RefCounted
# ...
```