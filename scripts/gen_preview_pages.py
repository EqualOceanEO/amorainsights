# 生成4个人形机器人报告落地页：中文付费/未付费 + 英文付费/未付费

BASE = "c:/Users/51229/WorkBuddy/Claw/public/"

# ── 共享内容数据 ────────────────────────────────────────────────
CH_CN = [
    {"id":"m","src":"/hri-report-part-m-mapping-v3.html","title":"产业链全景","tagline":"中美产业链全景 · 卡脖子清单 · 供应链时间线","badge":"免费","color":"#00d4ff","bg":"rgba(0,212,255,0.04)","border":"rgba(0,212,255,0.2)","preview":None},
    {"id":"a","src":"/hri-preview-part-a-cn.html","title":"技术突破","tagline":"双足人形机器人 · 灵巧手 · 具身智能","badge":"PRO","color":"#a855f7","bg":"rgba(168,85,247,0.04)","border":"rgba(168,85,247,0.2)","preview":None},
    {"id":"o","src":"/hri-preview-part-o-cn.html","title":"商业落地","tagline":"359家企业评分体系 · 销量规模 · 渗透率","badge":"PRO","color":"#22c55e","bg":"rgba(34,197,94,0.04)","border":"rgba(34,197,94,0.2)","preview":None},
    {"id":"r","src":"/hri-preview-part-r-cn.html","title":"市场容量","tagline":"万亿级市场 · 2030年预测 · 竞争格局","badge":"PRO","color":"#f97316","bg":"rgba(249,115,22,0.04)","border":"rgba(249,115,22,0.2)","preview":None},
    {"id":"a2","src":"/hri-preview-part-a2-cn.html","title":"投资指南","tagline":"AMORA评分体系 · Top20排名 · 买入时机","badge":"PRO","color":"#ec4899","bg":"rgba(236,72,153,0.04)","border":"rgba(236,72,153,0.2)","preview":None},
]
CH_EN = [
    {"id":"m","src":"/hri-report-part-m-mapping-v3.html","title":"Supply Chain Mapping","tagline":"China-US Chain · Bottlenecks · Supply Timeline","badge":"FREE","color":"#00d4ff","bg":"rgba(0,212,255,0.04)","border":"rgba(0,212,255,0.2)","preview":None},
    {"id":"a","src":"/hri-preview-part-a-en.html","title":"Technology Breakthrough","tagline":"Bipedal Humanoids · Dexterous Hands · Embodied AI","badge":"PRO","color":"#a855f7","bg":"rgba(168,85,247,0.04)","border":"rgba(168,85,247,0.2)","preview":None},
    {"id":"o","src":"/hri-preview-part-o-en.html","title":"Commercial Deployment","tagline":"359-Company Scoring · Sales Scale · Penetration","badge":"PRO","color":"#22c55e","bg":"rgba(34,197,94,0.04)","border":"rgba(34,197,94,0.2)","preview":None},
    {"id":"r","src":"/hri-preview-part-r-en.html","title":"Market Reach","tagline":"Trillion Market · 2030 Forecast · Competitive Landscape","badge":"PRO","color":"#f97316","bg":"rgba(249,115,22,0.04)","border":"rgba(249,115,22,0.2)","preview":None},
    {"id":"a2","src":"/hri-preview-part-a2-en.html","title":"Investment Guide","tagline":"AMORA Scoring · Top 20 Ranking · Entry Timing","badge":"PRO","color":"#ec4899","bg":"rgba(236,72,153,0.04)","border":"rgba(236,72,153,0.2)","preview":None},
]

