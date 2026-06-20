#!/usr/bin/env python3
"""Translate HRI-2026 HTML from Chinese to English - v2"""

with open('HRI-2026-AMORA-Report-v5.0.html', 'r', encoding='utf-8') as f:
    content = f.read()

# lang attribute
content = content.replace('lang="zh-CN"', 'lang="en"')

# Font family
content = content.replace("'PingFang SC','Microsoft YaHei','Helvetica Neue',Arial,sans-serif",
    "'Inter','Segoe UI',Helvetica,Arial,sans-serif")
content = content.replace("'PingFang SC','Helvetica Neue',Arial,sans-serif",
    "'Inter','Segoe UI',Helvetica,Arial,sans-serif")
content = content.replace("'Microsoft YaHei',Arial,sans-serif",
    "'Inter','Segoe UI',Helvetica,Arial,sans-serif")

# Title
content = content.replace('AMORA Report · 人形机器人行业深度报告 2026 v5.0',
    'AMORA Report · Humanoid Robotics Industry Deep Dive 2026 v5.0')

# Navigation
content = content.replace('行业研究报告', 'Industry Research Report')
content = content.replace('报告导航', 'Report Navigation')
content = content.replace('升级 PRO', 'Upgrade to PRO')

# Part labels
content = content.replace('A · 技术先进性', 'A · Technology Advancement')
content = content.replace('M · 产业链', 'M · Supply Chain')
content = content.replace('O · 商业化运营', 'O · Commercialization')
content = content.replace('R · 市场容量', 'R · Market Size')
content = content.replace('A₂ · 资本价值', 'A2 · Capital Value')
content = content.replace('A₂ · Assets', 'A2 · Assets')

# Hero
content = content.replace('从实验室到工厂，AI驱动的具身智能正在重塑全球制造业。2026年，人形机器人量产元年启幕。',
    'From lab to factory, AI-driven embodied intelligence is reshaping global manufacturing. 2026 marks the mass production year for humanoid robots.')

# Summary
content = content.replace('核心数据速览', 'Key Facts Overview')
content = content.replace('以下8个数字，勾勒出2026年人形机器人行业的真实轮廓。',
    'The following 8 numbers outline the true landscape of the humanoid robotics industry in 2026.')

# Stats
content = content.replace('2025年全球市场规模', '2025 Global Market Size')
content = content.replace('2025年全球出货量（台）', '2025 Global Shipments (units)')
content = content.replace('2035年市场规模预测', '2035 Market Size Forecast')
content = content.replace('2030年出货量预测', '2030 Shipment Forecast')
content = content.replace('AMORA总分', 'AMORA Total Score')
content = content.replace('综合技术+商业化第一', 'Top in Tech + Commercialization')
content = content.replace('国产人形机器人BOM成本', 'China Humanoid BOM Cost')
content = content.replace('较2023年下降56%', 'Down 56% from 2023')
content = content.replace('Figure AI 2026年量产目标', 'Figure AI 2026 Target')
content = content.replace('商业可行性关键里程碑', 'Key Commercial Milestone')
content = content.replace('Figure AI最新估值', 'Figure AI Latest Valuation')
content = content.replace('2025年9月C轮融资', 'Sep 2025 Series C')
content = content.replace('宇树科技投前估值', 'Unitree Pre-money Valuation')
content = content.replace('科创板IPO已受理（2026年3月）', 'STAR IPO Filed (Mar 2026)')
content = content.replace('汇川技术市值', 'Inovance Market Cap')
content = content.replace('A股机器人供应链最大市值', 'Largest A-Share Robot Supply Cap')
content = content.replace('智元机器人2025年营收', 'Zhiyuan 2025 Revenue')
content = content.replace('中国商业化最快整机厂商', 'Fastest Commercializing China Maker')
content = content.replace('制造业ROI回收期', 'Manufacturing ROI Payback')
content = content.replace('2028年有望压缩至1.5-2年', 'Expected 1.5-2 yrs by 2028')

# Part A
content = content.replace('使能技术与突破', 'Enabling Technologies & Breakthroughs')
content = content.replace('人形机器人是机械工程、材料科学、传感器技术与AI大模型的深度融合。2023年后，"具身智能"从学术概念进入商业验证阶段，四大技术路线并行演进。',
    'Humanoid robotics is a deep fusion of mechanical engineering, materials science, sensor technology, and AI foundation models. After 2023, Embodied AI has moved from academic concept to commercial validation, with four major technology pathways evolving in parallel.')
