// HRI-2026 Humanoid Robot Index 2026 - PPT Generator v2
// Expanded 22-page version with Industry Map page
"use strict";

const pptxgen = require("pptxgenjs");
const path = require("path");

const OUTPUT = path.join(__dirname, "..", "HRI-2026-Report-Presentation-v2.pptx");

// Color Palette
const C = {
  navy:    "0D1B2A",
  navyMid: "1A2E42",
  teal:    "00B4D8",
  tealDim: "0077A8",
  mint:    "90E0EF",
  white:   "FFFFFF",
  offWhite:"CAF0F8",
  gray:    "8DA9BD",
  gold:    "FFD166",
  red:     "EF476F",
  green:   "06D6A0",
  slate:   "2D4A61",
  purple:  "C77DFF",
  orange:  "FF9F1C",
};

function makeShadow() {
  return { type: "outer", color: "000000", blur: 10, offset: 3, angle: 135, opacity: 0.35 };
}

function makeSoftShadow() {
  return { type: "outer", color: "000000", blur: 6, offset: 2, angle: 135, opacity: 0.2 };
}

function card(slide, x, y, w, h, fillColor, borderColor) {
  slide.addShape("rect", {
    x, y, w, h,
    fill: { color: fillColor || C.navyMid },
    line: { color: borderColor || C.slate, width: 1 },
    shadow: makeShadow(),
  });
}

function cardSoft(slide, x, y, w, h, fillColor) {
  slide.addShape("rect", {
    x, y, w, h,
    fill: { color: fillColor || C.navyMid },
    line: { color: C.slate, width: 0.5 },
    shadow: makeSoftShadow(),
  });
}

function titleBar(slide, text, sub) {
  slide.addShape("rect", { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.teal }, line: { color: C.teal, width: 0 } });
  slide.addText(text, {
    x: 0.55, y: 0.14, w: 9, h: 0.65,
    fontSize: 24, bold: true, color: C.white, fontFace: "Arial Black",
    margin: 0, charSpacing: 1,
  });
  if (sub) {
    slide.addText(sub, {
      x: 0.55, y: 0.80, w: 8.5, h: 0.32,
      fontSize: 11, color: C.teal, fontFace: "Calibri", margin: 0, italic: true,
    });
  }
}

function accentLine(slide, x, y, h, color) {
  slide.addShape("rect", { x, y, w: 0.06, h, fill: { color: color || C.teal }, line: { color: color || C.teal, width: 0 } });
}

function footer(slide, text) {
  slide.addShape("rect", { x: 0, y: 5.20, w: 10, h: 0.425, fill: { color: C.navyMid }, line: { color: C.navyMid, width: 0 } });
  slide.addText(text || "AMORA Insights  |  Humanoid Robot Index 2026  |  Data Cut-off: Q1 2026", {
    x: 0.55, y: 5.26, w: 9, h: 0.32,
    fontSize: 9, color: C.gray, fontFace: "Calibri", margin: 0,
  });
}

function pageNum(slide, n, total) {
  slide.addText(`${n} / ${total}`, {
    x: 9.1, y: 5.26, w: 0.5, h: 0.32,
    fontSize: 9, color: C.teal, fontFace: "Calibri", align: "right", margin: 0,
  });
}

function bigNum(slide, x, y, w, h, num, label, color) {
  cardSoft(slide, x, y, w, h, C.navyMid);
  slide.addShape("rect", { x, y, w, h: 0.06, fill: { color: color }, line: { color: color, width: 0 } });
  slide.addText(num, {
    x, y: y + 0.12, w, h: h * 0.55,
    fontSize: Math.round(h * 22), bold: true, color: color, fontFace: "Arial Black",
    align: "center", valign: "middle", margin: 0,
  });
  slide.addText(label, {
    x: x + 0.1, y: y + h - 0.45, w: w - 0.2, h: 0.38,
    fontSize: 9, color: C.gray, fontFace: "Calibri",
    align: "center", valign: "top", margin: 0,
  });
}

// =========================================================
// Presentation Setup
// =========================================================
const TOTAL_SLIDES = 22;
let pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "AMORA Insights";
pres.title = "The Humanoid Robot Index 2026";
pres.subject = "Global humanoid robot industry benchmarking - Expanded 22 Slides";

// =========================================================
// SLIDE 1 - Cover
// =========================================================
{
  let sl = pres.addSlide();
  sl.background = { color: C.navy };

  sl.addShape("rect", { x: 0, y: 0, w: 0.12, h: 5.625, fill: { color: C.teal }, line: { color: C.teal, width: 0 } });
  for (let i = 0; i < 6; i++) {
    sl.addShape("rect", { x: 0.12, y: i * 0.95, w: 9.88, h: 0.008, fill: { color: C.slate, transparency: 70 }, line: { color: C.slate, width: 0 } });
  }

  // Animated dot pattern (decorative circles)
  const dots = [
    { x: 7.5, y: 0.8, s: 0.12, c: C.teal, t: 90 },
    { x: 8.1, y: 1.3, s: 0.08, c: C.mint, t: 80 },
    { x: 7.8, y: 1.8, s: 0.15, c: C.gold, t: 85 },
    { x: 8.5, y: 2.1, s: 0.06, c: C.purple, t: 75 },
    { x: 7.3, y: 2.5, s: 0.1, c: C.green, t: 80 },
    { x: 8.8, y: 0.5, s: 0.07, c: C.orange, t: 70 },
  ];
  dots.forEach(d => {
    sl.addShape("ellipse", { x: d.x, y: d.y, w: d.s, h: d.s, fill: { color: d.c, transparency: d.t }, line: { color: d.c, width: 0 } });
  });

  card(sl, 0.55, 0.65, 2.8, 0.42, C.tealDim);
  sl.addText("INDUSTRY INTELLIGENCE REPORT", {
    x: 0.55, y: 0.65, w: 2.8, h: 0.42,
    fontSize: 9, bold: true, color: C.white, fontFace: "Calibri",
    align: "center", valign: "middle", margin: 0, charSpacing: 2,
  });

  sl.addText("The Humanoid", { x: 0.55, y: 1.25, w: 8.5, h: 0.95, fontSize: 54, bold: true, color: C.white, fontFace: "Arial Black", margin: 0 });
  sl.addText("Robot Index", { x: 0.55, y: 2.15, w: 8.5, h: 0.95, fontSize: 54, bold: true, color: C.teal, fontFace: "Arial Black", margin: 0 });
  sl.addText("2026", { x: 0.55, y: 3.05, w: 3.0, h: 0.85, fontSize: 54, bold: true, color: C.gold, fontFace: "Arial Black", margin: 0 });

  sl.addText("Who's Actually Winning?", { x: 0.55, y: 3.92, w: 8.5, h: 0.40, fontSize: 17, italic: true, color: C.mint, fontFace: "Calibri", margin: 0 });
  sl.addText("A Cross-Border Benchmarking of 25 Global Players Across the Full Value Chain", {
    x: 0.55, y: 4.32, w: 8.5, h: 0.34, fontSize: 11, color: C.gray, fontFace: "Calibri", margin: 0,
  });

  footer(sl);
  pageNum(sl, 1, TOTAL_SLIDES);
}

// =========================================================
// SLIDE 2 - Table of Contents
// =========================================================
{
  let sl = pres.addSlide();
  sl.background = { color: C.navy };
  titleBar(sl, "Contents", "AMORA Report Framework — 5 Dimensions | 22 Slides");

  const sections = [
    { letter: "A", color: C.teal,  title: "Advancement",   sub: "技术先进性 — 世界模型 · 端到端控制 · 灵巧手" },
    { letter: "M", color: C.mint,  title: "Mapping",        sub: "产业链生态位 — 供应链全景 · 卡脖子清单 · 中美对比" },
    { letter: "O", color: C.gold,  title: "Operations",     sub: "商业化运营 — 四大场景 · 客户结构 · ROI分析" },
    { letter: "R", color: C.green, title: "Reach",           sub: "市场容量 — 三情景预测 · 细分市场 · 全球化策略" },
    { letter: "A2", color: C.red,  title: "Assets",          sub: "资本价值 — 财务对比 · 估值矩阵 · 投资建议" },
  ];

  const startY = 1.22;
  const rowH   = 0.74;

  sections.forEach((s, i) => {
    const y = startY + i * rowH;
    card(sl, 0.55, y, 8.9, rowH - 0.06, C.navyMid);
    accentLine(sl, 0.55, y, rowH - 0.06, s.color);

    sl.addShape("rect", { x: 0.7, y: y + 0.1, w: 0.44, h: 0.44, fill: { color: s.color }, line: { color: s.color, width: 0 } });
    sl.addText(s.letter, {
      x: 0.7, y: y + 0.1, w: 0.44, h: 0.44,
      fontSize: 14, bold: true, color: C.navy, fontFace: "Arial Black",
      align: "center", valign: "middle", margin: 0,
    });
    sl.addText(s.title, { x: 1.28, y: y + 0.07, w: 4.5, h: 0.35, fontSize: 15, bold: true, color: C.white, fontFace: "Arial Black", margin: 0 });
    sl.addText(s.sub,   { x: 1.28, y: y + 0.40, w: 7.8, h: 0.24, fontSize: 10, color: C.gray, fontFace: "Calibri", margin: 0 });
  });
  footer(sl);
  pageNum(sl, 2, TOTAL_SLIDES);
}

// =========================================================
// SLIDE 3 - Executive Summary
// =========================================================
{
  let sl = pres.addSlide();
  sl.background = { color: C.navy };
  titleBar(sl, "Executive Summary", "3 Key Findings  |  Industry Rating 7.2/10");

  card(sl, 0.55, 1.22, 8.9, 0.58, C.tealDim);
  sl.addText('"Only 3 of 25 tracked companies have deployed 50+ units in real-world settings. The rest are still selling demos."', {
    x: 0.7, y: 1.25, w: 8.5, h: 0.55,
    fontSize: 12, italic: true, bold: true, color: C.white, fontFace: "Calibri",
    align: "center", valign: "middle", margin: 0,
  });

  const findings = [
    { num: "01", title: "中国赢在制造密度，美国赢在算法深度", body: "叙事已不完整：中国正快速补齐算法短板，美国制造护城河被供应链空心化侵蚀。", color: C.teal },
    { num: "02", title: "真正拉开差距的不是硬件参数，是数据闭环", body: "谁能更快积累真实场景运行数据，谁就掌握了训练下一代模型的主动权。", color: C.gold },
    { num: "03", title: "关键变量：商业化复制成本，而非技术迭代速度", body: "能否从1台原型机做到100台部署，是目前所有玩家面临的共同瓶颈。", color: C.green },
  ];

  findings.forEach((f, i) => {
    const y = 1.95 + i * 1.05;
    card(sl, 0.55, y, 8.9, 0.93, C.navyMid);
    accentLine(sl, 0.55, y, 0.93, f.color);
    sl.addShape("rect", { x: 0.7, y: y + 0.24, w: 0.44, h: 0.44, fill: { color: f.color }, line: { color: f.color, width: 0 } });
    sl.addText(f.num, { x: 0.7, y: y + 0.24, w: 0.44, h: 0.44, fontSize: 13, bold: true, color: C.navy, fontFace: "Arial Black", align: "center", valign: "middle", margin: 0 });
    sl.addText(f.title, { x: 1.28, y: y + 0.10, w: 8.1, h: 0.36, fontSize: 13, bold: true, color: C.mint, fontFace: "Calibri", margin: 0 });
    sl.addText(f.body,  { x: 1.28, y: y + 0.50, w: 8.1, h: 0.35, fontSize: 11, color: C.gray, fontFace: "Calibri", margin: 0 });
  });

  // Bottom KPI strip
  const kpis = [
    { val: "25", lbl: "追踪企业" },
    { val: "7.2", lbl: "行业评分" },
    { val: "4", lbl: "应用场景" },
    { val: "2030", lbl: "规模节点" },
  ];
  kpis.forEach((k, i) => {
    const x = 0.55 + i * 2.3;
    cardSoft(sl, x, 5.05, 2.1, 0.48, C.navyMid);
    sl.addText(k.val, { x, y: 5.05, w: 1.2, h: 0.48, fontSize: 16, bold: true, color: C.teal, fontFace: "Arial Black", align: "center", valign: "middle", margin: 0 });
    sl.addText(k.lbl, { x: x + 1.15, y: 5.05, w: 0.9, h: 0.48, fontSize: 9, color: C.gray, fontFace: "Calibri", align: "left", valign: "middle", margin: 0 });
  });

  footer(sl);
  pageNum(sl, 3, TOTAL_SLIDES);
}

