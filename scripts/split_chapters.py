"""
Split HRI-2026-AMORA-Report-v5.0.html into 5 standalone chapter files.
Each chapter file = shared CSS/styles/nav + its section HTML + its required JS.
"""

import re
import os

BASE = r"C:\Users\51229\WorkBuddy\Claw"
SRC  = os.path.join(BASE, "HRI-2026-AMORA-Report-v5.0.html")
DEST = os.path.join(BASE, "public")

# ── Boundary lines (0-indexed) ─────────────────────────────────────────────
# These are the <section id="xxx"> tag lines (found via grep)
# Format: (section_id, start_line, end_line)   end_line = exclusive
SECTIONS = [
    # id        start(1-based)  end(1-based)
    ("advancement",  1418, 1558),
    ("mapping",      1558, 2073),
    ("operations",  2073, 2270),
    ("reach",       2270, 2544),
    ("assets",      2544, 2903),
]

# ── Script blocks by chapter (line ranges in v5.0, 1-based) ─────────────────
SCRIPTS = {
    "mapping":     (2903, 3155),   # componentData + selectComponent + scroll
    "reach":       (3258, 3325),   # marketBarChart + cnUsPieChart
    "assets":      (3156, 3258),   # Chart.js defaults + radar fns + 4 buildRadar calls + costPieChart
    "advancement": None,
    "operations":  None,
}

# ── Chapter name → public filename ──────────────────────────────────────────
CHAPTER_FILES = {
    "advancement": "hri-report-part-a-advancement-v1.html",
    "mapping":     "hri-report-part-m-mapping-v1.html",
    "operations":  "hri-report-part-o-operations-v1.html",
    "reach":       "hri-report-part-r-reach-v1.html",
    "assets":      "hri-report-part-a2-assets-v1.html",
}

def line_num_to_idx(line_1based):
    return line_1based - 1

def read_all():
    with open(SRC, encoding="utf-8") as f:
        return f.readlines()

def build_chapter(section_id, all_lines, sec_lines, css_end_idx, script_range):
    """
    Build a complete standalone chapter HTML.
    - all_lines:  all lines from the source file (for CSS + JS extraction)
    - sec_lines:  lines belonging to this chapter's <section> only
    - css_end_idx: 0-indexed line BEFORE nav/heros HTML starts (in all_lines)
    - script_range: (start, end) 1-based line numbers for <script> block (in all_lines), or None
    """
    # ── 1. CSS (from full file) ──────────────────────────────────────────────
    css_block = "".join(all_lines[:css_end_idx])

    # ── 2. Chapter section HTML ────────────────────────────────────────────────
    ch_html = "".join(sec_lines)

    # ── 3. JS block (from full file) ──────────────────────────────────────────
    if script_range:
        js_start = line_num_to_idx(script_range[0])
        js_end   = line_num_to_idx(script_range[1])
        js_block = "".join(all_lines[js_start:js_end])
    else:
        js_block = ""

    # ── Assemble ─────────────────────────────────────────────────────────────
    page = (
        "<!DOCTYPE html>\n"
        "<html lang=\"zh-CN\">\n"
        "<head>\n"
        "<meta charset=\"UTF-8\" />\n"
        "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n"
        "<title>AMORA HRI 2026 — " + section_id.capitalize() + "</title>\n"
        '<link rel="preconnect" href="https://fonts.googleapis.com" />\n'
        '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />\n'
        '<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>\n'
        "</head>\n"
        "<body>\n"
        + css_block
        + ch_html
        + '<script>\n'
        + js_block
        + '\n</script>\n'
        + "</body>\n"
        + "</html>\n"
    )
    return page

def main():
    lines = read_all()

    # Find the line where nav/heros HTML starts (right after </style> closing)
    # In v5.0, line ~1299 is the closing of the main CSS </style>
    css_end_idx = None
    for i, line in enumerate(lines):
        if "</style>" in line and i < 1400:  # should be in first 1400 lines
            css_end_idx = i + 1  # include the </style> line
            break

    if css_end_idx is None:
        raise RuntimeError("Could not find </style> boundary — check v5.0 structure")

    print(f"CSS ends at line {css_end_idx+1} (0-idx: {css_end_idx})")

    for sec_id, sec_start, sec_end in SECTIONS:
        # sec_start/sec_end are 1-based; convert to 0-based for slicing
        sec_lines = lines[sec_start-1 : sec_end-1]

        # Find script range for this chapter
        scr = SCRIPTS.get(sec_id)

        fname = CHAPTER_FILES[sec_id]
        out_path = os.path.join(DEST, fname)
        content = build_chapter(sec_id, lines, sec_lines, css_end_idx, scr)

        with open(out_path, "w", encoding="utf-8") as f:
            f.write(content)

        print(f"  Wrote {fname}  ({len(content)//1024} KB)")

    print("\nDone.")

if __name__ == "__main__":
    main()
