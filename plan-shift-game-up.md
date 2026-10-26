# ゲーム世界を上にずらす修正プラン（ユーザー提案に基づく）

## ユーザーの気づき（正しい）

> "ゲーム世界をもう少し上にずらせば見えるようになる"

**根拠**（コードと画像解析から）:

`StreetScene.ts` のコンテンツ配置:
```typescript
ground = tileSprite(width/2, height - 30, ...)  // 画面下部
player = new Player(this, 160, height - 60, ...)  // 下から60px
shopArea = image(160, height - 120, ...)         // 下から120px
npc = new NPC(this, 320, height - 60, ...)       // 下から60px
promptText = text(width/2, height - 40, ...)     // 下から40px
```

HUD の下部要素（`HudScene.ts`）:
```typescript
logBg = rectangle(0, height - 120, width, 120, ...)  // 下から120px、高さ120 = 下端まで
commandPanel = rectangle(0, height - 70, width, 70, ...) // 下から70px、高さ70 = 下端まで
```

→ **ゲーム世界のキャラクター・店・路地裏は全部下端120px以内に配置されている**。そこにHUDのログコンソール（120px）とコマンドパネル（70px）が重なる。結果として「キャラクターの頭だけ見える」状態になる。

---

## 修正方針（最小変更・最大効果）

### 方法: StreetScene のコンテンツを上にシフト

**変更内容**: `StreetScene.ts` の `create()` で、すべてのゲーム世界要素のY座標を **上方向（-100px程度）** にシフトする。

**具体的な修正**:

```typescript
// StreetScene.create() でのシフト量
const SHIFT_Y = -120;  // 下から120px上に移動（HUDログコンソールの上端に合わせる）

// 各オブジェクトの表示位置を調整
this.player.y += SHIFT_Y;        // または新規作成時に height - 60 + SHIFT_Y
this.shopArea.y += SHIFT_Y;
this.alleyArea.y += SHIFT_Y;
ground.y += SHIFT_Y;             // tileSprite の中心位置を調整
// NPC の位置も同様
```

出力: 以下のファイルを修正し、再ビルド・再撮影して確認。

---

## 修正ファイル

- `src/phaser/scenes/StreetScene.ts` — `create()` と `update()` の座標を調整
- （必要なら）`src/phaser/scenes/ShopScene.ts` — 同様の調整

---

## 確認手順

1. `patc` で `StreetScene.ts` の `y` 座標を調整（`height - 60` → `height - 180` くらいに）
2. `pnpm build`
3. `pnpm preview` → `localhost:4173`
4. 新規スクリーンショット撮影 → `vision_analyze` で「キャラクターの頭だけ」ではなく「キャラクター全体+背景」が見えるか確認

---

## ユーザーの提案の価値

これは**正確な診断**です。HUDの深度（500-700）は正しく修正されており、問題は**ゲームコンテンツの配置位置**（下端に集中しすぎている）にあります。シフトすれば、HUDログコンソール（下から120px）とコマンドパネル（下から70px）の上にゲーム世界が完全に表示されます。