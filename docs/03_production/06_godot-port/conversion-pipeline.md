# 変換ツール・パイプライン設計

## 概要
既存 TypeScript データ (`src/data/`) を Godot Resource (`.tres`) へ変換するパイプライン。
開発フロー: **TS編集 → JSON吐き出し → 変換ツール実行 → `.tres` 生成 → 検証 → コミット**

## アーキテクチャ

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  TypeScript     │     │  JSON (中間)     │     │  Godot Resource │
│  src/data/      │ ──► │  import_json/    │ ──► │  resources/     │
│  *.ts           │     │  *.json          │     │  *.tres         │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                              │                          │
                              ▼                          ▼
                       ┌──────────────────┐     ┌─────────────────┐
                       │  Node.js Script  │     │  @tool GDScript │
                       │  export_ts_data  │     │  convert_json   │
                       └──────────────────┘     └─────────────────┘
```

## Step 1: TypeScript → JSON 吐き出し (Node.js)

### `scripts/export_ts_data.mjs`
```javascript
// scripts/export_ts_data.mjs
// 実行: node scripts/export_ts_data.mjs
// 出力: ../overlord-syndicate-godot/import_json/

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const SRC_DATA = path.join(PROJECT_ROOT, 'src', 'data');
const OUT_DIR = path.join(PROJECT_ROOT, '..', 'overlord-syndicate-godot', 'import_json');

async function main() {
    // 既存TSを動的import (tsx/ts-node不要: .jsにトランスパイル済み想定、または jiti 使用)
    // ここでは簡易的に .ts を正規表現でパースするか、別途ビルドステップで .json 吐き出し済みを想定
    
    // 実用的アプローチ: package.json に "export:data": "tsx scripts/export_ts_data.ts" 追加
    // tsx で直接 .ts 実行し、JSON.stringify で出力
}

main();
```

### 実用的実装: `scripts/export_ts_data.ts` (tsx実行)
```typescript
// scripts/export_ts_data.ts
// 実行: npx tsx scripts/export_ts_data.ts

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '../import_json');

// 既存データモジュールをインポート
import { chapterData as ch01 } from '../src/data/chapters/ch01/index.js';
import { evidenceList as ch01Evidence } from '../src/data/chapters/ch01/evidence.js';
// ... 必要分 import

function writeJson(filename: string, data: unknown) {
    const outPath = path.join(OUT_DIR, filename);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
    console.log(`Written: ${outPath}`);
}

// チャプター単位で統合 JSON 吐き出し
writeJson('ch01/chapter.json', {
    id: 'ch01',
    titleKey: 'chapter.ch01.title',
    background: 'assets/backgrounds/bg_shotengai_office.png',
    // testimonies, hotspots, evidence_list は別ファイル参照 or インライン
});

writeJson('ch01/evidence.json', ch01Evidence);
writeJson('ch01/testimonies.json', ch01Testimonies);
writeJson('ch01/hotspots.json', ch01Hotspots);
writeJson('ch01/npcs.json', ch01Npcs);
writeJson('ch01/flags.json', ch01InitialFlags);

console.log('Export complete');
```

### 出力 JSON スキーマ例 (`import_json/ch01/evidence.json`)
```json
[
  {
    "id": "ev_goda_memo",
    "nameKey": "ev.goda_memo.name",
    "descKey": "ev.goda_memo.desc",
    "icon": "assets/evidence/icon_ev_goda_memo.png"
  },
  {
    "id": "ev_past_settlement",
    "nameKey": "ev.past_settlement.name",
    "descKey": "ev.past_settlement.desc",
    "icon": "assets/evidence/icon_ev_past_settlement.png"
  }
]
```

---

## Step 2: JSON → .tres 変換 (GDScript @tool)

### `scripts/tools/convert_json_to_tres.gd`
```gdscript
# scripts/tools/convert_json_to_tres.gd
@tool
class_name JsonToTresConverter extends EditorScript

## 設定
@export var json_source_dir: String = "res://import_json"
@export var tres_target_dir: String = "res://resources/data"
@export var chapter_ids: Array[String] = ["ch01"]  # 対象チャプター

## 内部状態
var _json_cache: Dictionary = {}
var _resource_cache: Dictionary = {}

func _run():
    print("=== JSON → .tres Conversion Started ===")
    
    for chapter_id in chapter_ids:
        print("Converting chapter: %s" % chapter_id)
        _convert_chapter(chapter_id)
    
    print("=== Conversion Complete ===")

func _convert_chapter(chapter_id: String):
    var chapter_dir = "%s/%s" % [json_source_dir, chapter_id]
    var target_chapter_dir = "%s/chapters/%s" % [tres_target_dir, chapter_id]
    
    # ディレクトリ作成
    _ensure_dir(target_chapter_dir)
    _ensure_dir("%s/evidence" % target_chapter_dir)
    _ensure_dir("%s/testimonies" % target_chapter_dir)
    _ensure_dir("%s/hotspots" % target_chapter_dir)
    
    # 1. 証拠変換
    var evidence_map = _convert_evidence(chapter_dir, "%s/evidence" % target_chapter_dir)
    
    # 2. 証言変換
    var testimony_map = _convert_testimonies(chapter_dir, "%s/testimonies" % target_chapter_dir)
    
    # 3. ホットスポット変換
    var hotspot_map = _convert_hotspots(chapter_dir, "%s/hotspots" % target_chapter_dir)
    
    # 4. チャプターデータ統合
    _convert_chapter_data(chapter_dir, target_chapter_dir, evidence_map, testimony_map, hotspot_map)

