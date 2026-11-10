# CI/CD 設定

## 概要
GitHub Actions で以下を自動化：
1. **Lint/型チェック** - 全PRで実行
2. **単体テスト (GUT)** - 全PRで実行
3. **検証スクリプト** - 全PRで実行
4. **Web エクスポート検証** - mainマージ時・タグ時
5. **デスクトップ エクスポート** - タグ時 (リリース成果物)

---

## ワークフロー構成

### `.github/workflows/ci.yml` (メインCI)

```yaml
name: CI

on:
  push:
    branches: [port/godot-gdscript]
  pull_request:
    branches: [port/godot-gdscript]

permissions:
  contents: read

env:
  GODOT_VERSION: "4.3"
  PROJECT_PATH: "."

jobs:
  # ===========================
  # Lint & Static Analysis
  # ===========================
  lint:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    container:
      image: godotengine/godot:${{ env.GODOT_VERSION }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup GDScript CLI
        run: |
          # gdscript CLI ツールインストール (静的解析用)
          wget -q https://github.com/godotengine/gdscript-language-server/releases/download/v1.0.0/gdscript-lint-linux.zip
          unzip -q gdscript-lint-linux.zip
          chmod +x gdscript-lint
          sudo mv gdscript-lint /usr/local/bin/
      
      - name: Run gdscript --check
        run: |
          gdscript --check --pedantic scripts/
      
      - name: Run Godot validation script
        run: |
          godot --headless --script res://scripts/tools/validate_all.gd

  # ===========================
  # Unit Tests (GUT)
  # ===========================
  test:
    name: Unit Tests
    runs-on: ubuntu-latest
    container:
      image: godotengine/godot:${{ env.GODOT_VERSION }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Install GUT
        run: |
          # GUT (GDUnit) インストール
          mkdir -p addons
          cd addons
          wget -q https://github.com/bitwes/Gut/releases/download/9.3.0/gut-9.3.0.zip
          unzip -q gut-9.3.0.zip
          rm gut-9.3.0.zip
      
      - name: Run Tests
        run: |
          godot --headless --run-tests
      
      - name: Upload Test Results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: test-results/
          retention-days: 7

  # ===========================
  # Web Export Verification
  # ===========================
  web-export:
    name: Web Export Verification
    runs-on: ubuntu-latest
    container:
      image: godotengine/godot:${{ env.GODOT_VERSION }}
    needs: [lint, test]  # Lint/テスト通過後のみ
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Export Templates
        run: |
          mkdir -p ~/.local/share/godot/export_templates/${{ env.GODOT_VERSION }}.stable
          wget -q https://github.com/godotengine/godot-builds/releases/download/${{ env.GODOT_VERSION }}-stable/Godot_v${{ env.GODOT_VERSION }}-stable_linux.x86_64.zip
          unzip -q Godot_v${{ env.GODOT_VERSION }}-stable_linux.x86_64.zip
          cp Godot_v${{ env.GODOT_VERSION }}-stable_linux.x86_64/export_templates/* ~/.local/share/godot/export_templates/${{ env.GODOT_VERSION }}.stable/
      
      - name: Export Web
        run: |
          mkdir -p build/web
          godot --headless --export-release "Web" build/web/index.html
      
      - name: Verify Export Output
        run: |
          # 基本ファイル存在確認
          test -f build/web/index.html
          test -f build/web/*.wasm
          test -f build/web/*.pck
          test -f build/web/*.js
          # サイズチェック (例: 50MB以下)
          WASM_SIZE=$(stat -c%s build/web/*.wasm)
          if [ $WASM_SIZE -gt 52428800 ]; then
            echo "WASM too large: $WASM_SIZE bytes"
            exit 1
          fi
      
      - name: Upload Web Build Artifact
        uses: actions/upload-artifact@v4
        with:
          name: web-build
          path: build/web/
          retention-days: 30

  # ===========================
  # Data Conversion Test
  # ===========================
  data-conversion:
    name: Data Conversion Pipeline
    runs-on: ubuntu-latest
    container:
      image: godotengine/godot:${{ env.GODOT_VERSION }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node.js (for TS→JSON export)
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install TS dependencies
        run: |
          cd ${{ env.PROJECT_PATH }}
          npm ci
      
      - name: Export TS Data to JSON
        run: |
          cd ${{ env.PROJECT_PATH }}
          npx tsx scripts/export_ts_data.ts
      
      - name: Convert JSON to .tres
        run: |
          godot --headless --script res://scripts/tools/convert_json_to_tres.gd
      
      - name: Validate Converted Resources
        run: |
          godot --headless --script res://scripts/tools/validate_all.gd

  # ===========================
  # Summary
  # ===========================
  ci-summary:
    name: CI Summary
    runs-on: ubuntu-latest
    needs: [lint, test, web-export, data-conversion]
    if: always()
    steps:
      - name: Check Job Status
        run: |
          if [[ "${{ needs.lint.result }}" != "success" ]]; then exit 1; fi
          if [[ "${{ needs.test.result }}" != "success" ]]; then exit 1; fi
          if [[ "${{ needs.web-export.result }}" != "success" ]]; then exit 1; fi
          if [[ "${{ needs.data-conversion.result }}" != "success" ]]; then exit 1; fi
          echo "All checks passed!"
```