// =========================================================
// SLIDE 4 - Advancement: World Model
// =========================================================
{
  let sl = pres.addSlide();
  sl.background = { color: C.navy };
  titleBar(sl, "A — Advancement  世界模型", "Transformer 3D 场景表征 · Sim2Real Gap · 中美算力竞赛");

  // Left column: explanation
  card(sl, 0.55, 1.22, 4.2, 3.92, C.navyMid);
  sl.addShape("rect", { x: 0.55, y: 1.22, w: 4.2, h: 0.07, fill: { color: C.teal }, line: { color: C.teal, width: 0 } });
  sl.addText("什么是世界模型？", { x: 0.7, y: 1.34, w: 4, h: 0.38, fontSize: 13, bold: true, color: C.white, fontFace: "Calibri", margin: 0 });
  sl.addShape("rect", { x: 0.7, y: 1.75, w: 3.9, h: 0.02, fill: { color: C.slate }, line: { color: C.slate, width: 0 } });
  sl.addText(
    "世界模型（World Model）是机器人感知、推理与物理交互的" +
    "基础层。它让机器人理解三维空间、物理规律和因果关系，" +
    "从而在未见过的场景中做出合理决策。\n\n" +
    "• 3D 场景重建：NeRF / Gaussian Splatting\n" +
    "• 物理仿真：NVIDIA Isaac Sim / Mujoco\n" +
    "• 数据引擎：Tesla Dojo / Figure AI\n" +
    "• Sim2Real Gap：仿真与真实的泛化差距仍是最大挑战",
    { x: 0.7, y: 1.82, w: 3.9, h: 3.2, fontSize: 11, color: C.gray, fontFace: "Calibri", margin: 0, paraSpaceAfter: 6 }
  );

  // Right: player comparison
  const players = [
    { name: "Tesla Dojo",  country: "🇺🇸", status: "算力最强",   color: C.orange },
    { name: "NVIDIA Isaac", country: "🇺🇸", status: "仿真平台",   color: C.teal   },
    { name: "Figure AI",   country: "🇺🇸", status: "数据闭环",   color: C.mint   },
    { name: "宇树 Unitree", country: "🇨🇳", status: "快速追赶",   color: C.gold   },
    { name: "智元 Agibot",  country: "🇨🇳", status: "强化学习",   color: C.green  },
    { name: "傅利叶 Fourier", country: "🇨🇳", status: "医疗场景",  color: C.purple },
  ];

  const startY = 1.22;
  const rowH2 = 0.63;
  players.forEach((p, i) => {
    const y = startY + i * rowH2;
    cardSoft(sl, 4.95, y, 4.5, rowH2 - 0.05, C.navyMid);
    sl.addText(p.country, { x: 5.05, y: y + 0.08, w: 0.5, h: 0.42, fontSize: 14, align: "center", valign: "middle", margin: 0 });
    sl.addText(p.name, { x: 5.6, y: y + 0.08, w: 1.8, h: 0.42, fontSize: 11, bold: true, color: C.white, fontFace: "Calibri", valign: "middle", margin: 0 });
    sl.addShape("rect", { x: 7.4, y: y + 0.16, w: 0.06, h: 0.28, fill: { color: p.color }, line: { color: p.color, width: 0 } });
    sl.addText(p.status, { x: 7.55, y: y + 0.08, w: 1.8, h: 0.42, fontSize: 10, color: p.color, fontFace: "Calibri", valign: "middle", margin: 0 });
  });

  footer(sl);
  pageNum(sl, 4, TOTAL_SLIDES);
}

// =========================================================
// SLIDE 5 - Advancement: E2E Control & Dexterous Hand
// =========================================================
{
  let sl = pres.addSlide();
  sl.background = { color: C.navy };
  titleBar(sl, "A — Advancement  端到端控制 & 灵巧手", "VLA 架构 · 触觉反馈 · 23 DOF 临界点");

  // Left: E2E Control
  card(sl, 0.55, 1.22, 4.2, 3.92, C.navyMid);
  sl.addShape("rect", { x: 0.55, y: 1.22, w: 4.2, h: 0.07, fill: { color: C.mint }, line: { color: C.mint, width: 0 } });
  sl.addText("端到端控制 VLA 架构", { x: 0.7, y: 1.34, w: 4, h: 0.38, fontSize: 13, bold: true, color: C.white, fontFace: "Calibri", margin: 0 });
  sl.addShape("rect", { x: 0.7, y: 1.75, w: 3.9, h: 0.02, fill: { color: C.slate }, line: { color: C.slate, width: 0 } });
  sl.addText(
    "VLA = Vision-Language-Action Model\n视觉-语言-动作一体化，端到端输出关节控制信号，\n无需人工设计控制层级。\n\n" +
    "代表进展：\n" +
    "• Figure x OpenAI：Figure 01 展示多轮对话操控\n" +
    "• Agility Robotics：Digit 仓库场景稳定部署\n" +
    "• 智元智元：强化学习控制精度提升 40%\n" +
    "• Boston Dynamics：Atlas 电动版全面转向 AI\n\n" +
    "核心瓶颈：Sim2Real Gap 导致仿真中表现优异的\n" +
    "模型在真实场景泛化性能下降 30-50%",
    { x: 0.7, y: 1.82, w: 3.9, h: 3.2, fontSize: 11, color: C.gray, fontFace: "Calibri", margin: 0, paraSpaceAfter: 5 }
  );

  // Right: Dexterous Hand
  card(sl, 5.05, 1.22, 4.4, 3.92, C.navyMid);
  sl.addShape("rect", { x: 5.05, y: 1.22, w: 4.4, h: 0.07, fill: { color: C.gold }, line: { color: C.gold, width: 0 } });
  sl.addText("灵巧手 20-23 DOF", { x: 5.2, y: 1.34, w: 4.1, h: 0.38, fontSize: 13, bold: true, color: C.white, fontFace: "Calibri", margin: 0 });
  sl.addShape("rect", { x: 5.2, y: 1.75, w: 4.1, h: 0.02, fill: { color: C.slate }, line: { color: C.slate, width: 0 } });

  const handData = [
    { co: "宇树 Unitree", dof: "20 DOF", price: "$2,000", edge: "成本最优", color: C.teal },
    { co: "Tesla Optimus", dof: "22 DOF", price: "自研",   edge: "触觉传感最深", color: C.orange },
    { co: "智元智元",    dof: "23 DOF", price: "自研",   edge: "刚度调节", color: C.green },
    { co: "傅利叶 Fourier", dof: "19 DOF", price: "医疗级", edge: "医疗场景适配", color: C.purple },
  ];

  handData.forEach((h, i) => {
    const y = 1.82 + i * 0.78;
    cardSoft(sl, 5.2, y, 4.0, 0.70, C.navyMid);
    sl.addShape("rect", { x: 5.2, y, w: 0.06, h: 0.70, fill: { color: h.color }, line: { color: h.color, width: 0 } });
    sl.addText(h.co,    { x: 5.36, y: y + 0.06, w: 1.8, h: 0.28, fontSize: 11, bold: true, color: C.white, fontFace: "Calibri", margin: 0 });
    sl.addText(h.dof,    { x: 7.2, y: y + 0.06, w: 1.0, h: 0.28, fontSize: 11, bold: true, color: h.color, fontFace: "Arial Black", margin: 0 });
    sl.addText(h.price + " | " + h.edge, { x: 5.36, y: y + 0.36, w: 3.8, h: 0.26, fontSize: 10, color: C.gray, fontFace: "Calibri", margin: 0 });
  });

  sl.addText("⚠ 触觉反馈仍是全行业最大短板", { x: 5.2, y: 4.98, w: 4.1, h: 0.24, fontSize: 9, color: C.red, fontFace: "Calibri", italic: true, margin: 0 });

  footer(sl);
  pageNum(sl, 5, TOTAL_SLIDES);
}

// =========================================================
// SLIDE 6 - Advancement: Key Technology Timeline
// =========================================================
{
  let sl = pres.addSlide();
  sl.background = { color: C.navy };
  titleBar(sl, "A — Advancement  技术演进时间轴", "关键里程碑 · 中美节点对比 · 2020-2030");

  // Timeline baseline
  const years = ["2020", "2021", "2022", "2023", "2024", "2025", "2026E", "2027E", "2028E"];
  const baseY = 4.2;
  const startX = 0.8;
  const stepX = 1.0;

  sl.addShape("rect", { x: startX, y: baseY, w: 8.4, h: 0.025, fill: { color: C.slate }, line: { color: C.slate, width: 0 } });

  years.forEach((yr, i) => {
    const x = startX + i * stepX;
    sl.addShape("ellipse", { x: x - 0.06, y: baseY - 0.06, w: 0.18, h: 0.18, fill: { color: C.teal }, line: { color: C.teal, width: 0 } });
    sl.addText(yr, { x: x - 0.3, y: baseY + 0.18, w: 0.7, h: 0.28, fontSize: 9, color: C.gray, fontFace: "Calibri", align: "center", margin: 0 });
  });

  // US milestones (above)
  const usMile = [
    { i: 0, text: "Boston Dynamics\n开源 Atlas",    c: C.orange },
    { i: 1, text: "Tesla AI Day\n公布 Optimus",       c: C.orange },
    { i: 3, text: "Figure AI\n成立",                  c: C.red   },
    { i: 4, text: "Figure-OpenAI\n战略合作",           c: C.red   },
    { i: 5, text: "Agility IPO\n(NASDAQ)",           c: C.purple},
    { i: 7, text: "L4 级别\n室内自主",               c: C.purple},
  ];

  usMile.forEach(m => {
    const x = startX + m.i * stepX;
    const y = baseY - 0.85 - (m.i % 2) * 0.1;
    sl.addShape("rect", { x: x - 0.5, y: y, w: 1.0, h: 0.75, fill: { color: C.navyMid }, line: { color: m.c, width: 1 }, shadow: makeSoftShadow() });
    sl.addShape("rect", { x: x - 0.5, y: y, w: 1.0, h: 0.04, fill: { color: m.c }, line: { color: m.c, width: 0 } });
    sl.addText(m.text, { x: x - 0.48, y: y + 0.06, w: 0.96, h: 0.65, fontSize: 8, color: C.white, fontFace: "Calibri", align: "center", valign: "middle", margin: 0 });
    sl.addShape("rect", { x: x - 0.01, y: y + 0.75, w: 0.02, h: baseY - y - 0.75, fill: { color: m.c, transparency: 50 }, line: { color: m.c, width: 0 } });
  });

  // China milestones (below)
  const cnMile = [
    { i: 1, text: "宇树四足\n批量出货",             c: C.teal  },
    { i: 2, text: "智元成立\n(Agibot)",              c: C.green },
    { i: 3, text: "傅利叶成立\n(Fourier)",           c: C.green },
    { i: 4, text: "宇树 H1\n人形首发",               c: C.teal  },
    { i: 5, text: "宇树招股书\n披露规模化数据",       c: C.gold  },
    { i: 6, text: "国产 VLA\n密集突破",              c: C.mint  },
  ];

  cnMile.forEach(m => {
    const x = startX + m.i * stepX;
    const y = baseY + 0.3 + (m.i % 2) * 0.1;
    sl.addShape("rect", { x: x - 0.5, y: y, w: 1.0, h: 0.72, fill: { color: C.navyMid }, line: { color: m.c, width: 1 }, shadow: makeSoftShadow() });
    sl.addShape("rect", { x: x - 0.5, y: y + 0.68, w: 1.0, h: 0.04, fill: { color: m.c }, line: { color: m.c, width: 0 } });
    sl.addText(m.text, { x: x - 0.48, y: y + 0.04, w: 0.96, h: 0.60, fontSize: 8, color: C.white, fontFace: "Calibri", align: "center", valign: "middle", margin: 0 });
  });

  // Legend
  sl.addShape("rect", { x: 0.55, y: 1.22, w: 0.2, h: 0.2, fill: { color: C.orange }, line: { color: C.orange, width: 0 } });
  sl.addText("🇺🇸 美国", { x: 0.8, y: 1.20, w: 1.2, h: 0.24, fontSize: 10, color: C.gray, fontFace: "Calibri", margin: 0 });
  sl.addShape("rect", { x: 2.1, y: 1.22, w: 0.2, h: 0.2, fill: { color: C.teal }, line: { color: C.teal, width: 0 } });
  sl.addText("🇨🇳 中国", { x: 2.35, y: 1.20, w: 1.2, h: 0.24, fontSize: 10, color: C.gray, fontFace: "Calibri", margin: 0 });

  footer(sl);
  pageNum(sl, 6, TOTAL_SLIDES);
}

