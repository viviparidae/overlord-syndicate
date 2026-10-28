#!/usr/bin/env python3
"""PixelMplus12 などのドット風TTFを BMFont (.fnt + PNG) に変換する。

- 12px で描画し、2値化してドット感を保つ
- 文字集合は docs/ の日本語テキスト + ASCII + かな + 全角記号
- 出力: public/assets/fonts/{name}.fnt / {name}.png
使用法: python3 scripts/generate-bitmap-font.py
"""
import argparse
import glob
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

FONT = Path("assets-src/fonts/PixelMplus12-Regular.ttf")
OUT_DIR = Path("public/assets/fonts")
NAME = "pixelmplus12"
SIZE = 12
PAD = 1
COLS = 48


def collect_chars() -> list[str]:
    chars: set[str] = set()
    for cp in range(0x20, 0x7F):
        chars.add(chr(cp))
    for cp in range(0x3000, 0x3100):
        chars.add(chr(cp))
    for cp in range(0xFF01, 0xFF5F):
        chars.add(chr(cp))
    for ch in "◀▶◁▷○×≡▼●△":
        chars.add(ch)
    sources = glob.glob("docs/**/*.md", recursive=True)
    sources += [
        "src/localization/ja.json",
        "src/localization/en.json",
    ]
    sources += glob.glob("src/data/**/*.ts", recursive=True)
    for path in sources:
        try:
            text = Path(path).read_text(encoding="utf-8")
        except OSError:
            continue
        for ch in text:
            if "\u3000" <= ch <= "\u9fff" or ch in "…—–‘’“”":
                chars.add(ch)
    return sorted(chars)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--font", default=str(FONT))
    ap.add_argument("--size", type=int, default=SIZE)
    ap.add_argument("--out-dir", default=str(OUT_DIR))
    ap.add_argument("--name", default=NAME)
    args = ap.parse_args()

    font = ImageFont.truetype(args.font, args.size)
    ascent, descent = font.getmetrics()
    cell_h = ascent + descent

    charset = collect_chars()
    glyphs = []
    for ch in charset:
        advance = max(1, round(font.getlength(ch)))
        img = Image.new("L", (advance, cell_h), 0)
        ImageDraw.Draw(img).text((0, 0), ch, font=font, fill=255, anchor="la")
        img = img.point(lambda v: 255 if v >= 128 else 0, mode="1")
        glyphs.append((ch, advance, img))

    # シェルフパッカー
    rows = []
    x = 0
    y = 0
    row_h = 0
    placed = []
    atlas_w = args.size * (COLS + 2)
    for ch, advance, img in glyphs:
        w = advance + PAD
        h = cell_h + PAD
        if x + w > atlas_w:
            x = 0
            y += row_h
            row_h = 0
        placed.append((ch, advance, x, y, img))
        x += w
        row_h = max(row_h, h)
    y += row_h

    # 2の累乗に切り上げ
    atlas_h = 1
    while atlas_h < y:
        atlas_h *= 2

    atlas = Image.new("RGBA", (atlas_w, atlas_h), (0, 0, 0, 0))
    for ch, advance, gx, gy, img in placed:
        atlas.paste((255, 255, 255, 255), (gx, gy), img)

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    png_path = out_dir / f"{args.name}.png"
    atlas.save(png_path)

    lines = [
        f'info face="{args.name}" size={args.size} bold=0 italic=0 charset="" '
        f"unicode=1 stretchH=100 smooth=0 aa=1 padding=0,0,0,0 spacing=1,1 outline=0",
        f"common lineHeight={cell_h} base={ascent} scaleW={atlas_w} scaleH={atlas_h} "
        f'pages=1 packed=0 alphaChnl=0 redChnl=0 greenChnl=0 blueChnl=0',
        f'page id=0 file="{args.name}.png"',
        f"chars count={len(placed)}",
    ]
    for ch, advance, gx, gy, _ in placed:
        lines.append(
            f"char id={ord(ch)} x={gx} y={gy} width={advance} height={cell_h} "
            f"xoffset=0 yoffset=0 xadvance={advance} page=0 chnl=15"
        )
    lines.append("kernings count=0")
    (out_dir / f"{args.name}.fnt").write_text("\n".join(lines) + "\n", encoding="utf-8")

    xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        "<font>",
        f'  <info face="{args.name}" size="{args.size}" bold="0" italic="0" charset="" '
        f'unicode="1" stretchH="100" smooth="0" aa="1" padding="0,0,0,0" spacing="1,1" outline="0"/>',
        f'  <common lineHeight="{cell_h}" base="{ascent}" scaleW="{atlas_w}" scaleH="{atlas_h}" '
        'pages="1" packed="0" alphaChnl="0" redChnl="0" greenChnl="0" blueChnl="0"/>',
        "  <pages>",
        f'    <page id="0" file="{args.name}.png"/>',
        "  </pages>",
        f'  <chars count="{len(placed)}">',
    ]
    for ch, advance, gx, gy, _ in placed:
        xml.append(
            f'    <char id="{ord(ch)}" x="{gx}" y="{gy}" width="{advance}" height="{cell_h}" '
            f'xoffset="0" yoffset="0" xadvance="{advance}" page="0" chnl="15"/>'
        )
    xml += ['  </chars>', '  <kernings count="0"/>', "</font>"]
    (out_dir / f"{args.name}.xml").write_text("\n".join(xml) + "\n", encoding="utf-8")

    print(f"glyphs={len(placed)} atlas={atlas_w}x{atlas_h}")
    print(f"out={png_path} / {out_dir / (args.name + '.fnt')} / {out_dir / (args.name + '.xml')}")


if __name__ == "__main__":
    main()