func _ensure_dir(path: String):
    var dir = DirAccess.open(path.get_base_dir())
    if dir and not dir.dir_exists(path.get_file()):
        dir.make_dir(path.get_file())

# --- 証拠 ---
func _convert_evidence(source_dir: String, target_dir: String) -> Dictionary:
    var json = _load_json("%s/evidence.json" % source_dir)
    var map = {}
    
    for ev_data in json:
        var ev = EvidenceItem.new()
        ev.id = ev_data.id
        ev.name_key = ev_data.nameKey
        ev.desc_key = ev_data.descKey
        ev.icon = "res://%s" % ev_data.icon  # パス修正
        
        var file_name = "%s/%s.tres" % [target_dir, ev.id]
        ResourceSaver.save(ev, file_name)
        map[ev.id] = file_name
        print("  Evidence: %s" % ev.id)
    
    return map

# --- 証言 ---
func _convert_testimonies(source_dir: String, target_dir: String) -> Dictionary:
    var json = _load_json("%s/testimonies.json" % source_dir)
    var map = {}
    
    for t_data in json:
        var testimony = Testimony.new()
        testimony.id = t_data.id
        testimony.speaker = t_data.speaker
        
        var blocks = []
        for b_data in t_data.blocks:
            var block = TestimonyBlock.new()
            block.id = b_data.id
            block.text_key = b_data.textKey
            block.ask_back_key = b_data.askBackKey ?? ""
            
            if b_data.gap:
                var gap = Gap.new()
                gap.evidence_id = b_data.gap.evidenceId
                gap.accept_any_of = b_data.gap.acceptAnyOf
                gap.success_key = b_data.gap.successKey
                gap.fail_key = b_data.gap.failKey
                block.gap = gap
            
            blocks.append(block)
        
        testimony.blocks = blocks
        
        var file_name = "%s/%s.tres" % [target_dir, testimony.id]
        ResourceSaver.save(testimony, file_name)
        map[testimony.id] = file_name
        print("  Testimony: %s" % testimony.id)
    
    return map

# --- ホットスポット ---
func _convert_hotspots(source_dir: String, target_dir: String) -> Dictionary:
    var json = _load_json("%s/hotspots.json" % source_dir)
    var map = {}
    
    for h_data in json:
        var hs = Hotspot.new()
        hs.id = h_data.id
        hs.area_id = h_data.areaId
        hs.kind = _parse_hotspot_kind(h_data.kind)
        hs.label_key = h_data.labelKey
        hs.text_key = h_data.textKey ?? ""
        hs.evidence_id = h_data.evidenceId ?? ""
        hs.x = h_data.x
        hs.width = h_data.width
        
        var file_name = "%s/%s.tres" % [target_dir, hs.id]
        ResourceSaver.save(hs, file_name)
        map[hs.id] = file_name
        print("  Hotspot: %s" % hs.id)
    
    return map

func _parse_hotspot_kind(kind: String) -> int:
    match kind:
        "inspect": return Hotspot.Kind.INSPECT
        "talk": return Hotspot.Kind.TALK
        "move": return Hotspot.Kind.MOVE
        "locked": return Hotspot.Kind.LOCKED
    return Hotspot.Kind.INSPECT

# --- チャプターデータ ---
func _convert_chapter_data(source_dir: String, target_dir: String, 
                            evidence_map: Dictionary, testimony_map: Dictionary, hotspot_map: Dictionary):
    var chapter_json = _load_json("%s/chapter.json" % source_dir)
    var flags_json = _load_json("%s/flags.json" % source_dir)
    
    var chapter = ChapterData.new()
    chapter.id = chapter_json.id
    chapter.title_key = chapter_json.titleKey
    chapter.background = "res://%s" % chapter_json.background
    
    # 証言配列構築 (順序保持)
    chapter.testimonies = []
    for t_id in chapter_json.testimonyOrder:  # 別途順序配列が必要、または json に順序込み
        if testimony_map.has(t_id):
            chapter.testimonies.append(load(testimony_map[t_id]))
    
    # ホットスポット配列
    chapter.hotspots = []
    for h_id in chapter_json.hotspotOrder:
        if hotspot_map.has(h_id):
            chapter.hotspots.append(load(hotspot_map[h_id]))
    
    # 証拠リスト
    chapter.evidence_list = []
    for e_id in chapter_json.evidenceOrder:
        if evidence_map.has(e_id):
            chapter.evidence_list.append(load(evidence_map[e_id]))
    
    # 初期フラグ
    chapter.initial_flags = flags_json
    
    var file_name = "%s/chapter_data.tres" % target_dir
    ResourceSaver.save(chapter, file_name)
    print("  ChapterData: %s" % chapter.id)

