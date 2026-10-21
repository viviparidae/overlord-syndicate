# Skill: japanese-localization

## 説明
日本語テキスト、フォント、CJK テキストラッピング、ロケールフォーマット処理を行う。

## 主要ファイル
- `src/localization/index.ts` — `t()` 関数、`formatCurrency()`、`formatDate()`
- `src/localization/ja.json` — デフォルト (すべてのキー)
- `src/localization/en.json` — フォールバック
- `public/fonts/` — Noto Sans CJK サブセット (woff2)

## 関数
- `t('status.funds', { amount: 10000 })` → `資金: ¥10,000`
- `t('status.fear', { level: 5 })` → `恐怖: 5`
- `t('status.faith', { level: 2 })` → `狂信度: 2`
- `t('status.suspect', { level: 0 })` → `警戒度: 0%`
- `formatCurrency(10000)` → `¥10,000`
- `formatDate(new Date(1997, 0, 1))` → `平成9年1月1日`
- CJK テキストラッピング: オーバーフローなし、文字境界で改行

## 制約
- すべてのUIテキストキーは `ja.json` に存在する
- `en.json` はフォールバック: キーが `en.json` にない場合、`ja.json` の値にフォールバック
- TypeScript/JS コード内に日本語文字列を埋め込まない: `t()` を使用
- `t()` 関数はキーが欠落した場合、キー文字列をそのまま返して異常終了させない