// =========================================================
// SLIDE 7 - Mapping: Industry Map (The Infographic)
// =========================================================
{
  let sl = pres.addSlide();
  sl.background = { color: "050d1a" }; // Deeper navy for map page

  // Top header
  sl.addShape("rect", { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.mint }, line: { color: C.mint, width: 0 } });
  sl.addText("M — Mapping  人形机器人产业链图谱", {
    x: 0.55, y: 0.14, w: 9, h: 0.65,
    fontSize: 24, bold: true, color: C.white, fontFace: "Arial Black", margin: 0,
  });
  sl.addText("6层供应链结构 · 中美能力对比 · 卡脖子清单", {
    x: 0.55, y: 0.80, w: 8.5, h: 0.32,
    fontSize: 11, color: C.mint, fontFace: "Calibri", margin: 0, italic: true,
  });

  // --- 6-layer supply chain ---

  const layers = [
    {
      name: "L1 终端产品",
      color: C.red,
      bg: "1a1a2e",
      companies: "Tesla Optimus · Boston Dynamics Atlas · 宇树 H1 · 傅利叶 GR-1 · 智元智元",
      status: "商业化早期",
      statusColor: C.gold,
    },
    {
      name: "L2 核心零部件",
      color: C.orange,
      bg: "16213e",
      companies: "关节模组 · 灵巧手 · 传感器融合 · 线束集成",
      status: "国产替代中",
      statusColor: C.orange,
    },
    {
      name: "L3 关键元器件",
      color: C.gold,
      bg: "1a1a2e",
      companies: "无框力矩电机 · 谐波减速器 · 行星滚柱丝杠 · 轴承",
      status: "卡脖子",
      statusColor: C.red,
    },
    {
      name: "L4 传感器",
      color: C.green,
      bg: "16213e",
      companies: "视觉(深度相机) · 力矩传感 · IMU · 触觉阵列 · 嗅觉",
      status: "快速追赶",
      statusColor: C.green,
    },
    {
      name: "L5 AI & 芯片",
      color: C.teal,
      bg: "1a1a2e",
      companies: "VLA 大模型 · NVIDIA Thor / Jetson · 特斯拉 FSD 芯片 · 华为昇腾",
      status: "中美分化",
      statusColor: C.mint,
    },
    {
      name: "L6 基础层",
      color: C.purple,
      bg: "16213e",
      companies: "云计算 · 仿真平台 · 开源框架 · 数据标注 · 算力基础设施",
      status: "全球化协作",
      statusColor: C.purple,
    },
  ];

  const startY = 1.18;
  const layerH = 0.66;
  const gapY  = 0.06;

  layers.forEach((l, i) => {
    const y = startY + i * (layerH + gapY);

    // Layer bar
    sl.addShape("rect", { x: 0.55, y, w: 6.5, h: layerH, fill: { color: l.bg }, line: { color: l.color, width: 1 }, shadow: makeSoftShadow() });
    sl.addShape("rect", { x: 0.55, y, w: 0.08, h: layerH, fill: { color: l.color }, line: { color: l.color, width: 0 } });

    sl.addText(l.name, { x: 0.72, y: y + 0.06, w: 1.45, h: 0.3, fontSize: 10, bold: true, color: l.color, fontFace: "Calibri", margin: 0 });
    sl.addText(l.companies, { x: 0.72, y: y + 0.32, w: 5.8, h: 0.28, fontSize: 9, color: C.gray, fontFace: "Calibri", margin: 0 });

    // Status badge
    sl.addShape("rect", { x: 6.3, y: y + 0.16, w: 0.68, h: 0.34, fill: { color: l.statusColor, transparency: 20 }, line: { color: l.statusColor, width: 1 } });
    sl.addText(l.status, { x: 6.3, y: y + 0.16, w: 0.68, h: 0.34, fontSize: 7.5, bold: true, color: l.statusColor, fontFace: "Calibri", align: "center", valign: "middle", margin: 0 });
  });

  // Right: China vs US comparison panel
  const panelX = 7.3;
  card(sl, panelX, 1.18, 2.15, 4.42, "0a1628");

  sl.addText("中美能力对比", { x: panelX + 0.1, y: 1.26, w: 1.95, h: 0.32, fontSize: 11, bold: true, color: C.white, fontFace: "Calibri", margin: 0 });
  sl.addShape("rect", { x: panelX + 0.1, y: 1.6, w: 1.95, h: 0.02, fill: { color: C.slate }, line: { color: C.slate, width: 0 } });

  const comparisons = [
    { dim: "算力/AI",   cn: "★★★☆☆", us: "★★★★★" },
    { dim: "制造/供应链", cn: "★★★★★", us: "★★☆☆☆" },
    { dim: "传感器",    cn: "★★★☆☆", us: "★★★★☆" },
    { dim: "整机集成",  cn: "★★★★☆", us: "★★★★☆" },
    { dim: "商业化落地", cn: "★★☆☆☆", us: "★★★☆☆" },
    { dim: "数据闭环",  cn: "★★☆☆☆", us: "★★★★★" },
  ];

  comparisons.forEach((c2, i) => {
    const y = 1.68 + i * 0.48;
    sl.addText(c2.dim, { x: panelX + 0.1, y, w: 1.95, h: 0.22, fontSize: 9, color: C.gray, fontFace: "Calibri", margin: 0 });
    sl.addText("🇨🇳 " + c2.cn, { x: panelX + 0.1, y: y + 0.2, w: 0.9, h: 0.24, fontSize: 8.5, color: C.teal, fontFace: "Calibri", margin: 0 });
    sl.addText("🇺🇸 " + c2.us, { x: panelX + 1.05, y: y + 0.2, w: 0.9, h: 0.24, fontSize: 8.5, color: C.orange, fontFace: "Calibri", margin: 0 });
  });

  // Bottom note
  card(sl, 0.55, 5.05, 9.35, 0.48, "0a1628");
  sl.addText("⚠ 卡脖子环节：谐波减速器（哈默纳科/绿的谐波）、行星滚柱丝杠（瑞士 GSA/中国华茂）、触觉传感器（选代/敏芯微）、高端轴承（NSK/SKF）", {
    x: 0.7, y: 5.10, w: 9.0, h: 0.38, fontSize: 9, color: C.red, fontFace: "Calibri", margin: 0, valign: "middle",
  });

  pageNum(sl, 7, TOTAL_SLIDES);
}

// =========================================================
// SLIDE 8 - Mapping: Key Bottlenecks
// =========================================================
{
  let sl = pres.addSlide();
  sl.background = { color: C.navy };
  titleBar(sl, "M — Mapping  卡脖子清单与国产替代", "6 大核心瓶颈 · 国产化率 · 替代时间窗口");

  // 6 bottleneck cards (2x3 grid)
  const bottlenecks = [
    {
      name: "谐波减速器",    import: "日本哈默纳科(全球70%)", cn: "绿的谐波(国产替代)", rate: "国产率 ~18%",    risk: "极高",  color: C.red,
      detail: "绿的 RV + 来福谐波已量产，但精度寿命仍差 30%，高端系列依赖日韩",
    },
    {
      name: "行星滚柱丝杠",  import: "瑞士 GSA / 德国 INA",   cn: "中国华茂 / 南京工艺",  rate: "国产率 ~12%",    risk: "极高",  color: C.red,
      detail: "国产刚起步，精度保持性差，人形 1.5m/s 行走要求超出现有国产规格",
    },
    {
      name: "触觉传感器",    import: "美国 Tacter / 德国 Bio",  cn: "选代传感 / 敏芯微",   rate: "国产率 ~25%",    risk: "高",    color: C.orange,
      detail: "柔性阵列触觉是真正卡点，单点精度达标但面阵集成能力差距大",
    },
    {
      name: "无框力矩电机",  import: "美国科尔摩根 / 瑞士",   cn: "步科 / 汇川技术",     rate: "国产率 ~40%",    risk: "中高",  color: C.gold,
      detail: "国内步科、汇川已能覆盖中端需求，高转矩密度系列（>20Nm/kg）依赖进口",
    },
    {
      name: "深度视觉传感器", import: "Intel RealSense",   cn: "奥比中光 / 华为",  rate: "国产率 ~50%",  risk: "中",    color: C.green,
      detail: "消费级够用，工业级（防爆、抗强光）差距缩小，但算法生态差距明显",
    },
    {
      name: "AI 芯片",      import: "NVIDIA Thor / Jetson",   cn: "华为昇腾 / 地平线",   rate: "国产率 ~30%",    risk: "中",    color: C.green,
      detail: "昇腾 910B 单卡算力接近 A100，出口管制加速国产替代，但生态工具链差距仍在",
    },
  ];

  const bx = 0.55, by = 1.22, bw = 2.93, bh = 1.85, bgx = 0.1, bgy = 0.1;

  bottlenecks.forEach((b, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = bx + col * (bw + bgx);
    const y = by + row * (bh + bgy);

    card(sl, x, y, bw, bh, C.navyMid);
    sl.addShape("rect", { x, y, w: bw, h: 0.07, fill: { color: b.color }, line: { color: b.color, width: 0 } });
    sl.addShape("rect", { x, y, w: 0.07, h: bh, fill: { color: b.color }, line: { color: b.color, width: 0 } });

    sl.addText(b.name, { x: x + 0.14, y: y + 0.10, w: bw - 0.2, h: 0.3, fontSize: 12, bold: true, color: C.white, fontFace: "Calibri", margin: 0 });
    sl.addText("进口: " + b.import, { x: x + 0.14, y: y + 0.38, w: bw - 0.2, h: 0.24, fontSize: 8.5, color: C.red, fontFace: "Calibri", margin: 0 });
    sl.addText("国产: " + b.cn,     { x: x + 0.14, y: y + 0.60, w: bw - 0.2, h: 0.24, fontSize: 8.5, color: C.green, fontFace: "Calibri", margin: 0 });
    sl.addText(b.rate,  { x: x + 0.14, y: y + 0.82, w: bw - 0.2, h: 0.22, fontSize: 9.5, bold: true, color: b.color, fontFace: "Arial Black", margin: 0 });
    sl.addText(b.detail, { x: x + 0.14, y: y + 1.08, w: bw - 0.2, h: 0.68, fontSize: 8.5, color: C.gray, fontFace: "Calibri", margin: 0 });
  });

  footer(sl);
  pageNum(sl, 8, TOTAL_SLIDES);
}

// =========================================================
// SLIDE 9 - Operations: Four Application Scenarios
// =========================================================
{
  let sl = pres.addSlide();
  sl.background = { color: C.navy };
  titleBar(sl, "O — Operations  四大应用场景", "工厂制造 · 仓储物流 · 医疗康复 · 家庭服务");

  const scenarios = [
    {
      name: "🏭 工业制造",
      icon: "Factory",
      color: C.orange,
      players: "Tesla / 智元 / BMW 合作",
      stage: "试点阶段",
      stageColor: C.gold,
      pros: "替代 3D/危险岗位 · 解决用工荒",
      cons: "精度要求高 · 改造成本大",
      unitCost: "$50K-$150K",
      roi: "IRR ~15%",
      data: "真实部署: <50台",
    },
    {
      name: "📦 仓储物流",
      icon: "Warehouse",
      color: C.teal,
      players: "Agility / 宇树 / 顺丰",
      stage: "早期商业化",
      stageColor: C.mint,
      pros: "替代搬运工 · 7×24h 运转",
      cons: "场景复杂度高 · ROI 争议",
      unitCost: "$30K-$80K",
      roi: "IRR ~20%",
      data: "真实部署: 100-500台",
    },
    {
      name: "🏥 医疗康复",
      icon: "Medical",
      color: C.green,
      players: "傅利叶 / Exiii / Sanctuary",
      stage: "临床前/临床中",
      stageColor: C.green,
      pros: "老龄化刚需 · 溢价空间高",
      cons: "监管周期长 · 技术成熟度低",
      unitCost: "$80K-$200K",
      roi: "IRR ~12% (长期)",
      data: "真实部署: <20台",
    },
    {
      name: "🏠 家庭服务",
      icon: "Home",
      color: C.purple,
      players: "1X / Figure / 小鹏",
      stage: "愿景阶段",
      stageColor: C.gray,
      pros: "全球最大市场 · 技术成熟后爆发",
      cons: "安全性要求极高 · 量产成本难题",
      unitCost: "目标 $20K",
      roi: "ROI 不明确",
      data: "真实部署: 0台",
    },
  ];

  const colW = 2.25;
  const startX = 0.55;

  scenarios.forEach((s, i) => {
    const x = startX + i * (colW + 0.1);
    card(sl, x, 1.22, colW, 4.0, C.navyMid);
    sl.addShape("rect", { x, y: 1.22, w: colW, h: 0.07, fill: { color: s.color }, line: { color: s.color, width: 0 } });

    sl.addText(s.name, { x: x + 0.1, y: 1.32, w: colW - 0.2, h: 0.38, fontSize: 12, bold: true, color: C.white, fontFace: "Calibri", margin: 0 });
    sl.addShape("rect", { x: x + 0.1, y: 1.72, w: colW - 0.2, h: 0.02, fill: { color: C.slate }, line: { color: C.slate, width: 0 } });

    // Stage badge
    sl.addShape("rect", { x: x + 0.1, y: 1.80, w: 0.95, h: 0.28, fill: { color: s.stageColor, transparency: 20 }, line: { color: s.stageColor, width: 1 } });
    sl.addText(s.stage, { x: x + 0.1, y: 1.80, w: 0.95, h: 0.28, fontSize: 8, bold: true, color: s.stageColor, fontFace: "Calibri", align: "center", valign: "middle", margin: 0 });

    sl.addText("核心玩家", { x: x + 0.1, y: 2.16, w: colW - 0.2, h: 0.2, fontSize: 8, bold: true, color: C.gray, fontFace: "Calibri", margin: 0 });
    sl.addText(s.players, { x: x + 0.1, y: 2.34, w: colW - 0.2, h: 0.4, fontSize: 9, color: C.offWhite, fontFace: "Calibri", margin: 0 });

    sl.addText("优势", { x: x + 0.1, y: 2.76, w: colW - 0.2, h: 0.2, fontSize: 8, bold: true, color: C.gray, fontFace: "Calibri", margin: 0 });
    sl.addText(s.pros, { x: x + 0.1, y: 2.94, w: colW - 0.2, h: 0.5, fontSize: 9, color: C.green, fontFace: "Calibri", margin: 0 });

    sl.addText("挑战", { x: x + 0.1, y: 3.46, w: colW - 0.2, h: 0.2, fontSize: 8, bold: true, color: C.gray, fontFace: "Calibri", margin: 0 });
    sl.addText(s.cons, { x: x + 0.1, y: 3.64, w: colW - 0.2, h: 0.5, fontSize: 9, color: C.red, fontFace: "Calibri", margin: 0 });

    sl.addText("单价: " + s.unitCost, { x: x + 0.1, y: 4.20, w: colW - 0.2, h: 0.22, fontSize: 8.5, bold: true, color: s.color, fontFace: "Calibri", margin: 0 });
    sl.addText(s.roi, { x: x + 0.1, y: 4.42, w: colW - 0.2, h: 0.22, fontSize: 9, color: C.gold, fontFace: "Calibri", margin: 0 });
    sl.addText("部署量: " + s.data, { x: x + 0.1, y: 4.64, w: colW - 0.2, h: 0.22, fontSize: 8.5, color: C.gray, fontFace: "Calibri", margin: 0 });
  });

  footer(sl);
  pageNum(sl, 9, TOTAL_SLIDES);
}

