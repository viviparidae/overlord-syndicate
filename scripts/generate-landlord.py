#!/usr/bin/env python3
"""Generate landlord character atlas sheet (Char04)."""
import os
from PIL import Image, ImageDraw

OUT_DIR = "/home/tone/git/overlord-syndicate/public/assets/characters/charWorkshopIDemo"
CELL_W, CELL_H = 72, 128
COLS, ROWS = 4, 3
SHEET_W, SHEET_H = 288, 384

def draw_cell(draw, cx, cy, frame, char_type, direction):
    skin = (230, 200, 175)
    hair_dark = (45, 30, 25)
    hair_light = (120, 90, 60)
    suit_gray = (70, 75, 85)
    suit_black = (30, 30, 35)
    # Landlord: black suit, white shirt, stern look
    shirt_c, hair_c, pants_c = (230, 230, 240), hair_dark, suit_black
    hair_style = "bald"

    x0, y0 = cx, cy
    base_x = x0 + 24
    foot_y = y0 + 110
    dx = (frame - 1) * 4
    dy = (frame - 1) * 2

    # Legs
    leg_l_x = base_x - 6 + dx
    leg_r_x = base_x + 6 + dx
    draw.line([(leg_l_x, foot_y-18), (leg_l_x, foot_y)], fill=pants_c, width=3)
    draw.line([(leg_r_x, foot_y-20), (leg_r_x, foot_y)], fill=pants_c, width=3)

    # Torso (suit jacket, larger)
    torso_y = foot_y - 30
    draw.ellipse([(base_x-12, torso_y-14), (base_x+12, torso_y+10)], fill=suit_gray)

    # Head
    head_y = torso_y - 16
    head_r = 9
    draw.ellipse([(base_x-head_r, head_y-head_r-2), (base_x+head_r, head_y+head_r+2)], fill=skin)

    # Bald with slight hair line
    draw.ellipse([(base_x-9, head_y-10), (base_x+9, head_y-5)], fill=hair_dark)

    # Stern eyes
    eye_y = head_y - 1
    draw.ellipse([(base_x-4, eye_y), (base_x-2, eye_y+2)], fill=(30,30,30))
    draw.ellipse([(base_x+2, eye_y), (base_x+4, eye_y+2)], fill=(30,30,30))

    # Stern mouth
    draw.line([(base_x-2, head_y+4), (base_x+2, head_y+4)], fill=(90,60,60), width=1)

    # Shoes
    draw.ellipse([(base_x-7, foot_y-2), (base_x-3, foot_y+3)], fill=(30,30,30))
    draw.ellipse([(base_x+3, foot_y-2), (base_x+7, foot_y+3)], fill=(30,30,30))


def generate_sheet(char_type="landlord"):
    img = Image.new("RGBA", (SHEET_W, SHEET_H), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    for row in range(ROWS):
        for col in range(COLS):
            cx = col * CELL_W
            cy = row * CELL_H
            frame = row
            direction = ["down", "left", "right", "up"][col]
            draw_cell(draw, cx, cy, frame, char_type, direction)
    png_path = os.path.join(OUT_DIR, "20250303demoChar04.png")
    img.save(png_path)
    print(f"Created: {png_path}")

if __name__ == "__main__":
    generate_sheet("landlord")