PAID_CSS = """*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:#06060e;color:#e2e8f0;overflow-y:scroll;scrollbar-width:none}
body::-webkit-scrollbar{display:none}
.pg-header{position:sticky;top:0;z-index:200;display:flex;align-items:center;justify-content:space-between;padding:0 24px;height:52px;background:rgba(6,6,14,0.96);border-bottom:1px solid rgba(255,255,255,0.07);backdrop-filter:blur(12px)}
.pg-logo{font-size:15px;font-weight:900;letter-spacing:.12em;color:#f59e0b}
.pg-sep{color:#1e293b;margin:0 12px}
.pg-report{font-size:13px;color:#94a3b8}
.pg-badge{font-size:11px;font-weight:600;padding:3px 10px;border-radius:99px;border:1px solid;margin-left:8px}
.pg-ch-divider{display:flex;align-items:center;gap:8px;padding:10px 20px;font-size:12px;flex-wrap:wrap}
.pg-ch-badge{font-size:10px;font-weight:700;padding:2px 7px;border-radius:4px;border:1px solid;letter-spacing:.08em}
.pg-ch-label{font-weight:600}
.pg-ch-sep{color:#334155}
.pg-ch-tagline{color:#475569}
.pg-chapter-wrap{position:relative;overflow:hidden}
.pg-chapter-iframe{width:100%;border:none;display:block}
.pg-footer{border-top:1px solid rgba(255,255,255,0.05);padding:28px 24px;text-align:center;font-size:11px;color:#334155}
.pg-footer-logo{font-size:13px;font-weight:900;letter-spacing:.12em;color:#f59e0b;margin-bottom:6px}"""

UNPAID_CSS = """*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:#06060e;color:#e2e8f0;overflow-y:scroll;scrollbar-width:none}
body::-webkit-scrollbar{display:none}
.pg-header{position:sticky;top:0;z-index:200;display:flex;align-items:center;justify-content:space-between;padding:0 24px;height:52px;background:rgba(6,6,14,0.96);border-bottom:1px solid rgba(255,255,255,0.07);backdrop-filter:blur(12px)}
.pg-logo{font-size:15px;font-weight:900;letter-spacing:.12em;color:#f59e0b}
.pg-sep{color:#1e293b;margin:0 12px}
.pg-report{font-size:13px;color:#94a3b8}
.pg-badge{font-size:11px;font-weight:600;padding:3px 10px;border-radius:99px;border:1px solid;margin-left:8px}
.pg-ch-divider{display:flex;align-items:center;gap:8px;padding:10px 20px;font-size:12px;flex-wrap:wrap}
.pg-ch-badge{font-size:10px;font-weight:700;padding:2px 7px;border-radius:4px;border:1px solid;letter-spacing:.08em}
.pg-ch-label{font-weight:600}
.pg-ch-sep{color:#334155}
.pg-ch-tagline{color:#475569}
.pg-chapter-wrap{position:relative;overflow:hidden}
.pg-chapter-iframe{width:100%;border:none;display:block}
.pg-blur-fade{position:absolute;left:0;right:0;background:linear-gradient(to bottom,rgba(6,6,18,0.15) 0%,rgba(6,6,18,0.75) 28%,rgba(6,6,18,0.98) 60%,#06060e 100%);display:flex;flex-direction:column;align-items:center;padding-top:60px;padding-bottom:20px}
.pg-lock-icon{font-size:36px;margin-bottom:14px;filter:drop-shadow(0 0 12px rgba(245,158,11,0.4))}
.pg-lock-title{font-size:18px;font-weight:700;color:#f1f5f9;margin-bottom:6px}
.pg-lock-sub{font-size:12px;color:#64748b;margin-bottom:20px}
.pg-unlock-btn{display:inline-block;font-size:13px;font-weight:700;color:#06060e;background:linear-gradient(135deg,#fbbf24,#f97316);padding:10px 28px;border-radius:99px;text-decoration:none;box-shadow:0 0 20px rgba(245,158,11,0.35);transition:transform .15s,box-shadow .15s}
.pg-unlock-btn:hover{transform:scale(1.04);box-shadow:0 0 30px rgba(245,158,11,0.55)}
.pg-perk-list{margin-top:14px;font-size:11px;color:#475569;display:flex;gap:14px;flex-wrap:wrap;justify-content:center}
.pg-perk-list span::before{content:'\\2713 ';color:#f59e0b}
.pg-footer{border-top:1px solid rgba(255,255,255,0.05);padding:28px 24px;text-align:center;font-size:11px;color:#334155}
.pg-footer-logo{font-size:13px;font-weight:900;letter-spacing:.12em;color:#f59e0b;margin-bottom:6px}"""