// =========================================================
// SLIDE 10 - Operations: Customer Structure & ROI
// =========================================================
{
  let sl = pres.addSlide();
  sl.background = { color: C.navy };
  titleBar(sl, "O — Operations  客户结构与 ROI 真相", "宇树招股书数据揭示：73.6% 为科研教育，真正工业替代极少");

  // Key insight card
  card(sl, 0.55, 1.22, 8.9, 0.65, C.tealDim);
  sl.addText("宇树科技 2024 年客户结构（来自招股书）— 揭示行业真实阶段", {
    x: 0.7, y: 1.25, w: 8.5, h: 0.30, fontSize: 12, bold: true, color: C.white, fontFace: "Calibri", margin: 0,
  });
  sl.addText("73.6% 科研教育 + 9.0% 企业导览 + 6.7% 肢体外骨骼 + 4.6% 自动化巡检 + 6.1% 其他 — 真正工业替代客户极少", {
    x: 0.7, y: 1.55, w: 8.5, h: 0.28, fontSize: 10.5, italic: true, color: C.offWhite, fontFace: "Calibri", margin: 0,
  });

  // Bar chart (horizontal bars - visual representation)
  const segments = [
    { label: "科研教育",     pct: 73.6, color: C.teal   },
    { label: "企业导览/展示", pct:  9.0, color: C.mint   },
    { label: "肢体外骨骼",    pct:  6.7, color: C.green  },
    { label: "自动化巡检",    pct:  4.6, color: C.gold   },
    { label: "其他/个人",     pct:  6.1, color: C.gray   },
  ];

  const barBaseY = 2.10;
  const barMaxW  = 6.0;
  const barH     = 0.52;

  segments.forEach((s, i) => {
    const y = barBaseY + i * (barH + 0.08);
    const barW = (s.pct / 100) * barMaxW;

    sl.addText(s.label, { x: 0.55, y, w: 2.4, h: barH, fontSize: 11, color: C.white, fontFace: "Calibri", valign: "middle", margin: 0 });
    sl.addShape("rect", { x: 3.0, y: y + 0.1, w: barMaxW, h: barH - 0.2, fill: { color: C.navyMid }, line: { color: C.slate, width: 0.5 } });
    sl.addShape("rect", { x: 3.0, y: y + 0.1, w: barW,    h: barH - 0.2, fill: { color: s.color }, line: { color: s.color, width: 0 } });
    sl.addText(s.pct.toFixed(1) + "%", { x: 3.05 + barW, y, w: 0.8, h: barH, fontSize: 11, bold: true, color: s.color, fontFace: "Arial Black", valign: "middle", margin: 0 });
  });

  // Right: ROI Analysis
  card(sl, 9.2, 1.22, 0.3, 4.0, C.navyMid); // spacer

  card(sl, 9.35, 1.22, 0.1, 4.0, C.navyMid); // very narrow - just use space at right

  // Use the right portion
  const rightX = 7.6;
  card(sl, rightX, 1.22, 1.94, 2.8, C.navyMid);
  sl.addShape("rect", { x: rightX, y: 1.22, w: 1.94, h: 0.06, fill: { color: C.gold }, line: { color: C.gold, width: 0 } });
  sl.addText("ROI 分析", { x: rightX + 0.1, y: 1.32, w: 1.74, h: 0.28, fontSize: 11, bold: true, color: C.white, fontFace: "Calibri", margin: 0 });

  const roiData = [
    { label: "当前 IRR",  val: "15-20%", color: C.gold },
    { label: "目标 IRR",  val: ">25%",   color: C.green },
    { label: "回本周期",  val: "3-5年",  color: C.mint },
    { label: "人工替代率", val: "~60%",  color: C.teal },
    { label: "部署规模",  val: "3-10台", color: C.orange },
  ];
  roiData.forEach((r, i) => {
    const y = 1.66 + i * 0.42;
    sl.addText(r.label, { x: rightX + 0.1, y, w: 1.0, h: 0.36, fontSize: 9, color: C.gray, fontFace: "Calibri", valign: "middle", margin: 0 });
    sl.addText(r.val,   { x: rightX + 1.1, y, w: 0.8, h: 0.36, fontSize: 11, bold: true, color: r.color, fontFace: "Arial Black", valign: "middle", align: "right", margin: 0 });
  });

  // Bottom insight
  card(sl, 0.55, 4.70, 8.95, 0.55, C.navyMid);
  sl.addShape("rect", { x: 0.55, y: 4.70, w: 0.07, h: 0.55, fill: { color: C.red }, line: { color: C.red, width: 0 } });
  sl.addText("关键洞察：人形机器人目前本质上是一台「高价科研设备」，而非工业级自动化工具。客户结构揭示真相：73.6% 收入来自科研教育，说明真正工业替代的买单能力尚未形成。", {
    x: 0.72, y: 4.73, w: 8.7, h: 0.5, fontSize: 10, color: C.offWhite, fontFace: "Calibri", valign: "middle", margin: 0,
  });

  footer(sl);
  pageNum(sl, 10, TOTAL_SLIDES);
}

// =========================================================
// SLIDE 11 - Reach: Market Size Scenarios
// =========================================================
{
  let sl = pres.addSlide();
  sl.background = { color: C.navy };
  titleBar(sl, "R — Reach  市场容量三情景预测", "2025-2035 年出货量与规模预测 | 基准 / 乐观 / 保守");

  // Three scenarios
  const scenarios = [
    {
      name: "基准情景", color: C.teal,   emoji: "📊",
      entry: "2025: 1.45 万台", y2028: "8.5 万台", y2030: "22.7 万台", y2035: "88 万台",
      cagr: "CAGR ~40%",
      cond: "技术稳定 + 成本下降 + 1-2个爆款场景",
    },
    {
      name: "乐观情景", color: C.green,  emoji: "🚀",
      entry: "2025: 1.7 万台",  y2028: "14 万台",  y2030: "40 万台",  y2035: "150 万台",
      cagr: "CAGR ~55%",
      cond: "大模型突破 + 制造成本 <$20K + 工业大量采用",
    },
    {
      name: "保守情景", color: C.orange, emoji: "🐢",
      entry: "2025: 1.2 万台", y2028: "5 万台",   y2030: "12 万台",  y2035: "35 万台",
      cagr: "CAGR ~25%",
      cond: "技术瓶颈持续 + 成本居高不下 + 监管收紧",
    },
  ];

  const scW = 2.93;
  scenarios.forEach((s, i) => {
    const x = 0.55 + i * (scW + 0.1);
    card(sl, x, 1.22, scW, 2.85, C.navyMid);
    sl.addShape("rect", { x, y: 1.22, w: scW, h: 0.07, fill: { color: s.color }, line: { color: s.color, width: 0 } });

    sl.addText(s.emoji + " " + s.name, { x: x + 0.1, y: 1.32, w: scW - 0.2, h: 0.38, fontSize: 13, bold: true, color: C.white, fontFace: "Calibri", margin: 0 });
    sl.addShape("rect", { x: x + 0.1, y: 1.72, w: scW - 0.2, h: 0.02, fill: { color: C.slate }, line: { color: C.slate, width: 0 } });

    const years = [
      { yr: "2025", v: s.entry },
      { yr: "2028", v: s.y2028 },
      { yr: "2030", v: s.y2030 },
      { yr: "2035", v: s.y2035 },
    ];
    years.forEach((y2, j) => {
      const y = 1.82 + j * 0.52;
      sl.addText(y2.yr, { x: x + 0.1, y, w: 0.6, h: 0.44, fontSize: 11, bold: true, color: s.color, fontFace: "Arial Black", valign: "middle", margin: 0 });
      sl.addText(y2.v.replace(":", ":\n"), { x: x + 0.7, y, w: scW - 0.85, h: 0.44, fontSize: 9.5, color: C.offWhite, fontFace: "Calibri", valign: "middle", margin: 0 });
    });

    sl.addText(s.cagr, { x: x + 0.1, y: 3.96, w: scW - 0.2, h: 0.28, fontSize: 11, bold: true, color: s.color, fontFace: "Arial Black", align: "center", margin: 0 });
  });

  // Visual bar chart
  const barData = [
    { yr: "2025", opt: 1.7, base: 1.45, cons: 1.2, color: C.teal },
    { yr: "2028", opt: 14,  base: 8.5,  cons: 5,    color: C.teal },
    { yr: "2030", opt: 40,  base: 22.7, cons: 12,   color: C.teal },
    { yr: "2035", opt: 150, base: 88,   cons: 35,   color: C.teal },
  ];

  const chartX = 0.55, chartY = 4.22;
  sl.addText("全球出货量预测（万台）", { x: chartX, y: chartY - 0.02, w: 4, h: 0.24, fontSize: 9, bold: true, color: C.gray, fontFace: "Calibri", margin: 0 });

  const maxVal = 150;
  const colGroupW = 1.9;
  barData.forEach((b, i) => {
    const gx = chartX + 0.55 + i * (colGroupW / 4 * 3);
    const barUnitH = 0.04;

    const scale = (v) => Math.max(0.15, v / maxVal * 1.6);

    sl.addShape("rect", { x: gx,       y: chartY + 0.28 - scale(b.opt) * 0.8,  w: 0.32, h: scale(b.opt) * 0.8,  fill: { color: C.green, transparency: 20 },  line: { color: C.green,  width: 1 } });
    sl.addShape("rect", { x: gx + 0.36, y: chartY + 0.28 - scale(b.base) * 0.8, w: 0.32, h: scale(b.base) * 0.8, fill: { color: C.teal,  transparency: 20 },  line: { color: C.teal,   width: 1 } });
    sl.addShape("rect", { x: gx + 0.72, y: chartY + 0.28 - scale(b.cons) * 0.8, w: 0.32, h: scale(b.cons) * 0.8, fill: { color: C.orange, transparency: 20 }, line: { color: C.orange, width: 1 } });

    sl.addText(b.yr, { x: gx, y: chartY + 0.28, w: 1.1, h: 0.22, fontSize: 8.5, color: C.gray, fontFace: "Calibri", align: "center", margin: 0 });
  });

  sl.addShape("rect", { x: 0.55, y: chartY + 0.52, w: 9.0, h: 0.02, fill: { color: C.slate }, line: { color: C.slate, width: 0 } });
  sl.addShape("rect", { x: 7.5, y: chartY + 0.28, w: 0.22, h: 0.16, fill: { color: C.green, transparency: 20 }, line: { color: C.green, width: 1 } });
  sl.addText("乐观", { x: 7.75, y: chartY + 0.28, w: 0.5, h: 0.16, fontSize: 8, color: C.green, fontFace: "Calibri", margin: 0 });
  sl.addShape("rect", { x: 8.3, y: chartY + 0.28, w: 0.22, h: 0.16, fill: { color: C.teal, transparency: 20 }, line: { color: C.teal, width: 1 } });
  sl.addText("基准", { x: 8.55, y: chartY + 0.28, w: 0.5, h: 0.16, fontSize: 8, color: C.teal, fontFace: "Calibri", margin: 0 });
  sl.addShape("rect", { x: 9.1, y: chartY + 0.28, w: 0.22, h: 0.16, fill: { color: C.orange, transparency: 20 }, line: { color: C.orange, width: 1 } });
  sl.addText("保守", { x: 9.35, y: chartY + 0.28, w: 0.5, h: 0.16, fontSize: 8, color: C.orange, fontFace: "Calibri", margin: 0 });

  footer(sl);
  pageNum(sl, 11, TOTAL_SLIDES);
}

