# Resource システム設計

## 概要
既存の TypeScript データ定義 (`src/data/`, `src/core/state/types.ts`) を Godot `Resource` クラス群として実装し、`.tres` ファイルとしてシリアライズする。

## クラス階層

```
Resource (Godot組み込み)
├── EvidenceItem
├── Gap
├── TestimonyBlock
├── Testimony
├── Hotspot
└── ChapterData
```

## クラス定義

### EvidenceItem
```gdscript
# scripts/resources/evidence_item.gd
class_name EvidenceItem extends Resource

@export var id: String
@export var name_key: String      # ローカライズキー
@export var desc_key: String      # ローカライズキー
@export var icon: String          # "res://assets/evidence/icon_ev_xxx.png"

func _validate_property(property: String) -> bool:
    if property == "icon" and not icon.is_empty():
        return ResourceLoader.exists(icon)
    return true
```

### Gap
```gdscript
# scripts/resources/gap.gd
class_name Gap extends Resource

@export var evidence_id: String
@export var accept_any_of: Array[String] = []
@export var success_key: String
@export var fail_key: String
```

### TestimonyBlock
```gdscript
# scripts/resources/testimony_block.gd
class_name TestimonyBlock extends Resource

@export var id: String
@export var text_key: String
@export var ask_back_key: String = ""
@export var gap: Gap = null
```

### Testimony
```gdscript
# scripts/resources/testimony.gd
class_name Testimony extends Resource

@export var id: String
@export var speaker: String       # キャラID (ローカライズキー兼用)
@export var blocks: Array[TestimonyBlock] = []
```

### Hotspot
```gdscript
# scripts/resources/hotspot.gd
class_name Hotspot extends Resource

enum Kind { INSPECT, TALK, MOVE, LOCKED }

@export var id: String
@export var area_id: String
@export var kind: Kind = Kind.INSPECT
@export var label_key: String
@export var text_key: String = ""
@export var evidence_id: String = ""
@export var x: float = 0.0
@export var width: float = 100.0
```

### ChapterData (ルートリソース)
```gdscript
# scripts/resources/chapter_data.gd
class_name ChapterData extends Resource

@export var id: String
@export var title_key: String
@export var background: String    # "res://assets/backgrounds/bg_xxx.png"
@export var testimonies: Array[Testimony] = []
@export var hotspots: Array[Hotspot] = []
@export var evidence_list: Array[EvidenceItem] = []
@export var initial_flags: Dictionary[String, bool] = {}
@export var bgm: String = ""      # 将来用
```

## ファイル構成

```
resources/
└── data/
    └── chapters/
        └── ch01/
            ├── chapter_data.tres      # ChapterData (ルート)
            ├── evidence/
            │   ├── ev_goda_memo.tres
            │   ├── ev_past_settlement.tres
            │   └── ...
            ├── testimonies/
            │   ├── testimony_01.tres
            │   ├── testimony_02.tres
            │   └── ...
            └── hotspots/
                ├── hs_office_desk.tres
                ├── hs_arcade_entrance.tres
                └── ...
```

**注意**: サブリソース (`evidence/`, `testimonies/`, `hotspots/`) は個別 `.tres` に分割し、`ChapterData` から参照する形にすることで、共通証拠の再利用・差分更新を容易にする。

## .tres 例 (chapter_data.tres)

```gdscript
[gd_resource type="ChapterData" load_steps=5 format=3 uid://...]

[ext_resource type="Resource" path="evidence/ev_goda_memo.tres" id="1_ev_goda_memo"]
[ext_resource type="Resource" path="testimonies/testimony_01.tres" id="2_testimony_01"]
[ext_resource type="Resource" path="hotspots/hs_office_desk.tres" id="3_hs_office_desk"]
[ext_resource type="Resource" path="testimonies/testimony_02.tres" id="4_testimony_02"]
[ext_resource type="Resource" path="evidence/ev_past_settlement.tres" id="5_ev_past_settlement"]

[resource]
id = "ch01"
title_key = "chapter.ch01.title"
background = "res://assets/backgrounds/bg_shotengai_office.png"
testimonies = [ ExtResource("2_testimony_01"), ExtResource("4_testimony_02") ]
hotspots = [ ExtResource("3_hs_office_desk") ]
evidence_list = [ ExtResource("1_ev_goda_memo"), ExtResource("5_ev_past_settlement") ]
initial_flags = {
    "met_chinatsu": false,
    "visited_arcade": false
}
```

