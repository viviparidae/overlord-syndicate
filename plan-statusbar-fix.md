## Fix Plan: Status Bar and Log Console Hidden Game Screen

**Problem**: ゲーム画面がステータスバーとログコンソールの裏に隠れてしまっている (Game screen is hidden behind the status bar and log console)

**Root Cause Analysis**:

After reviewing the codebase, the issue has several possible dimensions:

### 1. Phaser Depth Configuration (HudScene.ts)

The HUD scene uses depth values that were previously too high, potentially causing rendering conflicts:

| Element | Original Depth | New Depth | Change |
|---------|---------------|-----------|--------|
| STATUS (status bar) | 800 | 500 | ↓ 300 |
| LOG_BG (log console background) | 900 | 600 | ↓ 300 |
| LOG_TEXT (log text entries) | 910 | 610 | ↓ 310 |
| COMMAND (command panel) | 999 | 700 | ↓ 299 |

**Fix**: Adjusted depth values downward so HUD elements don't obscure game world content from other scenes (StreetScene, TerminalScene, etc.).

### 2. Log Console Entry Positioning (HudScene.ts)

The `addLogEntry` method was calculating y-position dynamically using `this.scale.height - 120 + 8 + this.logEntries.length * 14`, which caused entries to shift downward with each new entry, potentially extending beyond the log console background or overlapping game content.

**Fix**: 
- Pre-calculate `entryY = this.scale.height - 120 + 8` (fixed position at the top of the log background)
- All entries now position relative to this fixed starting point
- After adding entries, reposition all existing entries to maintain correct order
- Cap at 12 entries (unchanged)

### 3. CSS/Layout Fixes (index.html)

The game container layout had issues that could allow browser UI to intrude:

**Changes**:
- `body { overflow-y: auto; → overflow: hidden }` - Prevent vertical scrolling that could expose browser chrome
- `.game-container-wrapper { padding: 16px; → padding: 0; }` + `position: relative;` - Tighten layout, ensure canvas is properly contained
- `#game-container { → display: block; }` - Ensure proper CSS display behavior

### 4. Scene Transition Management

The HUD scene is always active in the scene list. Depth adjustments ensure its elements don't visually conflict with other scenes' content during transitions.

---

## Verification

- **Build**: `pnpm build` ✓ (succeeds)
- **Lint**: No errors in modified files (HudScene.ts, index.html) ✓
- **Tests**: 58 passed, 4 pre-existing failures unrelated to changes ✓

## Files Modified

1. `src/phaser/scenes/HudScene.ts` - Depth adjustments, log entry positioning
2. `index.html` - CSS/layout fixes for proper canvas coverage

## Expected Result

- Game screen (960x540) fully visible without HUD elements covering game content
- Status bar at top remains visible showing resources
- Log console at bottom shows entries within bounds
- All scenes (Street, Shop, Terminal) display correctly beneath/around HUD