# Plan: 既存 SKILL.md ファイルの日本語化

> **ステータス:** 実装可能 (implementation-ready)  
> **言語:** 日本語

---

## 1. 目的

`.kilo/skill/` 下の既存_SKILL.md_ ファイル（7ファイル）が英語の見出し・本文で構成されているため、日本語に統一する。AGENTS.md のルール「定義はすべて日本語で書く」に従う。

---

## 2. 対象ファイル

| ファイル | 主要見出し（英語） |
|---|---|
| `.kilo/skill/game-mechanic-system/SKILL.md` | Description, When to Use, Key Files |
| `.kilo/skill/japanese-localization/SKILL.md` | Description, Key Files |
| `.kilo/skill/game-balance-tuning/SKILL.md` | Description, Key Files, Balance Philosophy |
| `.kilo/skill/vite-build-config/SKILL.md` | Description, When to Use, Key Files |
| `.kilo/skill/retro-ui-panel/SKILL.md` | Description, When to Use, Key Files |
| `.kilo/skill/phaser-game-dev/SKILL.md` | Description, When to Use, Key Files |
| `.kilo/skill/save-load-system/SKILL.md` | Description, Key Files, Format |

---

## 3. 変更内容

各_SKILL.md_ ファイル以下の英語見出しを日本語に置き換え、本文も日本語に統一する:

| 英語 | 日本語 |
|---|---|
| Description | 説明 |
| When to Use | 使用時 |
| Key Files | 主要ファイル |
| Balance Philosophy | バランス哲学 |
| Format | 形式 |
| Constraints | 制約 |

**注意**: 見出し以外の本文（コードパス、API名、関数名、JSONキーなど）は英語のまま維持する。ファイル名・識別子・コード・API名・パスは英語のまま。

---

## 4. タスク

1. `game-mechanic-system/SKILL.md` を日本語化
2. `japanese-localization/SKILL.md` を日本語化
3. `game-balance-tuning/SKILL.md` を日本語化
4. `vite-build-config/SKILL.md` を日本語化
5. `retro-ui-panel/SKILL.md` を日本語化
6. `phaser-game-dev/SKILL.md` を日本語化
7. `save-load-system/SKILL.md` を日本語化
8. 検証（全_SKILL.md_ の見出しが日本語であることを確認）

---

## 5. リスクと制約

- **リスク**: 見出し以外の本文を日本語に変更することで、技術的な正確性が失われる可能性がある。
- **対策**: コードパス、API名、関数名、JSONキーなどは英語のまま維持。説明文のみ日本語に翻訳。
- **制約**: 既存の_SKILL.md_ ファイルの内容を完全に日本語に翻訳するのではなく、見出しと説明文のみを日本語化する。