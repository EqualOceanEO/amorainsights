"""
生成纯净中/英文 HRI 2026 章节 HTML 文件 + 4个主页面
策略：
  - 纯英文章节：去掉所有中文字符，保留英文标题/内容/CSS
  - 纯中文章节：去掉所有英文字符，保留中文标题/内容/CSS
  - 主页面用 iframe 嵌套各自语言的章节
"""
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
raw_data = json.loads(r.read())[0]['chapters_json']

PUBLIC = 'c:/Users/51229/WorkBuddy/Claw/public'
os.makedirs(PUBLIC, exist_ok=True)

CHAPTER_META = {
    'm': {'title_cn': '产业链全景图谱', 'title_en': 'Supply Chain Mapping',
          'subtitle_cn': '产业链生态定位 · 中美双轨竞争', 'subtitle_en': 'Ecosystem · US-China Competition',
          'color': '#3b82f6', 'gradient': '135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%',
          'accent': '#60a5fa', 'free': True},
    'a': {'title_cn': '技术先进性', 'title_en': 'Technology Advancement',
          'subtitle_cn': '核心技术与专利壁垒', 'subtitle_en': 'Core Technology & Patent Barriers',
          'color': '#8b5cf6', 'gradient': '135deg, #0a0a0a 0%, #1a0a2e 50%, #0a1621 100%',
          'accent': '#a78bfa', 'free': False},
    'o': {'title_cn': '商业化运营', 'title_en': 'Operations & Commercialization',
          'subtitle_cn': '收入结构与盈利模型', 'subtitle_en': 'Revenue Structure & Profitability',
          'color': '#10b981', 'gradient': '135deg, #0a0a0a 0%, #0d1f12 50%, #0a1a0d 100%',
          'accent': '#34d399', 'free': False},
    'r': {'title_cn': '市场容量', 'title_en': 'Market Reach & Sizing',
          'subtitle_cn': 'TAM / SAM / SOM 三层分析', 'subtitle_en': 'TAM · SAM · SOM Analysis',
          'color': '#f59e0b', 'gradient': '135deg, #0a0a0a 0%, #1a1500 50%, #0a0a00 100%',
          'accent': '#fbbf24', 'free': False},
    'a2': {'title_cn': '资本价值', 'title_en': 'Capital Assets & Valuation',
           'subtitle_cn': '估值矩阵与资本青睐度', 'subtitle_en': 'Valuation Matrix & Investor Appeal',
           'color': '#ef4444', 'gradient': '135deg, #0a0a0a 0%, #1a0a0a 50%, #0a1a1a 100%',
           'accent': '#f87171', 'free': False},
}

CHAPTER_ORDER = ['m', 'a', 'o', 'r', 'a2']

def keep_cn(text):
    """保留中文字符，移除其他所有字符"""
    return ''.join(c for c in text if '\u4e00' <= c <= '\u9fff' or c in '\n \t')

def keep_en(text):
    """移除中文字符（保留英文和基本标点）"""
    result = []
    for c in text:
        if '\u4e00' <= c <= '\u9fff':
            continue  # skip Chinese
        result.append(c)
    return ''.join(result)

def clean_whitespace(text):
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r'[ \t]{2,}', ' ', text)
    return text.strip()

def patch_html_lang(html, lang):
    """修改 HTML lang 属性"""
    return re.sub(r'<html([^>]*)>', f'<html\\1>', html, flags=re.IGNORECASE)

def strip_chinese_from_html(html):
    """从 HTML 中移除所有中文字符"""
    def replacer(m):
        tag = m.group(1)
        content = m.group(2)
        # remove Chinese from content
        clean_content = keep_en(content)
        return f'<{tag}>{clean_content}</'
    # Process text content inside tags
    result = []
    i = 0
    while i < len(html):
        if html[i] == '<':
            j = html.index('>', i)
            result.append(html[i:j+1])
            i = j + 1
        else:
            j = i
            while j < len(html) and html[j] != '<':
                j += 1
            text_chunk = html[i:j]
            # remove Chinese from text
            clean_chunk = keep_en(text_chunk)
            result.append(clean_chunk)
            i = j
    return ''.join(result)

