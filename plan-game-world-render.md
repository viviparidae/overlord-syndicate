# ゲーム世界描画修正プラン（キャラクター頭のみ表示問題）

## 確認された現状

スクリーンショット解析（`Screenshot_20261025-164049.png`）の結果、**修正前と修正後を比較して確認された事実**:

| 要素                       | 修正前                     | 修正後（現在）                                                          |
| -------------------------- | -------------------------- | ----------------------------------------------------------------------- |
| HUDステータスバー          | 隠れていた                 | ✅ 上部に表示（深度500で正しく前面）                                    |
| ログコンソール             | 隠れていた / 位置ずれ      | ✅ 下部に固定表示（深度600、リポジショニング完了）                      |
| コマンドパネル             | 隠れていた                 | ✅ 下部外側に「店番/噂/脅迫」ボタン表示                                 |
| ゲーム世界（街並み・建物） | 完全に見えない（黒い画面） | ⚠️ **キャラクターの頭（ラベル「子供」「主婦」「新社会人」）のみ見える** |
| ゲーム画面背景             | 完全に黒/暗い              | ⚠️ **ほぼ黒い背景のみ** — 建物や風景の描画が確認できない                |

---

## 問題の特定

**ユーザー確認**: "キャラクターの頭しか見えてないです" → **ゲーム世界の描画レイヤー（背景画像、キャラクタースプライト、建物オブジェクト）がほぼ見えていない**。ラベルテキスト（`NPC` の名前など）は表示されているが、その下のスプライト（`Player`, `NPC`, `shopArea`, `alleyArea`, `ground` タイル）が見えていない。

### 考えられる原因（優先度順）

1. **Scene の深度競合（最有力）**
   - `HudScene` は常に `active: true`（`Game.ts` で `scene: [Boot, Street, Shop, Terminal, Hud]` に含まれる）
   - `StreetScene` の `create()` で追加されるオブジェクト（`ground`, `shopArea`, `player`, `npc` など）の深度が、HUD の深度（500-700）より**高い**可能性
   - しかし `StreetScene` のコードでは `player` の深度は `200`, `npc` は `150`, `shopArea` は `100` であり、HUD（500）より**低い**（= 背景側にある）
   - この設定では HUD が前面に来てゲーム世界が見えないという問題は**発生しない**はず

2. **Phaser の表示レイヤー（Canvas/Scene 管理）の問題**
   - `HudScene` が `active: true` のままであるため、`StreetScene` が `start()` された後も HUD のオブジェクトが残っている
   - しかし `HudScene` は別の `Scene` であり、`Phaser` は各 `Scene` ごとに独立した `displayList` を持つため、通常は競合しない
   - 問題は `StreetScene` の `create()` で追加されたオブジェクトが、何らかの理由で正しく描画されていない可能性

3. **Canvas の `context` / 描画の問題**
   - `pixelArt: true`, `roundPixels: true`, `antialias: false` の設定（`GAME_CONFIG`）が、特定のブラウザ環境で描画を妨げている可能性
   - 特に `Phaser` の `AUTO` タイプで `WebGL` が選択された場合と `Canvas` が選択された場合で挙動が異なる

4. **ゲーム世界のコンテンツが暗い（設計どおりの可能性）**
   - `StreetScene` の `ground` は `tileSprite` で色を指定していない（デフォルトのテクスチャ色に依存）
   - `player`, `npc` は `setDisplaySize(72, 72)` で `setDepth` は設定されているが、**テクスチャ（`assets` から読み込まれるスプライト画像）** が正しく読み込まれているか確認が必要
   - `AssetManager` が `assets` の読み込みを完了しているか確認

---

## 追加修正案（優先度順）

### 修正案 A: StreetScene の描画確認とデバッグ（最優先・最小変更）

`StreetScene.ts` にデバッグ表示を追加し、各オブジェクトが正しく描画されているか確認する。

```typescript
// create() の最後に追加
console.log("StreetScene create complete. Objects:", {
  player: this.player ? this.player.displayWidth + "x" + this.player.displayHeight : "null",
  npcs: this.physics.world.bodies.entries.length,
  scale: this.scale.width + "x" + this.scale.height,
});

// 各オブジェクトの可視性を強制的に確認
this.player?.setVisible(true).setAlpha(1);
this.shopArea?.setVisible(true).setAlpha(1);
this.alleyArea?.setVisible(true).setAlpha(1);
```

### 修正案 B: HUD Scene の可視性管理（Scene イベントによる制御）

`HudScene` が常に `active: true` であることを確認し、必要に応じて `StreetScene` 側で HUD の一部を非表示にする制御を追加する。

```typescript
// HudScene.ts の subscribeEngineEvents または create に追加
this.events.on("scene:pause", () => {
  // 必要に応じて HUD の一部を非表示
});
```

ただし、現在の設計（HUD は常に表示される）では、この修正は不要と判断される。

### 修正案 C: ゲーム世界の描画レイヤー（Depth）の再調整

`StreetScene` の各オブジェクトの深度を再確認し、HUD（500-700）より低い（= 背景側にある）が、**ゲーム画面内で正しく見える範囲**に収まっているか確認。

`StreetScene` の現在の深度設定:
```typescript
ground.setDepth(??)  // デフォルト（未指定）
player.setDepth(200)
npc.setDepth(150)
shopArea.setDepth(100)
alleyArea.setDepth(100)
```

**確認**: `ground` の深度が未設定（デフォルト 0）のため、`player`（200）や `npc`（150）より低い（= 背景側にある）。これは正しい（地面が最背面、キャラがその上、HUD が最前面）。

ただし、`HudScene` の `STATUS`（500）が `player`（200）より高い（前面に来る）ため、ステータスバーはキャラクターの上に重なる。これは**設計どおり**（HUD は常に前面に表示されるべき）。

### 修正案 D: Canvas / WebGL の描画モード確認

`GAME_CONFIG` の `type: Phaser.AUTO` は、`WebGL` が利用可能なら `WebGL` を選択する。環境によっては `WebGL` の描画に問題がある可能性があるため、`Canvas` を強制的に使用するテストを行う。

```typescript
// 一時的に GAME_CONFIG を変更してテスト
export const GAME_CONFIG: Phaser.Types.Core.GameConfig = {
  type: Phaser.CANVAS, // AUTO ではなく CANVAS を強制
  // ...
};
```

---

## 推奨する次のアクション

1. **`pnpm build` でビルド成功を再確認**（完了済み）
2. **`pnpm preview` で `localhost:4173` にアクセス**（完了済み）
3. **`StreetScene` の `create()` にデバッグログを追加して再ビルド・再撮影**（修正案 A を適用）
4. **画像解析で「ゲーム世界（キャラクター、建物、背景）が見えているか」を再確認**
5. **必要に応じて修正案 B/C/D を段階的に適用**

---

## まとめ

| 問題                                 | 状態                                         | 対応 |
| ------------------------------------ | -------------------------------------------- | ---- |
| ステータスバーが隠れている           | ✅ 解決（深度 500 に調整）                   |
| ログコンソールの位置ずれ             | ✅ 解決（固定 `entryY` + リポジショニング）  |
| ゲーム世界が見えない（キャラ頭のみ） | ⚠️ **新たな問題** — 描画レイヤーの確認が必要 |

現在の修正（深度・ログ位置・CSS）は完了していますが、**ゲーム世界の描画レイヤー（スプライト、タイル、キャラクターの可視性）**に別の問題が残っている可能性があります。修正案 A（デバッグログ追加）を優先して適用し、再確認を行ってください。
