"""
Clean v5.0 PRO version:
1. Remove ALL orphaned paywall HTML elements (paywall-*, #upgrade anchor in paywall sections)
2. Strip .paywall-* CSS classes from navigation (keep PRO badges off section tags - already done)
"""
import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

path = 'HRI-2026-AMORA-Report-v5.0.html'
with open(path, 'r', encoding='utf-8') as f:
    html = f.read()

original_len = len(html)

# Remove orphaned paywall box content
# These appear as: <h2 class="paywall-title"> ... </p><p class="paywall-price">...</p></div></div>
# The pattern: from <h2 class="paywall-title"> through the closing </div></div>
pattern_paywall_box = re.compile(
    r'<h2 class="paywall-title">.*?</div>\s*</div>\s*\n',
    re.DOTALL
)
html = pattern_paywall_box.sub('', html)
print(f"After removing paywall box: {len(html)}")

# Also remove any remaining standalone paywall- elements (spans, links, etc)
for cls in ['paywall-feature', 'paywall-price', 'paywall-badge', 'paywall-cta', 'paywall-desc']:
    pattern = re.compile(rf'<[^>]+class="[^"]*{re.escape(cls)}[^"]*"[^>]*>.*?</[^>]+>', re.DOTALL)
    before = len(html)
    html = pattern.sub('', html)
    after = len(html)
    if before != after:
        print(f"Removed {cls}: {before - after} chars")

# Remove any standalone #upgrade anchors in paywall sections
pattern_upgrade = re.compile(r'<a href="#upgrade"[^>]*>.*?</a>', re.DOTALL)
html = pattern_upgrade.sub('', html)

# Clean up double/triple blank lines
html = re.sub(r'\n{3,}', '\n\n', html)

removed = original_len - len(html)
print(f"\nTotal removed: {removed} chars ({removed/original_len*100:.1f}%)")

with open(path, 'w', encoding='utf-8') as f:
    f.write(html)

print("\n[v5.0 FIXED] All paywall remnants cleaned!")
