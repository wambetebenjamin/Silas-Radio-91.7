#!/usr/bin/env python3
"""
One-time asset generator for Silas Radio 91.7.

Produces two binary assets that are committed to the repository:

  1. PWA icons (public/icons/icon-192.png, icon-512.png, apple-touch-icon.png)
     rendered with the design source's own display face (Rockville Solid.woff,
     converted to TTF in-memory with fontTools) on the brand purple #5c00ce.

  2. The EFFECT-31 stop-motion sprite sheet
     (public/images/stopmotion-vinyl-sprite.png) — 12 frames of 240x200 = 2880x200,
     showing a vinyl record spinning while the needle drops. Stepped at 8fps by
     CSS (see .sr-spritesheet in globals.css), which sits inside the spec's
     8–12fps range.

Run:  python3 scripts/generate-assets.py
Requires: pillow, fonttools (pip install pillow fonttools)
"""

from __future__ import annotations

import math
import pathlib

from PIL import Image, ImageDraw, ImageFont
from fontTools.ttLib import TTFont

ROOT = pathlib.Path(__file__).resolve().parents[1]
FONT_WOFF = ROOT / "public" / "fonts" / "Rockville Solid.woff"
ICON_DIR = ROOT / "public" / "icons"
SPRITE = ROOT / "public" / "images" / "stopmotion-vinyl-sprite.png"

BRAND = (92, 0, 206)          # #5c00ce  ($primary-color)
BRAND_DEEP = (41, 8, 73)      # #290849  (solid header)
NEEDLE_RED = (244, 67, 54)    # #f44336  (source preloader red)


def load_display_font(size: int) -> ImageFont.FreeTypeFont:
    """Use the design source's Rockville Solid face for the wordmark/icons."""
    tmp = ROOT / ".cache" / "Rockville-Solid.ttf"
    tmp.parent.mkdir(exist_ok=True)
    if not tmp.exists():
        font = TTFont(str(FONT_WOFF))
        font.flavor = None
        font.save(str(tmp))
    return ImageFont.truetype(str(tmp), size)


def build_icon(size: int, padding_ratio: float = 0.16) -> Image.Image:
    image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)

    inset = int(size * 0.04)
    radius = int(size * 0.22)
    draw.rounded_rectangle(
        [inset, inset, size - inset, size - inset], radius=radius, fill=BRAND
    )

    # signal rings, echoing the gallery's EFFECT-07 line art
    centre = size / 2
    for index, factor in enumerate((0.40, 0.30)):
        r = size * factor
        draw.arc(
            [centre - r, centre - r, centre + r, centre + r],
            start=-140,
            end=140,
            fill=(255, 255, 255, 90 - index * 25),
            width=max(2, int(size * 0.012)),
        )

    font = load_display_font(int(size * (1 - padding_ratio * 3.4)))
    text = "91.7"
    bbox = draw.textbbox((0, 0), text, font=font)
    draw.text(
        (centre - (bbox[2] - bbox[0]) / 2 - bbox[0], centre - (bbox[3] - bbox[1]) / 2 - bbox[1]),
        text,
        font=font,
        fill=(255, 255, 255, 255),
    )

    # FM tick, bottom-right
    tick = int(size * 0.075)
    draw.ellipse(
        [size - inset - tick * 1.5, size - inset - tick * 1.5, size - inset - tick * 0.2, size - inset - tick * 0.2],
        fill=NEEDLE_RED,
    )
    return image


def build_spritesheet(frames: int = 12, fw: int = 240, fh: int = 200) -> Image.Image:
    sheet = Image.new("RGBA", (fw * frames, fh), (11, 0, 24, 255))

    cx, cy, r = fw / 2, fh / 2, 78

    for index in range(frames):
        frame = Image.new("RGBA", (fw, fh), (0, 0, 0, 0))
        draw = ImageDraw.Draw(frame)

        # deck
        draw.rounded_rectangle([18, 26, fw - 18, fh - 20], radius=10, fill=(27, 18, 48, 255), outline=BRAND, width=2)

        # platter rotation advances every frame (stop-motion, not smooth motion)
        angle = (index / frames) * 2 * math.pi * 0.75

        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(13, 13, 13, 255), outline=(90, 80, 110, 255), width=2)
        # grooves
        for g in range(3, 7):
            gr = r * g / 8
            draw.ellipse([cx - gr, cy - gr, cx + gr, cy + gr], outline=(34, 34, 38, 255), width=1)

        # label with a rotation marker so the spin reads clearly
        lr = r * 0.34
        draw.ellipse([cx - lr, cy - lr, cx + lr, cy + lr], fill=BRAND)
        mx = cx + math.cos(angle) * (lr * 0.7)
        my = cy + math.sin(angle) * (lr * 0.7)
        draw.line([cx, cy, mx, my], fill=(255, 255, 255, 255), width=3)
        draw.ellipse([cx - 4, cy - 4, cx + 4, cy + 4], fill=(255, 255, 255, 255))

        # tonearm: the needle drops across the first 6 frames then rides the groove
        drop = min(1.0, index / 6)
        pivot = (fw - 42, 40)
        needle_x = 150 + drop * 26
        needle_y = 74 + drop * 40
        draw.line([pivot, (needle_x, needle_y)], fill=(200, 200, 210, 255), width=4)
        draw.line(
            [(needle_x, needle_y), (needle_x + 6, needle_y + 16)],
            fill=NEEDLE_RED,
            width=3,
        )

        # frame counter ticks (helps verify frames when inspecting the sheet)
        for t in range(frames):
            colour = (255, 255, 255, 90) if t == index else (255, 255, 255, 28)
            draw.rectangle([24 + t * 14, fh - 16, 24 + t * 14 + 9, fh - 12], fill=colour)

        sheet.paste(frame, (index * fw, 0), frame)

    return sheet


def main() -> None:
    ICON_DIR.mkdir(parents=True, exist_ok=True)
    build_icon(192).save(ICON_DIR / "icon-192.png")
    build_icon(512).save(ICON_DIR / "icon-512.png")
    build_icon(180).save(ICON_DIR / "apple-touch-icon.png")
    build_icon(32).save(ICON_DIR / "favicon-32.png")
    print("icons written to", ICON_DIR)

    SPRITE.parent.mkdir(parents=True, exist_ok=True)
    sheet = build_spritesheet()
    sheet.save(SPRITE)
    print(f"sprite sheet written: {SPRITE} ({sheet.width}x{sheet.height}, 12 frames of 240x200)")


if __name__ == "__main__":
    main()