def strip_english_from_html(html):
    """从 HTML 中移除所有英文字符，保留中文"""
    result = []
    i = 0
    while i < len(html):
        if html[i] == '<':
            j = html.index('>', i)
            tag_content = html[i:j+1]
            # For closing tags like </div>, </span>, keep them
            if tag_content.startswith('</'):
                result.append(tag_content)
            else:
                # Self-closing or opening tag - keep the tag structure but remove Chinese from attrs
                result.append(tag_content)
            i = j + 1
        else:
            j = i
            while j < len(html) and html[j] != '<':
                j += 1
            text_chunk = html[i:j]
            # Keep only Chinese chars
            clean_chunk = keep_cn(text_chunk)
            result.append(clean_chunk)
            i = j
    return ''.join(result)

def extract_html_body(html):
    """提取 <body> 内容"""
    m = re.search(r'<body[^>]*>(.*?)</body>', html, re.DOTALL | re.IGNORECASE)
    if m:
        return m.group(1)
    return html

def make_standalone_chapter(key, lang, raw_html):
    """为单个章节生成独立 HTML 页面"""
    meta = CHAPTER_META[key]
    accent = meta['accent']
    gradient = meta['gradient']
    color = meta['color']

    if lang == 'en':
        title_main = f'HRI 2026 · Part {key.upper()}: {meta["title_en"]}'
        title_sub = meta['subtitle_en']
    else:
        title_main = f'HRI 2026 · {key.upper()}：{meta["title_cn"]}'
        title_sub = meta['subtitle_cn']

    # Extract body content and clean
    body = extract_html_body(raw_html)

    if lang == 'en':
        # Strip Chinese chars from the chapter HTML
        clean_body = strip_chinese_from_html(body)
    else:
        # Strip English chars from the chapter HTML
        clean_body = strip_english_from_html(body)

    # Remove empty tags
    clean_body = re.sub(r'<([a-z]+)[^>]*>\s*</\1>', '', clean_body, flags=re.IGNORECASE)
    clean_body = re.sub(r'<([a-z]+)[^>]*>\s*</\1>', '', clean_body, flags=re.IGNORECASE)

    lang_attr = 'zh-CN' if lang == 'cn' else 'en'
    font_family = '"PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif' if lang == 'cn' else '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

    standalone = f'''<!DOCTYPE html>
<html lang="{lang_attr}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title_main}</title>
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
body{{
  font-family: {font_family};
  background: linear-gradient({gradient});
  color: #e5e7eb;
  min-height: 100vh;
  padding: 20px;
}}
.container{{max-width:1400px;margin:0 auto;padding:0 20px}}
.header{{
  background:rgba(255,255,255,0.04);
  border-radius:16px;
  padding:28px 32px;
  margin-bottom:24px;
  border:1px solid rgba(255,255,255,0.08);
  border-left:3px solid {accent};
}}
.header .order{{
  font-size:11px;
  font-weight:700;
  letter-spacing:.12em;
  text-transform:uppercase;
  color:{accent};
  margin-bottom:6px;
}}
.header h1{{
  font-size:22px;
  font-weight:700;
  margin-bottom:6px;
}}
.header p{{font-size:13px;color:#9ca3af}}
.content{{
  background:rgba(255,255,255,0.03);
  border-radius:16px;
  padding:32px;
  border:1px solid rgba(255,255,255,0.08);
}}
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="order">Part {key.upper()} · HRI 2026</div>
    <h1>{title_main}</h1>
    <p>{title_sub}</p>
  </div>
  <div class="content">
    {clean_body}
  </div>
</div>
</body>
</html>'''

    return standalone