// =========================================================
// SLIDE 12 - Reach: Global Strategy
// =========================================================
{
  let sl = pres.addSlide();
  sl.background = { color: C.navy };
  titleBar(sl, "R — Reach  全球化策略", "中国市场领跑 · 北美高端定位 · 欧洲细分切入 · 东南亚制造成本洼地");

  // 4 regional cards
  const regions = [
    {
      name: "🇨🇳 中国", color: C.red,
      position: "出货量第一 / 制造成本洼地",
      status: "宇树 5500+ 台全球第一",
      strategy: "规模量产压成本 + 快速迭代",
      risk: "内卷加剧 / 估值泡沫",
      highlight: "全球人形机器人出货量第一大国",
    },
    {
      name: "🇺🇸 北美", color: C.teal,
      position: "技术最前沿 / 估值最高",
      status: "Tesla / Figure / Agility 三大龙头",
      strategy: "高端定位 + AI 算法差异化",
      risk: "制造成本高 / 量产瓶颈",
      highlight: "VLA 大模型发源地，资本密度最高",
    },
    {
      name: "🇪🇺 欧洲", color: C.green,
      position: "汽车产业链深度整合",
      status: "BMW / Mercedes + 机器人合作",
      strategy: "工业自动化场景优先落地",
      risk: "AI 人才密度不足",
      highlight: "汽车制造自动化需求是最大机会",
    },
    {
      name: "🌏 东南亚", color: C.gold,
      position: "制造成本 + 新兴市场",
      status: "制造业转型期 / 人口老龄化",
      strategy: "低成本制造 + 服务业探索",
      risk: "技术积累薄弱",
      highlight: "下一个制造业机器人化增长极",
    },
  ];

  const rw = 2.2;
  regions.forEach((r, i) => {
    const x = 0.55 + i * (rw + 0.1);
    card(sl, x, 1.22, rw, 3.98, C.navyMid);
    sl.addShape("rect", { x, y: 1.22, w: rw, h: 0.07, fill: { color: r.color }, line: { color: r.color, width: 0 } });
    sl.addShape("rect", { x, y: 1.22, w: 0.07, h: 3.98, fill: { color: r.color }, line: { color: r.color, width: 0 } });

    sl.addText(r.name, { x: x + 0.14, y: 1.32, w: rw - 0.2, h: 0.38, fontSize: 13, bold: true, color: C.white, fontFace: "Calibri", margin: 0 });
    sl.addText(r.position, { x: x + 0.14, y: 1.72, w: rw - 0.2, h: 0.36, fontSize: 9, color: r.color, fontFace: "Calibri", margin: 0, italic: true });
    sl.addShape("rect", { x: x + 0.14, y: 2.1, w: rw - 0.28, h: 0.02, fill: { color: C.slate }, line: { color: C.slate, width: 0 } });

    sl.addText("当前状态", { x: x + 0.14, y: 2.18, w: rw - 0.2, h: 0.22, fontSize: 8, bold: true, color: C.gray, fontFace: "Calibri", margin: 0 });
    sl.addText(r.status, { x: x + 0.14, y: 2.38, w: rw - 0.2, h: 0.36, fontSize: 9, color: C.offWhite, fontFace: "Calibri", margin: 0 });
    sl.addText("策略", { x: x + 0.14, y: 2.78, w: rw - 0.2, h: 0.22, fontSize: 8, bold: true, color: C.gray, fontFace: "Calibri", margin: 0 });
    sl.addText(r.strategy, { x: x + 0.14, y: 2.98, w: rw - 0.2, h: 0.36, fontSize: 9, color: C.offWhite, fontFace: "Calibri", margin: 0 });
    sl.addText("风险", { x: x + 0.14, y: 3.38, w: rw - 0.2, h: 0.22, fontSize: 8, bold: true, color: C.gray, fontFace: "Calibri", margin: 0 });
    sl.addText(r.risk, { x: x + 0.14, y: 3.58, w: rw - 0.2, h: 0.36, fontSize: 9, color: C.red, fontFace: "Calibri", margin: 0 });

    sl.addText(r.highlight, { x: x + 0.14, y: 4.68, w: rw - 0.2, h: 0.44, fontSize: 8, color: r.color, fontFace: "Calibri", italic: true, margin: 0 });
  });

  footer(sl);
  pageNum(sl, 12, TOTAL_SLIDES);
}

// =========================================================
// SLIDE 13 - Assets: Financial Comparison
// =========================================================
{
  let sl = pres.addSlide();
  sl.background = { color: C.navy };
  titleBar(sl, "A2 — Assets  核心财务数据对比", "营收 / 毛利 / 净利 / 出货量 — 宇树 vs UBTECH vs Agility vs Figure");

  // 4 KPI big numbers
  const kpis = [
    { num: "¥17亿",  label: "宇树 2025E 营收",    sub: "同比增长",     color: C.teal },
    { num: "60.3%",   label: "宇树毛利率",          sub: "硬件毛利极高",  color: C.green },
    { num: "5500台",  label: "宇树 2025 出货",      sub: "全球第一",      color: C.gold },
    { num: "¥6亿",   label: "宇树 2025E 净利",      sub: "净利率 35%",    color: C.mint },
  ];
  const kw = 2.2;
  kpis.forEach((k, i) => {
    const x = 0.55 + i * (kw + 0.08);
    bigNum(sl, x, 1.22, kw, 1.35, k.num, k.label + "  " + k.sub, k.color);
  });

  // Comparison table
  const tableX = 0.55, tableY = 2.75;
  const colWidths = [2.1, 1.55, 1.55, 1.55, 1.55, 1.7];
  const headers = ["企业", "2025营收", "毛利", "净利", "出货量", "估值/融资"];
  const rows = [
    ["宇树科技",  "¥17亿", "60.3%",  "¥6亿",   "5500台",  "IPO 42亿"],
    ["UBTECH",   "¥8亿",  "42%",    "亏损",   "~2000台", "港股上市"],
    ["Agility",  "$25M",  "N/A",    "亏损",   "100+台",  "NASDAQ"],
    ["Figure AI","$30M",  "N/A",    "亏损",   "<50台",   "26亿美元"],
    ["智元智元",  "未披露", "N/A",   "未披露", "千台级",  "150亿估值"],
  ];
  const tableW = colWidths.reduce((a, b) => a + b, 0);

  // Header row
  cardSoft(sl, tableX, tableY, tableW, 0.42, C.tealDim);
  let cx = tableX;
  headers.forEach((h, i) => {
    sl.addText(h, { x: cx + 0.05, y: tableY, w: colWidths[i], h: 0.42, fontSize: 9, bold: true, color: C.white, fontFace: "Calibri", align: "center", valign: "middle", margin: 0 });
    cx += colWidths[i];
  });

  // Data rows
  const rowColors = [C.navyMid, "16213e", C.navyMid, "16213e", C.navyMid];
  rows.forEach((row, ri) => {
    const ry = tableY + 0.42 + ri * 0.46;
    cardSoft(sl, tableX, ry, tableW, 0.44, rowColors[ri]);
    let rx = tableX;
    row.forEach((cell, ci) => {
      const cellColor = ci === 0 ? C.white : (ri === 0 ? C.teal : C.offWhite);
      sl.addText(cell, { x: rx + 0.05, y: ry, w: colWidths[ci], h: 0.44, fontSize: 9.5, color: cellColor, fontFace: "Calibri", align: ci === 0 ? "left" : "center", valign: "middle", margin: 0 });
      rx += colWidths[ci];
    });
  });

  // Bottom insight
  card(sl, 0.55, 5.05, 9.35, 0.48, C.navyMid);
  sl.addShape("rect", { x: 0.55, y: 5.05, w: 0.07, h: 0.48, fill: { color: C.gold }, line: { color: C.gold, width: 0 } });
  sl.addText("关键洞察：宇树是唯一实现规模化盈利的人形机器人企业，毛利率 60.3% 远超 UBTECH 的 42%；Agility 和 Figure 均处于严重亏损状态，依赖融资维持运营。", {
    x: 0.72, y: 5.08, w: 9.1, h: 0.42, fontSize: 9.5, color: C.offWhite, fontFace: "Calibri", valign: "middle", margin: 0,
  });

  pageNum(sl, 13, TOTAL_SLIDES);
}

// =========================================================
// SLIDE 14 - Assets: Valuation Matrix
// =========================================================
{
  let sl = pres.addSlide();
  sl.background = { color: C.navy };
  titleBar(sl, "A2 — Assets  估值矩阵与融资动态", "PS / EV-Revenue 倍数对比 · 融资轮次 · 资本效率");

  // Quadrant chart
  card(sl, 0.55, 1.22, 5.4, 4.0, C.navyMid);
  sl.addShape("rect", { x: 0.55, y: 1.22, w: 5.4, h: 0.06, fill: { color: C.gold }, line: { color: C.gold, width: 0 } });
  sl.addText("估值 vs 商业化成熟度象限", { x: 0.7, y: 1.32, w: 5.1, h: 0.32, fontSize: 11, bold: true, color: C.white, fontFace: "Calibri", margin: 0 });

  // Axes
  sl.addShape("rect", { x: 1.4, y: 1.75, w: 4.2, h: 0.02, fill: { color: C.slate }, line: { color: C.slate, width: 0 } }); // X axis
  sl.addShape("rect", { x: 1.4, y: 1.75, w: 0.02, h: 3.25, fill: { color: C.slate }, line: { color: C.slate, width: 0 } }); // Y axis
  sl.addText("商业化成熟度 →", { x: 1.5, y: 4.98, w: 2.0, h: 0.22, fontSize: 8, color: C.gray, fontFace: "Calibri", margin: 0 });
  sl.addText("估值 ↑", { x: 0.6, y: 2.2, w: 0.7, h: 0.22, fontSize: 8, color: C.gray, fontFace: "Calibri", margin: 0 });

  // Quadrant labels
  sl.addText("高估值·高成熟", { x: 3.6, y: 1.80, w: 2.0, h: 0.22, fontSize: 8, color: C.green, fontFace: "Calibri", align: "center", margin: 0 });
  sl.addText("低估值·高成熟", { x: 1.5, y: 1.80, w: 2.0, h: 0.22, fontSize: 8, color: C.teal, fontFace: "Calibri", align: "center", margin: 0 });
  sl.addText("低估值·早期",    { x: 1.5, y: 4.60, w: 2.0, h: 0.22, fontSize: 8, color: C.gray, fontFace: "Calibri", align: "center", margin: 0 });
  sl.addText("高估值·早期",    { x: 3.6, y: 4.60, w: 2.0, h: 0.22, fontSize: 8, color: C.red, fontFace: "Calibri", align: "center", margin: 0 });

  // Company dots
  const companies = [
    { name: "宇树科技", x: 4.2, y: 2.1, color: C.gold,   note: "¥42亿 IPO" },
    { name: "UBTECH",  x: 3.5, y: 2.4, color: C.teal,    note: "港股上市" },
    { name: "Agility", x: 2.8, y: 3.0, color: C.orange,  note: "NASDAQ" },
    { name: "Figure AI", x: 2.2, y: 3.6, color: C.red,  note: "26亿估值" },
    { name: "智元",    x: 2.0, y: 3.3, color: C.mint,    note: "150亿估值" },
    { name: "Boston",  x: 3.0, y: 3.8, color: C.purple,  note: "Hyundai旗下" },
  ];

  companies.forEach(c => {
    sl.addShape("ellipse", { x: c.x - 0.15, y: c.y - 0.15, w: 0.3, h: 0.3, fill: { color: c.color, transparency: 30 }, line: { color: c.color, width: 1.5 } });
    sl.addText(c.name, { x: c.x - 0.5, y: c.y - 0.4, w: 1.0, h: 0.22, fontSize: 8, bold: true, color: c.color, fontFace: "Calibri", align: "center", margin: 0 });
  });

  // Right: financing table
  const rightX = 6.15;
  card(sl, rightX, 1.22, 3.4, 4.0, C.navyMid);
  sl.addShape("rect", { x: rightX, y: 1.22, w: 3.4, h: 0.06, fill: { color: C.purple }, line: { color: C.purple, width: 0 } });
  sl.addText("融资动态（2024-2026）", { x: rightX + 0.1, y: 1.32, w: 3.2, h: 0.32, fontSize: 11, bold: true, color: C.white, fontFace: "Calibri", margin: 0 });

  const funding = [
    { co: "Figure AI",   amt: "$675M", rd: "B轮",  yr: "2025", c: C.red    },
    { co: "1X Tech",     amt: "$125M", rd: "B轮",  yr: "2024", c: C.green  },
    { co: "智元智元",    amt: "¥15亿", rd: "A轮",  yr: "2025", c: C.teal   },
    { co: "宇树科技",    amt: "¥42亿", rd: "IPO",  yr: "2026", c: C.gold   },
    { co: "傅利叶",      amt: "¥5亿",  rd: "A轮",  yr: "2024", c: C.mint   },
    { co: "Agility",     amt: "$200M", rd: "IPO+", yr: "2025", c: C.orange },
  ];

  funding.forEach((f, i) => {
    const y = 1.72 + i * 0.56;
    cardSoft(sl, rightX + 0.1, y, 3.2, 0.50, C.navyMid);
    sl.addShape("rect", { x: rightX + 0.1, y, w: 0.06, h: 0.50, fill: { color: f.c }, line: { color: f.c, width: 0 } });
    sl.addText(f.co, { x: rightX + 0.22, y: y + 0.04, w: 1.4, h: 0.24, fontSize: 10, bold: true, color: C.white, fontFace: "Calibri", margin: 0 });
    sl.addText(f.yr,  { x: rightX + 1.65, y: y + 0.04, w: 0.5, h: 0.24, fontSize: 9, color: C.gray, fontFace: "Calibri", margin: 0 });
    sl.addText(f.amt, { x: rightX + 2.2, y: y + 0.04, w: 1.0, h: 0.24, fontSize: 11, bold: true, color: f.c, fontFace: "Arial Black", align: "right", margin: 0 });
    sl.addText(f.rd,  { x: rightX + 0.22, y: y + 0.26, w: 3.0, h: 0.2, fontSize: 8.5, color: C.gray, fontFace: "Calibri", margin: 0 });
  });

  footer(sl);
  pageNum(sl, 14, TOTAL_SLIDES);
}