PREVIEW_H = 820
BLUR_H = 480
TOTAL_H = PREVIEW_H + BLUR_H

def build_paid(lang, chapters, title_text, subtitle_text, badge_text, badge_color, badge_bg, footer_text):
    html = f"""<!DOCTYPE html>
<html lang="{lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>{title_text}</title>
<style>{PAID_CSS}</style>
</head>
<body>
<header class="pg-header">
  <div style="display:flex;align-items:center;gap:6px;">
    <span class="pg-logo">AMORA</span>
    <span class="pg-sep">|</span>
    <span class="pg-report">{subtitle_text}</span>
  </div>
  <div style="display:flex;align-items:center;">
    <span class="pg-badge" style="background:{badge_bg};color:{badge_color};border-color:{badge_color}44;">{badge_text}</span>
    <span class="pg-badge" style="background:rgba(0,212,255,0.12);color:#00d4ff;border-color:rgba(0,212,255,0.25);">{lang.upper()}</span>
  </div>
</header>
"""
    for ch in chapters:
        html += f"""
<section style="background:{ch["bg"]};border-left:3px solid {ch["border"]};">
  <div class="pg-ch-divider">
    <span class="pg-ch-badge" style="color:{ch["color"]};border-color:{ch["color"]};background:{ch["color"]}18;">{ch["badge"]}</span>
    <span class="pg-ch-label" style="color:#94a3b8;">{ch["title"]}</span>
    <span class="pg-ch-sep">·</span>
    <span class="pg-ch-tagline">{ch["tagline"]}</span>
  </div>
  <div class="pg-chapter-wrap">
    <iframe src="{ch["src"]}" class="pg-chapter-iframe" height="900"
      scrolling="no" sandbox="allow-scripts allow-same-origin" title="{ch["title"]}"></iframe>
  </div>
</section>
"""
    html += f"""
<div class="pg-footer">
  <div class="pg-footer-logo">AMORA</div>
  <div>{footer_text}</div>
</div>
</body>
</html>"""
    return html

def build_unpaid(lang, chapters, title_text, subtitle_text, badge_text, lock_title, lock_sub, cta_text, perks, footer_text):
    html = f"""<!DOCTYPE html>
<html lang="{lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>{title_text}</title>
<style>{UNPAID_CSS}</style>
</head>
<body>
<header class="pg-header">
  <div style="display:flex;align-items:center;gap:6px;">
    <span class="pg-logo">AMORA</span>
    <span class="pg-sep">|</span>
    <span class="pg-report">{subtitle_text}</span>
  </div>
  <div style="display:flex;align-items:center;">
    <span class="pg-badge" style="background:#f59e0b22;color:#f59e0b;border-color:#f59e0b44;">{badge_text}</span>
    <span class="pg-badge" style="background:rgba(0,212,255,0.12);color:#00d4ff;border-color:rgba(0,212,255,0.25);">{lang.upper()}</span>
  </div>
</header>
"""
    for ch in chapters:
        html += f"""
<section style="background:{ch["bg"]};border-left:3px solid {ch["border"]};">
  <div class="pg-ch-divider">
    <span class="pg-ch-badge" style="color:{ch["color"]};border-color:{ch["color"]};background:{ch["color"]}18;">{ch["badge"]}</span>
    <span class="pg-ch-label" style="color:#94a3b8;">{ch["title"]}</span>
    <span class="pg-ch-sep">·</span>
    <span class="pg-ch-tagline">{ch["tagline"]}</span>
  </div>
  <div class="pg-chapter-wrap" style="height:{TOTAL_H}px;">
    <iframe src="{ch["src"]}" class="pg-chapter-iframe"
      style="height:{TOTAL_H}px;clip-path:inset(0 0 {BLUR_H}px 0);"
      scrolling="no" sandbox="allow-scripts allow-same-origin" title="{ch["title"]}"></iframe>
    <div class="pg-blur-fade" style="top:{PREVIEW_H - 160}px;height:{BLUR_H + 200}px;">
      <div class="pg-lock-icon">&#128274;</div>
      <div class="pg-lock-title">{ch["title"]} · {lock_title}</div>
      <div class="pg-lock-sub">{lock_sub}</div>
      <a href="/pricing" class="pg-unlock-btn">{cta_text}</a>
      <div class="pg-perk-list">{''.join(f'<span>{p}</span>' for p in perks)}</div>
    </div>
  </div>
</section>
"""
    html += f"""
<div class="pg-footer">
  <div class="pg-footer-logo">AMORA</div>
  <div>{footer_text}</div>
</div>
</body>
</html>"""
    return html