---

### `.github/workflows/release.yml` (リリースビルド)

```yaml
name: Release Build

on:
  push:
    tags:
      - 'godot-v*'

permissions:
  contents: write

env:
  GODOT_VERSION: "4.3"

jobs:
  export-all:
    name: Export All Platforms
    runs-on: ubuntu-latest
    container:
      image: godotengine/godot:${{ env.GODOT_VERSION }}
    strategy:
      matrix:
        platform: [web, linux, windows, macos]
        include:
          - platform: web
            export_name: "Web"
            output_dir: build/web
            artifact_name: overlord-syndicate-web
          - platform: linux
            export_name: "Linux/X11"
            output_dir: build/linux
            artifact_name: overlord-syndicate-linux
          - platform: windows
            export_name: "Windows Desktop"
            output_dir: build/windows
            artifact_name: overlord-syndicate-windows
          - platform: macos
            export_name: "macOS"
            output_dir: build/macos
            artifact_name: overlord-syndicate-macos
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Export Templates
        run: |
          mkdir -p ~/.local/share/godot/export_templates/${{ env.GODOT_VERSION }}.stable
          wget -q https://github.com/godotengine/godot-builds/releases/download/${{ env.GODOT_VERSION }}-stable/Godot_v${{ env.GODOT_VERSION }}-stable_linux.x86_64.zip
          unzip -q Godot_v${{ env.GODOT_VERSION }}-stable_linux.x86_64.zip
          cp Godot_v${{ env.GODOT_VERSION }}-stable_linux.x86_64/export_templates/* ~/.local/share/godot/export_templates/${{ env.GODOT_VERSION }}.stable/
      
      - name: Export ${{ matrix.platform }}
        run: |
          mkdir -p ${{ matrix.output_dir }}
          godot --headless --export-release "${{ matrix.export_name }}" ${{ matrix.output_dir }}/
      
      - name: Package Artifact
        run: |
          cd ${{ matrix.output_dir }}
          if [ "${{ matrix.platform }}" = "web" ]; then
            zip -r ../${{ matrix.artifact_name }}.zip .
          elif [ "${{ matrix.platform }}" = "windows" ]; then
            zip -r ../${{ matrix.artifact_name }}.zip .
          else
            tar -czf ../${{ matrix.artifact_name }}.tar.gz .
          fi
      
      - name: Upload Release Asset
        uses: softprops/action-gh-release@v1
        with:
          files: |
            build/${{ matrix.artifact_name }}.zip
            build/${{ matrix.artifact_name }}.tar.gz
          generate_release_notes: true
```

---

## Godot エクスポートプリセット (`export_presets.cfg`)

```ini
[preset.0]
name="Web"
platform="Web"
runnable=true
dedicated_server=false
custom_features=""
export_path="build/web/index.html"
export_filter="all_resources"
include_filter=""
exclude_filter=""
export_encryption_key=""
script_encryption_key=""
custom_template_release=""
custom_template_debug=""
texture_compression="vram"
vrams_compress_3d=true
vrams_compress_2d=true

[preset.1]
name="Linux/X11"
platform="Linux/X11"
runnable=true
dedicated_server=false
export_path="build/linux/overlord-syndicate"
export_filter="all_resources"

[preset.2]
name="Windows Desktop"
platform="Windows Desktop"
runnable=true
dedicated_server=false
export_path="build/windows/overlord-syndicate.exe"
export_filter="all_resources"

[preset.3]
name="macOS"
platform="macOS"
runnable=true
dedicated_server=false
export_path="build/macos/Overlord Syndicate.app"
export_filter="all_resources"
```

---

## プロジェクト設定 (`project.godot`) 抜粋

```ini
[application]
config/name="Overlord Syndicate"
config/icon="res://assets/ui/icon.png"
run/main_scene="res://scenes/Boot.tscn"
run/low_processor_mode_sleep_usec=1000

[autoload]
GameState="*res://scripts/autoload/game_state.gd"
ChapterLoader="*res://scripts/data/chapter_loader.gd"
Localization="*res://scripts/autoload/localization.gd"
AudioManager="*res://scripts/autoload/audio_manager.gd"

[rendering]
renderer/rendering_method="mobile"  # Web/軽量対応
renderer/max_frame_latency=1

[input]
# キー・ゲームパッドマッピング定義

[editor]
filesystem/import_default_preset="default"
filesystem/import_presets_path="import_presets/"

[export]
web/pool_size=32  # Web メモリプール (MB)
web/thread_count=0  # Web スレッド無効
```