// =========================================================
// SLIDE 15 - AMORA Score Overview
// =========================================================
{
  let sl = pres.addSlide();
  sl.background = { color: C.navy };
  titleBar(sl, "AMORA Score — 12 企业综合评分卡", "A(技术壁垒) · M(人才优势) · O(商业落地) · R(全球化) · A(可持续)");

  // Table
  const headers2 = ["企业", "国", "A", "M", "O", "R", "A2", "综合", "趋势"];
  const colW2 = [2.0, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.8, 0.55];
  const companies2 = [
    { name: "宇树科技",   cn: "🇨🇳", a: 8.5, m: 9.2, o: 9.0, r: 8.0, a2: 9.5, tot: 8.9, trend: "▲", tcolor: C.green },
    { name: "UBTECH",    cn: "🇨🇳", a: 8.0, m: 8.5, o: 6.8, r: 7.5, a2: 7.0, tot: 7.6, trend: "▬", tcolor: C.gray  },
    { name: "Tesla Optimus", cn: "🇺🇸", a: 9.5, m: 9.0, o: 7.0, r: 9.5, a2: 8.0, tot: 8.6, trend: "▲", tcolor: C.green },
    { name: "Figure AI",  cn: "🇺🇸", a: 9.0, m: 8.5, o: 5.5, r: 8.0, a2: 8.5, tot: 7.9, trend: "▲", tcolor: C.green },
    { name: "智元智元",  cn: "🇨🇳", a: 8.0, m: 8.0, o: 7.0, r: 6.5, a2: 7.5, tot: 7.4, trend: "▲", tcolor: C.green },
    { name: "Boston Dyn.", cn: "🇺🇸", a: 9.0, m: 8.5, o: 5.5, r: 8.0, a2: 6.5, tot: 7.5, trend: "▬", tcolor: C.gray  },
    { name: "Agility",    cn: "🇺🇸", a: 7.0, m: 7.0, o: 7.5, r: 7.5, a2: 5.5, tot: 6.9, trend: "▬", tcolor: C.gray  },
    { name: "傅利叶 Fourier", cn: "🇨🇳", a: 7.0, m: 7.5, o: 6.5, r: 6.0, a2: 6.5, tot: 6.7, trend: "▲", tcolor: C.green },
    { name: "1X Tech",    cn: "🇺🇸", a: 7.0, m: 7.0, o: 6.5, r: 7.0, a2: 7.0, tot: 6.9, trend: "▲", tcolor: C.green },
    { name: "Sanctuary",  cn: "🇨🇦", a: 8.0, m: 8.0, o: 5.0, r: 6.0, a2: 6.0, tot: 6.6, trend: "▬", tcolor: C.gray  },
    { name: "小鹏 PXES",  cn: "🇨🇳", a: 7.0, m: 7.0, o: 6.0, r: 7.0, a2: 6.5, tot: 6.7, trend: "▲", tcolor: C.green },
    { name: "Digit",      cn: "🇺🇸", a: 6.5, m: 6.5, o: 7.0, r: 6.5, a2: 5.0, tot: 6.3, trend: "▼", tcolor: C.red   },
  ];

  const th = 0.40;
  cardSoft(sl, 0.55, 1.22, 9.35, th, C.tealDim);
  let tx = 0.55;
  headers2.forEach((h, i) => {
    sl.addText(h, { x: tx + 0.03, y: 1.22, w: colW2[i], h: th, fontSize: 9, bold: true, color: C.white, fontFace: "Calibri", align: "center", valign: "middle", margin: 0 });
    tx += colW2[i];
  });

  const rowH2 = 0.34;
  companies2.forEach((co, ri) => {
    const ry = 1.22 + th + ri * rowH2;
    const rc = ri % 2 === 0 ? C.navyMid : "16213e";
    cardSoft(sl, 0.55, ry, 9.35, rowH2, rc);

    const vals = [co.name, co.cn, co.a, co.m, co.o, co.r, co.a2, co.tot.toFixed(1), co.trend];
    const colors2 = [C.white, C.gray, null, null, null, null, null, co.tcolor, co.tcolor];
    let rxx = 0.55;
    vals.forEach((v, vi) => {
      const c = colors2[vi] || C.offWhite;
      const isBold = vi === 7;
      sl.addText(String(v), {
        x: rxx + 0.03, y: ry, w: colW2[vi], h: rowH2,
        fontSize: isBold ? 10.5 : 9.5, bold: isBold, color: c, fontFace: "Calibri",
        align: vi === 0 ? "left" : "center", valign: "middle", margin: 0,
      });
      rxx += colW2[vi];
    });
  });

  // Color legend for dimensions
  const dimColors = [
    { dim: "A(Advancement)", c: C.teal   },
    { dim: "M(Mastery)",     c: C.mint   },
    { dim: "O(Operations)",  c: C.gold   },
    { dim: "R(Reach)",       c: C.green  },
    { dim: "A2(Assets)",     c: C.red    },
  ];
  dimColors.forEach((d, i) => {
    const x = 0.55 + i * 1.9;
    sl.addShape("rect", { x, y: 5.18, w: 0.18, h: 0.18, fill: { color: d.c }, line: { color: d.c, width: 0 } });
    sl.addText(d.dim, { x: x + 0.24, y: 5.17, w: 1.6, h: 0.2, fontSize: 8.5, color: C.gray, fontFace: "Calibri", margin: 0 });
  });

  pageNum(sl, 15, TOTAL_SLIDES);
}

// =========================================================
// SLIDE 16 - AMORA Score Radar Chart (Visual)
// =========================================================
{
  let sl = pres.addSlide();
  sl.background = { color: C.navy };
  titleBar(sl, "AMORA Score — 头部企业雷达图对比", "宇树 vs Tesla Optimus vs Figure AI vs UBTECH — 五维能力可视化");

  // Draw radar chart manually
  const cx = 3.5, cy = 3.3, r = 2.2;
  const dims = ["A", "M", "O", "R", "A2"];
  const angles = dims.map((_, i) => (i / 5) * 2 * Math.PI - Math.PI / 2);

  // Concentric polygons (grid)
  [0.2, 0.4, 0.6, 0.8, 1.0].forEach(pct => {
    const pts = angles.map(a => ({
      x: cx + r * pct * Math.cos(a),
      y: cy + r * pct * Math.sin(a),
    }));
    const pts2 = pts.map(p => `${p.x},${p.y}`).join(" ");
    sl.addShape("polygon", { x: 0, y: 0, w: 0, h: 0, fill: { type: "none" }, line: { color: C.slate, width: 0.5 } });
    // Using rect approximation - draw line manually
    for (let i = 0; i < pts.length; i++) {
      const p1 = pts[i];
      const p2 = pts[(i + 1) % pts.length];
      // We'll skip complex polygon drawing - use labels instead
    }
  });

  // Draw axes from center
  angles.forEach((a, i) => {
    const endX = cx + r * Math.cos(a);
    const endY = cy + r * Math.sin(a);
    // Use two points for line
    sl.addShape("rect", {
      x: Math.min(cx, endX), y: Math.min(cy, endY),
      w: Math.abs(endX - cx) || 0.01, h: Math.abs(endY - cy) || 0.01,
      fill: { color: C.slate, transparency: 70 }, line: { color: C.slate, width: 0 }
    });
  });

  // Axis labels
  dims.forEach((d, i) => {
    const a = angles[i];
    const lx = cx + (r + 0.3) * Math.cos(a);
    const ly = cy + (r + 0.3) * Math.sin(a);
    sl.addText(dims[i] === "A" ? "Advancement" : dims[i] === "M" ? "Mastery" : dims[i] === "O" ? "Operations" : dims[i] === "R" ? "Reach" : "Assets", {
      x: lx - 0.6, y: ly - 0.18, w: 1.2, h: 0.36,
      fontSize: 9, color: C.gray, fontFace: "Calibri", align: "center", valign: "middle", margin: 0,
    });
  });

  // Company polygons
  const radarCos = [
    { name: "宇树科技",   color: C.gold,  scores: [8.5, 9.2, 9.0, 8.0, 9.5] },
    { name: "Tesla",     color: C.orange, scores: [9.5, 9.0, 7.0, 9.5, 8.0] },
    { name: "Figure AI", color: C.red,    scores: [9.0, 8.5, 5.5, 8.0, 8.5] },
    { name: "UBTECH",    color: C.teal,   scores: [8.0, 8.5, 6.8, 7.5, 7.0] },
  ];

  // Draw polygon dots for each company
  radarCos.forEach((co, ci) => {
    const pts3 = angles.map((a, i) => ({
      x: cx + r * (co.scores[i] / 10) * Math.cos(a),
      y: cy + r * (co.scores[i] / 10) * Math.sin(a),
    }));

    // Draw connecting lines by using a series of rectangles (approximation)
    for (let i = 0; i < pts3.length; i++) {
      const p1 = pts3[i];
      const p2 = pts3[(i + 1) % pts3.length];
      const dist = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
      const angle2 = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      sl.addShape("rect", {
        x: p1.x, y: p1.y, w: Math.max(0.01, dist), h: 0.01,
        fill: { color: co.color, transparency: 30 - ci * 5 }, line: { color: co.color, width: 1 },
        rotate: (angle2 * 180) / Math.PI,
      });
    }

    // Dots at vertices
    pts3.forEach(p => {
      sl.addShape("ellipse", { x: p.x - 0.07, y: p.y - 0.07, w: 0.14, h: 0.14, fill: { color: co.color }, line: { color: co.color, width: 0 } });
    });

    // Company label at centroid
    const avgX = pts3.reduce((s, p) => s + p.x, 0) / pts3.length;
    const avgY = pts3.reduce((s, p) => s + p.y, 0) / pts3.length;
    sl.addShape("rect", { x: avgX - 0.45, y: avgY - 0.16, w: 0.9, h: 0.28, fill: { color: co.color, transparency: 20 }, line: { color: co.color, width: 1 } });
    sl.addText(co.name, { x: avgX - 0.45, y: avgY - 0.16, w: 0.9, h: 0.28, fontSize: 8.5, bold: true, color: co.color, fontFace: "Calibri", align: "center", valign: "middle", margin: 0 });
  });

  // Legend on right
  const legX = 6.8;
  card(sl, legX, 1.22, 2.7, 4.0, C.navyMid);
  sl.addShape("rect", { x: legX, y: 1.22, w: 2.7, h: 0.06, fill: { color: C.purple }, line: { color: C.purple, width: 0 } });
  sl.addText("评分说明", { x: legX + 0.1, y: 1.32, w: 2.5, h: 0.32, fontSize: 11, bold: true, color: C.white, fontFace: "Calibri", margin: 0 });

  const scoreExplanations = [
    { dim: "A (Advancement)", c: C.teal,   desc: "技术壁垒：算法/硬件/专利" },
    { dim: "M (Mastery)",     c: C.mint,   desc: "人才优势：核心团队/融资" },
    { dim: "O (Operations)",  c: C.gold,   desc: "商业落地：出货量/客户/收入" },
    { dim: "R (Reach)",       c: C.green,  desc: "全球化：境外收入/合作伙伴" },
    { dim: "A2 (Assets)",     c: C.red,    desc: "可持续：毛利/净利/现金流" },
  ];
  scoreExplanations.forEach((s, i) => {
    const y = 1.72 + i * 0.68;
    cardSoft(sl, legX + 0.1, y, 2.5, 0.60, C.navyMid);
    sl.addShape("rect", { x: legX + 0.1, y, w: 0.06, h: 0.60, fill: { color: s.c }, line: { color: s.c, width: 0 } });
    sl.addText(s.dim, { x: legX + 0.22, y: y + 0.04, w: 2.3, h: 0.26, fontSize: 9.5, bold: true, color: s.c, fontFace: "Calibri", margin: 0 });
    sl.addText(s.desc, { x: legX + 0.22, y: y + 0.30, w: 2.3, h: 0.26, fontSize: 9, color: C.gray, fontFace: "Calibri", margin: 0 });
  });

  footer(sl);
  pageNum(sl, 16, TOTAL_SLIDES);
}

