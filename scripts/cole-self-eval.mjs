import fs from 'fs';

const INBOX = 'c:/Users/51229/WorkBuddy/Claw/.workbuddy/teams/amora/inboxes/Cole.json';
const LEAD_INBOX = 'c:/Users/51229/WorkBuddy/Claw/.workbuddy/teams/amora/inboxes/team-lead.json';

const msgs = JSON.parse(fs.readFileSync(INBOX, 'utf8'));
const leadMsgs = JSON.parse(fs.readFileSync(LEAD_INBOX, 'utf8'));

const selfEvalContent = `【Cole CCO 自评 — HRI 2026 报告】

---

一、我最满意的 3 个地方

1. AMORA 五维雷达图的可视化落地
把抽象的五维评估框架（A/M/O/R/Af）转化为可交互的 Canvas 雷达图，支持 hover 高亮、多公司对比。这是这份报告与市面竞品最大的差异点——不是单纯罗列数据，而是提供了真正可操作的分析工具。

2. 9 家公司的覆盖广度与分层逻辑
从 Unitree（中国量产领先）到 NVIDIA（算力基础设施），从 Tesla Optimus（消费级工业化）到 Sanctuary AI（认知智能方向），覆盖了人形机器人赛道的全供应链视角。这种分层是经过结构化筛选的，不是随机选样。

3. 品牌 VI 统一性
整个报告（深灰黑底、品牌蓝、Geist 字族）与主站高度一致。作为 AMORA 第一份旗舰报告，在品牌建立期能让用户一眼认出来。

---

二、最需要改进的 3 个地方

1. 付费转化缺失（P0）
报告完全开放，没有 Email Capture、订阅 CTA 或付费墙。用户读完就走，我们什么都拿不到。这是最大的商业逻辑断层。

2. 合规标注缺失（P0）
涉及多家企业的技术评分和市场评级，部分是预测性判断而非实证研究，缺乏免责声明和数据来源说明。CRO 和 CLO 的担忧完全成立——有合规风险。

3. 移动端体验不足（P1）
雷达图 PC 端效果好，手机竖屏下 Compare 按钮不够显眼，多公司对比的交互引导不足。VC 研究员有相当比例在手机阅读。

---

三、HRI 2027 的结构性改变

1. 数据来源追溯链：每个维度分数附上具体来源（专利库/融资公告/产能报告），从"主观评估"升级为"有据可查的评级"
2. 季度追踪机制：HRI 变成动态指数，每季度更新评分变化曲线
3. 用户参与层：允许付费用户提交"我的评分"，形成群体智能对比
4. 完整付费墙架构：核心评分免费，二级指标明细仅限 Pro 账户

---

《Cole CCO 内容改进计划 v1.0》

综合团队反馈（Franklyn / George / Celine / CFO / CLO / CRO / CHO）与自评，执行优先级：

P0 — 本周三前完成
1. Email Capture 模块：报告底部 + 付费墙前各加一个 Newsletter 订阅入口（复用 /api/subscribe）
2. CTA 转化设计：雷达图区域下方加"解锁完整评分报告"按钮，指向 /pricing；报告结尾加 Subscribe CTA
3. 合规免责声明：nav 下方加 disclaimer banner（SENSITIVE_TECH 标注 + 投资建议免责）

P1 — 下周完成
4. 移动端 Compare 优化：按钮字号加大，< 480px 时雷达图单列布局
5. 数据来源标注：每家公司评分卡下方加数据来源展开项
6. SEO meta 完善：补充 og:image、description、article:published_time

P2 — Q2 规划
7. 完整付费墙（需要 Stripe 接入）
8. 季度追踪版本（HRI Q2 2026）
9. 用户投票层
10. 数据来源追溯链
11. 中文版 HRI 2026

P0 三项今天即开始执行，本周三请 Franklyn + Celine + CRO 验收。`;

const ts = new Date().toISOString();
const id = `msg-cole-self-eval-${Date.now()}`;

// Write to Cole's own inbox (record)
msgs.push({
  id,
  from: 'Cole',
  to: 'team-lead',
  type: 'message',
  content: selfEvalContent,
  timestamp: ts,
  read: false
});
fs.writeFileSync(INBOX, JSON.stringify(msgs, null, 2));

// Write to team-lead inbox
leadMsgs.push({
  id: id + '-lead',
  from: 'Cole',
  to: 'team-lead',
  type: 'message',
  content: selfEvalContent,
  timestamp: ts,
  read: false
});
fs.writeFileSync(LEAD_INBOX, JSON.stringify(leadMsgs, null, 2));

console.log('Cole self-eval + improvement plan sent to team-lead. id=' + id);
