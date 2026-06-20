#!/usr/bin/env python3
# 生成纯净的章节预览HTML（中/英文），用于未付费版iframe预览

import sys
sys.stdout.reconfigure(encoding='utf-8')

OUT = "c:/Users/51229/WorkBuddy/Claw/public/"

def gen_preview(title, subtitle, color, body_content, lang="zh-CN"):
    html = f"""<!DOCTYPE html>
<html lang="{lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>{title}</title>
<style>
*,*::before,*::after{{box-sizing:border-box;margin:0;padding:0}}
body{{font-family:{'"PingFang SC","Microsoft YaHei",-apple-system,sans-serif' if lang=='zh-CN' else "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"};background:linear-gradient(135deg,#06060e 0%,#0a0a1a 100%);color:#fff;padding:20px;min-height:100vh}}
.header{{background:rgba(255,255,255,0.05);border-radius:16px;padding:24px 28px;margin-bottom:20px;border:1px solid rgba(255,255,255,0.08);position:relative;overflow:hidden}}
.header::before{{content:'';position:absolute;top:0;left:0;width:4px;height:100%;background:linear-gradient(180deg,{color},transparent)}}
.badge{{display:inline-block;font-size:10px;font-weight:700;letter-spacing:.1em;padding:3px 10px;border-radius:4px;border:1px solid {color};color:{color};background:{color}18;margin-bottom:8px}}
.h1{{font-size:22px;font-weight:800;margin-bottom:4px;letter-spacing:-.01em}}
.sub{{font-size:13px;color:#64748b}}
.body{{display:grid;grid-template-columns:1fr 1fr;gap:16px}}
.card{{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:18px 20px}}
.card-title{{font-size:13px;font-weight:700;color:{color};margin-bottom:8px}}
.card-text{{font-size:12px;color:#94a3b8;line-height:1.6}}
.metric{{font-size:28px;font-weight:800;color:{color};display:block;margin-bottom:4px}}
.metric-label{{font-size:11px;color:#64748b}}
.chart-placeholder{{background:linear-gradient(135deg,rgba(255,255,255,0.03),rgba(255,255,255,0.06));border:1px solid rgba(255,255,255,0.06);border-radius:12px;height:180px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px}}
.chart-label{{font-size:12px;color:#475569}}
.grid-3{{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-top:12px}}
.grid-item{{background:rgba(255,255,255,0.03);border-radius:8px;padding:12px;text-align:center}}
.grid-num{{font-size:22px;font-weight:800;color:{color}}}
.grid-label{{font-size:10px;color:#64748b;margin-top:2px}}
</style>
</head>
<body>
<div class="header">
  <div class="badge">{subtitle}</div>
  <div class="h1">{title}</div>
  <div class="sub">Humanoid Robotics Intelligence 2026 · AMORA Research</div>
</div>
{body_content}
</body>
</html>"""
    return html

# ── 中文预览章节 ───────────────────────────────────────────────

CN_A = gen_preview(
    title="Part A · 技术突破",
    subtitle="PRO 完整章节预览",
    color="#a855f7",
    lang="zh-CN",
    body_content="""
<div class="body">
  <div>
    <div class="card">
      <div class="card-title">双足人形机器人</div>
      <div class="card-text">国内人形机器人普遍进入小批量量产阶段，宇树H1定价65万元/台，傅利叶GR-1约50万元/台，智元远征A1约40万元/台。</div>
    </div>
    <div class="card" style="margin-top:12px">
      <div class="card-title">灵巧手自由度进化</div>
      <div class="card-text">主流灵巧手自由度从6DOF提升至20DOF以上，成本从3万元/只降至约8,000元/只。</div>
    </div>
  </div>
  <div>
    <div class="chart-placeholder">
      <div class="metric">20+</div>
      <div class="chart-label">主流灵巧手自由度 DOF</div>
    </div>
  </div>
</div>
<div class="grid-3">
  <div class="grid-item"><span class="grid-num">65万</span><div class="grid-label">宇树H1单价（元）</div></div>
  <div class="grid-item"><span class="grid-num">50万</span><div class="grid-label">傅利叶GR-1（元）</div></div>
  <div class="grid-item"><span class="grid-num">40万</span><div class="grid-label">智元远征A1（元）</div></div>
</div>
""")

