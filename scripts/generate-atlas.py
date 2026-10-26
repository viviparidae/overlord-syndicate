#!/usr/bin/env python3
"""Generate Phaser atlas JSON files from character PNG sheets (4x3 grid, 72x128 cells)."""
import os
import json
from PIL import Image

OUT_DIR = "/home/tone/git/overlord-syndicate/public/assets/characters/charWorkshopIDemo"
# Constants (same as build-atlas-json.mjs constants)
CELL_W, CELL_H = 72, 128
COLS, ROWS = 4, 3
SHEET_W, SHEET_H = 288, 384

# Frame name mapping: (col, row) -> name
# col 0 = down, col 1 = left, col 2 = right, col 3 = up
# row 0 = frame 0, row 1 = frame 1, row 2 = frame 2
FRAME_NAMES = [
    ["walk_down_0", "walk_left_0", "walk_right_0", "walk_up_0"],  # row 0
    ["walk_down_1", "walk_left_1", "walk_right_1", "walk_up_1"],  # row 1
    ["walk_down_2", "walk_left_2", "walk_right_2", "walk_up_2"],  # row 2
]

# Characters to process
CHARACTERS = [
    "20250303demoChar00",
    "20250303demoChar01",
    "20250303demoChar02",
    "20250303demoChar03",
    "20250303demoChar04",
]

FRAMES = {}


def generate_atlas(char_sheet_name):
    png_path = os.path.join(OUT_DIR, f"{char_sheet_name}.png")
    if not os.path.exists(png_path):
        print(f"  SKIP: {char_sheet_name}.png not found")
        return

    print(f"  Generating atlas for {char_sheet_name} ...")
    img = Image.open(png_path)
    # Verify size
    if img.width != SHEET_W or img.height != SHEET_H:
        print(f"  ERROR: unexpected size {img.width}x{img.height}, expected {SHEET_W}x{SHEET_H}")
        return

    frames = {}
    for row in range(ROWS):
        for col in range(COLS):
            name = FRAME_NAMES[row][col]
            x = col * CELL_W
            y = row * CELL_H
            # Phaser atlas frame format: { frame: { frame: { x, y, w, h } } }
            frame_entry = {
                "frame": {
                    "x": x,
                    "y": y,
                    "w": CELL_W,
                    "h": CELL_H,
                }
            }
            frames[name] = frame_entry

    atlas = {"frames": frames}
    json_path = os.path.join(OUT_DIR, f"{char_sheet_name}.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(atlas, f, ensure_ascii=False, indent=2, sort_keys=False)
    print(f"  Generated: {json_path}")


def main():
    for sheet in CHARACTERS:
        generate_atlas(sheet)
    print("\nDone generating atlas JSONs")


if __name__ == "__main__":
    main()