"""Build 5 chapter HTML files from HRI-2026-AMORA-Report-v5.0.html"""
import os

BASE = r"C:\Users\51229\WorkBuddy\Claw"
SRC  = os.path.join(BASE, "HRI-2026-AMORA-Report-v5.0.html")
DEST = os.path.join(BASE, "public")

SECTIONS = {
    "advancement": (1418, 1558),
    "mapping":     (1558, 2073),
    "operations":  (2073, 2270),
    "reach":       (2270, 2544),
    "assets":      (2544, 2903),
}

def idx(n): return n - 1

def main():
    with open(SRC, encoding="utf-8") as f:
        all_lines = f.readlines()

    css = "".join(all_lines[idx(1):idx(1367+1)])
    css = css.replace("</style>\n", "")

    js_mapping = "".join(all_lines[idx(2951):idx(3155)])
    js_reach    = "".join(all_lines[idx(3156):idx(3325)])
    js_assets   = "".join(all_lines[idx(2951):idx(3258)])

    fname_map = {
        "advancement": "hri-report-part-a-advancement-v1.html",
        "mapping":     "hri-report-part-m-mapping-v1.html",
        "operations":  "hri-report-part-o-operations-v1.html",
        "reach":       "hri-report-part-r-reach-v1.html",
        "assets":      "hri-report-part-a2-assets-v1.html",
    }

    for sec_id, (start, end) in SECTIONS.items():
        ch_html = "".join(all_lines[idx(start):idx(end)])
        js = {"mapping": js_mapping, "reach": js_reach, "assets": js_assets}.get(sec_id, "")

        page = (
            "<!DOCTYPE html>\n"
            "<html lang=\"zh-CN\">\n"
            "<head>\n"
            "<meta charset=\"UTF-8\">\n"
            "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n"
            f"<title>AMORA HRI 2026 - {sec_id.capitalize()}</title>\n"
            '<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>\n'
            "<style>\n"
            + css
            + "\n</style>\n"
            + js
            + "\n</head>\n"
            "<body>\n"
            + ch_html
            + "\n</body>\n"
            "</html>\n"
        )

        out = os.path.join(DEST, fname_map[sec_id])
        with open(out, "w", encoding="utf-8") as f:
            f.write(page)
        print(f"Wrote {fname_map[sec_id]}  ({len(page)//1024} KB)")

    print("Done.")

if __name__ == "__main__":
    main()
