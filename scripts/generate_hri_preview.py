#!/usr/bin/env python3
"""Generate 4 standalone HRI-2026 preview HTML pages."""

import os, re

# ── Chapter definitions ──────────────────────────────────────────────────────
CHAPTERS = [
    {
        'key': 'm',
        'label': 'Part M · Mapping',
        'label_cn': '产业链全景',
        'color': '#00d4ff',
        'bg': 'rgba(0,212,255,0.06)',
        'border': 'rgba(0,212,255,0.25)',
        'grad': 'linear-gradient(135deg, #00d4ff 0%, #006688 100%)',
        'badge': 'FREE',
        'badge_color': '#00d4ff',
        'tagline': '中美产业链全景 · 卡脖子清单 · 供应链时间线',
        'tagline_en': 'Global Supply Chain Map · Chokepoint Analysis · Timeline',
        'src': '/hri-report-part-m-mapping-v3.html',
        'iframe_h': 5000,
        'free': True,
    },
    {
        'key': 'a',
        'label': 'Part A · Advancement',
        'label_cn': '技术先进性',
        'color': '#ff006e',
        'bg': 'rgba(255,0,110,0.06)',
        'border': 'rgba(255,0,110,0.25)',
        'grad': 'linear-gradient(135deg, #ff006e 0%, #880044 100%)',
        'badge': 'PRO',
        'badge_color': '#ff006e',
        'tagline': '世界模型 · 端到端控制 · 硬件代际演进',
        'tagline_en': 'World Models · End-to-End Control · Hardware Generation',
        'src': '/hri-report-part-a-advancement-v1.html',
        'iframe_h': 3800,
        'free': False,
    },
    {
        'key': 'o',
        'label': 'Part O · Operations',
        'label_cn': '商业化运营',
        'color': '#06d6a0',
        'bg': 'rgba(6,214,160,0.06)',
        'border': 'rgba(6,214,160,0.25)',
        'grad': 'linear-gradient(135deg, #06d6a0 0%, #048a68 100%)',
        'badge': 'PRO',
        'badge_color': '#06d6a0',
        'tagline': '出货量 · 客群结构 · 收入规模 · 盈利能力',
        'tagline_en': 'Shipments · Customer Mix · Revenue · Profitability',
        'src': '/hri-report-part-o-operations-v1.html',
        'iframe_h': 3400,
        'free': False,
    },
    {
        'key': 'r',
        'label': 'Part R · Reach',
        'label_cn': '市场容量',
        'color': '#ff9500',
        'bg': 'rgba(255,149,0,0.06)',
        'border': 'rgba(255,149,0,0.25)',
        'grad': 'linear-gradient(135deg, #ff9500 0%, #996600 100%)',
        'badge': 'PRO',
        'badge_color': '#ff9500',
        'tagline': '全球市场 · TAM/SAM/SOM · 增速预测',
        'tagline_en': 'Global Market · TAM/SAM/SOM · Growth Forecast',
        'src': '/hri-report-part-r-reach-v1.html',
        'iframe_h': 3200,
        'free': False,
    },
    {
        'key': 'a2',
        'label': 'Part A\u200b\u00b7 Assets',
        'label_cn': '资本价值',
        'color': '#a855f7',
        'bg': 'rgba(168,85,247,0.06)',
        'border': 'rgba(168,85,247,0.25)',
        'grad': 'linear-gradient(135deg, #a855f7 0%, #5b21b6 100%)',
        'badge': 'PRO',
        'badge_color': '#a855f7',
        'tagline': '估值 · 融资 · 资本效率 · AMORA Score 总榜',
        'tagline_en': 'Valuation · Funding · Capital Efficiency · AMORA Scoreboard',
        'src': '/hri-report-part-a2-assets-v1.html',
        'iframe_h': 3800,
        'free': False,
    },
]

# How much of each iframe to reveal in unpaid mode (px)
PREVIEW_HEIGHTS = {'m': 800, 'a': 700, 'o': 650, 'r': 600, 'a2': 650}

OUT_DIR = 'c:/Users/51229/WorkBuddy/Claw/public'
os.makedirs(OUT_DIR, exist_ok=True)