CN_O = gen_preview(
    title="Part O · 商业落地",
    subtitle="PRO 完整章节预览",
    color="#22c55e",
    lang="zh-CN",
    body_content="""
<div class="body">
  <div>
    <div class="card">
      <div class="card-title">359家企业AMORA评分体系</div>
      <div class="card-text">收录全球359家人形机器人相关企业，基于Advancement/Mastery/Operations/Reach/Affinity五维评分模型，给出综合竞争力评价。</div>
    </div>
    <div class="card" style="margin-top:12px">
      <div class="card-title">四大应用场景</div>
      <div class="card-text">工业制造、科研教育、商业服务、家庭陪伴。宇树客户结构揭示真相：73.6%科研教育+9%企业导览，真正工业替代客户极少。</div>
    </div>
  </div>
  <div>
    <div class="chart-placeholder">
      <div class="metric">359</div>
      <div class="chart-label">收录企业总数</div>
    </div>
  </div>
</div>
<div class="grid-3">
  <div class="grid-item"><span class="grid-num">73.6%</span><div class="grid-label">科研教育占比</div></div>
  <div class="grid-item"><span class="grid-num">9%</span><div class="grid-label">企业导览占比</div></div>
  <div class="grid-item"><span class="grid-num">17.4%</span><div class="grid-label">工业替代占比</div></div>
</div>
""")

CN_R = gen_preview(
    title="Part R · 市场容量",
    subtitle="PRO 完整章节预览",
    color="#f97316",
    lang="zh-CN",
    body_content="""
<div class="body">
  <div>
    <div class="card">
      <div class="card-title">三情景市场预测</div>
      <div class="card-text">基准预测：2030年全球人形机器人出货量约50万台，市场规模约3,500亿元；乐观情景下有望突破1万亿元。</div>
    </div>
    <div class="card" style="margin-top:12px">
      <div class="card-title">渗透率分化</div>
      <div class="card-text">工业场景渗透率预计2028年达3%，2030年突破10%；消费场景更慢，预计2035年后才有显著规模。</div>
    </div>
  </div>
  <div>
    <div class="chart-placeholder">
      <div class="metric">3,500亿</div>
      <div class="chart-label">2030年市场规模（基准）</div>
    </div>
  </div>
</div>
<div class="grid-3">
  <div class="grid-item"><span class="grid-num">50万</span><div class="grid-label">2030年出货量（台）</div></div>
  <div class="grid-item"><span class="grid-num">1万亿</span><div class="grid-label">乐观情景（2030）</div></div>
  <div class="grid-item"><span class="grid-num">10%</span><div class="grid-label">2030工业渗透率</div></div>
</div>
""")

CN_A2 = gen_preview(
    title="Part A2 · 投资指南",
    subtitle="PRO 完整章节预览",
    color="#ec4899",
    lang="zh-CN",
    body_content="""
<div class="body">
  <div>
    <div class="card">
      <div class="card-title">AMORA Score 评分体系</div>
      <div class="card-text">基于Advancement（技术壁垒）/ Mastery（人才优势）/ Operations（商业落地）/ Reach（全球化能力）/ Affinity（可持续能力）五维框架，对企业进行综合评分。</div>
    </div>
    <div class="card" style="margin-top:12px">
      <div class="card-title">Top 20 排名亮点</div>
      <div class="card-text">宇树科技以8.9分位居榜首，UBTECH（6.8分）、Figure AI（7.1分）紧随其后；资本密集型与技术密集型企业分化明显。</div>
    </div>
  </div>
  <div>
    <div class="chart-placeholder">
      <div class="metric">8.9</div>
      <div class="chart-label">宇树科技 AMORA 总分</div>
    </div>
  </div>
</div>
<div class="grid-3">
  <div class="grid-item"><span class="grid-num">8.9</span><div class="grid-label">宇树科技</div></div>
  <div class="grid-item"><span class="grid-num">7.1</span><div class="grid-label">Figure AI</div></div>
  <div class="grid-item"><span class="grid-num">6.8</span><div class="grid-label">UBTECH</div></div>
</div>
""")

# ── 英文预览章节 ───────────────────────────────────────────────

EN_A = gen_preview(
    title="Part A · Technology Breakthrough",
    subtitle="PRO · Full Chapter Preview",
    color="#a855f7",
    lang="en",
    body_content="""
<div class="body">
  <div>
    <div class="card">
      <div class="card-title">Bipedal Humanoid Progress</div>
      <div class="card-text">China's humanoid robots have entered small-batch production. Unitree H1 priced at ¥650K/unit, Fourier GR-1 at ¥500K/unit, Zhiyuan A1 at ¥400K/unit.</div>
    </div>
    <div class="card" style="margin-top:12px">
      <div class="card-title">Dexterous Hand Evolution</div>
      <div class="card-text">Mainstream dexterous hands have evolved from 6DOF to 20+DOF, with costs dropping from ¥30K to ~¥8K per unit.</div>
    </div>
  </div>
  <div>
    <div class="chart-placeholder">
      <div class="metric">20+</div>
      <div class="chart-label">Mainstream Dexterous Hand DOF</div>
    </div>
  </div>
</div>
<div class="grid-3">
  <div class="grid-item"><span class="grid-num">¥650K</span><div class="grid-label">Unitree H1 Price</div></div>
  <div class="grid-item"><span class="grid-num">¥500K</span><div class="grid-label">Fourier GR-1</div></div>
  <div class="grid-item"><span class="grid-num">¥400K</span><div class="grid-label">Zhiyuan A1</div></div>
</div>
""")

