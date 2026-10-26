#!/usr/bin/env python3
"""Generate realistic-proportion pixel art character atlas sheets (288x384, 4x3 cells of 72x128)."""
import os
from PIL import Image, ImageDraw

# Output directory
OUT_DIR = "/home/tone/git/overlord-syndicate/public/assets/characters/charWorkshopIDemo"
os.makedirs(OUT_DIR, exist_ok=True)

# Cell dimensions (same as build-atlas-json.mjs)
CELL_W, CELL_H = 72, 128
COLS, ROWS = 4, 3
SHEET_W = COLS * CELL_W  # 288
SHEET_H = ROWS * CELL_H  # 384

# Direction order: col 0=down, 1=left, 2=right, 3=up; row 0=frame0, 1=frame1, 2=frame2

def draw_cell(draw, cx, cy, frame, char_type, direction):
    """Draw a single 72x64 cell with realistic head/body proportions."""
    # Realistic proportion: head ~18px, body ~24px, legs ~22px (total ~64px)
    # Colors (1990s muted palette)
    skin = (230, 200, 175)
    hair_dark = (45, 30, 25)
    hair_light = (120, 90, 60)
    shirt_blue = (60, 100, 160)
    shirt_red = (180, 60, 50)
    pants_dark = (40, 45, 70)
    pants_gray = (100, 105, 110)
    suit_gray = (70, 75, 85)

    x0, y0 = cx, cy

    # Base body position (centered horizontally)
    base_x = x0 + 24  # body center around x=36
    foot_y = y0 + 110  # feet near bottom of 128px cell

    # Character-specific colors/styles
    if char_type == "player":
        shirt_c, hair_c, pants_c = shirt_blue, hair_dark, pants_dark
        hair_style = "short"
    elif char_type == "child":
        shirt_c, hair_c, pants_c = shirt_red, hair_light, pants_dark
        hair_style = "messy"
    elif char_type == "housewife":
        shirt_c, hair_c, pants_c = (160, 120, 90), hair_dark, (90, 60, 50)
        hair_style = "long"
    elif char_type == "salaryman":
        shirt_c, hair_c, pants_c = (220, 220, 230), hair_dark, suit_gray
        hair_style = "neat"
    else:
        shirt_c, hair_c, pants_c = shirt_blue, hair_dark, pants_dark
        hair_style = "short"

    # Animation frame offset for walking (subtle shift)
    dx = (frame - 1) * 4  # frame 1 shifts right, frame 0 neutral, frame 2 shifts left
    dy = (frame - 1) * 2

    # Legs (simple lines, realistic length ~22px)
    leg_l_x = base_x - 6 + dx
    leg_r_x = base_x + 6 + dx
    # Draw legs (vertical lines with slight angle for frame variation)
    draw.line([(leg_l_x, foot_y-18), (leg_l_x, foot_y)], fill=pants_c, width=3)
    draw.line([(leg_r_x, foot_y-20), (leg_r_x, foot_y)], fill=pants_c, width=3)

    # Torso (realistic, smaller head ratio: torso is taller)
    torso_y = foot_y - 28
    # Torso rectangle
    draw.ellipse([(base_x-12, torso_y-12), (base_x+12, torso_y+10)], fill=shirt_c)

    # Head (smaller relative to body: ~18px tall, positioned high)
    head_y = torso_y - 14
    head_r = 9
    draw.ellipse([(base_x-head_r, head_y-head_r-2), (base_x+head_r, head_y+head_r+2)], fill=skin)

    # Hair (on top and sides of head, realistic proportion)
    if hair_style == "short":
        draw.ellipse([(base_x-10, head_y-10), (base_x+10, head_y-6)], fill=hair_c)
    elif hair_style == "messy":
        draw.ellipse([(base_x-11, head_y-10), (base_x+11, head_y-4)], fill=hair_c)
        draw.ellipse([(base_x-6, head_y-12), (base_x+6, head_y-2)], fill=hair_c)
    elif hair_style == "long":
        # Long hair falling on sides
        draw.ellipse([(base_x-9, head_y-9), (base_x+9, head_y-5)], fill=hair_c)
        draw.ellipse([(base_x-12, head_y-2), (base_x+12, head_y+14)], fill=hair_c)
    elif hair_style == "neat":
        draw.ellipse([(base_x-9, head_y-10), (base_x+9, head_y-4)], fill=hair_c)

    # Eyes (tiny, simple dots)
    eye_y = head_y - 1
    draw.ellipse([(base_x-4, eye_y), (base_x-2, eye_y+2)], fill=(30,30,30))
    draw.ellipse([(base_x+2, eye_y), (base_x+4, eye_y+2)], fill=(30,30,30))

    # Minimal mouth (optional, very small for pixel art)
    draw.line([(base_x-2, head_y+4), (base_x+2, head_y+4)], fill=(180, 140, 120), width=1)

    # Shoes (tiny dots at feet)
    shoe_y = foot_y - 2
    draw.ellipse([(base_x-7, shoe_y), (base_x-3, shoe_y+3)], fill=(30,30,30))
    draw.ellipse([(base_x+3, shoe_y), (base_x+7, shoe_y+3)], fill=(30,30,30))


def generate_sheet(path, char_type):
    img = Image.new("RGBA", (SHEET_W, SHEET_H), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)

    # Draw a simple ground line at bottom of each cell (optional, for reference)
    for row in range(ROWS):
        for col in range(COLS):
            cx = col * CELL_W
            cy = row * CELL_H
            # Frame number (0,1,2)
            frame = row  # row 0=frame 0, 1=frame 1, 2=frame 2
            # Direction from column
            direction = ["down", "left", "right", "up"][col]
            draw_cell(draw, cx, cy, frame, char_type, direction)

    img.save(path)
    print(f"Created: {path}")


if __name__ == "__main__":
    chars = {
        "20250303demoChar00": "player",
        "20250303demoChar01": "child",
        "20250303demoChar02": "housewife",
        "20250303demoChar03": "salaryman",
    }
    for filename, char_type in chars.items():
        generate_sheet(os.path.join(OUT_DIR, f"{filename}.png"), char_type)
