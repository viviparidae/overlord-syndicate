---
name: overlord-syndicate-code-review
description: Code review and analysis procedures for Overlord Syndicate game project.
version: 1.0.0
author: tone
license: MIT
category: software-development
---

# Skill: overlord-syndicate-code-review

## Trigger
When analyzing, reviewing, or working with the Overlord Syndicate game codebase at `/home/tone/git/overlord-syndicate`.

## Overview
A 1990s Japanese ADV × social invasion simulation built with Phaser + Vite + TypeScript. Strict architecture: `src/core/` (pure logic, no Phaser/DOM per AGENTS.md §2), `src/phaser/` (rendering), `src/ui/` (DOM overlays), `src/balance/` (cost/reward tables), `src/localization/` (ja/en JSON), `src/data/` (JSON game data). Follows FOAM documentation with 9-field frontmatter.

## Procedure

### 1. Project Structure Check
Run: `ls /home/tone/git/overlord-syndicate/src/` to confirm expected directories exist.
Verify `src/core/` has no Phaser/DOM imports (per AGENTS.md §2).
Check `docs/foam-smart-folders.md` and `docs/index.md` for FOAM documentation status.

### 2. Code Quality Gates
- **Run**: `pnpm test:run` — verify no new failures (4 pre-existing happy-dom canvas infrastructure failures are not code bugs).
- **Lint**: `pnpm lint` — Biome checks (v2.6.2 schema). Fix auto-fixable issues with `pnpm lint:fix`.
- **Typecheck**: `pnpm typecheck` — `tsc --noEmit`.
- **Build**: `pnpm build` — production build to `dist/`.
- **E2E**: `pnpm test:e2e` — requires `vite preview` (port 4173) running first.

### 3. Key Files to Inspect
- `src/core/Resources.ts` — verify all resource changes go through the `Resources` class (no direct `state.funds =`).
- `src/balance/Thresholds.ts` — phase transition keys: `phase1To2`, `phase2To3`, `phase3To4`.
- `src/localization/ja.json` / `en.json` — ensure all 61 keys match between languages.
- `src/phaser/config.ts` — GAME_CONFIG: 960×540, `pixelArt: true, roundPixels: true`.
- `src/core/GameState.ts` — phase machine, no direct `if (phase === X)` comparisons.

### 4. Common Pitfalls & Fixes

| Pitfall | Why | Fix |
|---------|-----|-----|
| Direct state assignment (`state.funds = 100`) | Violates Resources class encapsulation; breaks save migration, test isolation | Always use `Resources.modify('funds', amount)` or similar API |
| `if (phase === 3)` direct comparisons | Should use `GameState.isPhase(3)` or threshold system; phase changes via `engine.advancePhase()` | Use threshold transition system from `src/balance/Thresholds.ts` |
| Missing `implemented_by` / `version` in doc frontmatter | Causes doc drift; `MD Editor Plus` board view breaks | Add all 9 frontmatter fields when creating/updating docs |
| Object creation in `update()` | Fails 60fps performance goal | Pool objects; reuse references; StreetScene.update() is a good example of delta-time usage without new object creation |
| Locale mismatch (ja.json key missing from en.json) | Fallback localization breaks; user-facing text appears in English only | Add new key to ja.json FIRST, then immediately add to en.json |
| Debug bridge left in production build | `DebugBridge.ts` has `?e2e` query param check | Remove or gate debug code before prod build |

### 5. User Preferences (concise/direct)
- Respond without filler (`Great question,` `I'd be happy to`).
- One-line question → one-line answer; finished work → short report only (what changed, what's verified, what's left).
- No restating requests; no narrating tool calls.
- Japanese user; responses in Japanese when appropriate.
- Conventional Commit format for any commits.

### 6. Quick Validation Checklist
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes (or auto-fixed)
- [ ] `pnpm test:run` passes (58/58 tests; 4 pre-existing happy-dom canvas failures OK)
- [ ] All localization keys match between ja.json and en.json
- [ ] No direct `state.funds =` assignments found in new code
- [ ] Phase transitions use Thresholds system, not direct comparisons
- [ ] FOAM docs have all 9 frontmatter fields set
- [ ] Pixel art config: 960×540, `pixelArt: true, roundPixels: true`