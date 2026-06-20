import { readFileSync, writeFileSync } from 'fs';

const BASE = 'c:/Users/51229/WorkBuddy/Claw/.workbuddy/teams/amora/inboxes';

const contexts = {
  Cole: {
    id: 'ctx-2026031501-cole',
    content: `【项目上下文同步 — 2026-03-15】

Cole，以下是当前内容侧进度与你的待办项。

**已完成的内容工作：**
- H5报告模板结构方案已输出（封面→核心结论→付费墙→正文章节→CCO观点→推荐）
- 内容归因模型已与Celine对齐：首触40% / 最后触点40% / 助攻20%
- acquisition_channel + last_content_slug 追踪字段已由George纳入DB设计
- ChartBlock overlay 文案已由Celine输出并交给George
- Custom Research 定价上调至$5K-$15K区间（CFO模型已采用$10K均值）

**你的待办：**
1. H5研究报告本地样例开发（待George完成技术原型后审阅）
2. 付费 Stripe webhook 触发时，P2阶段需实现 last_content_slug 快照（content_slug_at_conversion字段）——P2时与George再对齐
3. 内容分类业务定义文档（协同Celine）：普通报告边界定义+负面清单，周二初稿给CLO预审
4. 每周报告内容结构：周报发送API（/api/newsletter/send）已写好，需要你提供首期内容

**当前订阅状态：**
- 已有真实订阅用户（wangbin@iyiou.com 来自homepage，amorainsight@gmail.com 来自subscribe_page）
- 周报发送API支持 test_email 参数，可单独发给自己测试

**报告内容生产节奏（已定）：**
- 旗舰深度报告 5-6篇/月（L1+L2+L3，$1,500/篇）
- 标准深度报告 10-12篇/月（L1+L2，$1,100/篇）
- 快报简报 8-10篇/月（L1，$120/篇）`
  },
  CFO: {
    id: 'ctx-2026031501-cfo',
    content: `【项目上下文同步 — 2026-03-15】

CFO，以下是财务模型当前状态与待确认项。

**已完成：**
- 财务模型v2.1已出，$200K净利目标基准-乐观场景概率78%
- CHO KPI绩效联动制已与Franklyn确认（v3.0，4月1日生效）
- 审校策略A（分级）：Q3-Q4月度审校约$21,430，全年内容成本$100-120K
- Pre-A融资建议提前至5月15日关闭（已提议，待Franklyn确认）

**待你跟进：**
1. **Celine流失率假设**仍为空（0%）——CFO已标注高估风险，需要Celine提供Pro/Enterprise年度流失率
2. **MRR月报输出机制**——CHO KPI三（MRR门槛）数据来源为CFO月度报告，需确认每月结算后5个工作日内出具（CHO已要求）
3. **Stripe接入后**收入确认规则需要更新：月付订阅收入按月确认，年付按12个月摊销
4. **付费订阅收入模型更新**：\n   - Pro Monthly: $14.9/月\n   - Pro Annual: $99/年（$8.3/月均价）\n   - 7天免费试用期（不计入收入）

**关键财务假设（已锁定）：**
- 天使轮：$450K（已获取）
- Pre-A目标：$1.5M-$2M，目标5月15日关闭
- 2026全年总成本：$459-496K（选项A审校策略）
- Q3月支出跳升：$9K → $52.75K`
  },
  CLO: {
    id: 'ctx-2026031501-clo',
    content: `【项目上下文同步 — 2026-03-15】

CLO，以下是合规侧当前状态。

**已完成：**
- 内容分类框架v0.2已输出（compliance_tier/geo_risk_tier/effective_tier/sensitivity_tags等全部字段）
- compliance_overrides审计表设计完成（7年留存，物理删除硬阻断，TRUNCATE防护）
- /api/internal/compliance-scan端点已开发（CSV上传→GIN索引比对→批量flag→邮件通知）
- entity_list_scans表含notification_archive JSONB列（7年留存，平台自持）
- Policy文档表述已起草："合规通知留存"章节完整文本已确认

**待你跟进：**
1. **Content Classification Policy v1.0起草**（deadline 3月底）\n   - 等Celine业务定义初稿（原计划3月18日）到位后合并\n   - CLO预审后3月21-22日三方对齐会\n2. **合规审计要求章节**：schema最终版确认后立即起草（George已完成技术实现）
3. **Enterprise KYB SOP v1.0**（deadline 5月底）：Enterprise功能上线前2个月

**关键配置状态：**
- COMPLIANCE_NOTIFY_CLO = clo@amora.com（已在Vercel配置）
- Vercel Cron 每周五23:59自动触发合规扫描保底机制已配置
- SQL执行状态：等Franklyn在Supabase执行 full-schema-seed.sql + compliance-scan-rpc.sql`
  },
  CRO: {
    id: 'ctx-2026031501-cro',
    content: `【项目上下文同步 — 2026-03-15】

CRO，以下是风险侧当前状态。

**已完成：**
- geo_risk_tier字段规范（G0/G1/G2/G3）已输出，G2/G3均映射到RESTRICTED（C类）
- sensitivity_tags JSONB结构规范已输出（含entity/technology/country/keyword四类型）
- 名单推送CSV格式规范已输出（entity_name_normalized用于比对）
- compliance-scan-rpc.sql实现已确认（批量SQL单事务，CSV SHA-256 hash）
- FLAGGED子状态拆分已确认：FLAGGED_PENDING_REVIEW / FLAGGED_CONFIRMED / FLAGGED_RESOLVED_PUBLISHED / FLAGGED_RESOLVED_REMOVED

**待你跟进：**
1. **CRO字段规范文档**已发给George，合规扫描端点已实现，待Franklyn执行SQL后上线
2. **每周五名单更新推送**：MVP期手动上传CSV，通过 POST /api/internal/compliance-scan（需INTERNAL_API_SECRET鉴权）
3. **COMPLIANCE_NOTIFY_CRO邮箱**：需通过私信告知Franklyn配置到Vercel（不在团队消息传递明文）
4. **与CLO协作**：Content Classification Policy三方对齐会（3月21-22日）

**系统状态：**
- 合规扫描端点技术实现完成，等Supabase SQL执行后生效
- 每封扫描通知邮件含CSV SHA-256 hash，满足OFAC审计追溯要求`
  },
  CHO: {
    id: 'ctx-2026031501-cho',
    content: `【项目上下文同步 — 2026-03-15】

CHO，以下是人力侧当前状态。

**已完成决策：**
- KPI协议v3.0已由Franklyn签批，4月1日生效
  - KPI一：顾问交付率≥95%（Q2，单项达标$6,000）
  - KPI二：旗舰按时完成率≥90%（Q3，旗舰≤2篇豁免）
  - KPI三：MRR门槛 Q3≥$2,000 / Q4≥$4,000 / 2027均值≥$10,000（付费客户<5家豁免）
  - 梯度触发：2项达标$8,000 / 3项全达$12,500
- Q1顾问招募预算已授权（$6,000-10,000）

**你的待交付物（时间节点）：**
1. 顾问网络名单（脱敏版）：**3月25日前** → 交Celine用于Pitch Deck
2. 试运行质量数据：**3月28日前**
3. 深科技覆盖图谱：**3月25日前**
4. Pre-A路演材料（顾问能力背书模块）：配合Celine 4月4日Pitch Deck初稿

**NPS调查对接（与Celine已锁定）：**
- Q3末（9月底）首次调查，10月中旬前提交数据
- 格式：评分分布 + NPS值 + 定性关键词聚类（Top3正面/负面）
- Enterprise账户无论消费量均纳入（活跃用户≥1份消费）

**品牌资产（已可用）：**
- 顾问协议封面/路演材料使用 /public/amora-logo.svg（横版，深色底）
- 品牌色 Brand Blue #1D4ED8，辅助色方案可用蓝色系渐变区分热力图层次`
  }
};

let updated = 0;
for (const [name, ctx] of Object.entries(contexts)) {
  const path = `${BASE}/${name}.json`;
  const data = JSON.parse(readFileSync(path, 'utf-8'));
  
  // Check if context already injected
  if (data.some(m => m.id === ctx.id)) {
    console.log(`${name}: context already present, skipping`);
    continue;
  }
  
  data.push({
    id: ctx.id,
    from: 'team-lead',
    to: name,
    type: 'message',
    content: ctx.content,
    timestamp: `2026-03-15T08:00:0${updated + 3}.000Z`,
    read: false
  });
  
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`${name}: context injected ✅`);
  updated++;
}

console.log(`\nDone. ${updated} inboxes updated.`);