# Generate chapter files
print('=== Generating chapter HTML files ===')
for key in CHAPTER_ORDER:
    raw = raw_data[key]['html']
    for lang in ['en', 'cn']:
        standalone = make_standalone_chapter(key, lang, raw)
        filename = f'hri-ch-{key}-{lang}.html'
        filepath = os.path.join(PUBLIC, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(standalone)
        # Stats
        en_chars = sum(1 for c in standalone if 'a' <= c <= 'z' or 'A' <= c <= 'Z')
        cn_chars = sum(1 for c in standalone if '\u4e00' <= c <= '\u9fff')
        print(f'  {filename}: {len(standalone)} bytes | EN:{en_chars} CN:{cn_chars}')

print()

# ============================================================
# Generate 4 main pages (iframe wrappers)
# ============================================================
PREVIEW_HEIGHT = 800  # px visible before blur

WRAPPER_CN = '''<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>HRI 2026 · 人形机器人指数 | AMORA Insights</title>
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
::-webkit-scrollbar{{display:none}}
body{{
  font-family:-apple-system,"PingFang SC","Microsoft YaHei",sans-serif;
  background:#0a0a0f;
  color:#e5e7eb;
  min-height:100vh;
  overflow-y:auto;
}}
.report{{max-width:1400px;margin:0 auto;padding:20px;min-height:100vh}}
.report-head{{
  background:rgba(245,158,11,0.08);
  border:1px solid rgba(245,158,11,0.2);
  border-radius:20px;
  padding:32px;
  margin-bottom:24px;
  text-align:center;
}}
.report-head h1{{font-size:28px;font-weight:800;margin-bottom:6px;letter-spacing:.05em}}
.report-head h1 span{{color:#f59e0b}}
.report-head p{{font-size:14px;color:#9ca3af;letter-spacing:.04em}}
.chapters{{display:flex;flex-direction:column;gap:20px}}
.chapter{{border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08)}}
.chapter-inner{{position:relative;max-height:{preview_h}px;overflow:hidden}}
.chapter-inner.full{{max-height:none;overflow:visible}}
.chapter iframe{{width:100%;border:none;display:block;height:{full_h}px}}
.blur-overlay{{
  position:absolute;bottom:0;left:0;right:0;height:320px;
  background:linear-gradient(to bottom,rgba(10,10,15,0),rgba(10,10,15,0.97) 75%);
  display:flex;align-items:flex-end;justify-content:center;padding-bottom:40px;
}}
.blur-overlay.hidden{{display:none}}
.upgrade-box{{
  background:linear-gradient(135deg,rgba(245,158,11,0.15),rgba(249,115,22,0.15));
  border:1px solid rgba(245,158,11,0.4);
  border-radius:18px;padding:28px 36px;text-align:center;
}}
.upgrade-box h3{{font-size:18px;font-weight:700;color:#fbbf24;margin-bottom:8px}}
.upgrade-box p{{font-size:13px;color:#9ca3af;margin-bottom:16px}}
.upgrade-btn{{
  display:inline-block;background:linear-gradient(135deg,#f59e0b,#ea580c);
  color:#fff;font-weight:700;font-size:14px;padding:11px 32px;border-radius:10px;
  text-decoration:none;
}}
.foot{{text-align:center;padding:28px 0 12px;font-size:12px;color:#4b5563}}
</style>
</head>
<body>
<div class="report">
  <div class="report-head">
    <h1>HRI <span>2026</span> · 人形机器人指数</h1>
    <p>AMORA Research Framework · 行业洞察报告 · EqualOcean</p>
  </div>
  <div class="chapters">
{chapters_cn}
  </div>
  <div class="foot">
    <p>AMORA Insights · 人形机器人指数 2026 · 转载授权请联系</p>
  </div>
</div>
</body>
</html>'''

CHAPTER_CARD_CN = '''    <div class="chapter">
      <div class="chapter-inner {cls}">
        <iframe src="/hri-ch-{key}-cn.html" scrolling="no"></iframe>
        <div class="blur-overlay {blur_cls}">
          <div class="upgrade-box">
            <h3>{chapter_title}</h3>
            <p>解锁完整章节，查看深度分析与完整数据</p>
            <a href="/pricing" class="upgrade-btn">升级解锁 · 立即订阅</a>
          </div>
        </div>
      </div>
    </div>'''

WRAPPER_EN = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>HRI 2026 · Humanoid Robotics Intelligence | AMORA Insights</title>
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
::-webkit-scrollbar{{display:none}}
body{{
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  background:#0a0a0f;
  color:#e5e7eb;
  min-height:100vh;
  overflow-y:auto;
}}
.report{{max-width:1400px;margin:0 auto;padding:20px;min-height:100vh}}
.report-head{{
  background:rgba(139,92,246,0.08);
  border:1px solid rgba(139,92,246,0.2);
  border-radius:20px;
  padding:32px;
  margin-bottom:24px;
  text-align:center;
}}
.report-head h1{{font-size:28px;font-weight:800;margin-bottom:6px;letter-spacing:.05em}}
.report-head h1 span{{color:#818cf8}}
.report-head p{{font-size:14px;color:#9ca3af;letter-spacing:.04em}}
.chapters{{display:flex;flex-direction:column;gap:20px}}
.chapter{{border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08)}}
.chapter-inner{{position:relative;max-height:{preview_h}px;overflow:hidden}}
.chapter-inner.full{{max-height:none;overflow:visible}}
.chapter iframe{{width:100%;border:none;display:block;height:{full_h}px}}
.blur-overlay{{
  position:absolute;bottom:0;left:0;right:0;height:320px;
  background:linear-gradient(to bottom,rgba(10,10,15,0),rgba(10,10,15,0.97) 75%);
  display:flex;align-items:flex-end;justify-content:center;padding-bottom:40px;
}}
.blur-overlay.hidden{{display:none}}
.upgrade-box{{
  background:linear-gradient(135deg,rgba(139,92,246,0.15),rgba(99,102,241,0.15));
  border:1px solid rgba(139,92,246,0.4);
  border-radius:18px;padding:28px 36px;text-align:center;
}}
.upgrade-box h3{{font-size:18px;font-weight:700;color:#c4b5fd;margin-bottom:8px}}
.upgrade-box p{{font-size:13px;color:#9ca3af;margin-bottom:16px}}
.upgrade-btn{{
  display:inline-block;background:linear-gradient(135deg,#8b5cf6,#6d28d9);
  color:#fff;font-weight:700;font-size:14px;padding:11px 32px;border-radius:10px;
  text-decoration:none;
}}
.foot{{text-align:center;padding:28px 0 12px;font-size:12px;color:#4b5563}}
</style>
</head>
<body>
<div class="report">
  <div class="report-head">
    <h1>HRI <span>2026</span> · Humanoid Robotics Intelligence</h1>
    <p>AMORA Research Framework · Industry Intelligence Report · EqualOcean</p>
  </div>
  <div class="chapters">
{chapters_en}
  </div>
  <div class="foot">
    <p>AMORA Insights · Humanoid Robotics Intelligence 2026 · All Rights Reserved</p>
  </div>
</div>
</body>
</html>'''

CHAPTER_CARD_EN = '''    <div class="chapter">
      <div class="chapter-inner {cls}">
        <iframe src="/hri-ch-{key}-en.html" scrolling="no"></iframe>
        <div class="blur-overlay {blur_cls}">
          <div class="upgrade-box">
            <h3>{chapter_title}</h3>
            <p>Unlock full chapter access for in-depth analysis and complete data</p>
            <a href="/pricing" class="upgrade-btn">Upgrade to Pro · Unlock All</a>
          </div>
        </div>
      </div>
    </div>'''

FULL_H = 1400  # iframe height when full access

def build_main_page(lang, paid):
    if lang == 'cn':
        wrapper = WRAPPER_CN
        card_tmpl = CHAPTER_CARD_CN
    else:
        wrapper = WRAPPER_EN
        card_tmpl = CHAPTER_CARD_EN

    cards = []
    for key in CHAPTER_ORDER:
        meta = CHAPTER_META[key]
        unlocked = paid or meta['free']
        cls = 'full' if unlocked else ''
        blur_cls = 'hidden' if unlocked else ''

        if lang == 'cn':
            title = f'{key.upper()}：{meta["title_cn"]}'
        else:
            title = f'Part {key.upper()}: {meta["title_en"]}'

        h = FULL_H if unlocked else PREVIEW_HEIGHT
        card = card_tmpl.format(key=key, cls=cls, blur_cls=blur_cls, chapter_title=title)
        cards.append(card)

    html = wrapper.format(
        preview_h=PREVIEW_HEIGHT,
        full_h=FULL_H,
        chapters_cn='\n'.join(cards) if lang == 'cn' else '',
        chapters_en='\n'.join(cards) if lang == 'en' else '',
    )

    suffix = '-preview' if not paid else ''
    filename = f'hri-2026-{lang}{suffix}.html'
    filepath = os.path.join(PUBLIC, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)

    en_c = sum(1 for c in html if 'a' <= c <= 'z' or 'A' <= c <= 'Z')
    cn_c = sum(1 for c in html if '\u4e00' <= c <= '\u9fff')
    status = 'PAID (full)' if paid else 'PREVIEW (blurred)'
    print(f'{filename}: {status} | EN:{en_c} CN:{cn_c} | {len(html)} bytes')

print('=== Generating main wrapper pages ===')
for lang in ['cn', 'en']:
    for paid in [True, False]:
        build_main_page(lang, paid)

print()
print('All files written to /public/')
