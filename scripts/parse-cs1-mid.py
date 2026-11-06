import json

path = r"C:\Users\Kuki\.cursor\browser-logs\cdp-response-Runtime.evaluate-2026-11-01T10-48-21-519Z.json"
with open(path, encoding="utf-8") as f:
    data = json.load(f)
items = data["result"]["value"]["items"]

print("=== y 6400..9400 ALL (w>=100 or img) ===")
for it in items:
    if 6400 <= it["y"] <= 9400:
        if it["tag"] == "img" and it["w"] < 60:
            continue
        if it["tag"] != "img" and it["w"] < 40:
            continue
        print(
            f"{it['y']:5d} {it['tag']:3s} x{it['x']:<4d} {it['w']:4d}x{it['h']:<4d} "
            f"fs={it.get('fs','')} {it['text'][:140]}"
        )