# 生成中文付费
cn_paid = build_paid(
    lang="zh-CN",
    chapters=CH_CN,
    title_text="人形机器人智能产业报告 2026 · AMORA",
    subtitle_text="人形机器人智能产业报告 2026",
    badge_text="已解锁",
    badge_color="#22c55e",
    badge_bg="#22c55e22",
    footer_text="人形机器人智能产业报告 2026 · AMORA Research"
)
with open(BASE + "hri-2026-cn-paid.html", "w", encoding="utf-8") as f:
    f.write(cn_paid)
print("Wrote hri-2026-cn-paid.html")

# 生成中文未付费
cn_unpaid = build_unpaid(
    lang="zh-CN",
    chapters=CH_CN,
    title_text="人形机器人智能产业报告 2026 · AMORA",
    subtitle_text="人形机器人智能产业报告 2026",
    badge_text="预览",
    lock_title="完整章节",
    lock_sub="升级至 Pro 解锁完整报告",
    cta_text="升级解锁全部章节",
    perks=["完整数据图表", "企业深度评分", "投资策略建议"],
    footer_text="人形机器人智能产业报告 2026 · AMORA Research"
)
with open(BASE + "hri-2026-cn-unpaid.html", "w", encoding="utf-8") as f:
    f.write(cn_unpaid)
print("Wrote hri-2026-cn-unpaid.html")

# 生成英文付费
en_paid = build_paid(
    lang="en",
    chapters=CH_EN,
    title_text="Humanoid Robotics Intelligence 2026 · AMORA",
    subtitle_text="Humanoid Robotics Intelligence 2026",
    badge_text="Unlocked",
    badge_color="#22c55e",
    badge_bg="#22c55e22",
    footer_text="Humanoid Robotics Intelligence 2026 · AMORA Research"
)
with open(BASE + "hri-2026-en-paid.html", "w", encoding="utf-8") as f:
    f.write(en_paid)
print("Wrote hri-2026-en-paid.html")

# 生成英文未付费
en_unpaid = build_unpaid(
    lang="en",
    chapters=CH_EN,
    title_text="Humanoid Robotics Intelligence 2026 · AMORA",
    subtitle_text="Humanoid Robotics Intelligence 2026",
    badge_text="Preview",
    lock_title="Full Chapter",
    lock_sub="Upgrade to Pro for the complete report",
    cta_text="Unlock All Chapters",
    perks=["Complete Data Charts", "Company Deep Scores", "Investment Strategy"],
    footer_text="Humanoid Robotics Intelligence 2026 · AMORA Research"
)
with open(BASE + "hri-2026-en-unpaid.html", "w", encoding="utf-8") as f:
    f.write(en_unpaid)
print("Wrote hri-2026-en-unpaid.html")

print("\nAll 4 landing pages written!")
print("\nPreview chapter files needed for unpaid versions:")
for ch in CH_CN:
    if ch["src"].startswith("/hri-preview"):
        print(f"  {ch['src']}")
