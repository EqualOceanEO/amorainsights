"""Update presentation.xml, presentation.xml.rels, Content_Types.xml for 5 new slides."""
import re, os

BASE = r"C:\Users\51229\WorkBuddy\Claw\unpacked_pptx"

# ── 1. presentation.xml ─────────────────────────────────────────────────────
# Insert 5 new sldId entries AFTER rId9 (slide8) in the sldIdLst
with open(os.path.join(BASE,"ppt","presentation.xml"), encoding="utf-8") as f:
    pres = f.read()

# Find the sldId entry for rId9 (slide8)
# Pattern: <p:sldId id="263" r:id="rId9"/>
target = '<p:sldId id="263" r:id="rId9"/>'
# New entries to insert after it
new_ids = ""
for i, (sid, rid) in enumerate([(278,"rId24"),(279,"rId25"),(280,"rId26"),(281,"rId27"),(282,"rId28")]):
    new_ids += f'<p:sldId id="{sid}" r:id="{rid}"/>'
pres_new = pres.replace(target, target + new_ids)
print(f"presentation.xml: inserted {len(new_ids)//40} new sldId entries")
with open(os.path.join(BASE,"ppt","presentation.xml"), "w", encoding="utf-8") as f:
    f.write(pres_new)

# ── 2. presentation.xml.rels ──────────────────────────────────────────────────
with open(os.path.join(BASE,"ppt","_rels","presentation.xml.rels"), encoding="utf-8") as f:
    rels = f.read()

# Insert new relationships before </Relationships>
new_rels = ""
for i,(rid,fn) in enumerate([("rId24","slide23.xml"),("rId25","slide24.xml"),
                               ("rId26","slide25.xml"),("rId27","slide26.xml"),("rId28","slide27.xml")]):
    new_rels += ('<Relationship Id="%s" Type="http://schemas.openxmlformats.org/officeDocument/'
                  '2006/relationships/slide" Target="slides/%s"/>')%(rid,fn)

rels_new = rels.replace("</Relationships>", new_rels + "</Relationships>")
print(f"presentation.xml.rels: added 5 new relationship entries")
with open(os.path.join(BASE,"ppt","_rels","presentation.xml.rels"), "w", encoding="utf-8") as f:
    f.write(rels_new)

# ── 3. Content_Types.xml ────────────────────────────────────────────────────
with open(os.path.join(BASE,"[Content_Types].xml"), encoding="utf-8") as f:
    ct = f.read()

new_overrides = ""
for n in range(23, 28):
    new_overrides += ('<Override PartName="/ppt/slides/slide%d.xml" '
                       'ContentType="application/vnd.openxmlformats-officedocument.'
                       'presentationml.slide+xml"/>') % n

ct_new = ct.replace("</Types>", new_overrides + "</Types>")
print(f"Content_Types.xml: added 5 new Override entries")
with open(os.path.join(BASE,"[Content_Types].xml"), "w", encoding="utf-8") as f:
    f.write(ct_new)

print("All manifest files updated.")