## 実行時読み込み API

```gdscript
# scripts/data/chapter_loader.gd
class_name ChapterLoader extends RefCounted

static var _cache: Dictionary[String, ChapterData] = {}

static func load_chapter(chapter_id: String) -> ChapterData:
    if _cache.has(chapter_id):
        return _cache[chapter_id]
    
    var path = "res://resources/data/chapters/%s/chapter_data.tres" % chapter_id
    var chapter = ResourceLoader.load(path)
    if chapter == null:
        push_error("Chapter not found: %s" % chapter_id)
        return ChapterData.new()
    
    _cache[chapter_id] = chapter
    return chapter

static func preload_all():
    var dir = DirAccess.open("res://resources/data/chapters")
    if dir:
        for entry in dir.get_directories():
            if entry.begins_with("ch"):
                load_chapter(entry)
```

## エディタ拡張 (@tool)

```gdscript
# scripts/tools/resource_validator.gd
@tool
class_name ResourceValidator extends EditorScript

@export var validate_on_save: bool = true

func _run():
    var errors = []
    var dir = DirAccess.open("res://resources/data")
    _validate_recursive(dir, errors)
    
    if errors.is_empty():
        print("All resources valid")
    else:
        for e in errors:
            printerr(e)

func _validate_recursive(dir: DirAccess, errors: Array):
    for file in dir.get_files():
        if file.ends_with(".tres"):
            var res = ResourceLoader.load(dir.get_current_dir().path_join(file))
            if res:
                _validate_resource(res, errors)
    
    for subdir in dir.get_directories():
        var sub = DirAccess.open(dir.get_current_dir().path_join(subdir))
        if sub:
            _validate_recursive(sub, errors)

func _validate_resource(res: Resource, errors: Array):
    if res is EvidenceItem:
        if not ResourceLoader.exists(res.icon):
            errors.append("Missing icon: %s -> %s" % [res.resource_path, res.icon])
    elif res is ChapterData:
        for t in res.testimonies:
            if t == null: errors.append("Null testimony in %s" % res.resource_path)
        for h in res.hotspots:
            if h == null: errors.append("Null hotspot in %s" % res.resource_path)
        for e in res.evidence_list:
            if e == null: errors.append("Null evidence in %s" % res.resource_path)
```

## 変換元: 既存 TypeScript データ

既存 `src/data/chapters/ch01/*.ts` から JSON を吐き出し、変換ツールで上記 `.tres` 構造へマッピング。

### 対応マッピング表

| TS 型 | GDScript Resource | 備考 |
|-------|-------------------|------|
| `EvidenceItem` | `EvidenceItem` | 1:1 |
| `Gap` | `Gap` | 1:1 |
| `TestimonyBlock` | `TestimonyBlock` | `askBackKey` → `ask_back_key` |
| `Testimony` | `Testimony` | 1:1 |
| `Hotspot` | `Hotspot` | `HotspotKind` → `Kind` enum |
| `ChapterData` (TS側は分散) | `ChapterData` | 既存 `npcs.ts`, `facing.ts`, `index.ts` を統合 |

## 将来拡張

- **モッド対応**: `user://mods/` から `ResourceLoader.load()` で追加チャプター読み込み
- **差分パッチ**: `.tres` を JSON 化し、パッチ適用後再インポート
- **プロシージャル生成**: `@tool` スクリプトでホットスポット座標自動配置等