"""Standalone chapter splitter for HRI-2026-AMORA-Report-v5.0.html"""
import os

BASE = r"C:\Users\51229\WorkBuddy\Claw"
SRC  = os.path.join(BASE, "HRI-2026-AMORA-Report-v5.0.html")
EN   = os.path.join(BASE, "HRI-2026-AMORA-Report-v5.0-en.html")
DEST = os.path.join(BASE, "public")

# ── v5.0 section boundaries (1-based line numbers, end is exclusive) ────────
SECTIONS = [
    ("advancement", 1418, 1558),
    ("mapping",      1558, 2073),
    ("operations",  2073, 2270),
    ("reach",       2270, 2544),
    ("assets",      2544, 2903),
]

# ── Script JS blocks for each chapter (1-based, end is exclusive) ───────────
SCRIPTS = {
    "mapping":     (2903, 3155),   # componentData + selectComponent + scroll
    "reach":       (3258, 3325),   # marketBarChart + cnUsPieChart
    "assets":      (3156, 3258),   # Chart defaults + radar fns + costPieChart
    "advancement": None,
    "operations":  None,
}

CHAPTER_FILES = {
    "advancement": "hri-report-part-a-advancement-v1.html",
    "mapping":     "hri-report-part-m-mapping-v1.html",
    "operations":  "hri-report-part-o-operations-v1.html",
    "reach":       "hri-report-part-r-reach-v1.html",
    "assets":      "hri-report-part-a2-assets-v1.html",
}

EN_SUFFIX = "-en"

def split_file(src_path, dest_dir, lang_suffix=""):
    with open(src_path, encoding="utf-8") as f:
        all_lines = f.readlines()

    total = len(all_lines)
    print(f"  Read {src_path}  ({total} lines)")

    # Find </style> boundary (CSS ends right before nav HTML)
    css_end_idx = None
    for i, line in enumerate(all_lines):
        if "</style>" in line and i < 1400:
            css_end_idx = i + 1  # include </style> in CSS
            print(f"  CSS ends at line {i+1} (0-idx {css_end_idx-1})")
            break
    if css_end_idx is None:
        raise RuntimeError("Could not find </style> boundary")

    for sec_id, sec_start, sec_end in SECTIONS:
        # Extract section HTML (convert 1-based → 0-based)
        sec_lines = all_lines[sec_start-1 : sec_end-1]

        # Extract JS block (from full file)
        scr = SCRIPTS.get(sec_id)
        if scr:
            js_lines = all_lines[scr[0]-1 : scr[1]-1]
        else:
            js_lines = []

        # Assemble
        page = (
            "<!DOCTYPE html>\n"
            "<html lang=\"zh-CN\">\n"
            "<head>\n"
            "<meta charset=\"UTF-8\" />\n"
            "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n"
            f"<title>AMORA HRI 2026 — {sec_id.capitalize()}</title>\n"
            '<link rel="preconnect" href="https://fonts.googleapis.com" />\n'
            '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />\n'
            '<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>\n'
            "</head>\n"
            "<body>\n"
            + "".join(all_lines[:css_end_idx])        # CSS
            + "".join(sec_lines)                       # Section HTML
            + "<script>\n"
            + "".join(js_lines)                        # JS
            + "\n</script>\n"
            + "</body>\n"
            + "</html>\n"
        )

        fname = CHAPTER_FILES[sec_id]
        if lang_suffix:
            fname = fname.replace(".html", f"{lang_suffix}.html")
        out_path = os.path.join(dest_dir, fname)

        with open(out_path, "w", encoding="utf-8") as f:
            f.write(page)
        print(f"  Wrote {fname}  ({len(page)//1024} KB)")

def main():
    print("=== Splitting Chinese v5.0 ===")
    split_file(SRC, DEST)
    if os.path.exists(EN):
        print("\n=== Splitting English v5.0-en ===")
        split_file(EN, DEST, EN_SUFFIX)
    else:
        print("\n  (English v5.0-en.html not found, skipping)")
    print("\nDone!")

if __name__ == "__main__":
    main()