---

## インポートプリセット (`import_presets/`)

### `import_presets/texture_2d_bg.preset` (背景用)
```ini
[preset]
name="texture_2d_bg"
importer="texture"
detect_3d=false
force_max_size=true
max_size=2048
compress/mode=2  # VRAM Compressed
compress/hdr_mode=0
compress/normal_map=0
compress/lossy_quality=0.7
mipmaps/generate=false
flags/repeat=0
flags/filter=true
flags/mipmaps=false
flags/anisotropic=false
flags/srgb=true
process/fix_alpha_border=true
process/premultiply_alpha=false
process/hdr_as_srgb=false
process/normal_map_invert_y=false
stream=false
size_limit=0
```

### `import_presets/texture_2d_ui.preset` (UI・アイコン用)
```ini
[preset]
name="texture_2d_ui"
importer="texture"
compress/mode=2
compress/lossy_quality=0.8
flags/filter=false  # ピクセルアート等で最近傍
flags/mipmaps=false
process/fix_alpha_border=true
```

### `import_presets/texture_atlas.preset` (アトラス用)
```ini
[preset]
name="texture_atlas"
importer="texture"
compress/mode=2
flags/filter=true
flags/mipmaps=true
```

---

## プリコミットフック (`.pre-commit-config.yaml`)

```yaml
repos:
  - repo: local
    hooks:
      - id: godot-lint
        name: GDScript Lint
        entry: bash -c 'godot --headless --script res://scripts/tools/validate_all.gd'
        language: system
        types: [file]
        files: '\.gd$'
        pass_filenames: false
      
      - id: gdscript-check
        name: gdscript --check
        entry: gdscript --check --pedantic
        language: system
        types: [file]
        files: '\.gd$'
```

```bash
# インストール
pip install pre-commit
pre-commit install
```

---

## ローカル開発コマンド

```bash
# 開発用エディタ起動
godot --editor

# ヘッドレス検証
godot --headless --script res://scripts/tools/validate_all.gd

# 単体テスト実行
godot --headless --run-tests

# 全テスト + カバレッジ (GUT対応時)
godot --headless --run-tests --coverage

# Web エクスポートテスト
mkdir -p build/web && godot --headless --export-release "Web" build/web/index.html

# デスクトップ エクスポートテスト
mkdir -p build/linux && godot --headless --export-release "Linux/X11" build/linux/overlord-syndicate

# 型チェックのみ
gdscript --check --pedantic scripts/

# データ変換パイプライン実行
npx tsx scripts/export_ts_data.ts  # TS→JSON
godot --headless --script res://scripts/tools/convert_json_to_tres.gd  # JSON→.tres
```

---

## 成果物管理

| 成果物 | 保存場所 | 保持期間 | 用途 |
|--------|----------|----------|------|
| Webビルド | GitHub Artifacts / Release Assets | 30日 / 永久 | プレイテスト・配布 |
| デスクトップビルド | Release Assets | 永久 | 配布 |
| テスト結果 | GitHub Artifacts | 7日 | デバッグ |
| カバレッジレポート | GitHub Artifacts / Codecov | 30日 | 品質管理 |

---

## 環境変数・シークレット

| 変数名 | 用途 | 設定場所 |
|--------|------|----------|
| `GODOT_VERSION` | 使用Godotバージョン | ワークフロー `env` |
| `EXPORT_ENCRYPTION_KEY` | スクリプト暗号化キー (任意) | Repository Secrets |
| `ITCH_IO_API_KEY` | itch.io デプロイ用 (任意) | Repository Secrets |
| `STEAM_API_KEY` | Steam デプロイ用 (任意) | Repository Secrets |

---

## トラブルシューティング

| 症状 | 原因 | 対処 |
|------|------|------|
| `gdscript` コマンド見つからない | CLI ツール未インストール | `wget` でバイナリ取得、PATH通す |
| Export template mismatch | Godotバージョンとテンプレート不一致 | `GODOT_VERSION` 統一、テンプレート再取得 |
| Web export fails (OOM) | WASM メモリ不足 | `web/pool_size` 増やす、テクスチャ圧縮強化 |
| Test discovery fails | GUT 未インストール / パス間違い | `addons/gut/` 存在確認、バージョン固定 |
| Validation script timeout | ファイル数多すぎ | 検証対象絞り込み、並列化 |