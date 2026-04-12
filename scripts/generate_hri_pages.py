"""从 Supabase 拉取所有章节的原始 HTML，保存到本地，生成纯净中英文版本"""
import urllib.request
import json
import re
import os
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

SUPABASE_URL = 'https://jqppcuccqkxhhrvndsil.supabase.co'
SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc'

url = f'{SUPABASE_URL}/rest/v1/reports?id=eq.44&select=chapters_json'
req = urllib.request.Request(url, headers={'apikey': SERVICE_KEY, 'Authorization': f'Bearer {SERVICE_KEY}', 'Prefer': 'raw'})
r = urllib.request.urlopen(req, timeout=15)
data = json.loads(r.read())[0]['chapters_json']

BASE_DIR = 'c:/Users/51229/WorkBuddy/Claw/public'
os.makedirs(BASE_DIR, exist_ok=True)

chapter_meta = {
    'm': {'title': 'Part M · 产业链全景图谱', 'title_en': 'Part M · Supply Chain Mapping', 'subtitle': '产业链生态定位', 'subtitle_en': 'Supply Chain Ecosystem', 'color': '#3b82f6', 'order': 1, 'free': True},
    'a': {'title': 'Part A · 技术先进性', 'title_en': 'Part A · Technology Advancement', 'subtitle': '核心技术与专利壁垒', 'subtitle_en': 'Core Technology & Patents', 'color': '#8b5cf6', 'order': 2, 'free': False},
    'o': {'title': 'Part O · 商业化运营', 'title_en': 'Part O · Operations & Commercialization', 'subtitle': '收入结构与盈利模型', 'subtitle_en': 'Revenue & Profitability', 'color': '#10b981', 'order': 3, 'free': False},
    'r': {'title': 'Part R · 市场容量', 'title_en': 'Part R · Market Reach & Sizing', 'subtitle': 'TAM/SAM/SOM 分析', 'subtitle_en': 'Market Size Analysis', 'color': '#f59e0b', 'order': 4, 'free': False},
    'a2': {'title': 'Part A2 · 资本价值', 'title_en': 'Part A2 · Capital Assets & Valuation', 'subtitle': '估值与资本青睐度', 'subtitle_en': 'Valuation & Funding', 'color': '#ef4444', 'order': 5, 'free': False},
}

def strip_cn(text):
    """Remove all Chinese characters from text"""
    return ''.join(c for c in text if not ('\u4e00' <= c <= '\u9fff'))

def strip_non_cn(text):
    """Remove all non-Chinese characters from text (keep Chinese only)"""
    return ''.join(c for c in text if '\u4e00' <= c <= '\u9fff')

def strip_tags_keep_text(html):
    """Strip HTML tags but keep structure for text extraction"""
    # Remove style tags and content
    html = re.sub(r'<style[^>]*>.*?</style>', '', html, flags=re.DOTALL | re.IGNORECASE)
    html = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL | re.IGNORECASE)
    # Replace block elements with newlines
    html = re.sub(r'<(div|p|li|tr|h[1-6]|br)[^>]*>', '\n', html, flags=re.IGNORECASE)
    # Remove all remaining tags
    html = re.sub(r'<[^>]+>', '', html)
    html = re.sub(r'\n{3,}', '\n\n', html)
    return html.strip()

def get_text_content(html):
    """Extract all text from HTML, separated by language"""
    clean = strip_tags_keep_text(html)
    cn = strip_non_cn(clean)
    en = strip_cn(clean).strip()
    return clean, cn, en

# Save raw chapters
for key in ['m', 'a', 'o', 'r', 'a2']:
    ch = data[key]
    raw_html = ch['html']
    clean, cn, en = get_text_content(raw_html)
    print(f'Part {key.upper()}: raw={len(raw_html)}, clean={len(clean)}, cn={len(cn)}, en={len(en)}')
    print(f'  CN sample: {cn[:200]}')
    print(f'  EN sample: {en[:200]}')
    print()

# Now generate 4 wrapper pages
# Two wrappers: one Chinese (cn), one English (en)
# Each has: paid (full content) and unpaid (blurred preview)

