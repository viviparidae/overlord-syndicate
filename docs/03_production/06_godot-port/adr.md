# アーキテクチャ決定記録 (ADR)

## ADR-001: エンジン・言語選定

**決定**: Godot 4.x + GDScript

**理由**
- Webエクスポート（WASM）がネイティブ対応、C#の AOT 制約なし
- GDScript は Godot ネイティブ言語、エディタ統合・ホットリロード最速
- 既存 TypeScript コードベースとの型的親和性：型ヒント（`var x: Type`）で準同等の静的解析可能
- `@tool` スクリプトでエディタ拡張・変換ツールが容易
- コミュニティ資産・ドキュメントが最も豊富

**代替案と却下理由**
| 代替 | 却下理由 |
|------|----------|
| Godot + C# | Webエクスポートで `reflection`/`dynamic` 制約、AOT コンパイル時間長、依存追加 |
| GDScript + GDExtension (Rust/C++) | オーバーエンジニアリング、ビルド複雑化、初期移植では不要 |
| 独自エンジン継続 (Phaser) | 目的が「Godot移植」のため対象外 |

---

## ADR-002: データ形式・Resource化

**決定**: 既存 JSON → Godot `Resource` (`.tres`) へ変換、実行時は `preload()` / `ResourceLoader.load()`

**理由**
- エディタのインスペクタでデータ直接編集可能（証拠・証言・ホットスポット座標）
- 型付きリソースとして参照整合性チェック（欠落アイコン・未定義キーをエディタ警告）
- `@export` 変数でシーンからドラッグ＆ドロップ割り当て可能
- バイナリ `.res` へ圧縮可能（リリース時）

**変換戦略**
- ビルド時・CI で一括変換（`@tool` スクリプト）
- 開発中は JSON 編集 → 変換 → `.tres` 確認のサイクル
- 将来的に JSON 直接編集も併用可能（`FileAccess` + `JSON.parse_string` フォールバック）

---

## ADR-003: コアロジック移植戦略

**決定**: `src/core/` を `scripts/core/` へ 1:1 移植、クラス・関数シグネチャ維持

**理由**
- 既存コアは Phaser 非依存・純粋 TypeScript（副作用なし・決定論的）
- 単体テスト資産（vitest）を GUT (GDUnit) へ移植し回帰防止
- インターフェース（`ResolutionEngine`, `StoryRunner`, `SaveRepository` 等）を維持し、Godot側 UI から同一 API で呼び出し可能に

**マッピング方針**
| TypeScript | GDScript |
|------------|----------|
| `class` / `interface` | `class_name` + `@export` / `extends Resource` |
| `type` / `interface` (データのみ) | `class_name` extends `Resource` |
| `enum` | `enum` または `@export_enum` |
| `readonly` / `private` | 慣習 `_` プレフィックス、必要なら `@export` 制御 |
| `Promise` / `async` | `await` + `Signal` / `call_deferred` |
| `Map<K,V>` | `Dictionary[K, V]` (型ヒント付き) |
| `Array<T>` | `Array[T]` (型ヒント付き) |

---

## ADR-004: UI・シーン構成

**決定**: Phaser Scene 単位 → Godot Scene (`.tscn`) 単位、Control ノードツリーで構築

**マッピング**
| Phaser Scene | Godot Scene | ルートノード |
|--------------|-------------|--------------|
| `BootScene` | `Boot.tscn` | `Node` (自動読み込み `Autoload` 推奨) |
| `TitleScene` | `Title.tscn` | `Control` |
| `ChapterSelectScene` | `ChapterSelect.tscn` | `Control` |
| `StoryScene` | `Story.tscn` | `Control` |
| `InvestigationScene` | `Investigation.tscn` | `Control` |
| `ResolutionScene` | `Resolution.tscn` | `Control` |
| `GameOverScene` | `GameOver.tscn` | `Control` |
| `EvidenceScene` | `Evidence.tscn` (ポップアップ) | `Window` / `PopupPanel` |

**共通 UI コンポーネント** → `scripts/ui/components/` として再利用可能なカスタム Control クラス化
- `DialogueBox`, `CharacterPortrait`, `EvidenceSlot`, `HotspotButton`, `ChapterCard` 等

---

## ADR-005: シーン遷移・ステート管理

**決定**: `SceneTree.change_scene_to_file()` + `Autoload` シングルトン (`GameState`) でグローバル状態管理

**理由**
- Godot 標準のシーン切替・メモリ管理を活用
- `GameState` (Autoload) が `current_chapter`, `evidence_inventory`, `flags`, `save_slot` 等を保持
- 各シーンは `GameState` 参照し、必要データを `ready()` で取得・UI 反映
- セーブ/ロードは `GameState.save()` / `GameState.load()` で一元化

---

## ADR-006: アセットパイプライン

**決定**: 既存 `public/assets/` → `assets/` へコピー、Godot インポート設定 (`.godot/imported/`) で最適化

**方針**
- 背景・立ち絵: `Texture2D` (VRAM 圧縮: BPTC / WebP)
- UI フレーム・アイコン: `Texture2D` + NinePatch / Atlas
- 証拠アイコン: `Texture2D` (小サイズ、アトラス化推奨)
- フォント: 既存 Web フォント → `.ttf` / `.otf` 取得し `DynamicFont` 化、フォールバック設定
- オーディオ: 既存なし → 後で追加時は `.ogg` (Vorbis/Opus)

---

## ADR-007: ローカライズ

**決定**: Godot `TranslationServer` + CSV (`.translation` リソース)

**移行手順**
1. 既存 `src/localization/` の JSON/TS → CSV 変換 (`key,ja,en`)
2. `TranslationServer.add_translation()` で読み込み
3. UI 文字列は `tr("key")` または `@export` 変数に `LocalizationKey` ヒント付け
4. 実行時言語切替: `TranslationServer.set_locale("ja")` / `"en"`

---

## ADR-008: セーブ/ロード

**決定**: `ConfigFile` (人間可読 INI 形式) + `FileAccess` で `user://saves/slot_N.save`

**データ構造**
```ini
[meta]
version = 1
timestamp = 1700000000
chapter = "ch01"
phase = "investigation"

[evidence]
ev_goda_memo = true
ev_past_settlement = true

[flags]
met_chinatsu = true
visited_arcade = true

[progress]
current_testimony = "testimony_03"
current_block = 2
```

**理由**: Godot 標準、クロスプラットフォーム、`user://` 自動解決、手動編集・デバッグ容易

---

## ADR-009: テスト戦略

**決定**: GUT (GDUnit) でユニットテスト + 手動 E2E チェックリスト

| レベル | ツール | 対象 |
|--------|--------|------|
| ユニット | GUT | `scripts/core/*`, `scripts/resources/*`, `GameState` |
| 結合 | GUT + シーンインスタンス化 | シーン遷移・データフロー |
| E2E | 手動チェックリスト | 全フロー通し、セーブ/ロード、多言語切替 |

**CI**: GitHub Actions で `godot --headless --run-tests` 実行

---

## ADR-010: Web エクスポート設定

**決定**: Godot Web エクスポートテンプレート (WASM) 使用、`.pck` 分割なし (初期)

**注意点**
- `OS.delay_msec()` 等ブロッキング API 回避 (`await get_tree().create_timer()` 使用)
- ファイルシステムアクセスは `FileAccess` 抽象化層経由 (Web では IndexedDB へフォールバック)
- スレッド非対応 → 重い計算はメインスレッドで分割実行 (`call_deferred` / フレーム分散)
- メモリ上限 (ブラウザ依存) に注意、テクスチャ圧縮・アトラス化で削減