content = content.replace('世界模型是机器人"大脑"的终极形态，其核心挑战在于将视觉、语言与动作统一建模。',
    'World models represent the ultimate form of the robot brain, with the core challenge being unified modeling of vision, language, and motion.')
content = content.replace('VLA（Vision-Language-Action）端到端架构原理', 'VLA End-to-End Architecture')
content = content.replace('VLA将视觉感知，自然语言指令和动作输出统一建模为一个端到端神经网络，实现"看到→理解→执行"的闭环。',
    'VLA unifies visual perception, natural language instructions, and action outputs into one end-to-end neural network, achieving a see-to-understand-to-execute loop.')
content = content.replace('代表方案：', 'Representing:')
content = content.replace('核心优势：', 'Core Advantage:')
content = content.replace('核心瓶颈：', 'Core Bottleneck:')
content = content.replace('技术路线对比', 'Technology Roadmap Comparison')

# Timeline
content = content.replace('技术演进时间轴（2018-2026）', 'Technology Evolution Timeline (2018-2026)')
content = content.replace('BC（行为克隆）规模化应用', 'BC (Behavioral Cloning) Scaled Application')
content = content.replace('UC Berkeley、Stanford将模仿学习用于机器人控制，机器人可以复现人类演示动作。',
    'UC Berkeley and Stanford applied imitation learning to robot control, enabling robots to replicate human demonstrations.')
content = content.replace('范式突破', 'Paradigm Breakthrough')
content = content.replace('产业化启动', 'Industrialization Launch')
content = content.replace('工业验证', 'Industrial Validation')
content = content.replace('量产元年 · 多路线并行', 'Mass Production Year - Multiple Paths in Parallel')
content = content.replace('量产元年', 'Mass Production Year')

# Additional timeline items
content = content.replace('具身智能商业化', 'Embodied AI Commercialization')
content = content.replace('Figure AI发布Helix，端到端VLA控制整机，双手协同装配汽车零件，具身智能进入Industrial Validation。',
    'Figure AI released Helix: end-to-end VLA controls the full robot, dual hands collaboratively assemble auto parts. Embodied AI enters Industrial Validation.')
content = content.replace('Figure/Tesla/宇树/智元同时推进量产；Physical Intelligence开源π0；1X NEO进入家庭测试。技术路线收敛与分化并存。',
    'Figure/Tesla/Unitree/Zhiyuan simultaneously push mass production; Physical Intelligence open-sources π0; 1X NEO enters home testing. Technology paths converge and diverge simultaneously.')

# Hardware
content = content.replace('硬件进阶：从"能动"到"能干活"', 'Hardware Evolution: From Mobile to Working')
content = content.replace('国产替代最成熟', 'Most Mature Domestic Alternative')
content = content.replace('谐波减速器', 'Harmonic Reducer')
content = content.replace('行星滚柱丝杠', 'Planetary Roller Screw')
content = content.replace('灵巧手微型减速器', 'Dexterous Hand Micro Reducer')
content = content.replace('壁垒：中 | 国产强', 'Barrier: Medium | China Strong')
content = content.replace('壁垒：高 | 产能待验证', 'Barrier: High | Capacity TBD')
content = content.replace('壁垒：极高 | 进口依赖', 'Barrier: Very High | Import Dependent')
content = content.replace('⚠️ 最大缺口', '⚠️ Largest Gap')
content = content.replace('⚠️ 极高壁垒', '⚠️ Very High Barrier')

# Part M
content = content.replace('产业链生态位', 'Supply Chain Ecosystem')
content = content.replace('核心零部件供应链', 'Core Component Supply Chain')
content = content.replace('点击左侧分类或点击机器人高亮部位，查看中美主要供应商及壁垒等级。',
    'Click categories on the left or robot parts to view major China-US suppliers and barrier levels.')
