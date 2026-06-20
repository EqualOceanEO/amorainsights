// HRI-2026 Humanoid Robot Index 2026 - PPT Generator
// Using PptxGenJS - Deep Tech Navy/Teal Theme
"use strict";

const pptxgen = require("pptxgenjs");
const path = require("path");

const OUTPUT = path.join(__dirname, "..", "HRI-2026-Report-Presentation.pptx");

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
};

function makeShadow() {
  return { type: "outer", color: "000000", blur: 10, offset: 3, angle: 135, opacity: 0.35 };
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

function card(slide, x, y, w, h, fillColor) {
  slide.addShape("rect", {
    x, y, w, h,
    fill: { color: fillColor || C.navyMid },
    line: { color: C.slate, width: 1 },
    shadow: makeShadow(),
  });
}

function accentLine(slide, x, y, h) {
  slide.addShape("rect", { x, y, w: 0.06, h, fill: { color: C.teal }, line: { color: C.teal, width: 0 } });
}

// Presentation Setup
let pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "AMORA Insights";
pres.title = "The Humanoid Robot Index 2026";
pres.subject = "Global humanoid robot industry benchmarking";

// =========================================================
// SLIDE 1 - Cover
// =========================================================
{
  let sl = pres.addSlide();
  sl.background = { color: C.navy };

  sl.addShape("rect", { x: 0, y: 0, w: 0.12, h: 5.625, fill: { color: C.teal }, line: { color: C.teal, width: 0 } });

  for (let i = 0; i < 6; i++) {
    sl.addShape("rect", {
      x: 0.12, y: i * 0.95, w: 9.88, h: 0.008,
      fill: { color: C.slate, transparency: 70 },
      line: { color: C.slate, width: 0 },
    });
  }

  card(sl, 0.55, 0.65, 2.8, 0.42, C.tealDim);
  sl.addText("INDUSTRY INTELLIGENCE REPORT", {
    x: 0.55, y: 0.65, w: 2.8, h: 0.42,
    fontSize: 9, bold: true, color: C.white, fontFace: "Calibri",
    align: "center", valign: "middle", margin: 0, charSpacing: 2,
  });

  sl.addText("The Humanoid", {
    x: 0.55, y: 1.25, w: 8.5, h: 0.95,
    fontSize: 54, bold: true, color: C.white, fontFace: "Arial Black", margin: 0,
  });
  sl.addText("Robot Index", {
    x: 0.55, y: 2.15, w: 8.5, h: 0.95,
    fontSize: 54, bold: true, color: C.teal, fontFace: "Arial Black", margin: 0,
  });
  sl.addText("2026", {
    x: 0.55, y: 3.05, w: 3.0, h: 0.85,
    fontSize: 54, bold: true, color: C.gold, fontFace: "Arial Black", margin: 0,
  });

  sl.addText("Who's Actually Winning?", {
    x: 0.55, y: 3.92, w: 8.5, h: 0.40,
    fontSize: 17, italic: true, color: C.mint, fontFace: "Calibri", margin: 0,
  });
  sl.addText("A Cross-Border Benchmarking of 25 Global Players Across the Full Value Chain", {
    x: 0.55, y: 4.32, w: 8.5, h: 0.34,
    fontSize: 11, color: C.gray, fontFace: "Calibri", margin: 0,
  });

  sl.addShape("rect", { x: 0, y: 5.20, w: 10, h: 0.425, fill: { color: C.navyMid }, line: { color: C.navyMid, width: 0 } });
  sl.addText("AMORA Insights  |  Data Cut-off: Q1 2026  |  AMORA Report Framework  |  Confidential", {
    x: 0.55, y: 5.25, w: 9, h: 0.32,
    fontSize: 9, color: C.gray, fontFace: "Calibri", margin: 0,
  });
}

// =========================================================
// SLIDE 2 - Table of Contents
// =========================================================
{
  let sl = pres.addSlide();
  sl.background = { color: C.navy };
  titleBar(sl, "Contents", "AMORA Report Framework - 5 Dimensions");

  const sections = [
    { letter: "A", color: C.teal,  title: "Advancement",  sub: "技术先进性 -- 世界模型 · 端到端控制 · 灵巧手" },
    { letter: "M", color: C.mint,  title: "Mapping",       sub: "产业链生态位 -- 供应链全景 · 卡脖子清单 · 中美对比" },
    { letter: "O", color: C.gold,  title: "Operations",    sub: "商业化运营 -- 四大场景 · 客户结构 · ROI分析" },
    { letter: "R", color: C.green, title: "Reach",         sub: "市场容量 -- 三情景预测 · 细分市场 · 全球化策略" },
    { letter: "A2", color: C.red,  title: "Assets",        sub: "资本价值 -- 财务对比 · 估值矩阵 · 投资建议" },
  ];

  const startY = 1.22;
  const rowH   = 0.74;

  sections.forEach((s, i) => {
    const y = startY + i * rowH;
    card(sl, 0.55, y, 8.9, rowH - 0.06, C.navyMid);
    accentLine(sl, 0.55, y, rowH - 0.06);

    sl.addShape("rect", { x: 0.7, y: y + 0.1, w: 0.44, h: 0.44, fill: { color: s.color }, line: { color: s.color, width: 0 } });
    sl.addText(s.letter, {
      x: 0.7, y: y + 0.1, w: 0.44, h: 0.44,
      fontSize: 14, bold: true, color: C.navy, fontFace: "Arial Black",
      align: "center", valign: "middle", margin: 0,
    });

    sl.addText(s.title, {
      x: 1.28, y: y + 0.07, w: 4.5, h: 0.35,
      fontSize: 15, bold: true, color: C.white, fontFace: "Arial Black", margin: 0,
    });
    sl.addText(s.sub, {
      x: 1.28, y: y + 0.40, w: 7.8, h: 0.24,
      fontSize: 10, color: C.gray, fontFace: "Calibri", margin: 0,
    });
    sl.addText("Slide " + (4 + i * 2), {
      x: 8.8, y: y + 0.18, w: 0.6, h: 0.28,
      fontSize: 9, color: C.teal, fontFace: "Calibri", align: "right", margin: 0,
    });
  });
}

// =========================================================
// SLIDE 3 - Executive Summary
// =========================================================
{
  let sl = pres.addSlide();
  sl.background = { color: C.navy };
  titleBar(sl, "Executive Summary", "3 Key Findings  |  Industry Rating 7.2/10");

  card(sl, 0.55, 1.22, 8.9, 0.60, C.tealDim);
  sl.addText('"Only 3 of 25 tracked companies have deployed 50+ units in real-world settings. The rest are still selling demos."', {
    x: 0.7, y: 1.25, w: 8.5, h: 0.55,
    fontSize: 12, italic: true, bold: true, color: C.white, fontFace: "Calibri",
    align: "center", valign: "middle", margin: 0,
  });

  const findings = [
    {
      num: "01",
      title: "中国赢在制造密度，美国赢在算法深度",
      body: "叙事已不完整：中国正快速补齐算法短板，美国制造护城河被供应链空心化侵蚀。",
      color: C.teal,
    },
    {
      num: "02",
      title: "真正拉开差距的不是硬件参数，是数据闭环",
      body: "谁能更快积累真实场景运行数据，谁就掌握了训练下一代模型的主动权。",
      color: C.gold,
    },
    {
      num: "03",
      title: "关键变量：商业化复制成本，而非技术迭代速度",
      body: "能否从1台原型机做到100台部署，是目前所有玩家面临的共同瓶颈。",
      color: C.green,
    },
  ];

  findings.forEach((f, i) => {
    const y = 1.97 + i * 1.07;
    card(sl, 0.55, y, 8.9, 0.95, C.navyMid);
    accentLine(sl, 0.55, y, 0.95);
    sl.addShape("rect", { x: 0.7, y: y + 0.25, w: 0.44, h: 0.44, fill: { color: f.color }, line: { color: f.color, width: 0 } });
    sl.addText(f.num, { x: 0.7, y: y + 0.25, w: 0.44, h: 0.44, fontSize: 13, bold: true, color: C.navy, fontFace: "Arial Black", align: "center", valign: "middle", margin: 0 });
    sl.addText(f.title, { x: 1.28, y: y + 0.10, w: 8.1, h: 0.36, fontSize: 13, bold: true, color: C.mint, fontFace: "Calibri", margin: 0 });
    sl.addText(f.body,  { x: 1.28, y: y + 0.50, w: 8.1, h: 0.35, fontSize: 11, color: C.gray, fontFace: "Calibri", margin: 0 });
  });
}

// =========================================================
// SLIDE 4 - Advancement
// =========================================================
{
  let sl = pres.addSlide();
  sl.background = { color: C.navy };
  titleBar(sl, "A -- Advancement  技术先进性", "世界模型 · 端到端控制 · 灵巧手 · 中美技术差距");

  const cols = [
    {
      emoji: "[World]", title: "世界模型\nWorld Model",
      points: "· Transformer 3D 场景表征\n· Tesla Dojo / NVIDIA Isaac Sim 领先\n· 宇树 Unitree-PI 系列快速追赶\n· 关键差距：Sim2Real 转换效率",
      color: C.teal,
    },
    {
      emoji: "[E2E]", title: "端到端控制\nE2E Control",
      points: "· VLA（Vision-Language-Action）成主流\n· Figure-OpenAI / Agility-Amazon 战略绑定\n· Agibot 智元 强化学习取得突破\n· 真实部署仍受限于 Sim2Real Gap",
      color: C.mint,
    },
    {
      emoji: "[Hand]", title: "灵巧手\nDexterous Hand",
      points: "· 20-23 DOF 成行业主流\n· 宇树灵巧手售价 $2K，性价比领先\n· Tesla Optimus 手部自研最深\n· 触觉反馈仍是全行业短板",
      color: C.gold,
    },
  ];

  const colW = 2.82;
  cols.forEach((c, i) => {
    const x = 0.55 + i * 3.06;
    card(sl, x, 1.22, colW, 3.98, C.navyMid);
    sl.addShape("rect", { x, y: 1.22, w: colW, h: 0.07, fill: { color: c.color }, line: { color: c.color, width: 0 } });
    sl.addText(c.title, {
      x: x + 0.12, y: 1.32, w: colW - 0.22, h: 0.65,
      fontSize: 13, bold: true, color: C.white, fontFace: "Calibri", margin: 0,
    });
    sl.addShape("rect", { x: x + 0.12, y: 2.00, w: colW - 0.24, h: 0.025, fill: { color: C.slate }, line: { color: C.slate, width: 0 } });
    sl.addText(c.points, {
      x: x + 0.12, y: 2.08, w: colW - 0.22, h: 2.85,
      fontSize: 11, color: C.gray, fontFace: "Calibri", margin: 0, paraSpaceAfter: 6,
    });
  });

  card(sl, 0.55, 5.28, 8.9, 0.22, C.slate);
  sl.addText("核心判断：Tesla Optimus Advancement 9.2/10，但其中50%来自Dojo算力，而非机器人本体技术 -- 需区分看待。", {
    x: 0.7, y: 5.30, w: 8.5, h: 0.18,
    fontSize: 9, italic: true, color: C.teal, fontFace: "Calibri", margin: 0,
  });
}

// =========================================================
// SLIDE 5 - Mapping: Supply Chain
// =========================================================
{
  let sl = pres.addSlide();
  sl.background = { color: C.navy };
  titleBar(sl, "M -- Mapping  产业链生态位", "中美供应链全景 · 卡脖子清单 · 关键依赖分析");

  const layers = [
    { label: "算法层",   items: "VLA / RL / Foundation Model",   cn: "弱",   us: "极强", cnC: C.red,   usC: C.green },
    { label: "算力层",   items: "NVIDIA Jetson Thor / Orin X",   cn: "弱",   us: "极强", cnC: C.red,   usC: C.green },
    { label: "整机OEM",  items: "宇树 / Tesla / Figure AI",       cn: "极强", us: "中",   cnC: C.green, usC: C.gold  },
    { label: "执行器",   items: "谐波减速器 / 电机 / 滚柱丝杠",  cn: "强",   us: "弱",   cnC: C.teal,  usC: C.red   },
    { label: "传感器",   items: "力觉/触觉/视觉/IMU",            cn: "中",   us: "强",   cnC: C.gold,  usC: C.teal  },
    { label: "下游场景", items: "工厂 / 物流 / 医疗 / 家庭",     cn: "强",   us: "中",   cnC: C.teal,  usC: C.gold  },
  ];

  sl.addText("产业链层级",   { x: 0.55, y: 1.20, w: 2.2, h: 0.28, fontSize: 10, bold: true, color: C.teal, fontFace: "Calibri", margin: 0 });
  sl.addText("主要玩家/产品", { x: 2.8,  y: 1.20, w: 3.5, h: 0.28, fontSize: 10, bold: true, color: C.teal, fontFace: "Calibri", margin: 0 });
  sl.addText("中国能力",     { x: 6.4,  y: 1.20, w: 1.4, h: 0.28, fontSize: 10, bold: true, color: C.teal, fontFace: "Calibri", margin: 0, align: "center" });
  sl.addText("美国能力",     { x: 8.0,  y: 1.20, w: 1.4, h: 0.28, fontSize: 10, bold: true, color: C.teal, fontFace: "Calibri", margin: 0, align: "center" });
  sl.addShape("rect", { x: 0.55, y: 1.50, w: 8.9, h: 0.025, fill: { color: C.slate }, line: { color: C.slate, width: 0 } });

  layers.forEach((row, i) => {
    const y = 1.58 + i * 0.60;
    if (i % 2 === 0) {
      sl.addShape("rect", { x: 0.55, y, w: 8.9, h: 0.57, fill: { color: C.navyMid }, line: { color: C.navyMid, width: 0 } });
    }
    sl.addShape("rect", { x: 0.55, y: y + 0.08, w: 0.05, h: 0.38, fill: { color: C.teal }, line: { color: C.teal, width: 0 } });
    sl.addText(row.label, { x: 0.68, y: y + 0.13, w: 2.0, h: 0.28, fontSize: 12, bold: true, color: C.white, fontFace: "Calibri", margin: 0 });
    sl.addText(row.items, { x: 2.8,  y: y + 0.13, w: 3.45, h: 0.28, fontSize: 10, color: C.gray, fontFace: "Calibri", margin: 0 });

    sl.addShape("rect", { x: 6.55, y: y + 0.10, w: 1.0, h: 0.30, fill: { color: row.cnC }, line: { color: row.cnC, width: 0 } });
    sl.addText(row.cn, { x: 6.55, y: y + 0.10, w: 1.0, h: 0.30, fontSize: 11, bold: true, color: C.navy, fontFace: "Calibri", align: "center", valign: "middle", margin: 0 });

    sl.addShape("rect", { x: 8.10, y: y + 0.10, w: 1.0, h: 0.30, fill: { color: row.usC }, line: { color: row.usC, width: 0 } });
    sl.addText(row.us, { x: 8.10, y: y + 0.10, w: 1.0, h: 0.30, fontSize: 11, bold: true, color: C.navy, fontFace: "Calibri", align: "center", valign: "middle", margin: 0 });
  });

  sl.addText("卡脖子清单：算力芯片（NVIDIA垄断）· 高精度减速器（日本纳博克）· 高性能电机控制IC · VLA大模型基础训练框架", {
    x: 0.55, y: 5.28, w: 9.0, h: 0.25, fontSize: 9, color: C.gold, fontFace: "Calibri", margin: 0,
  });
}

// =========================================================
// SLIDE 6 - Operations: 四大应用场景
// =========================================================
{
  let sl = pres.addSlide();
  sl.background = { color: C.navy };
  titleBar(sl, "O -- Operations  商业化运营", "四大应用场景 · 客户结构 · ROI分析");

  const scenarios = [
    {
      title: "工厂制造", status: "最成熟", statusColor: C.green, roi: "IRR 18-22%",
      body: "比亚迪/东风工厂 · 优必选Walker S部署\n年替代3名工人，回收期4-5年\n挑战：柔性切换成本高",
    },
    {
      title: "物流仓储", status: "快速增长", statusColor: C.teal, roi: "IRR 14-18%",
      body: "Amazon-Agility Robotics Digit合作\n顺丰/菜鸟仓储试点\n重复性任务适配度高",
    },
    {
      title: "医疗康复", status: "高潜力", statusColor: C.gold, roi: "IRR 8-12%",
      body: "Fourier GR-1 康复场景领先\n高值耗材+软件订阅商业模式\n监管壁垒是主要障碍",
    },
    {
      title: "家庭服务", status: "2030+", statusColor: C.red, roi: "不确定",
      body: "成本目标$10K-15K（当前3-5倍）\n1X NEO Beta 技术路线最近\n消费者信任是关键变量",
    },
  ];

  const colW = 4.3;
  scenarios.forEach((s, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.55 + col * 4.6;
    const y = 1.22 + row * 2.15;
    card(sl, x, y, colW, 2.0, C.navyMid);
    sl.addShape("rect", { x, y, w: colW, h: 0.07, fill: { color: s.statusColor }, line: { color: s.statusColor, width: 0 } });

    sl.addText(s.title, { x: x + 0.12, y: y + 0.12, w: 2.8, h: 0.38, fontSize: 15, bold: true, color: C.white, fontFace: "Calibri", margin: 0 });
    sl.addShape("rect", { x: x + 3.05, y: y + 0.13, w: 1.1, h: 0.30, fill: { color: s.statusColor }, line: { color: s.statusColor, width: 0 } });
    sl.addText(s.status, { x: x + 3.05, y: y + 0.13, w: 1.1, h: 0.30, fontSize: 10, bold: true, color: C.navy, fontFace: "Calibri", align: "center", valign: "middle", margin: 0 });

    sl.addShape("rect", { x: x + 0.12, y: y + 0.57, w: 1.5, h: 0.28, fill: { color: C.slate }, line: { color: C.slate, width: 0 } });
    sl.addText(s.roi, { x: x + 0.12, y: y + 0.57, w: 1.5, h: 0.28, fontSize: 10, bold: true, color: C.gold, fontFace: "Calibri", align: "center", valign: "middle", margin: 0 });

    sl.addText(s.body, { x: x + 0.12, y: y + 0.96, w: colW - 0.24, h: 0.90, fontSize: 10, color: C.gray, fontFace: "Calibri", margin: 0, paraSpaceAfter: 4 });
  });
}

// =========================================================
// SLIDE 7 - Reach: Market Size Forecast
// =========================================================
{
  let sl = pres.addSlide();
  sl.background = { color: C.navy };
  titleBar(sl, "R -- Reach  市场容量", "三情景预测 2025-2030 · 全球出货量 · 市场规模");

  const chartData = [
    { name: "保守情景", labels: ["2025", "2026", "2027", "2028", "2029", "2030"], values: [1.7, 3.5, 8, 18, 40, 85] },
    { name: "基准情景", labels: ["2025", "2026", "2027", "2028", "2029", "2030"], values: [1.7, 5, 14, 38, 100, 250] },
    { name: "激进情景", labels: ["2025", "2026", "2027", "2028", "2029", "2030"], values: [1.7, 7, 22, 70, 200, 500] },
  ];

  sl.addChart(pres.charts.BAR, chartData, {
    x: 0.45, y: 1.20, w: 5.9, h: 3.95,
    barDir: "col",
    barGrouping: "clustered",
    chartColors: ["2D4A61", "00B4D8", "90E0EF"],
    chartArea: { fill: { color: C.navyMid }, roundedCorners: false },
    plotArea:  { fill: { color: C.navyMid } },
    catAxisLabelColor: C.gray,
    valAxisLabelColor: C.gray,
    valAxisLineShow: false,
    catAxisLineShow: false,
    valGridLine: { color: C.slate, size: 0.5 },
    catGridLine: { style: "none" },
    showTitle: true, title: "全球人形机器人年出货量（万台）",
    titleColor: C.white, titleFontSize: 11,
    showLegend: true, legendPos: "b", legendFontColor: C.gray,
    showValue: false,
  });

  const metrics = [
    { val: "1.7万台",  label: "2025年预测出货量",   sub: "全球，宇树约占32%",         color: C.teal  },
    { val: "$3.6B",    label: "2025年全球市场规模",  sub: "MarketsandMarkets估算",     color: C.gold  },
    { val: "250万台",  label: "2030年基准情景出货",  sub: "工业场景主导",               color: C.green },
    { val: "3.5万亿",  label: "中国2030市场估算",    sub: "含软件/服务/配套生态",       color: C.mint  },
  ];

  metrics.forEach((m, i) => {
    const y = 1.20 + i * 0.99;
    card(sl, 6.5, y, 3.2, 0.87, C.navyMid);
    accentLine(sl, 6.5, y, 0.87);
    sl.addText(m.val,   { x: 6.65, y: y + 0.03, w: 3.0, h: 0.44, fontSize: 26, bold: true, color: m.color, fontFace: "Arial Black", margin: 0 });
    sl.addText(m.label, { x: 6.65, y: y + 0.47, w: 3.0, h: 0.22, fontSize: 10, bold: true, color: C.white, fontFace: "Calibri", margin: 0 });
    sl.addText(m.sub,   { x: 6.65, y: y + 0.67, w: 3.0, h: 0.18, fontSize: 9, color: C.gray, fontFace: "Calibri", margin: 0 });
  });

  sl.addText("三情景触发条件：保守=2027前无规模化工业客户；基准=Tesla/宇树2.0均进入量产；激进=具身大模型出现，成本跌破$10K", {
    x: 0.45, y: 5.28, w: 9.2, h: 0.24, fontSize: 8.5, color: C.gold, fontFace: "Calibri", margin: 0,
  });
}

// =========================================================
// SLIDE 8 - Assets: Capital Efficiency
// =========================================================
{
  let sl = pres.addSlide();
  sl.background = { color: C.navy };
  titleBar(sl, "A2 -- Assets  资本价值", "主要玩家财务对比 · 资本效率 · 估值矩阵");

  card(sl, 0.55, 1.22, 8.9, 0.70, C.tealDim);
  sl.addText("宇树 vs Figure AI：资本效率相差 125倍", {
    x: 0.7, y: 1.25, w: 8.5, h: 0.36,
    fontSize: 17, bold: true, color: C.white, fontFace: "Arial Black", align: "center", margin: 0,
  });
  sl.addText("Figure：融资$6.75亿 · 出货<200台 = $338万/台    VS    宇树：融资~$1.5亿 · 出货5,500台 = $2.7万/台", {
    x: 0.7, y: 1.60, w: 8.5, h: 0.28,
    fontSize: 11, color: C.mint, fontFace: "Calibri", align: "center", margin: 0,
  });

  const tableRows = [
    [
      { text: "公司",     options: { fill: { color: C.tealDim }, color: C.white, bold: true, align: "center", fontSize: 10, fontFace: "Calibri" } },
      { text: "估值/融资", options: { fill: { color: C.tealDim }, color: C.white, bold: true, align: "center", fontSize: 10, fontFace: "Calibri" } },
      { text: "2025营收", options: { fill: { color: C.tealDim }, color: C.white, bold: true, align: "center", fontSize: 10, fontFace: "Calibri" } },
      { text: "毛利率",   options: { fill: { color: C.tealDim }, color: C.white, bold: true, align: "center", fontSize: 10, fontFace: "Calibri" } },
      { text: "资本效率", options: { fill: { color: C.tealDim }, color: C.white, bold: true, align: "center", fontSize: 10, fontFace: "Calibri" } },
      { text: "数据置信", options: { fill: { color: C.tealDim }, color: C.white, bold: true, align: "center", fontSize: 10, fontFace: "Calibri" } },
    ],
    [
      { text: "宇树科技",    options: { fill: { color: C.navyMid }, color: C.white, bold: true, fontSize: 10, fontFace: "Calibri" } },
      { text: "260亿(IPO)", options: { fill: { color: C.navyMid }, color: C.gray, align: "center", fontSize: 10, fontFace: "Calibri" } },
      { text: "17.08亿元",   options: { fill: { color: C.navyMid }, color: C.green, bold: true, align: "center", fontSize: 10, fontFace: "Calibri" } },
      { text: "60.27%",      options: { fill: { color: C.navyMid }, color: C.green, bold: true, align: "center", fontSize: 10, fontFace: "Calibri" } },
      { text: "$2.7万/台",   options: { fill: { color: C.navyMid }, color: C.green, bold: true, align: "center", fontSize: 10, fontFace: "Calibri" } },
      { text: "L1 招股书",   options: { fill: { color: C.navyMid }, color: C.mint, bold: true, align: "center", fontSize: 10, fontFace: "Calibri" } },
    ],
    [
      { text: "优必选",      options: { fill: { color: C.navy }, color: C.white, bold: true, fontSize: 10, fontFace: "Calibri" } },
      { text: "$2.0亿(港)",  options: { fill: { color: C.navy }, color: C.gray, align: "center", fontSize: 10, fontFace: "Calibri" } },
      { text: "9亿元(估)",   options: { fill: { color: C.navy }, color: C.gray, align: "center", fontSize: 10, fontFace: "Calibri" } },
      { text: "35%(估)",     options: { fill: { color: C.navy }, color: C.gray, align: "center", fontSize: 10, fontFace: "Calibri" } },
      { text: "N/A",         options: { fill: { color: C.navy }, color: C.gray, align: "center", fontSize: 10, fontFace: "Calibri" } },
      { text: "L2 年报",     options: { fill: { color: C.navy }, color: C.gold, align: "center", fontSize: 10, fontFace: "Calibri" } },
    ],
    [
      { text: "Figure AI",   options: { fill: { color: C.navyMid }, color: C.white, bold: true, fontSize: 10, fontFace: "Calibri" } },
      { text: "$39亿",        options: { fill: { color: C.navyMid }, color: C.gray, align: "center", fontSize: 10, fontFace: "Calibri" } },
      { text: "<$1000万",     options: { fill: { color: C.navyMid }, color: C.gray, align: "center", fontSize: 10, fontFace: "Calibri" } },
      { text: "N/A",          options: { fill: { color: C.navyMid }, color: C.gray, align: "center", fontSize: 10, fontFace: "Calibri" } },
      { text: "$338万/台",    options: { fill: { color: C.navyMid }, color: C.red, bold: true, align: "center", fontSize: 10, fontFace: "Calibri" } },
      { text: "L3 媒体",      options: { fill: { color: C.navyMid }, color: C.red, align: "center", fontSize: 10, fontFace: "Calibri" } },
    ],
    [
      { text: "UBTECH",      options: { fill: { color: C.navy }, color: C.white, bold: true, fontSize: 10, fontFace: "Calibri" } },
      { text: "$1.5亿(港)",  options: { fill: { color: C.navy }, color: C.gray, align: "center", fontSize: 10, fontFace: "Calibri" } },
      { text: "7亿元(估)",   options: { fill: { color: C.navy }, color: C.gray, align: "center", fontSize: 10, fontFace: "Calibri" } },
      { text: "30%(估)",     options: { fill: { color: C.navy }, color: C.gray, align: "center", fontSize: 10, fontFace: "Calibri" } },
      { text: "N/A",         options: { fill: { color: C.navy }, color: C.gray, align: "center", fontSize: 10, fontFace: "Calibri" } },
      { text: "L2 年报",     options: { fill: { color: C.navy }, color: C.gold, align: "center", fontSize: 10, fontFace: "Calibri" } },
    ],
    [
      { text: "Boston Dyn.", options: { fill: { color: C.navyMid }, color: C.white, bold: true, fontSize: 10, fontFace: "Calibri" } },
      { text: "并入现代汽车", options: { fill: { color: C.navyMid }, color: C.gray, align: "center", fontSize: 10, fontFace: "Calibri" } },
      { text: "$1亿+(估)",   options: { fill: { color: C.navyMid }, color: C.gray, align: "center", fontSize: 10, fontFace: "Calibri" } },
      { text: "N/A",          options: { fill: { color: C.navyMid }, color: C.gray, align: "center", fontSize: 10, fontFace: "Calibri" } },
      { text: "N/A",          options: { fill: { color: C.navyMid }, color: C.gray, align: "center", fontSize: 10, fontFace: "Calibri" } },
      { text: "L2 母公司",    options: { fill: { color: C.navyMid }, color: C.gold, align: "center", fontSize: 10, fontFace: "Calibri" } },
    ],
  ];

  sl.addTable(tableRows, {
    x: 0.55, y: 2.05, w: 8.9, h: 2.60,
    colW: [1.55, 1.6, 1.45, 1.2, 1.55, 1.55],
    border: { type: "solid", pt: 0.5, color: C.slate },
    rowH: 0.37,
  });

  // Three investment theses
  const theses = [
    { label: "中国商业化",  body: "宇树·智元·乐聚\n当期盈利+规模效应", color: C.green },
    { label: "美国算法期权", body: "Figure·1X·Apptronik\n押注具身AI算法护城河", color: C.teal },
    { label: "供应链零部件", body: "执行器·传感器·EMS\n确定性最高的价值洼地", color: C.gold },
  ];

  theses.forEach((t, i) => {
    const x = 0.55 + i * 3.0;
    card(sl, x, 4.75, 2.85, 0.72, C.navyMid);
    sl.addShape("rect", { x, y: 4.75, w: 2.85, h: 0.07, fill: { color: t.color }, line: { color: t.color, width: 0 } });
    sl.addText(t.label, { x: x + 0.12, y: 4.82, w: 2.6, h: 0.26, fontSize: 12, bold: true, color: t.color, fontFace: "Calibri", margin: 0 });
    sl.addText(t.body,  { x: x + 0.12, y: 5.08, w: 2.6, h: 0.34, fontSize: 10, color: C.gray, fontFace: "Calibri", margin: 0 });
  });
}

// =========================================================
// SLIDE 9 - AMORA Score: Company Ratings
// =========================================================
{
  let sl = pres.addSlide();
  sl.background = { color: C.navy };
  titleBar(sl, "AMORA Score  企业评分卡汇总", "第一梯队12家企业 · 五维评分 · 2026Q1");

  const companies = [
    { name: "宇树科技",        A: 8.5, M: 7.5, O: 9.2, R: 8.0, Af: 7.8, total: 8.9, country: "CN" },
    { name: "Tesla Optimus",   A: 9.2, M: 9.5, O: 5.0, R: 9.0, Af: 9.5, total: 8.5, country: "US" },
    { name: "Boston Dynamics", A: 8.8, M: 9.0, O: 8.0, R: 9.0, Af: 8.8, total: 8.3, country: "US" },
    { name: "Figure AI",       A: 8.5, M: 9.5, O: 4.5, R: 7.0, Af: 7.0, total: 7.8, country: "US" },
    { name: "优必选",           A: 7.5, M: 6.5, O: 8.5, R: 7.5, Af: 8.5, total: 7.7, country: "CN" },
    { name: "Agility Robotics", A: 8.0, M: 8.5, O: 8.0, R: 8.5, Af: 7.5, total: 7.6, country: "US" },
    { name: "Agibot 智元",      A: 7.8, M: 7.0, O: 7.0, R: 6.5, Af: 7.0, total: 7.1, country: "CN" },
    { name: "1X Technologies",  A: 8.2, M: 9.2, O: 4.0, R: 6.0, Af: 7.5, total: 7.0, country: "NO" },
    { name: "Fourier GR-1",     A: 7.2, M: 7.0, O: 6.5, R: 7.0, Af: 6.8, total: 6.9, country: "CN" },
    { name: "Apptronik",        A: 7.5, M: 8.0, O: 5.5, R: 7.5, Af: 7.0, total: 6.8, country: "US" },
    { name: "UBTECH",           A: 7.0, M: 6.5, O: 6.8, R: 7.5, Af: 8.5, total: 6.8, country: "CN" },
    { name: "乐聚机器人",        A: 6.8, M: 6.5, O: 7.0, R: 6.0, Af: 7.0, total: 6.5, country: "CN" },
  ];

  // Header
  const hCols = ["公司", "A", "M", "O", "R", "Af", "综合评分", ""];
  const hRow = hCols.map(h => ({
    text: h,
    options: { fill: { color: C.tealDim }, color: C.white, bold: true, align: "center", fontSize: 10, fontFace: "Calibri" },
  }));
  hRow[0].options.align = "left";

  const dataRows = companies.map((c, ri) => {
    const bg = ri % 2 === 0 ? C.navyMid : C.navy;
    const flag = c.country === "CN" ? "[CN]" : c.country === "US" ? "[US]" : "[NO]";
    const scoreColor = c.total >= 8.5 ? C.green : c.total >= 7.5 ? C.teal : c.total >= 7.0 ? C.gold : C.gray;
    const barLen = Math.round((c.total / 10) * 6);
    const bar = "█".repeat(barLen) + "░".repeat(6 - barLen);

    function scoreCell(val) {
      const color = val >= 8.5 ? C.green : val >= 7.5 ? C.teal : val >= 7.0 ? C.gold : val >= 6.0 ? C.gray : C.red;
      return { text: String(val.toFixed(1)), options: { fill: { color: bg }, color, align: "center", fontSize: 10, fontFace: "Calibri" } };
    }

    return [
      { text: flag + " " + c.name, options: { fill: { color: bg }, color: C.white, bold: true, fontSize: 10, fontFace: "Calibri" } },
      scoreCell(c.A), scoreCell(c.M), scoreCell(c.O), scoreCell(c.R), scoreCell(c.Af),
      { text: String(c.total.toFixed(1)), options: { fill: { color: bg }, color: scoreColor, bold: true, align: "center", fontSize: 12, fontFace: "Arial Black" } },
      { text: bar, options: { fill: { color: bg }, color: scoreColor, align: "left", fontSize: 8, fontFace: "Calibri" } },
    ];
  });

  sl.addTable([hRow, ...dataRows], {
    x: 0.45, y: 1.22, w: 9.1, h: 4.22,
    colW: [2.0, 0.7, 0.7, 0.7, 0.7, 0.7, 0.85, 2.75],
    border: { type: "solid", pt: 0.5, color: C.slate },
    rowH: 0.335,
  });

  sl.addText("A=Advancement(技术壁垒) · M=Mastery(人才) · O=Operations(商业落地) · R=Reach(全球化) · Af=Affinity(可持续)  |  数据截止Q1 2026", {
    x: 0.45, y: 5.50, w: 9.1, h: 0.22, fontSize: 8.5, color: C.gray, fontFace: "Calibri", margin: 0,
  });
}

// =========================================================
// SLIDE 10 - Investment Conclusions
// =========================================================
{
  let sl = pres.addSlide();
  sl.background = { color: C.navy };
  titleBar(sl, "Investment Conclusions  投资建议", "估值逻辑 · 三类机会 · 2026-2027 关键催化剂");

  // Three thesis cards
  const theses = [
    {
      tag: "HIGH CONVICTION", tagColor: C.green,
      title: "中国主机厂（商业化逻辑）",
      points: [
        "宇树IPO定价是全行业估值锚，PS 15x",
        "智元/乐聚：下一轮融资估值参照宇树",
        "盈利公司稀缺性溢价，科创板机器人板块",
        "风险：科研教育客户占73.6%，工业替代仍早期",
      ],
      color: C.green,
    },
    {
      tag: "OPTION PLAY", tagColor: C.teal,
      title: "美国算法公司（期权逻辑）",
      points: [
        "Figure AI $39亿估值 = 具身AI算法期权",
        "OpenAI/NVIDIA战略背书构成稀缺性溢价",
        "具身大模型出现时，估值逻辑被验证/颠覆",
        "风险：无盈利路径，依赖融资续命到2028+",
      ],
      color: C.teal,
    },
    {
      tag: "HIGHEST CERTAINTY", tagColor: C.gold,
      title: "供应链零部件（确定性逻辑）",
      points: [
        "执行器：谐波减速器/高性能电机（日本领先）",
        "传感器：6轴力觉/触觉传感（全球稀缺）",
        "EMS代工：富士康/立讯精密已切入",
        "风险较低，但增长天花板受限",
      ],
      color: C.gold,
    },
  ];

  theses.forEach((t, i) => {
    const x = 0.5 + i * 3.15;
    card(sl, x, 1.22, 3.0, 3.2, C.navyMid);
    sl.addShape("rect", { x, y: 1.22, w: 3.0, h: 0.07, fill: { color: t.color }, line: { color: t.color, width: 0 } });
    sl.addShape("rect", { x: x + 0.12, y: 1.32, w: 2.2, h: 0.28, fill: { color: t.tagColor }, line: { color: t.tagColor, width: 0 } });
    sl.addText(t.tag, { x: x + 0.12, y: 1.32, w: 2.2, h: 0.28, fontSize: 9, bold: true, color: C.navy, fontFace: "Calibri", align: "center", valign: "middle", margin: 0 });
    sl.addText(t.title, { x: x + 0.12, y: 1.65, w: 2.75, h: 0.40, fontSize: 12, bold: true, color: C.white, fontFace: "Calibri", margin: 0 });
    sl.addShape("rect", { x: x + 0.12, y: 2.08, w: 2.75, h: 0.025, fill: { color: C.slate }, line: { color: C.slate, width: 0 } });
    sl.addText(t.points.map(p => "· " + p).join("\n"), {
      x: x + 0.12, y: 2.15, w: 2.75, h: 2.1,
      fontSize: 10, color: C.gray, fontFace: "Calibri", margin: 0, paraSpaceAfter: 5,
    });
  });

  // Catalysts
  card(sl, 0.5, 4.55, 9.1, 0.85, C.navyMid);
  sl.addShape("rect", { x: 0.5, y: 4.55, w: 9.1, h: 0.07, fill: { color: C.tealDim }, line: { color: C.tealDim, width: 0 } });
  sl.addText("2026-2027 关键催化剂", {
    x: 0.65, y: 4.63, w: 3.0, h: 0.26,
    fontSize: 11, bold: true, color: C.teal, fontFace: "Calibri", margin: 0,
  });
  sl.addText([
    { text: "宇树IPO完成",         options: { color: C.mint, bold: true } },
    { text: " · ",                  options: { color: C.gray } },
    { text: "Tesla Optimus量产",    options: { color: C.mint, bold: true } },
    { text: " · ",                  options: { color: C.gray } },
    { text: "具身大模型发布",       options: { color: C.mint, bold: true } },
    { text: " · ",                  options: { color: C.gray } },
    { text: "成本跌破$10K",         options: { color: C.gold, bold: true } },
    { text: " · ",                  options: { color: C.gray } },
    { text: "中国工业客户规模采购", options: { color: C.green, bold: true } },
  ], { x: 0.65, y: 4.93, w: 8.8, h: 0.36, fontSize: 11, fontFace: "Calibri", margin: 0 });
}

// =========================================================
// SLIDE 11 - Closing / Appendix
// =========================================================
{
  let sl = pres.addSlide();
  sl.background = { color: C.navy };

  sl.addShape("rect", { x: 0, y: 0, w: 0.12, h: 5.625, fill: { color: C.teal }, line: { color: C.teal, width: 0 } });

  sl.addText("About This Report", {
    x: 0.55, y: 0.8, w: 9, h: 0.65,
    fontSize: 32, bold: true, color: C.white, fontFace: "Arial Black", margin: 0,
  });
  sl.addText("The Humanoid Robot Index 2026 by AMORA Insights", {
    x: 0.55, y: 1.48, w: 9, h: 0.36,
    fontSize: 14, italic: true, color: C.teal, fontFace: "Calibri", margin: 0,
  });

  const infos = [
    { label: "报告框架", value: "AMORA Report: Advancement / Mapping / Operations / Reach / Assets" },
    { label: "覆盖公司", value: "25家：第一梯队12家（深度评分）+ 第二梯队8家 + 平台层5家" },
    { label: "数据截止", value: "Q1 2026 (2026年3月31日)" },
    { label: "数据分级", value: "L1 = 经审计财报/招股书 · L2 = 官方公告/年报 · L3 = 媒体估算" },
    { label: "重要声明", value: "本报告所有投资建议仅供参考，不构成投资意见。过往表现不代表未来结果。" },
  ];

  infos.forEach((info, i) => {
    const y = 2.10 + i * 0.60;
    accentLine(sl, 0.55, y, 0.48);
    sl.addText(info.label + "：", { x: 0.72, y, w: 1.5, h: 0.30, fontSize: 11, bold: true, color: C.teal, fontFace: "Calibri", margin: 0 });
    sl.addText(info.value, { x: 2.25, y, w: 7.2, h: 0.30, fontSize: 11, color: C.gray, fontFace: "Calibri", margin: 0 });
  });

  sl.addShape("rect", { x: 0, y: 5.2, w: 10, h: 0.425, fill: { color: C.navyMid }, line: { color: C.navyMid, width: 0 } });
  sl.addText("AMORA Insights  |  humanoidrobotindex.com  |  Q1 2026  |  All Rights Reserved", {
    x: 0.55, y: 5.25, w: 9, h: 0.32,
    fontSize: 9, color: C.gray, fontFace: "Calibri", align: "center", margin: 0,
  });
}

// =========================================================
// Save
// =========================================================
pres.writeFile({ fileName: OUTPUT })
  .then(() => console.log("PPT saved: " + OUTPUT))
  .catch(e => { console.error("Error:", e); process.exit(1); });