def build_page(lang: str, paid: bool):
    """Build a complete HTML page string."""
    is_cn = (lang == 'cn')
    mode_label = '已解锁 · 全章节' if paid else '预览版 · 部分章节'
    mode_badge = '已解锁' if paid else '预览'
    mode_color = '#22c55e' if paid else '#f59e0b'

    # ── Header ──
    header = f"""\
  <!-- ── Header ──────────────────────────────────────────────── -->
  <header class="pg-header">
    <div class="pg-header-left">
      <span class="pg-logo">AMORA</span>
      <span class="pg-report-title">Humanoid Robotics Intelligence 2026</span>
      <span class="pg-sep">|</span>
      <span class="pg-report-title-cn">人形机器人智能产业报告 2026</span>
    </div>
    <div class="pg-header-right">
      <span class="pg-mode-badge" style="background:{mode_color}22;color:{mode_color};border:1px solid {mode_color}44;">
        {mode_badge}
      </span>
      <span class="pg-lang-badge">{'中文' if is_cn else 'EN'}</span>
    </div>
  </header>"""

    # ── Chapter sections ──
    chapter_htmls = []
    for ch in CHAPTERS:
        is_unlocked = paid or ch['free']
        ph = PREVIEW_HEIGHTS[ch['key']]
        sec_id = f"sec-{ch['key']}"

        if is_unlocked:
            inner = f"""\
    <div class="pg-chapter-wrap" style="height:{ch['iframe_h']}px;">
      <iframe
        src="{ch['src']}"
        class="pg-chapter-iframe"
        style="height:{ch['iframe_h']}px;"
        scrolling="no"
        sandbox="allow-scripts allow-same-origin"
        title="{ch['label']}">
      </iframe>
    </div>"""
        else:
            inner = f"""\
    <div class="pg-chapter-wrap pg-chapter-locked" style="height:{ch['iframe_h']}px;">
      <div class="pg-chapter-peek" style="height:{ph}px;overflow:hidden;position:relative;">
        <iframe
          src="{ch['src']}"
          class="pg-chapter-iframe"
          style="height:{ch['iframe_h']}px;pointer-events:none;"
          scrolling="no"
          sandbox="allow-scripts allow-same-origin"
          title="{ch['label']} (preview)">
        </iframe>
      </div>
      <!-- Blur overlay -->
      <div class="pg-blur-fade" style="top:{ph}px;height:{ch['iframe_h']-ph}px;">
        <div class="pg-blur-inner">
          <div class="pg-lock-icon">&#128274;</div>
          <div class="pg-lock-label">{'此章节完整版已锁定' if is_cn else 'Full Chapter Locked'}</div>
          <div class="pg-lock-chapter">{ch['label_cn']} · {ch['label']}</div>
          <a href="/pricing" class="pg-upgrade-btn">
            {'升级解锁全部章节' if is_cn else 'Upgrade to Unlock All Chapters'}
          </a>
          <div class="pg-lock-sub">{'或登录已有 Pro 账号' if is_cn else 'Or sign in with a Pro account'}</div>
        </div>
      </div>
    </div>"""

        chapter_htmls.append(f"""\
  <!-- ── Chapter {ch['key']} ────────────────────────────────── -->
  <section id="{sec_id}" class="pg-chapter"
    style="background:{ch['bg']};border-left:3px solid {ch['border']};">
    <div class="pg-ch-divider">
      <div class="pg-ch-badge" style="color:{ch['color']};border-color:{ch['color']};background:{ch['color']}18;">
        {ch['badge']}
      </div>
      <span class="pg-ch-label">{ch['label']}</span>
      <span class="pg-ch-label-cn">{ch['label_cn']}</span>
      <span class="pg-ch-sep">·</span>
      <span class="pg-ch-tagline">{'[CN] ' + ch['tagline'] if is_cn else ch['tagline_en']}</span>
    </div>
{inner}
  </section>""")

    chapters_block = '\n'.join(chapter_htmls)

    # ── Footer ──
    footer = f"""\
  <!-- ── Footer ─────────────────────────────────────────────── -->
  <footer class="pg-footer">
    <div class="pg-footer-inner">
      <div class="pg-footer-logo">AMORA</div>
      <div class="pg-footer-note">
        {'© 2026 AMORA Insights · 人形机器人智能产业报告 2026 · 仅供预览' if is_cn else
         '© 2026 AMORA Insights · Humanoid Robotics Intelligence 2026 · Preview Only'}
      </div>
      <a href="/pricing" class="pg-footer-cta">
        {'立即升级 Pro →' if is_cn else 'Upgrade to Pro →'}
      </a>
    </div>
  </footer>"""

    # ── Full HTML ──
    page_title_cn = '人形机器人智能产业报告 2026 · 人形机器人'
    page_title_en = 'Humanoid Robotics Intelligence 2026 | AMORA'
    og_desc_cn = 'AMORA 发布《人形机器人智能产业报告 2026》，覆盖中美日韩欧核心企业，涵盖产业链全景、技术先进性、商业化运营、市场容量与资本估值五大维度。'
    og_desc_en = 'AMORA presents the Humanoid Robotics Intelligence 2026 report, covering 9 core companies across US, China, Japan, Korea and EU, analyzing supply chain, technology, commercialization, market reach and capital value.'

    html = f"""\
<!DOCTYPE html>
<html lang="{'zh-CN' if is_cn else 'en-US'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{page_title_cn if is_cn else page_title_en}</title>
  <meta name="description" content="{og_desc_cn if is_cn else og_desc_en}">
  <style>
    /* ── Reset & Base ──────────────────────────────────────── */
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
    html, body {{
      height: 100%;
      overflow: hidden; /* page-level: NO scrollbars */
      background: #06060e;
      color: #e2e8f0;
      font-family: 'Inter', -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif;
    }}
    ::-webkit-scrollbar {{ display: none; }}
    body {{ scrollbar-width: none; -ms-overflow-style: none; }}

    /* ── Layout ─────────────────────────────────────────────── */
    .pg-root {{
      display: flex;
      flex-direction: column;
      height: 100vh;
      width: 100%;
      overflow: hidden;
    }}
    .pg-body {{
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      /* subtle inner scrollbar only */
      scrollbar-width: thin;
      scrollbar-color: #1e293b transparent;
    }}
    .pg-body::-webkit-scrollbar {{ width: 4px; }}
    .pg-body::-webkit-scrollbar-track {{ background: transparent; }}
    .pg-body::-webkit-scrollbar-thumb {{ background: #1e293b; border-radius: 2px; }}

    /* ── Header ────────────────────────────────────────────── */
    .pg-header {{
      flex-shrink: 0;
      height: 52px;
      background: rgba(6,6,18,0.97);
      border-bottom: 1px solid rgba(255,255,255,0.06);
      backdrop-filter: blur(20px);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      z-index: 100;
      position: relative;
    }}
    .pg-header-left {{
      display: flex;
      align-items: center;
      gap: 10px;
      overflow: hidden;
    }}
    .pg-logo {{
      font-size: 15px;
      font-weight: 800;
      letter-spacing: 0.12em;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      flex-shrink: 0;
    }}
    .pg-report-title {{
      font-size: 13px;
      font-weight: 600;
      color: #94a3b8;
      white-space: nowrap;
      flex-shrink: 0;
    }}
    .pg-report-title-cn {{
      font-size: 12px;
      color: #475569;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }}
    .pg-sep {{ color: #334155; font-size: 12px; }}
    @media (max-width: 700px) {{
      .pg-report-title-cn, .pg-sep {{ display: none; }}
    }}
    .pg-header-right {{
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }}
    .pg-mode-badge {{
      font-size: 11px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 20px;
      letter-spacing: 0.05em;
    }}
    .pg-lang-badge {{
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      padding: 3px 8px;
      border: 1px solid #1e293b;
      border-radius: 20px;
    }}

    /* ── Chapter Sections ───────────────────────────────────── */
    .pg-chapter {{
      border-left: 3px solid transparent;
    }}
    .pg-ch-divider {{
      position: sticky;
      top: 0;
      z-index: 50;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 20px;
      background: rgba(6,6,18,0.95);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(255,255,255,0.04);
      overflow: hidden;
    }}
    .pg-ch-badge {{
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.1em;
      padding: 2px 7px;
      border: 1px solid;
      border-radius: 4px;
      flex-shrink: 0;
    }}
    .pg-ch-label {{
      font-size: 13px;
      font-weight: 700;
      color: #e2e8f0;
      flex-shrink: 0;
    }}
    .pg-ch-label-cn {{
      font-size: 12px;
      color: #94a3b8;
      flex-shrink: 0;
    }}
    .pg-ch-sep {{
      color: #334155;
      font-size: 11px;
    }}
    .pg-ch-tagline {{
      font-size: 11px;
      color: #475569;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }}
    @media (max-width: 600px) {{
      .pg-ch-tagline {{ display: none; }}
    }}

    /* ── iframe wrapper ─────────────────────────────────────── */
    .pg-chapter-wrap {{
      position: relative;
      overflow: hidden;
    }}
    .pg-chapter-iframe {{
      width: 100%;
      border: none;
      display: block;
      /* iframe scrolls internally */
    }}

    /* ── Locked / Blur ──────────────────────────────────────── */
    .pg-blur-fade {{
      position: absolute;
      left: 0;
      right: 0;
      background: linear-gradient(
        to bottom,
        rgba(6,6,18,0.2) 0%,
        rgba(6,6,18,0.85) 35%,
        rgba(6,6,18,0.98) 70%,
        #06060e 100%
      );
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding-top: 20px;
    }}
    .pg-blur-inner {{
      text-align: center;
      padding: 24px 32px;
      border: 1px solid rgba(245,158,11,0.15);
      border-radius: 16px;
      background: rgba(6,6,18,0.7);
      backdrop-filter: blur(12px);
      max-width: 340px;
    }}
    .pg-lock-icon {{
      font-size: 32px;
      margin-bottom: 10px;
    }}
    .pg-lock-label {{
      font-size: 13px;
      font-weight: 700;
      color: #f59e0b;
      margin-bottom: 6px;
    }}
    .pg-lock-chapter {{
      font-size: 11px;
      color: #64748b;
      margin-bottom: 16px;
    }}
    .pg-upgrade-btn {{
      display: inline-block;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: #06060e;
      font-size: 13px;
      font-weight: 800;
      padding: 10px 24px;
      border-radius: 10px;
      text-decoration: none;
      letter-spacing: 0.04em;
      box-shadow: 0 4px 24px rgba(245,158,11,0.3);
      transition: opacity 0.2s, box-shadow 0.2s;
    }}
    .pg-upgrade-btn:hover {{
      opacity: 0.88;
      box-shadow: 0 6px 32px rgba(245,158,11,0.45);
    }}
    .pg-lock-sub {{
      font-size: 11px;
      color: #475569;
      margin-top: 10px;
    }}

    /* ── Footer ─────────────────────────────────────────────── */
    .pg-footer {{
      flex-shrink: 0;
      border-top: 1px solid rgba(255,255,255,0.06);
      background: rgba(6,6,18,0.97);
      padding: 20px;
    }}
    .pg-footer-inner {{
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }}
    .pg-footer-logo {{
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 0.12em;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }}
    .pg-footer-note {{
      font-size: 11px;
      color: #334155;
    }}
    .pg-footer-cta {{
      font-size: 12px;
      font-weight: 700;
      color: #f59e0b;
      text-decoration: none;
      padding: 6px 14px;
      border: 1px solid rgba(245,158,11,0.3);
      border-radius: 8px;
      transition: background 0.2s;
    }}
    .pg-footer-cta:hover {{
      background: rgba(245,158,11,0.08);
    }}
  </style>
</head>
<body>
  <div class="pg-root">
{header}
    <!-- Main scrollable body -->
    <div class="pg-body">
{chapters_block}
    </div>
{footer}
  </div>
</body>
</html>"""

    return html


# ── Generate all 4 pages ──────────────────────────────────────────────────────
pages = [
    ('hri-2026-cn-paid.html',   'cn', True),
    ('hri-2026-cn-unpaid.html', 'cn', False),
    ('hri-2026-en-paid.html',   'en', True),
    ('hri-2026-en-unpaid.html', 'en', False),
]

for fname, lang, paid in pages:
    html = build_page(lang, paid)
    path = os.path.join(OUT_DIR, fname)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(html)
    size = os.path.getsize(path) // 1024
    mode = 'PAID/UNLOCKED' if paid else 'UNPAID/PREVIEW'
    lang_label = '中文' if lang == 'cn' else 'EN'
    print(f'  [{lang_label}/{mode}] {fname} ({size}KB)')

print('\nAll 4 preview pages generated!')