content = content.replace('零部件国产化率', 'Component Localization Rate')
content = content.replace('预计完全追平时间', 'Expected Time to Catch Up')
content = content.replace('触觉传感器国产率', 'Tactile Sensor Localization')
content = content.replace('零部件分类', 'Component Categories')
content = content.replace('点击零部件查看详情', 'Click Components to View Details')
content = content.replace('伺服驱动', 'Servo Drive')
content = content.replace('力矩电机', 'Torque Motor')
content = content.replace('力觉传感器', 'Force Sensor')
content = content.replace('触觉传感器', 'Tactile Sensor')
content = content.replace('AI芯片/计算', 'AI Chip/Compute')
content = content.replace('灵巧手/丝杠', 'Dexterous Hand/Screw')
content = content.replace('点击机器人不同部位查看对应零部件供应商', 'Click different robot parts to view component suppliers')

# Key insight
content = content.replace('人形机器人供应链最大机会在Harmonic Reducer（绿的谐波）和Servo Drive（汇川技术）的Domestic Alternative；最大风险在Tactile Sensor和AI芯片的进口依赖（&lt;10%国产化率）。',
    'The largest opportunity in humanoid robot supply chain is in Harmonic Reducer (Leaderdrive) and Servo Drive (Inovance) Domestic Alternative; the biggest risk is Tactile Sensor and AI Chip import dependence (&lt;10% localization).')
content = content.replace('人形机器人供应链最大', 'Largest Humanoid Robot Supply Chain')
content = content.replace('最大', 'Largest')
content = content.replace('国产化率约65%', '~65% localization')
content = content.replace('人形机器人运动控制核心，国产化率约65%', 'Core of robot motion control, ~65% localization')

# Suppliers
content = content.replace('美国供应商', 'US Suppliers')
content = content.replace('中国供应商', 'China Suppliers')
content = content.replace('壁垒等级：', 'Barrier Level:')
content = content.replace('垄断', 'Monopoly')
content = content.replace('主导', 'Leading')
content = content.replace('领先', 'Leading')
content = content.replace('依赖日本', 'Dependent on Japan')
content = content.replace('依赖进口', 'Import Dependent')
content = content.replace('追赶中', 'Catching Up')
content = content.replace('国产替代', 'Domestic Alternative')
content = content.replace('受制', 'Constrained')
content = content.replace('极弱', 'Very Weak')

# Comparison
content = content.replace('美国供应链优势', 'US Supply Chain Advantages')
content = content.replace('中国供应链优势', 'China Supply Chain Advantages')
content = content.replace('AI芯片/算力', 'AI Chip/Compute')
content = content.replace('整机集成', 'Robot OEM Integration')
content = content.replace('稀土/钕铁硼', 'RE/NdFeB')
content = content.replace('铝合金/机身', 'Aluminum/Body')

# Key insight
content = content.replace('关键洞察', 'Key Insight')

# Global players
content = content.replace('全球整机厂商分布', 'Global Robot Manufacturers Distribution')
content = content.replace('累计交付', 'Cumulative Delivery')
content = content.replace('累计融资', 'Cumulative Funding')
content = content.replace('商业化场景', 'Commercial Scenario')
content = content.replace('技术优势', 'Tech Advantage')

# BOM
content = content.replace('整机BOM成本结构', 'Robot BOM Cost Structure')
content = content.replace('中国人形机器人综合成本（~38万元/台）', 'China Humanoid Total Cost (~¥380K/unit)')
content = content.replace('卡脖子程度排名', 'Bottleneck Severity Ranking')
content = content.replace('零部件国产化壁垒分析', 'Component Localization Barrier Analysis')
content = content.replace('产业链上下游全景图（传统视图）', 'Supply Chain Overview (Traditional View)')

# Part O
content = content.replace('商业化运营', 'Commercialization')
content = content.replace('从试点到规模化的跨越', 'From Pilot to Scale')
content = content.replace('2026年是人形机器人量产的真正起点。制造业ROI模型已经跑通，但规模化仍需跨越三道坎：成本、可靠性和数据闭环。',
    '2026 marks the true starting point for humanoid robot mass production. Manufacturing ROI validated, but scaling requires overcoming three barriers: cost, reliability, and data loop.')
content = content.replace('制造业ROI测算（以汽车焊装线为例）', 'Manufacturing ROI (Auto Welding Example)')
content = content.replace('整机售价（2025年）', 'Robot Price (2025)')
content = content.replace('部署实施费', 'Deployment Fee')
content = content.replace('年运维成本', 'Annual O&M Cost')
content = content.replace('静态回收期', 'Static Payback')
content = content.replace('替代1.5-2人', 'Replaces 1.5-2 Workers')
content = content.replace('2028年目标回收期', '2028 Target Payback')
content = content.replace('量产50,000台时', 'At 50K Units')
content = content.replace('应用场景渗透路径', 'Application Penetration Paths')