EN_O = gen_preview(
    title="Part O · Commercial Deployment",
    subtitle="PRO · Full Chapter Preview",
    color="#22c55e",
    lang="en",
    body_content="""
<div class="body">
  <div>
    <div class="card">
      <div class="card-title">359-Company AMORA Scoring</div>
      <div class="card-text">Covers 359 global humanoid robotics companies, scored on Advancement/Mastery/Operations/Reach/Affinity — a five-dimensional competitive model.</div>
    </div>
    <div class="card" style="margin-top:12px">
      <div class="card-title">Four Application Scenarios</div>
      <div class="card-text">Industrial manufacturing, R&D/education, commercial services, home companionship. Unitree customer mix reveals: 73.6% R&D/education + 9% enterprise guides — true industrial substitution remains minimal.</div>
    </div>
  </div>
  <div>
    <div class="chart-placeholder">
      <div class="metric">359</div>
      <div class="chart-label">Companies Covered</div>
    </div>
  </div>
</div>
<div class="grid-3">
  <div class="grid-item"><span class="grid-num">73.6%</span><div class="grid-label">R&D / Education</div></div>
  <div class="grid-item"><span class="grid-num">9%</span><div class="grid-label">Enterprise Guide</div></div>
  <div class="grid-item"><span class="grid-num">17.4%</span><div class="grid-label">Industrial Use</div></div>
</div>
""")

EN_R = gen_preview(
    title="Part R · Market Reach",
    subtitle="PRO · Full Chapter Preview",
    color="#f97316",
    lang="en",
    body_content="""
<div class="body">
  <div>
    <div class="card">
      <div class="card-title">Three-Scenario Market Forecast</div>
      <div class="card-text">Base case: ~500K global humanoid robot shipments by 2030, market size ~¥3.5 trillion. Bull case could exceed ¥10 trillion.</div>
    </div>
    <div class="card" style="margin-top:12px">
      <div class="card-title">Penetration Rate Divergence</div>
      <div class="card-text">Industrial penetration expected to reach 3% by 2028, breaking 10% by 2030. Consumer scenarios lag — significant scale not expected before 2035.</div>
    </div>
  </div>
  <div>
    <div class="chart-placeholder">
      <div class="metric">¥3.5T</div>
      <div class="chart-label">2030 Market Size (Base Case)</div>
    </div>
  </div>
</div>
<div class="grid-3">
  <div class="grid-item"><span class="grid-num">500K</span><div class="grid-label">2030 Shipments (units)</div></div>
  <div class="grid-item"><span class="grid-num">¥10T</span><div class="grid-label">Bull Case 2030</div></div>
  <div class="grid-item"><span class="grid-num">10%</span><div class="grid-label">2030 Industrial Penetration</div></div>
</div>
""")

EN_A2 = gen_preview(
    title="Part A2 · Investment Guide",
    subtitle="PRO · Full Chapter Preview",
    color="#ec4899",
    lang="en",
    body_content="""
<div class="body">
  <div>
    <div class="card">
      <div class="card-title">AMORA Score Framework</div>
      <div class="card-text">Five-dimensional scoring: Advancement (tech moat) / Mastery (talent edge) / Operations (commercialization) / Reach (global reach) / Affinity (sustainability). Composite score out of 10.</div>
    </div>
    <div class="card" style="margin-top:12px">
      <div class="card-title">Top 20 Highlights</div>
      <div class="card-text">Unitree Tech leads with 8.9/10, followed by Figure AI (7.1), UBTECH (6.8). Capital-intensive vs. tech-intensive companies show clear divergence.</div>
    </div>
  </div>
  <div>
    <div class="chart-placeholder">
      <div class="metric">8.9</div>
      <div class="chart-label">Unitree Tech AMORA Score</div>
    </div>
  </div>
</div>
<div class="grid-3">
  <div class="grid-item"><span class="grid-num">8.9</span><div class="grid-label">Unitree Tech</div></div>
  <div class="grid-item"><span class="grid-num">7.1</span><div class="grid-label">Figure AI</div></div>
  <div class="grid-item"><span class="grid-num">6.8</span><div class="grid-label">UBTECH</div></div>
</div>
""")

# 写入文件
files = [
    (OUT + "hri-preview-part-a-cn.html", CN_A),
    (OUT + "hri-preview-part-o-cn.html", CN_O),
    (OUT + "hri-preview-part-r-cn.html", CN_R),
    (OUT + "hri-preview-part-a2-cn.html", CN_A2),
    (OUT + "hri-preview-part-a-en.html", EN_A),
    (OUT + "hri-preview-part-o-en.html", EN_O),
    (OUT + "hri-preview-part-r-en.html", EN_R),
    (OUT + "hri-preview-part-a2-en.html", EN_A2),
]
for path, content in files:
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Wrote {path.split('/')[-1]} ({len(content)} bytes)")

print("\nAll preview chapter files generated!")
