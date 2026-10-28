#!/usr/bin/env python3
"""AI生成原画(JPG)からゲーム用アセット(PNG)を生成する。

- マゼンタ背景を透過化
- スプライト: 32x48 に最近傍縮小 + 16色減色
- 立ち絵: 上半身をクロップして 128x160 に縮小 + 16色減色
- 背景: 320x180 に縮小 + 16色減色
使用法: python3 scripts/process-assets.py
"""
from pathlib import Path
from PIL import Image

SRC = Path("assets-src/generated")
DST = Path("public/assets")

CHAR_IDS = {
    "篠宮 涼": "ryo",
    "郷田 権造": "goda",
    "郷田 航": "wataru",
    "松谷 静江": "matsutani",
    "榎本 千夏": "chinatsu",
    "岡田 修": "okada",
    "辰巳 徳造": "tatsumi",
    "丸福 健太": "kenta",
}
BG_IDS = {
    "中央通り・中景": "bg_arcade_center_mid",
    "中央通り・遠景": "bg_arcade_center_far",
    "西口・中景": "bg_arcade_west_mid",
    "東口・中景": "bg_arcade_east_mid",
    "組合事務所": "bg_shotengai_office",
}

def remove_bg(img: Image.Image, tol: int = 40) -> Image.Image:
    """四隅の色をキーに背景を透過する（ImageChops で高速処理）。"""
    from PIL import ImageChops
    rgb = img.convert("RGB")
    w, h = rgb.size
    r, g, b = rgb.getpixel((2, 2))
    bg = Image.new("RGB", rgb.size, (r, g, b))
    diff = ImageChops.difference(rgb, bg)
    # 各チャンネルの差が tol を超えたら前景
    r_d, g_d, b_d = diff.split()
    mask = Image.eval(
        ImageChops.add(ImageChops.add(r_d, g_d), b_d),
        lambda v: 255 if v > tol * 2 else 0,
    )
    rgb.putalpha(mask)
    return rgb

def trim(img: Image.Image) -> Image.Image:
    bbox = img.getbbox()
    return img.crop(bbox) if bbox else img

def quant16(img: Image.Image) -> Image.Image:
    """16色へ減色（RGBAはアルファを保ち、透明画素のRGBを黒で埋める）。"""
    if img.mode == "RGBA":
        alpha = img.getchannel("A")
        q = img.convert("RGB").quantize(
            colors=16, method=Image.Quantize.MEDIANCUT,
            dither=Image.Dither.FLOYDSTEINBERG,
        ).convert("RGB")
        black = Image.new("RGB", img.size, (0, 0, 0))
        out = Image.composite(q, black, alpha)
        out.putalpha(alpha)
        return out
    return img.quantize(
        colors=16, method=Image.Quantize.MEDIANCUT,
        dither=Image.Dither.FLOYDSTEINBERG,
    )

def to_sprite(img: Image.Image) -> Image.Image:
    """32x48 のキャンバスに全身を収める。"""
    w, h = img.size
    scale = min(32 / w, 48 / h)
    nw, nh = max(1, round(w * scale)), max(1, round(h * scale))
    body = img.resize((nw, nh), Image.NEAREST)
    canvas = Image.new("RGBA", (32, 48), (0, 0, 0, 0))
    canvas.paste(body, ((32 - nw) // 2, (48 - nh) // 2))
    return quant16(canvas)

def to_portrait(img: Image.Image) -> Image.Image:
    """128x160 (4:5) に上半身をクロップ。頭上に余白を残す。"""
    w, h = img.size
    cw = min(w, int(h * 4 / 5))
    cx = (w - cw) // 2
    ch = int(cw * 5 / 4)
    top = max(0, int(h * 0.02))
    crop = img.crop((cx, top, cx + cw, min(h, top + ch)))
    return quant16(crop.resize((128, 160), Image.NEAREST))

def content_bbox(img: Image.Image, tol: int = 40):
    """マゼンタ余白を除いた内容領域のbboxを返す。"""
    from PIL import ImageChops
    rgb = img.convert("RGB")
    r, g, b = rgb.getpixel((2, 2))
    bg = Image.new("RGB", rgb.size, (r, g, b))
    diff = ImageChops.difference(rgb, bg)
    r_d, g_d, b_d = diff.split()
    mask = Image.eval(
        ImageChops.add(ImageChops.add(r_d, g_d), b_d),
        lambda v: 255 if v > tol * 2 else 0,
    )
    return mask.getbbox()


def cover_resize(img: Image.Image, size):
    """アスペクト比を保って中央 cover クロップし、指定サイズへ縮小する。"""
    tw, th = size
    w, h = img.size
    scale = max(tw / w, th / h)
    nw, nh = round(w * scale), round(h * scale)
    img = img.resize((nw, nh), Image.LANCZOS)
    left = (nw - tw) // 2
    top = (nh - th) // 2
    return img.crop((left, top, left + tw, top + th))


def main() -> None:
    made = []
    # キャラクター: スプライト + 立ち絵
    for jp, cid in CHAR_IDS.items():
        for path in sorted((SRC / "characters").glob(f"{jp}*.jpg")):
            img = remove_bg(Image.open(path))
            body = trim(img)
            suffix = "down" if "伏せ" in path.stem else "normal"
            sprite = to_sprite(body)
            out = DST / "characters" / f"char_{cid}.png"
            if suffix == "down":
                out = DST / "characters" / f"char_{cid}_down.png"
            sprite.save(out)
            made.append(str(out))
            if suffix == "normal":
                portrait = to_portrait(body)
                pout = DST / "portraits" / f"face_{cid}_normal.png"
                portrait.save(pout)
                made.append(str(pout))
            else:
                portrait = to_portrait(body)
                pout = DST / "portraits" / f"face_{cid}_down.png"
                portrait.save(pout)
                made.append(str(pout))
    # 背景
    for jp, bid in BG_IDS.items():
        path = SRC / "backgrounds" / f"{jp}.jpg"
        if not path.exists():
            continue
        img = Image.open(path).convert("RGB")
        box = content_bbox(img)
        if box:
            img = img.crop(box)
        img = cover_resize(img, (320, 180))
        quant16(img).save(DST / "backgrounds" / f"{bid}.png")
        made.append(str(DST / "backgrounds" / f"{bid}.png"))
    # UI
    ui_raw = SRC / "ui" / "UI枠.jpg"
    if ui_raw.exists():
        img = Image.open(ui_raw).convert("RGB")
        img = img.resize((img.width // 4, img.height // 4), Image.NEAREST)
        quant16(img).save(DST / "ui" / "ui_frame.png")
        made.append(str(DST / "ui" / "ui_frame.png"))
    print(f"{len(made)} 件のアセットを生成:")
    for m in made:
        print(" ", m)

if __name__ == "__main__":
    main()