# Scenarios
content = content.replace('汽车制造业', 'Automotive Manufacturing')
content = content.replace('仓储物流', 'Warehouse Logistics')
content = content.replace('家庭服务', 'Home Services')
content = content.replace('电力巡检', 'Power Inspection')
content = content.replace('医疗康复', 'Medical Rehabilitation')
content = content.replace('危险作业（矿山/化工）', 'Hazardous Operations')
content = content.replace('早期商业化', 'Early Commercial')
content = content.replace('小批量', 'Small Batch')
content = content.replace('10年+', '10+ Years')
content = content.replace('概念验证', 'PoC')
content = content.replace('当前渗透', 'Current Penetration')
content = content.replace('替代', 'Replace')

# Scenario cards
content = content.replace('量产最快，华为合作', 'Fastest mass production, Huawei partnership')
content = content.replace('3C电子组装（验证中）', '3C Electronics Assembly (Under Validation)')
content = content.replace('2025年出货量全球第一', '2025 Global #1 in Shipments')
content = content.replace('验证中', 'Under Validation')

# Deployment
content = content.replace('量产爬坡进展（2025年实际部署数据）', 'Production Ramp (2025 Actual Data)')
content = content.replace('主要场景', 'Main Scenario')
content = content.replace('量产能力', 'Capacity')
content = content.replace('2026年目标', '2026 Target')
content = content.replace('关键里程碑', 'Key Milestone')
content = content.replace('科研+少量工业', 'R&D + some industrial')
content = content.replace('3C/柔性制造', '3C/Flexible manufacturing')
content = content.replace('汽车装配', 'Auto assembly')
content = content.replace('工厂内测', 'Factory testing')
content = content.replace('康复+工业', 'Rehab + industrial')

# Part R
content = content.replace('市场容量', 'Market Size')
content = content.replace('三大战场的规模测算', 'Scale for Three Battlefields')
content = content.replace('人形机器人不是单一战场，而是制造业、Warehouse Logistics、Home Services三条渗透路径的叠加。',
    'Humanoid robotics is not a single battlefield but a superposition of three penetration paths: Manufacturing, Warehouse Logistics, Home Services.')
content = content.replace('人形机器人不是单一战场，而是制造业、仓储物流、家庭服务三条渗透路径的叠加。市场规模取决于AI能力突破速度与供应链降本节奏。',
    'Humanoid robotics is not a single battlefield, but the superposition of three penetration paths: Manufacturing, Warehouse Logistics, Home Services. Market size depends on AI breakthroughs and supply chain cost reduction pace.')
content = content.replace('人形机器人不是单一战场，而是制造业、仓储物流、家庭服务三条渗透路径的叠加。',
    'Humanoid robotics is not a single battlefield, but the superposition of three penetration paths: Manufacturing, Warehouse Logistics, Home Services.')
content = content.replace('市场规模取决于AI能力突破速度与供应链降本节奏。',
    'Market size depends on AI capability breakthrough speed and supply chain cost reduction pace.')
content = content.replace('全球人形机器人主机厂地理分布', 'Global Humanoid OEM Geographic Distribution')
content = content.replace('悬停标记点查看公司详情，中国是全球整机厂商数量最多的国家（17家），美国则在资本密度上领先。',
    'Hover markers to view details. China has most OEMs globally (17), US leads in capital density.')

# Market forecast
content = content.replace('全球市场规模测算（2025-2035）', 'Global Market Size (2025-2035)')
content = content.replace('分场景市场规模（亿美元）', 'Market by Scenario ($100M)')
content = content.replace('三大应用场景渗透路径', 'Three Scenario Penetration Paths')
content = content.replace('中美市场对比', 'China-US Market Comparison')
content = content.replace('2030年全球市场分布', '2030 Global Distribution')
content = content.replace('中国凭借供应链成本优势追赶美国，但AI大模型代差是主要短板。',
    'China catching up with supply chain cost advantage, but AI foundation model gap is main weakness.')
