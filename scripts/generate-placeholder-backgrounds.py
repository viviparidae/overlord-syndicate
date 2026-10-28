#!/usr/bin/env python3
"""横スクロール調査パート用の仮背景をコードで描く。

仕様 (docs/03_production/03_art-animation/ai-prompt-book.md §8.3):
- 真横からの視点。消失点のない奥行き禁止
- 地面ラインは高さ75%。下1/4は歩行帯
- 店先は等間隔で連続
- 320x180 で使用するため、640x360 (= 2倍) で描く
使用法: python3 scripts/generate-placeholder-backgrounds.py
"""
from pathlib import Path

from PIL import Image, ImageDraw

W, H = 640, 360
GROUND_Y = 270  # 高さ75%: 地面ライン
OUT = Path("public/assets/backgrounds")

# 共通パレット
SKY = [(20, 20, 30), (26, 26, 38), (32, 32, 46)]
ARC_ROOF = (58, 52, 44)
ARC_ROOF_LIGHT = (232, 217, 160)
WALL_SHUTTER = (52, 52, 62)
WALL_SHUTTER_D = (38, 38, 48)
SHOP_WALL = (66, 58, 64)
SHOP_WALL_D = (48, 42, 48)
GROUND = (40, 38, 46)
GROUND_TILE = (46, 44, 52)
GLASS = (36, 40, 56)
GLASS_LIGHT = (52, 58, 76)
NEON_OFF = (30, 30, 38)
POLE = (28, 28, 34)


