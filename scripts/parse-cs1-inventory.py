import json
import re

path = r"C:\Users\Kuki\.cursor\browser-logs\cdp-response-Runtime.evaluate-2026-11-01T10-48-21-519Z.json"
with open(path, encoding="utf-8") as f:
    data = json.load(f)
val = data["result"]["value"]
print("totalH", val["totalH"], "count", val["count"])

keys = re.compile(
    r"Live Figma|Cohort|Career|RoadMap|Roadmap|Core Coding|Learning Hub|Features|Funnel|"
    r"Course Modules|Proof|Results|Request|Strategy|Product|Thinking|Mapping|Problem|"
    r"Why I|PAUx|Phase|Mentorship|SHIPPED|Be the Gen|Students|Placement|HTML|"
    r"Personal Learning|Workspace|calendar|dashboard",
    re.I,
)

print("\n=== KEY ITEMS ===")
for it in val["items"]:
    t = it["text"]
    if it["tag"] in ("h1", "h2", "h3") or keys.search(t) or t.startswith("[IMG"):
        if t.startswith("[IMG") and it["w"] < 80:
            continue
        print(f"{it['y']:5d} {it['tag']:3s} {it['x']:4d} {it['w']:4d}x{it['h']:<4d} {t[:120]}")

print("\n=== ALL H2/H3 ===")
for it in val["items"]:
    if it["tag"] in ("h1", "h2", "h3"):
        print(f"{it['y']:5d} {it['tag']} {t if False else it['text'][:120]}")