content = content.replace('四大催化剂', 'Four Catalysts')
content = content.replace('18个月关键窗口（2026-2027）', '18-Month Critical Window (2026-2027)')
content = content.replace('以下四个信号将决定人形机器人规模化拐点的出现时间。',
    'The following four signals will determine the humanoid scaling inflection timing.')
content = content.replace('注：', 'Note:')

# Catalysts
content = content.replace('2035年出货量', '2035 Shipments')
content = content.replace('⭐⭐⭐⭐⭐ Figure AI量产1,000台', '⭐⭐⭐⭐⭐ Figure AI Mass Produce 1,000 Units')
content = content.replace('⭐⭐⭐⭐ 国产谐波+丝杠双量产', '⭐⭐⭐⭐ Domestic Harmonic+Screw Dual Mass Production')
content = content.replace('2026年Q3 · 供应链降本关键', '2026 Q3 · Supply Chain Cost Reduction Key')

# Part A2
content = content.replace('资本价值与投资分析', 'Capital Value & Investment Analysis')
content = content.replace('AMORA Score五维评分', 'AMORA Score Five-Dimension Rating')
content = content.replace('AMORA Score从五个维度评估公司：Advancement（技术）· Mastery（运营）· Operations（商业化）· Reach（市场）· Affinity（资本与战略）。满分100分。',
    'AMORA Score evaluates companies across five dimensions: Advancement, Mastery, Operations, Reach, Affinity. Max score: 100.')
content = content.replace('重点公司AMORA五维雷达图对比', 'Key Companies AMORA Radar Comparison')
content = content.replace('全体公司AMORA Score一览', 'All Companies AMORA Score')
content = content.replace('整机厂商投融资总览（全球）', 'Robot OEM Investment Overview (Global)')
content = content.replace('国外整机厂商', 'International Robot OEMs')
content = content.replace('中国整机厂商', 'China Robot OEMs')
content = content.replace('供应链投融资总览', 'Supply Chain Investment Overview')
content = content.replace('核心零部件 — A股上市公司', 'Core Components - A-Share Listed')
content = content.replace('最近融资轮次', 'Latest Round')
content = content.replace('融资时间', 'Date')
content = content.replace('本轮金额', 'Round Amount')
content = content.replace('累计融资', 'Cumulative Funding')
content = content.replace('最新估值', 'Latest Valuation')
content = content.replace('关键投资方', 'Key Investors')
content = content.replace('商业化阶段', 'Commercial Stage')
content = content.replace('资本背景', 'Capital Background')

# Company descriptions
content = content.replace('硬件性价比最优（整机成本&lt;40万），出货量全球第一，但AI大模型能力是明显短板。',
    'Best hardware cost-performance (BOM &lt;¥400K), #1 global shipments, but AI foundation model capability is a clear weakness.')
content = content.replace('战略布局完整，量产意愿最强，2025年营收10.5亿商业化最快，但估值较高。',
    'Complete strategic layout, strongest mass production will, 2025 revenue ¥1.05B, fastest commercialization, but high valuation.')

# Score tables
content = content.replace('2026量产生死线', '2026 Mass Production Make-or-Break')
content = content.replace('全球出货量最大（5,500台）', 'Largest Global Shipments (5,500 units)')
content = content.replace('已进入Tesla Optimus供应链', 'Entered Tesla Optimus Supply Chain')
content = content.replace('具身智能量产', 'Embodied AI Mass Production')

# Investment conclusion
content = content.replace('投资结论：当前人形机器人投资有三条主线：①整机（Figure AI / 智元 / 宇树IPO）——高风险高赔率；②核心零部件（绿的谐波 / 汇川技术）——确定性最高；③具身AI软件（Physical Intelligence）——平台型机会。',
    'Investment Conclusion: Three main themes in humanoid robotics: 1) Robot OEMs (Figure AI / Zhiyuan / Unitree IPO) - high risk, high reward; 2) Core components (Leaderdrive / Inovance) - highest certainty; 3) Embodied AI software (Physical Intelligence) - platform opportunity.')
content = content.replace('估值风险提示：Figure AI P/S约130x，智元机器人估值130亿但出货量仍处于爬坡期，2027年是验证商业模型的关键节点。',
    'Valuation Risk: Figure AI P/S ~130x, Zhiyuan valuation ¥13B but shipments still in ramp, 2027 is key node for commercial model validation.')