def dither_rect(d, x0, y0, x1, y1, c1, c2, step=4):
    """2色を縦方向のディザで塗る（滑らかなグラデ禁止の代替）。"""
    d.rectangle((x0, y0, x1, y1), fill=c1)
    for i, yy in enumerate(range(y0, y1 + 1, step)):
        c = c2 if (i % 2 == 0) else c1
        d.rectangle((x0, yy, x1, min(yy + step // 2, y1)), fill=c)


def shop_block(d, x0, y0, y1, width, body, shutter, seed=0):
    """1店分: 看板帯 + シャッター + 引き戸風の枠。等間隔。"""
    x1 = x0 + width
    # 壁
    d.rectangle((x0, y0, x1, y1), fill=body)
    # 看板帯（上端）
    d.rectangle((x0, y0, x1, y0 + 18), fill=(40, 38, 48))
    d.rectangle((x0 + 2, y0 + 4, x1 - 2, y0 + 14), fill=(24, 24, 30))
    # シャッター
    sx0, sx1 = x0 + 6, x1 - 6
    d.rectangle((sx0, y0 + 22, sx1, y1 - 6), fill=shutter)
    for i, xx in enumerate(range(sx0, sx1, 8)):
        c = (46, 46, 56) if i % 2 == 0 else (36, 36, 44)
        d.rectangle((xx, y0 + 22, xx + 4, y1 - 6), fill=c)
    # 柱
    d.rectangle((x0, y0, x0 + 5, y1), fill=POLE)
    d.rectangle((x1 - 5, y0, x1, y1), fill=POLE)


def window_panel(d, x0, y0, x1, y1, lit=False):
    d.rectangle((x0, y0, x1, y1), fill=GLASS if not lit else GLASS_LIGHT)
    d.rectangle((x0, y0, x1, y0 + 2), fill=(12, 12, 16))
    d.line((x0 + (x1 - x0) // 2, y0, x0 + (x1 - x0) // 2, y1), fill=(12, 12, 16))


def vending(d, x, y, h):
    d.rectangle((x, y, x + 22, y + h), fill=(40, 52, 60))
    d.rectangle((x + 2, y + 4, x + 20, y + h // 2), fill=(60, 78, 88))
    d.rectangle((x + 2, y + h // 2 + 2, x + 20, y + h - 4), fill=(26, 26, 30))


def board(d, x, y):
    d.rectangle((x, y, x + 30, y + 40), fill=(36, 32, 30))
    d.rectangle((x + 2, y + 2, x + 28, y + 38), fill=(52, 46, 42))
    for yy in range(y + 8, y + 34, 7):
        d.line((x + 5, yy, x + 25, yy), fill=(74, 66, 58))


def booth(d, x, y):
    d.rectangle((x, y, x + 26, y + 56), fill=(34, 44, 52))
    d.rectangle((x + 3, y + 4, x + 23, y + 50), fill=(28, 36, 44))
    d.rectangle((x + 6, y + 8, x + 20, y + 34), fill=(40, 52, 62))


def arcade_roof(d, x0, x1):
    d.rectangle((x0, 0, x1, 34), fill=ARC_ROOF)
    d.rectangle((x0, 30, x1, 34), fill=(20, 20, 26))
    for i, xx in enumerate(range(x0, x1, 40)):
        c = ARC_ROOF_LIGHT if i % 3 == 0 else NEON_OFF
        d.rectangle((xx + 14, 14, xx + 26, 26), fill=c)


def ground(d, x0, x1):
    d.rectangle((x0, GROUND_Y, x1, H), fill=GROUND)
    for xx in range(x0, x1, 32):
        d.rectangle((xx, GROUND_Y, xx + 30, H), fill=GROUND_TILE)
    d.line((x0, GROUND_Y, x1, GROUND_Y), fill=(18, 18, 22))


def base_sky(d):
    d.rectangle((0, 0, W, GROUND_Y), fill=SKY[0])
    d.rectangle((0, 120, W, GROUND_Y), fill=SKY[1])


def west_bg() -> Image.Image:
    img = Image.new("RGB", (W, H), (0, 0, 0))
    d = ImageDraw.Draw(img)
    base_sky(d)
    arcade_roof(d, 0, W)
    d.rectangle((0, 34, W, GROUND_Y), fill=SKY[1])
    shop_block(d, 20, 34, GROUND_Y, 180, SHOP_WALL, WALL_SHUTTER)
    shop_block(d, 240, 34, GROUND_Y, 160, SHOP_WALL_D, WALL_SHUTTER_D)
    shop_block(d, 440, 34, GROUND_Y, 180, SHOP_WALL, WALL_SHUTTER)
    # 篠宮文具店: ガラス戸
    window_panel(d, 30, 92, 100, GROUND_Y - 20)
    window_panel(d, 104, 92, 174, GROUND_Y - 20)
    d.rectangle((20, 30, 200, 42), fill=(72, 60, 48))
    vending(d, 300, GROUND_Y - 76, 74)
    shop_block(d, 400, 34, GROUND_Y, 200, SHOP_WALL, WALL_SHUTTER)
    d.rectangle((470, 120, 540, GROUND_Y - 20), fill=WALL_SHUTTER)
    board(d, 560, GROUND_Y - 58)
    ground(d, 0, W)
    return img


def center_bg() -> Image.Image:
    img = Image.new("RGB", (W, H), (0, 0, 0))
    d = ImageDraw.Draw(img)
    base_sky(d)
    arcade_roof(d, 0, W)
    d.rectangle((0, 34, W, GROUND_Y), fill=SKY[2])
    shop_block(d, 10, 34, GROUND_Y, 200, SHOP_WALL, WALL_SHUTTER)
    shop_block(d, 430, 34, GROUND_Y, 200, SHOP_WALL_D, WALL_SHUTTER_D)
    # 掲示板
    board(d, 240, GROUND_Y - 70)
    d.rectangle((236, GROUND_Y - 76, 276, GROUND_Y - 66), fill=POLE)
    # 公衆電話
    booth(d, 330, GROUND_Y - 88)
    # 組合事務所の入口
    d.rectangle((520, 60, 630, GROUND_Y), fill=(50, 48, 56))
    window_panel(d, 540, 100, 610, GROUND_Y - 30)
    d.rectangle((560, GROUND_Y - 60, 600, GROUND_Y), fill=(36, 32, 34))
    ground(d, 0, W)
    return img


def east_bg() -> Image.Image:
    img = Image.new("RGB", (W, H), (0, 0, 0))
    d = ImageDraw.Draw(img)
    base_sky(d)
    arcade_roof(d, 0, W)
    d.rectangle((0, 34, W, GROUND_Y), fill=SKY[1])
    shop_block(d, 20, 34, GROUND_Y, 180, SHOP_WALL_D, WALL_SHUTTER_D)
    shop_block(d, 430, 34, GROUND_Y, 190, SHOP_WALL, WALL_SHUTTER)
    # 豆腐屋: のれん
    d.rectangle((40, 90, 190, GROUND_Y - 20), fill=WALL_SHUTTER)
    for i, xx in enumerate(range(48, 186, 22)):
        c = (232, 217, 160) if i % 2 == 0 else (196, 178, 128)
        d.rectangle((xx, 92, xx + 12, GROUND_Y - 30), fill=c)
    # 写真館: ショーケース
    window_panel(d, 460, 80, 610, GROUND_Y - 20)
    d.rectangle((500, 130, 570, GROUND_Y - 40), fill=(60, 54, 60))
    # 不動産事務所
    d.rectangle((300, 70, 410, GROUND_Y), fill=(48, 46, 54))
    d.rectangle((315, 110, 395, GROUND_Y - 20), fill=WALL_SHUTTER)
    ground(d, 0, W)
    return img


def office_bg() -> Image.Image:
    img = Image.new("RGB", (W, H), (0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rectangle((0, 0, W, H), fill=(34, 34, 42))
    dither_rect(d, 0, 0, W, H, (34, 34, 42), (28, 28, 34), step=6)
    # 壁のパネル
    for xx in range(0, W, 96):
        d.rectangle((xx, 20, xx + 92, 250), fill=(38, 38, 46))
        d.rectangle((xx + 2, 22, xx + 90, 248), fill=(32, 32, 40))
    # 机
    d.rectangle((120, 250, 360, 286), fill=(58, 44, 36))
    d.rectangle((132, 286, 348, 330), fill=(44, 33, 27))
    # 黒電話
    d.rectangle((260, 226, 330, 250), fill=(20, 20, 24))
    d.rectangle((296, 216, 320, 230), fill=(24, 24, 28))
    # 証明書ふうの額
    d.rectangle((420, 60, 520, 150), fill=(50, 44, 38))
    # 待合椅子
    for i in range(3):
        x = 470 + i * 62
        d.rectangle((x, 256, x + 54, 300), fill=(40, 40, 50))
        d.rectangle((x + 6, 300, x + 12, 322), fill=(30, 30, 36))
        d.rectangle((x + 42, 300, x + 48, 322), fill=(30, 30, 36))
    # 床
    d.rectangle((0, 300, W, H), fill=(44, 42, 50))
    d.line((0, 300, W, 300), fill=(24, 24, 30))
    return img


def far_bg() -> Image.Image:
    img = Image.new("RGB", (W, H), (0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rectangle((0, 0, W, H), fill=(24, 24, 34))
    # 奥の建物（横に並ぶだけ、奥行きなし）
    for i, (x0, hgt) in enumerate([(20, 110), (150, 150), (280, 90), (400, 130), (540, 100)]):
        c = (32, 32, 44) if i % 2 == 0 else (28, 28, 40)
        d.rectangle((x0, GROUND_Y - hgt, x0 + 110, GROUND_Y - 6), fill=c)
        for wx in range(x0 + 10, x0 + 100, 22):
            for wy in range(GROUND_Y - hgt + 14, GROUND_Y - 20, 26):
                lit = (wx * 3 + wy) % 5 == 0
                d.rectangle((wx, wy, wx + 10, wy + 14), fill=(90, 84, 96) if lit else (20, 20, 28))
    d.rectangle((0, GROUND_Y - 6, W, H), fill=(22, 22, 30))
    return img


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    targets = {
        "bg_arcade_west_mid": west_bg(),
        "bg_arcade_west_far": far_bg(),
        "bg_arcade_center_mid": center_bg(),
        "bg_arcade_center_far": far_bg(),
        "bg_arcade_east_mid": east_bg(),
        "bg_arcade_east_far": far_bg(),
        "bg_shotengai_office": office_bg(),
    }
    for name, img in targets.items():
        img.save(OUT / f"{name}.png")
        print("wrote", OUT / f"{name}.png")


if __name__ == "__main__":
    main()
