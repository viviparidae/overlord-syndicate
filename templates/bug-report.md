---

title: バグ報告テンプレート
description: 開発中に発見したバグを記録するための標準化されたバグ報告フォーマット。
status: draft
version: "0.1"
category: qa
tags:
- qa
- bug
  traces_to:
- docs/qa/test-plan.md
  implemented_by:
  verified_by:

---

# バグ報告

## 必須フィールド

| フィールド       | 説明                                             |
| ---------------- | ------------------------------------------------ |
| タイトル         | バグを簡潔に要約する                             |
| 説明             | 再現手順、期待動作、実際の動作を記述する         |
| 重大度           | Critical / High / Medium / Low / Info から選択   |
| 再現手順         | ステップバイステップの手順を記述する             |
| 環境コンテキスト | OS、ブラウザ、フェーズ、セーブ状態などを記録する |
| 優先度           | P0 / P1 / P2 / P3 から選択する                   |

## テンプレート

```markdown
## タイトル

[簡潔なタイトル]

## 説明

[バグの詳細な説明]

## 再現手順

1.
2.
3.

## 期待される挙動

[正常時の挙動]

## 実際の挙動

[バグ発生時の挙動]

## 環境コンテキスト

- OS:
- ブラウザ:
- フェーズ:
- セーブ状態:

## 優先度

[P0/P1/P2/P3]

## タグ

[core/phaser/ui/data/balance/localization]

## ステータス

[New/In Progress/Fixed/Resolved]
```
