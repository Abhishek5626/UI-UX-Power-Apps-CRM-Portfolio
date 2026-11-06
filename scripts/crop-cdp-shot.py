import base64
import json
import sys
from pathlib import Path

from PIL import Image
from io import BytesIO

log = Path(sys.argv[1])
out = Path(sys.argv[2])
x, y, w, h = map(int, sys.argv[3:7])

data = json.loads(log.read_text(encoding="utf-8"))
b64 = data.get("data") or data.get("result", {}).get("data")
if not b64:
    raise SystemExit(f"no image data in {log}")
im = Image.open(BytesIO(base64.b64decode(b64))).convert("RGB")
print("shot", im.size)
cropped = im.crop((x, y, x + w, y + h))
# keep full res for quality but cap width ~1400
if cropped.width > 1400:
    ratio = 1400 / cropped.width
    cropped = cropped.resize(
        (1400, int(cropped.height * ratio)), Image.Resampling.LANCZOS
    )
out.parent.mkdir(parents=True, exist_ok=True)
cropped.save(out, optimize=True, quality=90)
print("saved", out, cropped.size, out.stat().st_size)
