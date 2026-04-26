"""
Fix v5.0 PRO version:
1. Remove all .paywall-overlay blocks
2. Remove opacity:0.4 wrapper divs (but keep inner content)
3. Remove PRO badges from section tags
"""
import re

import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('HRI-2026-AMORA-Report-v5.0.html', 'r', encoding='utf-8') as f:
    html = f.read()

original_len = len(html)

# ── 1. Remove entire .paywall-overlay blocks ──────────────────────────────
# Match: <div class="paywall-overlay..."> ... </div> (non-greedy across lines)
pattern_paywall = re.compile(
    r'\s*<!-- Paywall for [A-Za-z0-9 /]+ -->\s*\n?\s*<div class="paywall-overlay[^"]*"[^>]*>.*?</div>\s*\n?',
    re.DOTALL
)
html = pattern_paywall.sub('', html)
print(f"After removing .paywall-overlay blocks: {len(html)} chars (removed {original_len - len(html)})")

# ── 2. Remove wrapper divs with opacity:0.4 ──────────────────────────────
# Pattern: <div style="margin-top:40px;opacity:0.4;pointer-events:none;">
# We want to replace this opening div tag with nothing (just keep content)
pattern_opacity_open = re.compile(
    r'<div style="margin-top:40px;opacity:0\.4;pointer-events:none;">'
)
html = pattern_opacity_open.sub('', html)
print(f"After removing opacity wrapper opens: {len(html)} chars")

# Remove the matching closing tag: </div><!-- End of paywall content -->
pattern_opacity_close = re.compile(
    r'</div><!-- End of paywall content -->'
)
html = pattern_opacity_close.sub('', html)
print(f"After removing opacity wrapper closes: {len(html)} chars")

# ── 3. Remove PRO badges from section tags ───────────────────────────────
# <span class="section-pro-badge">🔒 PRO</span>
pattern_badge = re.compile(r'\s*<span class="section-pro-badge">🔒 PRO</span>')
html = pattern_badge.sub('', html)
print(f"After removing PRO badges: {len(html)} chars")

removed = original_len - len(html)
print(f"\nTotal removed: {removed} chars ({removed/original_len*100:.1f}%)")

with open('HRI-2026-AMORA-Report-v5.0.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("\n[v5.0 FIXED] All paywalls removed from PRO version!")
