"""Capture Framer feature stages via CDP screenshots cropped with Pillow."""
import base64
import json
import subprocess
import sys
from pathlib import Path

# This script expects pre-saved full-page or viewport PNGs named by the agent.
# Prefer: agent saves viewport captures; this crops by known coords relative to scroll.

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "case-study-1"


def crop_save(src: Path, box: tuple[int, int, int, int], dest: Path, max_w: int = 1600):
    im = Image.open(src).convert("RGB")
    cropped = im.crop(box)
    if cropped.width > max_w:
        ratio = max_w / cropped.width
        cropped = cropped.resize(
            (max_w, int(cropped.height * ratio)), Image.Resampling.LANCZOS
        )
    dest.parent.mkdir(parents=True, exist_ok=True)
    cropped.save(dest, optimize=True, quality=88)
    print(f"saved {dest.name} {cropped.size} {dest.stat().st_size}")


if __name__ == "__main__":
    print("helper ready", OUT)