// =========================================================
// SLIDE 17 - Investment Recommendations
// =========================================================
{
  let sl = pres.addSlide();
  sl.background = { color: C.navy };
  titleBar(sl, "Investment Recommendations  投资建议", "高确信 / 期权价值 / 零部件三层逻辑 · 催化剂清单");

  const tiers = [
    {
      tier: "高确信标的", color: C.green, icon: "🥇",
      companies: "宇树科技（IPO）· Figure AI（二级）· NVIDIA（生态）",
      logic: "规模盈利 + 营收可见性 + 估值合理",
      risk: "估值已部分反映预期",
      action: "IPO 参与 / 二级建仓",
    },
    {
      tier: "期权价值", color: C.gold, icon: "🥈",
      companies: "智元智元（IPO前）· 傅利叶 · 1X Technologies",
      logic: "技术有亮点 + 估值弹性大 + 中国供应链成本优势",
      risk: "亏损持续，IPO 时间不确定",
      action: "早期跟进，关注融资节点",
    },
    {
      tier: "零部件阿尔法", color: C.teal, icon: "🥉",
      companies: "绿的谐波（减速器）· 华为昇腾（AI芯片）· 汇川（关节电机）",
      logic: "不依赖单一客户 · 国产替代逻辑强 · 收入可见性好",
      risk: "人形订单占比仍低",
      action: "左侧布局，等待规模放量",
    },
  ];

  const tw = 2.93;
  tiers.forEach((t, i) => {
    const x = 0.55 + i * (tw + 0.1);
    card(sl, x, 1.22, tw, 3.5, C.navyMid);
    sl.addShape("rect", { x, y: 1.22, w: tw, h: 0.07, fill: { color: t.color }, line: { color: t.color, width: 0 } });
    sl.addShape("rect", { x, y: 1.22, w: 0.07, h: 3.5, fill: { color: t.color }, line: { color: t.color, width: 0 } });

    sl.addText(t.icon + " " + t.tier, { x: x + 0.14, y: 1.32, w: tw - 0.2, h: 0.38, fontSize: 13, bold: true, color: C.white, fontFace: "Calibri", margin: 0 });
    sl.addShape("rect", { x: x + 0.14, y: 1.72, w: tw - 0.28, h: 0.02, fill: { color: C.slate }, line: { color: C.slate, width: 0 } });

    sl.addText("代表标的", { x: x + 0.14, y: 1.80, w: tw - 0.2, h: 0.22, fontSize: 8, bold: true, color: C.gray, fontFace: "Calibri", margin: 0 });
    sl.addText(t.companies, { x: x + 0.14, y: 2.00, w: tw - 0.2, h: 0.52, fontSize: 9.5, color: C.offWhite, fontFace: "Calibri", margin: 0 });

    sl.addText("核心逻辑", { x: x + 0.14, y: 2.54, w: tw - 0.2, h: 0.22, fontSize: 8, bold: true, color: C.gray, fontFace: "Calibri", margin: 0 });
    sl.addText(t.logic, { x: x + 0.14, y: 2.74, w: tw - 0.2, h: 0.52, fontSize: 9.5, color: C.green, fontFace: "Calibri", margin: 0 });

    sl.addText("风险", { x: x + 0.14, y: 3.28, w: tw - 0.2, h: 0.22, fontSize: 8, bold: true, color: C.gray, fontFace: "Calibri", margin: 0 });
    sl.addText(t.risk, { x: x + 0.14, y: 3.48, w: tw - 0.2, h: 0.44, fontSize: 9.5, color: C.red, fontFace: "Calibri", margin: 0 });

    sl.addText("操作建议: " + t.action, { x: x + 0.14, y: 4.42, w: tw - 0.2, h: 0.28, fontSize: 9, bold: true, color: t.color, fontFace: "Calibri", margin: 0 });
  });

  // Catalysts
  card(sl, 0.55, 4.85, 9.35, 0.68, C.tealDim);
  sl.addText("📅 近期催化剂：宇树 IPO 定价（Q2 2026） · Figure AI 新一轮融资 · 特斯拉 Optimus 工厂部署公告 · 工信部人形机器人专项政策落地", {
    x: 0.7, y: 4.88, w: 9.0, h: 0.62, fontSize: 10.5, color: C.white, fontFace: "Calibri", valign: "middle", margin: 0,
  });

  pageNum(sl, 17, TOTAL_SLIDES);
}

// =========================================================
// SLIDE 18 - Risk Factors
// =========================================================
{
  let sl = pres.addSlide();
  sl.background = { color: C.navy };
  titleBar(sl, "Risk Factors  风险因素", "技术 / 商业化 / 监管 / 地缘政治 · 完整风险矩阵");

  const risks = [
    { icon: "🔬", risk: "技术风险", level: "高", color: C.red,
      items: ["Sim2Real Gap 持续，泛化性能难达标", "触觉传感器无突破，灵巧手实用性受限", "大模型推理成本高，实时控制延迟问题"] },
    { icon: "💰", risk: "商业化风险", level: "高", color: C.orange,
      items: ["客户以科研为主，真实工业买单能力未形成", "单台成本仍高于人工替代 ROI 临界点", "量产一致性差，故障率高影响口碑"] },
    { icon: "⚖️", risk: "监管风险", level: "中", color: C.gold,
      items: ["欧盟 AI Act 对人形机器人安全标准趋严", "工厂部署需新增安全认证流程", "数据跨境传输限制影响全球化模型训练"] },
    { icon: "🌐", risk: "地缘风险", level: "中", color: C.purple,
      items: ["NVIDIA H100/H200 出口管制持续收紧", "中国供应链面临美国实体清单风险", "技术人才流动受限（国籍审查趋严）"] },
    { icon: "🏭", risk: "供应链风险", level: "中高", color: C.mint,
      items: ["谐波减速器 / 行星滚柱丝杠进口依赖", "高端轴承国产替代进度低于预期", "关键芯片（TI/ADI）供应波动"] },
    { icon: "💹", risk: "估值风险", level: "高", color: C.teal,
      items: ["Figure AI 26亿估值远超收入倍数", "一级市场定价与二级流动性错配", "AI 赛道整体降温可能拖累估值"] },
  ];

  const rw2 = 2.95;
  const rh2 = 1.78;
  risks.forEach((r, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.55 + col * (rw2 + 0.1);
    const y = 1.22 + row * (rh2 + 0.1);

    card(sl, x, y, rw2, rh2, C.navyMid);
    sl.addShape("rect", { x, y, w: rw2, h: 0.07, fill: { color: r.color }, line: { color: r.color, width: 0 } });

    sl.addText(r.icon + " " + r.risk, { x: x + 0.1, y: y + 0.1, w: rw2 - 0.5, h: 0.32, fontSize: 11, bold: true, color: C.white, fontFace: "Calibri", margin: 0 });
    sl.addShape("rect", { x: x + rw2 - 0.75, y: y + 0.12, w: 0.65, h: 0.28, fill: { color: r.color, transparency: 30 }, line: { color: r.color, width: 1 } });
    sl.addText("风险 " + r.level, { x: x + rw2 - 0.75, y: y + 0.12, w: 0.65, h: 0.28, fontSize: 8, bold: true, color: r.color, fontFace: "Calibri", align: "center", valign: "middle", margin: 0 });

    r.items.forEach((item, j) => {
      sl.addText("• " + item, { x: x + 0.1, y: y + 0.46 + j * 0.40, w: rw2 - 0.2, h: 0.38, fontSize: 8.5, color: C.gray, fontFace: "Calibri", margin: 0 });
    });
  });

  footer(sl);
  pageNum(sl, 18, TOTAL_SLIDES);
}

// =========================================================
// SLIDE 19 - Key Catalysts Timeline
// =========================================================
{
  let sl = pres.addSlide();
  sl.background = { color: C.navy };
  titleBar(sl, "Key Catalysts  关键催化剂与时间节点", "2026 H1 密集事件窗口 — 影响行业估值与投资节奏");

  const events = [
    { date: "2026 Q1",    ev: "宇树科技通过港交所上市聆讯",     type: "IPO",     color: C.gold,   impact: "★★★★★" },
    { date: "2026 Q1",    ev: "Figure AI 发布 Figure 02 商业版", type: "产品",    color: C.teal,   impact: "★★★★"  },
    { date: "2026 Q2",    ev: "Tesla Optimus 德国工厂部署公告",  type: "落地",    color: C.green,  impact: "★★★★"  },
    { date: "2026 Q2",    ev: "工信部人形机器人专项政策出台",     type: "政策",    color: C.mint,   impact: "★★★★★" },
    { date: "2026 Q2",    ev: "Figure AI / Agility 新一轮融资",  type: "融资",    color: C.orange, impact: "★★★"   },
    { date: "2026 Q3",    ev: "宇树 H1 产能 7.5 万台/年扩张",    type: "产能",    color: C.green,  impact: "★★★"   },
    { date: "2026 H2",    ev: "NVIDIA Thor 人形机器人 SDK 发布", type: "生态",    color: C.purple, impact: "★★★★"  },
    { date: "2026 H2",    ev: "国产谐波减速器批量通过验证",       type: "供应链",  color: C.mint,   impact: "★★★"   },
  ];

  const evW = 4.35;
  events.forEach((e, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.55 + col * (evW + 0.2);
    const y = 1.22 + row * 1.06;

    cardSoft(sl, x, y, evW, 0.95, C.navyMid);
    sl.addShape("rect", { x, y, w: 0.07, h: 0.95, fill: { color: e.color }, line: { color: e.color, width: 0 } });

    sl.addText(e.date, { x: x + 0.14, y: y + 0.06, w: 0.9, h: 0.32, fontSize: 10, bold: true, color: e.color, fontFace: "Calibri", margin: 0 });
    sl.addShape("rect", { x: x + 1.1, y: y + 0.1, w: 0.65, h: 0.24, fill: { color: e.color, transparency: 30 }, line: { color: e.color, width: 1 } });
    sl.addText(e.type, { x: x + 1.1, y: y + 0.1, w: 0.65, h: 0.24, fontSize: 8, bold: true, color: e.color, fontFace: "Calibri", align: "center", valign: "middle", margin: 0 });

    sl.addText(e.ev, { x: x + 0.14, y: y + 0.38, w: evW - 0.3, h: 0.38, fontSize: 10, color: C.offWhite, fontFace: "Calibri", margin: 0 });

    sl.addText(e.impact, { x: x + evW - 1.1, y: y + 0.06, w: 1.0, h: 0.32, fontSize: 9, bold: true, color: C.gold, fontFace: "Calibri", align: "right", margin: 0 });
  });

  // Bottom summary
  card(sl, 0.55, 5.05, 9.35, 0.48, C.tealDim);
  sl.addText("⚡ 核心判断：2026 H1 是人形机器人行业最重要的催化剂窗口，宇树 IPO + 政策落地 + 特斯拉部署三重叠加，可能触发板块性行情。", {
    x: 0.7, y: 5.08, w: 9.1, h: 0.42, fontSize: 10, color: C.white, fontFace: "Calibri", valign: "middle", margin: 0,
  });

  pageNum(sl, 19, TOTAL_SLIDES);
}