# Editorial
content = content.replace('编辑观点', 'Editorial View')
content = content.replace('2026年的人形机器人赛道，不是科技竞赛，是叙事战争。宇树招股书是整场叙事战争里最诚实的一份文件——17亿营收、6亿净利告诉市场：机器人可以赚钱。但73.6%卖给高校，真正的工业替代浪潮还在路上。美国公司在用融资买时间，中国公司在用出货量买未来。真正的拐点：谁的数据闭环先跑起来。AMORA判断：出货量收敛成数据，比算法收敛成产品，在时间上Lead 12-18个月。',
    'The 2026 humanoid robotics sector is not a technology race but a narrative war. Unitree IPO prospectus is the most honest document in this war - ¥1.7B revenue, ¥600M net profit tells the market: robots can be profitable. But 73.6% sold to universities; the real industrial replacement wave is still coming. US companies are buying time with funding; Chinese companies are buying the future with shipments. The real inflection: whose data loop runs first. AMORA assessment: shipments converging to data leads algorithms converging to products by 12-18 months in time.')

# Appendix
content = content.replace('附录', 'Appendix')
content = content.replace('A. 关键术语', 'A. Key Terms')
content = content.replace('B. 数据来源', 'B. Data Sources')
content = content.replace('全称', 'Full Name')
content = content.replace('定义', 'Definition')
content = content.replace('级别', 'Level')
content = content.replace('覆盖', 'Coverage')

# Footer
content = content.replace('人形机器人行业深度报告', 'Humanoid Robotics Industry Deep Dive')
content = content.replace('数据截止：2026年Q1 | 发布日期：2026年Q2 | 框架：AMORA Report',
    'Data as of: Q1 2026 | Published: Q2 2026 | Framework: AMORA Report')
content = content.replace('本报告仅供信息参考，不构成投资建议。投资有风险，决策需谨慎。',
    'This report is for information only, not investment advice. Investing involves risk.')

# Additional terms
content = content.replace('VLA', 'VLA')
content = content.replace('具身智能', 'Embodied AI')
content = content.replace('国产化率', 'Localization Rate')
content = content.replace('AI芯片', 'AI Chip')
content = content.replace('AI大模型', 'AI Foundation Model')
content = content.replace('大模型', 'Foundation Model')
content = content.replace('供应链降本', 'Supply Chain Cost Reduction')
content = content.replace('产业链', 'Supply Chain')
content = content.replace('量产', 'Mass Production')
content = content.replace('出货量', 'Shipments')
content = content.replace('规模化', 'Scale')
content = content.replace('规模化拐点', 'Scale Inflection Point')
content = content.replace('国产', 'Domestic')
content = content.replace('丝杠', 'Screw/Ball Screw')
content = content.replace('已进入', 'Entered')
content = content.replace('进入Tesla', 'Entered Tesla')
content = content.replace('进入家庭', 'Entered Home')
content = content.replace('进入', 'Enter')
content = content.replace('验证', 'Validation')
content = content.replace('赛道', 'Sector')
content = content.replace('叙事战争', 'Narrative War')
content = content.replace('叙事', 'Narrative')
content = content.replace('拐点', 'Inflection Point')
content = content.replace('闭环', 'Loop')
content = content.replace('工业替代', 'Industrial Replacement')
content = content.replace('浪潮', 'Wave')
content = content.replace('赚钱', 'Profitable')
content = content.replace('爬坡期', 'Ramp Period')
content = content.replace('瓶颈', 'Bottleneck')
content = content.replace('追赶', 'Catching Up')
content = content.replace('国产化', 'Localization')
content = content.replace('卡脖子', 'Bottleneck')
content = content.replace('壁垒', 'Barrier')
content = content.replace('壁垒等级', 'Barrier Level')
content = content.replace('风险', 'Risk')
content = content.replace('风险提示', 'Risk Notice')
content = content.replace('机会', 'Opportunity')
content = content.replace('真正', 'Real')
content = content.replace('数据闭环', 'Data Loop')
content = content.replace('告诉市场', 'Tell the Market')

# barrier descriptions in JS
content = content.replace('中 — 绿的谐波已量产，追赶哈默纳科', 'Medium — Leaderdrive in production, chasing Harmonic')

with open('HRI-2026-AMORA-Report-v5.0-en.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('English version created: HRI-2026-AMORA-Report-v5.0-en.html')
print(f'File size: {len(content):,} characters')
