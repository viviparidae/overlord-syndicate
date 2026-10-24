---

name: retro-ui-panel
description: 1990年代日本のレトロスタイル HTML/CSS オーバーレイパネルを構築する。ステータスバー、コマンドボタン、ログコンソール、ダイアログボックスなど。
---

# Skill: retro-ui-panel

## 説明

1990年代日本のレトロスタイル HTML/CSS オーバーレイパネルを構築する。

## 使用時

- ステータスバー、コマンドボタン、ログコンソール、ダイアログボックスなど。

## 主要ファイル

- `src/ui/index.html` — パネルテンプレート
- `src/ui/StatusBar.ts` — 資金/恐怖/狂信度/警戒度表示を更新
- `src/ui/index.ts` — コマンドボタン → core アクションディスパッチ、`initUI()` エントリポイント
- `src/localization/ja.json` — すべてのUI文字列

## デザイン仕様

- フォント: 'MS Gothic' またはピクセルフォントのフォールバック
- カラーパレット: #1a1a2e (bg), #e94560 (accent), #0f3460 (panel)
- 固定幅テキストでログエントリ
- Phaser キャンバスの上に CSS z-index でオーバーレイ配置
- すべての UI 文字列は ja.json; en.json フォールバック
- ボタンは core アクションをディスパッチ; UI は状態を読み取り専用で反映
- Phaser API を UI 層に含めない; DOM イベントのみ