// =========================================================
// SLIDE 20 - China vs US Deep Dive
// =========================================================
{
  let sl = pres.addSlide();
  sl.background = { color: C.navy };
  titleBar(sl, "China vs US  中美深度对比", "技术路线 / 商业模式 / 资本效率 / 供应链 — 全维度竞争格局");

  // VS visual
  card(sl, 0.55, 1.22, 3.8, 0.72, C.navyMid);
  sl.addShape("rect", { x: 0.55, y: 1.22, w: 1.8, h: 0.72, fill: { color: C.red, transparency: 20 }, line: { color: C.red, width: 1 } });
  sl.addText("🇨🇳 中国", { x: 0.55, y: 1.22, w: 1.8, h: 0.72, fontSize: 18, bold: true, color: C.red, fontFace: "Arial Black", align: "center", valign: "middle", margin: 0 });

  sl.addShape("rect", { x: 2.55, y: 1.22, w: 0.5, h: 0.72, fill: { color: C.gold }, line: { color: C.gold, width: 0 } });
  sl.addText("VS", { x: 2.55, y: 1.22, w: 0.5, h: 0.72, fontSize: 12, bold: true, color: C.navy, fontFace: "Arial Black", align: "center", valign: "middle", margin: 0 });

  sl.addShape("rect", { x: 3.15, y: 1.22, w: 1.2, h: 0.72, fill: { color: C.teal, transparency: 20 }, line: { color: C.teal, width: 1 } });
  sl.addText("🇺🇸 美国", { x: 3.15, y: 1.22, w: 1.2, h: 0.72, fontSize: 18, bold: true, color: C.teal, fontFace: "Arial Black", align: "center", valign: "middle", margin: 0 });

  const comparisons2 = [
    { dim: "技术路线",   cn: "快速跟随 + 本地化微创新", us: "原创性突破 + 平台型生态" },
    { dim: "代表玩家",   cn: "宇树 / 智元 / 傅利叶",     us: "Tesla / Figure / Agility" },
    { dim: "资本效率",   cn: "¥42亿 IPO / ¥6亿净利",    us: "$26亿估值 / 仍亏损" },
    { dim: "制造优势",   cn: "供应链完整 / 成本低 50%",  us: "精密制造 / 高端材料" },
    { dim: "数据闭环",   cn: "追赶中 / 真实场景数据少",  us: "特斯拉车队数据 / 优势明显" },
    { dim: "政策支持",   cn: "专项政策 + 补贴预期强",    us: "CHIPS Act + AI Initiative" },
    { dim: "商业化",     cn: "规模出货第一 / 科研为主",  us: "愿景驱动 / 工厂落地" },
    { dim: "全球化",     cn: "境外收入 >35%",           us: "全球品牌影响力更强" },
  ];

  const compH = 0.42;
  comparisons2.forEach((c, i) => {
    const y = 2.05 + i * compH;
    const bg = i % 2 === 0 ? C.navyMid : "16213e";
    cardSoft(sl, 0.55, y, 9.35, compH - 0.03, bg);

    sl.addText(c.dim, { x: 0.62, y, w: 1.5, h: compH - 0.03, fontSize: 9, bold: true, color: C.gray, fontFace: "Calibri", valign: "middle", margin: 0 });
    sl.addText(c.cn, { x: 2.1, y, w: 3.7, h: compH - 0.03, fontSize: 9.5, color: C.offWhite, fontFace: "Calibri", valign: "middle", margin: 0 });
    sl.addShape("rect", { x: 5.85, y: y + 0.1, w: 0.02, h: compH - 0.23, fill: { color: C.slate }, line: { color: C.slate, width: 0 } });
    sl.addText(c.us, { x: 6.0, y, w: 3.8, h: compH - 0.03, fontSize: 9.5, color: C.offWhite, fontFace: "Calibri", valign: "middle", margin: 0 });
  });

  footer(sl);
  pageNum(sl, 20, TOTAL_SLIDES);
}

// =========================================================
// SLIDE 21 - Conclusion
// =========================================================
{
  let sl = pres.addSlide();
  sl.background = { color: C.navy };

  // Full bleed header
  sl.addShape("rect", { x: 0, y: 0, w: 10, h: 1.6, fill: { color: C.tealDim }, line: { color: C.tealDim, width: 0 } });
  sl.addText("The Humanoid Robot Index 2026", {
    x: 0.55, y: 0.25, w: 9, h: 0.5, fontSize: 22, bold: true, color: C.white, fontFace: "Arial Black", margin: 0,
  });
  sl.addText("结论与行动建议", {
    x: 0.55, y: 0.75, w: 9, h: 0.5, fontSize: 28, bold: true, color: C.gold, fontFace: "Arial Black", margin: 0,
  });
  sl.addText("行业评分 7.2/10  |  宇树综合第一 8.9分  |  处于商业化临界点前夜", {
    x: 0.55, y: 1.22, w: 9, h: 0.34, fontSize: 12, italic: true, color: C.offWhite, fontFace: "Calibri", margin: 0,
  });

  const conclusions = [
    { icon: "1", title: "格局未定，卡位窗口仍在", detail: "真正工业替代客户占比不足 15%，意味着绝大多数市场尚未被任何人占据，先发优势尚未固化。", color: C.teal },
    { icon: "2", title: "数据闭环比技术参数更重要", detail: "谁能更快积累真实场景运行数据，谁就掌握了训练下一代模型的主动权——这不是硬件竞赛，是数据竞赛。", color: C.gold },
    { icon: "3", title: "中国制造优势被低估，美国算法优势被高估", detail: "宇树 60.3% 毛利率、5500 台出货量证明了中国制造密度的商业可行性；美国供应链空心化风险正在累积。", color: C.green },
    { icon: "4", title: "2026 是关键验证年", detail: "宇树 IPO 定价 + 特斯拉工厂部署 + 工信部政策三重催化剂叠加，将重塑行业估值基准和投资逻辑。", color: C.red },
  ];

  conclusions.forEach((c, i) => {
    const y = 1.72 + i * 0.92;
    card(sl, 0.55, y, 9.35, 0.84, C.navyMid);
    sl.addShape("rect", { x: 0.55, y, w: 0.08, h: 0.84, fill: { color: c.color }, line: { color: c.color, width: 0 } });

    sl.addShape("rect", { x: 0.72, y: y + 0.14, w: 0.44, h: 0.44, fill: { color: c.color }, line: { color: c.color, width: 0 } });
    sl.addText(c.icon, { x: 0.72, y: y + 0.14, w: 0.44, h: 0.44, fontSize: 14, bold: true, color: C.navy, fontFace: "Arial Black", align: "center", valign: "middle", margin: 0 });
    sl.addText(c.title, { x: 1.28, y: y + 0.08, w: 8.5, h: 0.36, fontSize: 13, bold: true, color: C.white, fontFace: "Calibri", margin: 0 });
    sl.addText(c.detail, { x: 1.28, y: y + 0.46, w: 8.5, h: 0.34, fontSize: 10, color: C.gray, fontFace: "Calibri", margin: 0 });
  });

  pageNum(sl, 21, TOTAL_SLIDES);
}

// =========================================================
// SLIDE 22 - Appendix / Disclaimer
// =========================================================
{
  let sl = pres.addSlide();
  sl.background = { color: C.navy };
  titleBar(sl, "Appendix  附录与免责声明", "数据来源 · 评分方法论 · 评级说明 · 免责声明");

  // Left: Data Sources
  card(sl, 0.55, 1.22, 4.2, 2.4, C.navyMid);
  sl.addShape("rect", { x: 0.55, y: 1.22, w: 4.2, h: 0.06, fill: { color: C.teal }, line: { color: C.teal, width: 0 } });
  sl.addText("数据来源", { x: 0.7, y: 1.32, w: 4, h: 0.32, fontSize: 11, bold: true, color: C.white, fontFace: "Calibri", margin: 0 });
  sl.addText(
    "• 宇树科技港交所招股书（2026年3月版）\n" +
    "• UBTECH 年报（港交所披露）\n" +
    "• Agility Robotics SEC 文件（10-K / 8-K）\n" +
    "• IDTechEx / FutureMarkets 等第三方研究\n" +
    "• 工信部、IFR 国际机器人联合会数据\n" +
    "• 公开新闻与公司官方渠道披露\n" +
    "• AMORA 数据库（截至 Q1 2026）",
    { x: 0.7, y: 1.68, w: 4, h: 1.9, fontSize: 9.5, color: C.gray, fontFace: "Calibri", margin: 0, paraSpaceAfter: 4 }
  );

  // Right: Scoring Methodology
  card(sl, 4.95, 1.22, 4.5, 2.4, C.navyMid);
  sl.addShape("rect", { x: 4.95, y: 1.22, w: 4.5, h: 0.06, fill: { color: C.gold }, line: { color: C.gold, width: 0 } });
  sl.addText("AMORA Score 评分方法论", { x: 5.1, y: 1.32, w: 4.2, h: 0.32, fontSize: 11, bold: true, color: C.white, fontFace: "Calibri", margin: 0 });
  sl.addText(
    "• A (Advancement): 专利数 / 算法论文 / 硬件参数\n" +
    "• M (Mastery): 核心团队背景 / 融资规模 / 估值倍数\n" +
    "• O (Operations): 出货量 / 客户数 / 营收规模\n" +
    "• R (Reach): 境外收入占比 / 国际合作伙伴\n" +
    "• A2 (Assets): 毛利率 / 净利率 / 现金流\n\n" +
    "综合评分 = 加权平均（各维度 1-10 分）\n" +
    "评分截止日期：2026年3月31日",
    { x: 5.1, y: 1.68, w: 4.2, h: 1.9, fontSize: 9.5, color: C.gray, fontFace: "Calibri", margin: 0, paraSpaceAfter: 4 }
  );

  // Disclaimer
  card(sl, 0.55, 3.78, 8.9, 1.22, "16213e");
  sl.addShape("rect", { x: 0.55, y: 3.78, w: 8.9, h: 0.06, fill: { color: C.red }, line: { color: C.red, width: 0 } });
  sl.addText("免责声明 / Disclaimer", { x: 0.7, y: 3.88, w: 8.6, h: 0.28, fontSize: 10, bold: true, color: C.red, fontFace: "Calibri", margin: 0 });
  sl.addText(
    "本报告由 AMORA Insights 编制，仅供机构投资者参考，不构成任何投资建议。所有数据来源于公开渠道，AMORA 对数据准确性不作保证。" +
    "评分为主观判断，存在固有偏差风险。投资人形机器人行业涉及技术、商业化、监管等多重不确定性，请咨询持牌投资顾问。" +
    "AMORA Insights 及关联公司可能持有报告中提及标的的多头或空头头寸。",
    { x: 0.7, y: 4.18, w: 8.6, h: 0.78, fontSize: 9, color: C.gray, fontFace: "Calibri", margin: 0 }
  );

  // Contact
  card(sl, 0.55, 5.08, 8.9, 0.45, C.tealDim);
  sl.addText("AMORA Insights  |  www.amorainsights.com  |  research@amorainsights.com  |  Data Cut-off: Q1 2026  |  Copyright © 2026 AMORA Insights Ltd.", {
    x: 0.7, y: 5.12, w: 8.6, h: 0.38, fontSize: 9, color: C.white, fontFace: "Calibri", align: "center", valign: "middle", margin: 0,
  });

  pageNum(sl, 22, TOTAL_SLIDES);
}

// =========================================================
// Write File
// =========================================================
pres.writeFile({ fileName: OUTPUT })
  .then(() => {
    const { execSync } = require("child_process");
    const fs = require("fs");
    const size = fs.statSync(OUTPUT).size;
    console.log(`\n✅ PPT 生成成功！`);
    console.log(`📁 文件路径: ${OUTPUT}`);
    console.log(`📦 文件大小: ${(size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📄 总页数: ${TOTAL_SLIDES} 页`);
    console.log(`\n幻灯片列表:`);
    const slideList = [
      "1. 封面 Cover",
      "2. 目录 Contents",
      "3. 执行摘要 Executive Summary",
      "4. Advancement — 世界模型",
      "5. Advancement — 端到端控制 & 灵巧手",
      "6. Advancement — 技术演进时间轴",
      "7. Mapping — 人形机器人产业链图谱 ⭐新增",
      "8. Mapping — 卡脖子清单与国产替代",
      "9. Operations — 四大应用场景",
      "10. Operations — 客户结构与 ROI 真相",
      "11. Reach — 市场容量三情景预测",
      "12. Reach — 全球化策略",
      "13. Assets — 核心财务数据对比",
      "14. Assets — 估值矩阵与融资动态",
      "15. AMORA Score — 12 企业综合评分卡",
      "16. AMORA Score — 雷达图对比",
      "17. Investment Recommendations",
      "18. Risk Factors",
      "19. Key Catalysts",
      "20. China vs US 深度对比",
      "21. 结论与行动建议",
      "22. 附录与免责声明",
    ];
    slideList.forEach(s => console.log("  " + s));
  })
  .catch(err => {
    console.error("❌ 生成失败:", err.message);
    process.exit(1);
  });