WRAPPER_CN = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title} | HRI 2026 · 人形机器人指数</title>
<style>
* {{ margin:0; padding:0; box-sizing:border-box }}
body {{
  font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  color: #e5e7eb;
  min-height: 100vh;
}}
.report-wrapper {{
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}}
.report-header {{
  background: rgba(255,255,255,0.05);
  border-radius: 20px;
  padding: 28px 32px;
  margin-bottom: 20px;
  border: 1px solid rgba(255,255,255,0.1);
}}
.report-header h1 {{
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
}}
.report-header p {{
  font-size: 14px;
  color: #9ca3af;
}}
.chapter-grid {{
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}}
.chapter-card {{
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.03);
  position: relative;
}}
.chapter-inner {{
  position: relative;
  max-height: {max_height}px;
  overflow: hidden;
}}
.chapter-inner.unlocked {{
  max-height: none;
}}
.chapter-blur {{
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 300px;
  background: linear-gradient(to bottom, transparent, #0a0a0a 80%);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 40px;
}}
.chapter-blur.hidden {{ display: none; }}
.upgrade-card {{
  background: linear-gradient(135deg, rgba(245,158,11,0.2), rgba(249,115,22,0.2));
  border: 1px solid rgba(245,158,11,0.5);
  border-radius: 16px;
  padding: 24px 32px;
  text-align: center;
}}
.upgrade-card h3 {{
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #fbbf24;
}}
.upgrade-card p {{
  font-size: 13px;
  color: #9ca3af;
  margin-bottom: 16px;
}}
.upgrade-btn {{
  display: inline-block;
  background: linear-gradient(135deg, #f59e0b, #ea580c);
  color: white;
  font-weight: 700;
  font-size: 14px;
  padding: 10px 28px;
  border-radius: 10px;
  text-decoration: none;
}}
.report-footer {{
  text-align: center;
  padding: 32px 0 16px;
  font-size: 12px;
  color: #6b7280;
}}
.paid-badge {{
  position: absolute;
  top: 12px; right: 12px;
  background: rgba(34,197,94,0.2);
  border: 1px solid rgba(34,197,94,0.5);
  color: #4ade80;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
}}
iframe {{
  width: 100%;
  border: none;
  display: block;
}}
</style>
</head>
<body>
<div class="report-wrapper">
  <div class="report-header">
    <h1>人形机器人指数 2026</h1>
    <p>Humanoid Robotics Intelligence 2026 · AMORA Research Framework</p>
  </div>
  <div class="chapter-grid">
{chapter_cards}
  </div>
  <div class="report-footer">
    <p>AMORA Insights · 人形机器人指数 2026 · 转载需授权</p>
  </div>
</div>
</body>
</html>"""

CHAPTER_CARD_CN = """    <div class="chapter-card">
      <div class="chapter-inner {unlocked}">
        <iframe src="/api/hri-chapters/{key}" style="height:{height}px" scrolling="no"></iframe>
        <div class="chapter-blur {blur_class}">
          <div class="upgrade-card">
            <h3>{chapter_title}</h3>
            <p>解锁完整章节，查看深度分析与数据洞察</p>
            <a href="/pricing" class="upgrade-btn">升级解锁全部章节</a>
          </div>
        </div>
      </div>
    </div>"""

# English wrapper
WRAPPER_EN = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title} | HRI 2026 · Humanoid Robotics Index</title>
<style>
* {{ margin:0; padding:0; box-sizing:border-box }}
body {{
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  color: #e5e7eb;
  min-height: 100vh;
}}
.report-wrapper {{
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}}
.report-header {{
  background: rgba(255,255,255,0.05);
  border-radius: 20px;
  padding: 28px 32px;
  margin-bottom: 20px;
  border: 1px solid rgba(255,255,255,0.1);
}}
.report-header h1 {{
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
}}
.report-header p {{
  font-size: 14px;
  color: #9ca3af;
}}
.chapter-grid {{
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}}
.chapter-card {{
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.03);
  position: relative;
}}
.chapter-inner {{
  position: relative;
  max-height: {max_height}px;
  overflow: hidden;
}}
.chapter-inner.unlocked {{
  max-height: none;
}}
.chapter-blur {{
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 300px;
  background: linear-gradient(to bottom, transparent, #0a0a0a 80%);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 40px;
}}
.chapter-blur.hidden {{ display: none; }}
.upgrade-card {{
  background: linear-gradient(135deg, rgba(139,92,246,0.2), rgba(79,70,229,0.2));
  border: 1px solid rgba(139,92,246,0.5);
  border-radius: 16px;
  padding: 24px 32px;
  text-align: center;
}}
.upgrade-card h3 {{
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #c4b5fd;
}}
.upgrade-card p {{
  font-size: 13px;
  color: #9ca3af;
  margin-bottom: 16px;
}}
.upgrade-btn {{
  display: inline-block;
  background: linear-gradient(135deg, #8b5cf6, #6d28d9);
  color: white;
  font-weight: 700;
  font-size: 14px;
  padding: 10px 28px;
  border-radius: 10px;
  text-decoration: none;
}}
.report-footer {{
  text-align: center;
  padding: 32px 0 16px;
  font-size: 12px;
  color: #6b7280;
}}
iframe {{
  width: 100%;
  border: none;
  display: block;
}}
</style>
</head>
<body>
<div class="report-wrapper">
  <div class="report-header">
    <h1>Humanoid Robotics Intelligence 2026</h1>
    <p>HRI 2026 · AMORA Research Framework · Industry Intelligence Report</p>
  </div>
  <div class="chapter-grid">
{chapter_cards}
  </div>
  <div class="report-footer">
    <p>AMORA Insights · Humanoid Robotics Intelligence 2026 · All Rights Reserved</p>
  </div>
</div>
</body>
</html>"""

CHAPTER_CARD_EN = """    <div class="chapter-card">
      <div class="chapter-inner {unlocked}">
        <iframe src="/api/hri-chapters/{key}" style="height:{height}px" scrolling="no"></iframe>
        <div class="chapter-blur {blur_class}">
          <div class="upgrade-card">
            <h3>{chapter_title}</h3>
            <p>Unlock full chapter access for in-depth analysis and data insights</p>
            <a href="/pricing" class="upgrade-btn">Upgrade to Pro · Unlock All</a>
          </div>
        </div>
      </div>
    </div>"""

PREVIEW_HEIGHT = 900  # px per chapter preview

def build_page(lang, paid):
    meta = {
        'cn': {'title': '人形机器人指数 2026', 'wrapper': WRAPPER_CN, 'card': CHAPTER_CARD_CN},
        'en': {'title': 'Humanoid Robotics Intelligence 2026', 'wrapper': WRAPPER_EN, 'card': CHAPTER_CARD_EN},
    }[lang]

    cards = []
    for key in ['m', 'a', 'o', 'r', 'a2']:
        ch_meta = chapter_meta[key]
        unlocked = paid or ch_meta['free']
        blur_class = '' if unlocked else ''
        unlocked_class = 'unlocked' if unlocked else ''
        title = ch_meta['title'] if lang == 'cn' else ch_meta['title_en']
        height = 4000 if unlocked else PREVIEW_HEIGHT

        card_html = meta['card'].format(
            key=key,
            height=height,
            unlocked=unlocked_class,
            blur_class=blur_class,
            chapter_title=title,
        )
        cards.append(card_html)

    page_html = meta['wrapper'].format(
        title=meta['title'],
        max_height=PREVIEW_HEIGHT,
        chapter_cards='\n'.join(cards),
    )

    suffix = '' if paid else '-preview'
    filename = f'hri-2026-{lang}{suffix}.html'
    filepath = os.path.join(BASE_DIR, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(page_html)
    print(f'Written: {filepath} ({len(page_html)} bytes)')

# Generate all 4 pages
for lang in ['cn', 'en']:
    for paid in [True, False]:
        build_page(lang, paid)

print('\nDone! 4 pages generated.')
print('  hri-2026-cn.html          — Chinese, paid (full access)')
print('  hri-2026-cn-preview.html  — Chinese, unpaid (blurred preview)')
print('  hri-2026-en.html          — English, paid (full access)')
print('  hri-2026-en-preview.html  — English, unpaid (blurred preview)')