# --- ユーティリティ ---
func _load_json(path: String):
    if _json_cache.has(path):
        return _json_cache[path]
    
    var file = FileAccess.open(path, FileAccess.READ)
    if not file:
        push_error("JSON not found: %s" % path)
        return []
    
    var text = file.get_as_text()
    file.close()
    var json = JSON.parse_string(text)
    _json_cache[path] = json
    return json
```

### 実行方法
```bash
# エディタから: スクリプト → 実行 (JsonToTresConverter)
# ヘッドレス:
godot --headless --script res://scripts/tools/convert_json_to_tres.gd
```

---

## Step 3: 検証・CI 統合

### 検証スクリプト (`scripts/tools/validate_all.gd`)
```gdscript
# scripts/tools/validate_all.gd
@tool
class_name ValidateAll extends EditorScript

func _run():
    var errors = []
    
    # 1. Resource バリデーション
    ResourceValidator.new()._run()  # 既存バリデーター呼び出し
    
    # 2. 参照整合性: ChapterData から全サブリソースロード確認
    var loader = ChapterLoader.new()
    for ch_id in ["ch01"]:  # 全チャプター
        var chapter = loader.load_chapter(ch_id)
        _validate_chapter_references(chapter, errors)
    
    # 3. ローカライズキー存在チェック
    _validate_localization_keys(errors)
    
    # 4. アセット存在チェック
    _validate_asset_paths(errors)
    
    if errors.is_empty():
        print("✅ All validations passed")
    else:
        printerr("❌ Validation failed (%d errors):" % errors.size())
        for e in errors:
            printerr("  - %s" % e)
        OS.exit(1)

func _validate_chapter_references(chapter: ChapterData, errors: Array):
    for i, t in enumerate(chapter.testimonies):
        if t == null: errors.append("Chapter %s: testimony[%d] is null" % [chapter.id, i])
    for i, h in enumerate(chapter.hotspots):
        if h == null: errors.append("Chapter %s: hotspot[%d] is null" % [chapter.id, i])
    for i, e in enumerate(chapter.evidence_list):
        if e == null: errors.append("Chapter %s: evidence[%d] is null" % [chapter.id, i])

func _validate_localization_keys(errors: Array):
    # TranslationServer から全キー取得し、Resource 内のキーと照合
    pass

func _validate_asset_paths(errors: Array):
    # 全 Resource の icon/background パスが ResourceLoader.exists() で真になるか
    pass
```

### CI 設定 (`.github/workflows/godot-ci.yml`)
```yaml
name: Godot CI

on:
  push:
    branches: [port/godot-gdscript]
  pull_request:
    branches: [port/godot-gdscript]

jobs:
  validate:
    runs-on: ubuntu-latest
    container:
      image: godotengine/godot:4.3
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Godot
        run: |
          # Godot 4.3 テンプレート取得
          mkdir -p ~/.local/share/godot/export_templates/4.3.stable
          wget -q https://github.com/godotengine/godot-builds/releases/download/4.3-stable/Godot_v4.3-stable_linux.x86_64.zip
          unzip -q Godot_v4.3-stable_linux.x86_64.zip
          cp Godot_v4.3-stable_linux.x86_64/export_templates/* ~/.local/share/godot/export_templates/4.3.stable/
      
      - name: Run Validation
        run: |
          godot --headless --script res://scripts/tools/validate_all.gd
      
      - name: Run Unit Tests (GUT)
        run: |
          godot --headless --run-tests
      
      - name: Export Web (test build)
        run: |
          mkdir -p build/web
          godot --headless --export-release "Web" build/web/index.html
        # 成果物アップロード (artifact)

  # 別ジョブでデスクトップエクスポートテストも実行可能
```

---

## 開発ワークフロー

### 日常開発
```bash
# 1. TSデータ編集 (Phaser版リポまたは共通データリポ)
# 2. JSON吐き出し
cd /home/tone/git/overlord-syndicate
npx tsx scripts/export_ts_data.ts

# 3. Godot側で変換
cd /home/tone/git/overlord-syndicate-godot  # 同一リポならブランチ切替
godot --headless --script res://scripts/tools/convert_json_to_tres.gd

# 4. 検証
godot --headless --script res://scripts/tools/validate_all.gd

# 5. エディタで .tres 確認・微調整 → コミット
```

### 自動化 (推奨: GitHub Actions + pre-commit)
- **pre-commit**: `validate_all.gd` 実行 (高速モード: 変更ファイルのみ)
- **PR CI**: フル検証 + 単体テスト + Webエクスポート
- **main マージ時**: リリースビルド成果物生成

---

## 将来拡張: 双方向同期

現状: **TS → JSON → .tres** (単方向)

将来的に Godot エディタでデータ編集 → TS 反映が必要なら:
1. `.tres` → JSON 逆変換ツール作成 (`scripts/tools/tres_to_json.gd`)
2. JSON → TS 型定義自動生成 (TypeScript interface)
3. ただし「単一ソース原則」でどちらかをマスターに決めるのが安全

**推奨**: **TS をマスター** (既存コードベース・型安全性・レビュー容易) にし、Godot 側はビルド成果物として扱う。