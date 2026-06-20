-- =============================================================
-- 中国人形机器人主机厂数据导入
-- 数据来源：AMORA研究团队整理（2026-03-28）
-- 数据可信度：S级（招股书/年报）、A级（专业机构）、B级（行业媒体）
-- =============================================================

-- 先清空现有人形机器人相关数据（如需要重新导入）
-- DELETE FROM companies WHERE industry_slug = 'manufacturing' AND sub_sector = 'humanoid-robot';

-- 插入中国主机厂数据
INSERT INTO companies (
    name, name_cn, slug, industry_slug, sub_sector, 
    country, hq_city, hq_province, founded_year,
    description, description_cn,
    funding_stage, funding_total_usd, valuation_usd, valuation_date,
    lead_investors, all_investors,
    founders, team_background, university_tags,
    core_products, product_status, unit_shipment, unit_price_usd,
    tech_route, tech_maturity_level, world_model_score, ai_approach, patent_count,
    supply_chain_tier, ecosystem_position, key_components,
    primary_use_cases, customer_breakdown, key_partners,
    data_sources, data_reliability, notes,
    is_tracked, is_public, status, created_at, updated_at
) VALUES 

-- ============================================
-- 1. 宇树科技（拟IPO）- 量产之王
-- ============================================
(
    'Unitree', '宇树科技', 'unitree', 'manufacturing', 'humanoid-robot',
    'CN', 'Hangzhou', 'Zhejiang', 2016,
    'Global leader in humanoid robot mass production with 5,500 units shipped in 2025. Known for cost-effective quadruped and humanoid robots.',
    '全球人形机器人量产领导者，2025年出货量5500台。以高性价比四足机器人和人形机器人闻名。',
    'pre-ipo', 150000000, NULL, NULL,
    ARRAY['Sequoia China', 'Shunwei Capital', 'Shenzhen Capital Group'],
    ARRAY['Sequoia China', 'Shunwei Capital', 'Shenzhen Capital Group', 'China Internet Investment Fund', 'Matrix Partners China', 'Meituan'],
    ARRAY['Wang Xingxing'], 
    'Founded by Wang Xingxing, Shanghai University background. Team focuses on motion control and hardware optimization.',
    ARRAY['Shanghai University'],
    ARRAY['Unitree H1', 'Unitree G1'], 
    'mass_production', 
    5500, 
    90000,
    'Layered control architecture + AI assistance. Focus on hardware cost reduction and motion control optimization. Strong in quadruped technology migration.',
    7, 3, 'layered-control', 
    150,
    'midstream', 
    'Mass production leader with extreme cost advantage. Dominates education/research market (73.6%), expanding to industrial applications.',
    ARRAY['self-developed motor', 'self-developed reducer', 'proprietary control system'],
    ARRAY['education', 'research', 'industrial', 'enterprise tour'],
    '{"education_research": 73.6, "enterprise_tour": 9.0, "industrial": 10.0, "other": 7.4}'::jsonb,
    ARRAY['Huawei', 'BYD'],
    ARRAY['Unitree IPO Prospectus', 'Company Official Website', 'IDTechEx Report 2025'],
    'S',
    'IPO prospectus filed to HKEX. 2025 revenue 1.708B RMB, net profit 600M RMB, gross margin 60.27%. Controls 68.78% voting rights.',
    true, false, 'active', NOW(), NOW()
),

-- ============================================
-- 2. 优必选（已上市）
-- ============================================
(
    'UBTECH', '优必选', 'ubtech', 'manufacturing', 'humanoid-robot',
    'CN', 'Shenzhen', 'Guangdong', 2012,
    'First humanoid robot company listed in Hong Kong. Focuses on Walker series for education, logistics, and automotive factory applications.',
    '首家在香港上市的人形机器人公司。专注于Walker系列，应用于教育、物流和汽车工厂场景。',
    'ipo', 
    500000000, 
    2000000000, 
    '2023-12-29',
    ARRAY['Tencent', 'Industrial and Commercial Bank of China'],
    ARRAY['Tencent', 'Industrial and Commercial Bank of China', 'Haier', 'Telstra', 'CDH Investments'],
    ARRAY['Zhou Jian'],
    'Founded by Zhou Jian, South University of Science and Technology background. Listed on HKEX in Dec 2023.',
    ARRAY['SUSTech'],
    ARRAY['Walker S', 'Walker S1', 'Walker X'],
    'pilot_production',
    500,
    150000,
    'Modular joint design + AI integration. Focus on service scenarios and automotive factory applications.',
    6, 3, 'modular-ai',
    200,
    'midstream',
    'Listed company with diverse application scenarios. Strong in education and service robots, expanding to industrial use cases.',
    ARRAY['modular joints', 'proprietary servo system'],
    ARRAY['education', 'automotive', 'logistics', 'healthcare'],
    '{"education": 40, "automotive": 25, "logistics": 20, "healthcare": 15}'::jsonb,
    ARRAY['BYD', 'FAW', 'NIO'],
    ARRAY['HKEX Annual Report', 'Company Official Website', 'Industry Reports'],
    'S',
    'Listed on HKEX (09880.HK). First humanoid robot company IPO. Revenue heavily dependent on education sector.',
    true, true, 'active', NOW(), NOW()
),

-- ============================================
-- 3. 智元机器人（A轮）- AI驱动
-- ============================================
(
    'AgiBot', '智元机器人', 'agibot', 'manufacturing', 'humanoid-robot',
    'CN', 'Shanghai', 'Shanghai', 2023,
    'Rapidly growing startup founded by former Huawei "Genius Youth". Focuses on embodied AI and large model integration for industrial applications.',
    '由前华为"天才少年"创立的快速增长初创公司。专注于具身智能和大模型集成，应用于工业场景。',
    'series-a',
    100000000,
    500000000,
    '2024-06',
    ARRAY['Hillhouse Capital', 'CDH Investments'],
    ARRAY['Hillhouse Capital', 'CDH Investments', 'Baidu Ventures', 'MiraclePlus', 'BYD'],
    ARRAY['Peng Zhihui'],
    'Founded by Peng Zhihui (former Huawei Genius Youth), Shanghai Jiao Tong University alumni. Strong AI and robotics background.',
    ARRAY['SJTU', 'Huawei'],
    ARRAY['Expedition A1', 'Expedition A2', 'Lingxi X1'],
    'pilot_production',
    1000,
    120000,
    'Embodied AI + Large Language Model. End-to-end learning approach with strong AI capabilities. Rapid iteration and product development.',
    6, 4, 'embodied-llm',
    80,
    'midstream',
    'AI-driven approach with strong technical team. Focus on industrial manufacturing scenarios. Fast product iteration cycle.',
    ARRAY['AI chip integration', 'proprietary joint modules'],
    ARRAY['industrial manufacturing', 'automotive', '3C electronics'],
    '{"industrial": 70, "automotive": 20, "other": 10}'::jsonb,
    ARRAY['BYD', 'Huawei'],
    ARRAY['Company Official Website', 'News Reports', 'Crunchbase'],
    'A',
    'Achieved mass production of 1,000 units in 2024. Strong AI capabilities with LLM integration. Founded by high-profile Huawei alumnus.',
    true, false, 'active', NOW(), NOW()
),

-- ============================================
-- 4. 傅利叶智能（B轮）- 医疗细分
-- ============================================
(
    'Fourier Intelligence', '傅利叶智能', 'fourier-intelligence', 'manufacturing', 'humanoid-robot',
    'CN', 'Shanghai', 'Shanghai', 2015,
    'Started with exoskeletons, pivoted to humanoid robots. Focus on medical rehabilitation and healthcare applications.',
    '从外骨骼起家，转型人形机器人。专注于医疗康复和医疗保健应用。',
    'series-b',
    100000000,
    400000000,
    '2023-08',
    ARRAY['SoftBank Vision Fund 2', 'Aramco P7'],
    ARRAY['SoftBank Vision Fund 2', 'Aramco P7', 'Yuanjing Capital', 'Qianhai Fund'],
    ARRAY['Gu Jie'],
    'Founded by Gu Jie, Shanghai Jiao Tong University background. Started with rehabilitation exoskeletons, expanding to humanoid robots.',
    ARRAY['SJTU'],
    ARRAY['GR-1', 'GR-2'],
    'pilot_production',
    200,
    150000,
    'Exoskeleton heritage with strong medical background. Focus on rehabilitation and healthcare scenarios.',
    6, 3, 'medical-focused',
    120,
    'midstream',
    'Medical rehabilitation specialist with exoskeleton background. Unique positioning in healthcare humanoid robots.',
    ARRAY['force control system', 'rehabilitation algorithms'],
    ARRAY['medical rehabilitation', 'healthcare', 'elderly care'],
    '{"medical": 80, "research": 15, "other": 5}'::jsonb,
    ARRAY['Shanghai Ruijin Hospital', 'Peking Union Medical College Hospital'],
    ARRAY['Company Official Website', 'News Reports', 'Industry Reports'],
    'B',
    'Strong medical background with exoskeleton products. GR series targets rehabilitation market. SoftBank investment validates technology.',
    true, false, 'active', NOW(), NOW()
),

-- ============================================
-- 5. 乐聚机器人（B轮）- 华为生态
-- ============================================
(
    'Leju Robotics', '乐聚机器人', 'leju-robotics', 'manufacturing', 'humanoid-robot',
    'CN', 'Shenzhen', 'Guangdong', 2016,
    'Harbin Institute of Technology spin-off with strong Huawei ecosystem partnership. Focus on education and open-source HarmonyOS integration.',
    '哈尔滨工业大学孵化企业，与华为生态系统深度合作。专注于教育和开源鸿蒙系统集成。',
    'series-b',
    50000000,
    200000000,
    '2022-12',
    ARRAY['Tencent', 'Shenzhen Capital Group'],
    ARRAY['Tencent', 'Shenzhen Capital Group', 'Hongtai Fund', 'Qianhai Fund'],
    ARRAY['Leng Xiaokun'],
    'Founded by Leng Xiaokun, Harbin Institute of Technology background. Strong partnership with Huawei on HarmonyOS.',
    ARRAY['HIT'],
    ARRAY['Kuafu', 'KV-01'],
    'pilot_production',
    300,
    100000,
    'HarmonyOS integration with open-source strategy. Focus on education market with Huawei ecosystem support.',
    6, 3, 'harmonyos-ai',
    100,
    'midstream',
    'Huawei ecosystem partner with HarmonyOS integration. Strong in education market with open-source strategy.',
    ARRAY['HarmonyOS integration', 'modular joints'],
    ARRAY['education', 'research', 'smart home'],
    '{"education": 60, "research": 25, "smart_home": 15}'::jsonb,
    ARRAY['Huawei', 'China Mobile'],
    ARRAY['Company Official Website', 'News Reports', 'Huawei Partnership Announcements'],
    'B',
    'Deep partnership with Huawei on HarmonyOS for robots. Open-source strategy to build ecosystem. HIT background team.',
    true, false, 'active', NOW(), NOW()
),

-- ============================================
-- 6. 星动纪元（天使轮）- 清华系
-- ============================================
(
    'Robotera', '星动纪元', 'robotera', 'manufacturing', 'humanoid-robot',
    'CN', 'Beijing', 'Beijing', 2023,
    'Tsinghua University spin-off focusing on reinforcement learning and simulation. Strong academic background in embodied AI.',
    '清华大学孵化企业，专注于强化学习和仿真。具身智能领域强大学术背景。',
    'angel',
    20000000,
    100000000,
    '2024-03',
    ARRAY['Legend Capital', 'Jinding Capital'],
    ARRAY['Legend Capital', 'Jinding Capital', 'Tsinghua Capital', 'Century Golden Resources'],
    ARRAY['Chen Jianyu'],
    'Founded by Chen Jianyu, Tsinghua University Institute for Interdisciplinary Information Sciences background. Strong academic research background.',
    ARRAY['Tsinghua'],
    ARRAY['Xiaoxing', 'Xingdong No.1'],
    'prototype',
    10,
    NULL,
    'Reinforcement learning + simulation. Strong academic approach with focus on embodied AI research.',
    5, 4, 'rl-simulation',
    30,
    'midstream',
    'Tsinghua academic spin-off with strong research capabilities. Early stage with focus on RL and simulation.',
    ARRAY['RL algorithms', 'simulation platform'],
    ARRAY['research', 'industrial'],
    '{"research": 90, "industrial": 10}'::jsonb,
    ARRAY['Tsinghua University'],
    ARRAY['Company Official Website', 'News Reports', 'Academic Publications'],
    'B',
    'Strong Tsinghua academic background. Focus on reinforcement learning and embodied AI research. Early stage.',
    true, false, 'active', NOW(), NOW()
),

-- ============================================
-- 7. 逐际动力（A轮）- 阿里系
-- ============================================
(
    'LimX Dynamics', '逐际动力', 'limx-dynamics', 'manufacturing', 'humanoid-robot',
    'CN', 'Shenzhen', 'Guangdong', 2022,
    'Alibaba-backed startup focusing on reinforcement learning and multimodal perception. Strong technical team from SUSTech.',
    '阿里巴巴支持的初创公司，专注于强化学习和多模态感知。团队来自南方科技大学。',
    'series-a',
    30000000,
    150000000,
    '2024-06',
    ARRAY['Alibaba', 'China Merchants Venture Capital'],
    ARRAY['Alibaba', 'China Merchants Venture Capital', 'SAIC Capital', 'Frees Fund'],
    ARRAY['Chen Jianmin'],
    'Founded by Chen Jianmin, Southern University of Science and Technology background. Strong Alibaba ecosystem support.',
    ARRAY['SUSTech'],
    ARRAY['CL-1'],
    'prototype',
    20,
    NULL,
    'Reinforcement learning + multimodal perception. Bipedal and wheeled configurations. Strong simulation capabilities.',
    5, 4, 'rl-multimodal',
    40,
    'midstream',
    'Alibaba-backed with strong technical capabilities. Focus on RL and multimodal perception. Bipedal + wheeled approach.',
    ARRAY['multimodal sensors', 'RL control system'],
    ARRAY['industrial', 'logistics'],
    '{"industrial": 70, "logistics": 30}'::jsonb,
    ARRAY['Alibaba', 'SAIC Motor'],
    ARRAY['Company Official Website', 'News Reports', 'Alibaba Investment Announcement'],
    'B',
    'Alibaba investment provides ecosystem support. Strong technical team from SUSTech. Dual approach: bipedal + wheeled.',
    true, false, 'active', NOW(), NOW()
),

-- ============================================
-- 8. 银河通用（天使轮）- 轮式双臂
-- ============================================
(
    'GalaxyBot', '银河通用', 'galaxybot', 'manufacturing', 'humanoid-robot',
    'CN', 'Beijing', 'Beijing', 2023,
    'Peking University and Stanford background team. Focus on wheeled dual-arm robots for logistics and warehouse applications.',
    '北大+斯坦福背景团队。专注于轮式双臂机器人，应用于物流和仓储场景。',
    'angel',
    20000000,
    80000000,
    '2024-01',
    ARRAY['BlueRun Ventures', 'Matrix Partners China'],
    ARRAY['BlueRun Ventures', 'Matrix Partners China', 'Source Code Capital', 'IDG Capital'],
    ARRAY['Wang He'],
    'Founded by Wang He, Peking University and Stanford background. Focus on wheeled dual-arm configuration for logistics.',
    ARRAY['PKU', 'Stanford'],
    ARRAY['Galbot'],
    'prototype',
    5,
    NULL,
    'Wheeled dual-arm configuration with large model + embodied AI. Focus on logistics and warehouse automation.',
    5, 3, 'wheeled-llm',
    25,
    'midstream',
    'Unique wheeled dual-arm approach. PKU+Stanford background team. Focus on logistics scenarios.',
    ARRAY['dual-arm coordination', 'wheeled mobility'],
    ARRAY['logistics', 'warehouse', 'manufacturing'],
    '{"logistics": 80, "warehouse": 20}'::jsonb,
    ARRAY['JD Logistics', 'SF Express'],
    ARRAY['Company Official Website', 'News Reports', 'Investment Announcements'],
    'B',
    'Differentiated approach with wheeled dual-arm design. Strong academic background. Early stage focused on logistics.',
    true, false, 'active', NOW(), NOW()
),

-- ============================================
-- 9. 开普勒机器人（天使轮）- 工业场景
-- ============================================
(
    'Kepler Robotics', '开普勒机器人', 'kepler-robotics', 'manufacturing', 'humanoid-robot',
    'CN', 'Shanghai', 'Shanghai', 2023,
    'Focus on industrial scenarios with self-developed joint modules. Strong investor backing from top VCs.',
    '专注于工业场景，自研关节模组。获得顶级风投支持。',
    'angel',
    10000000,
    50000000,
    '2024-02',
    ARRAY['Hillhouse Capital', 'Sequoia China Seed Fund'],
    ARRAY['Hillhouse Capital', 'Sequoia China Seed Fund', 'Chuxin Capital'],
    NULL,
    'Focus on industrial applications with proprietary joint technology. Early stage startup.',
    ARRAY[],
    ARRAY['K1', 'K2'],
    'prototype',
    0,
    NULL,
    'Self-developed joint modules with focus on industrial manufacturing scenarios.',
    4, 3, 'industrial-focused',
    15,
    'midstream',
    'Industrial-focused approach with proprietary joint technology. Early stage with strong VC backing.',
    ARRAY['self-developed joints', 'industrial control system'],
    ARRAY['industrial manufacturing'],
    '{"industrial": 100}'::jsonb,
    ARRAY[],
    ARRAY['News Reports', 'Investment Announcements'],
    'C',
    'Early stage with focus on industrial applications. Self-developed joint modules. Strong investor backing.',
    true, false, 'active', NOW(), NOW()
),

-- ============================================
-- 10. 众擎机器人（天使轮）- 小米系
-- ============================================
(
    'EngineAI', '众擎机器人', 'engineai', 'manufacturing', 'humanoid-robot',
    'CN', 'Shenzhen', 'Guangdong', 2023,
    'Xiaomi ecosystem company with open-source strategy. Founder from XPeng Robotics background.',
    '小米生态链公司，开源策略。创始人来自小鹏机器人团队。',
    'angel',
    10000000,
    50000000,
    '2024-04',
    ARRAY['Shunwei Capital', 'Xiaomi Group'],
    ARRAY['Shunwei Capital', 'Xiaomi Group', 'BlueRun Ventures'],
    ARRAY['Zhao Tongyang'],
    'Founded by Zhao Tongyang, former XPeng Robotics background. Xiaomi ecosystem with open-source approach.',
    ARRAY['XPeng'],
    ARRAY['SA01', 'SE01'],
    'prototype',
    0,
    NULL,
    'High-performance joints with open-source strategy. Xiaomi ecosystem support.',
    4, 3, 'opensource-joints',
    20,
    'midstream',
    'Xiaomi ecosystem player with open-source strategy. Founder from XPeng Robotics. Focus on high-performance joints.',
    ARRAY['high-performance joints', 'open-source platform'],
    ARRAY['education', 'research', 'industrial'],
    '{"education": 50, "research": 30, "industrial": 20}'::jsonb,
    ARRAY['Xiaomi', 'XPeng'],
    ARRAY['News Reports', 'Xiaomi Ecosystem Announcements'],
    'C',
    'Xiaomi ecosystem company with open-source approach. Founder has XPeng Robotics experience. Early stage.',
    true, false, 'active', NOW(), NOW()
),

-- ============================================
-- 11. 无界动力（天使轮）- 地平线系
-- ============================================
(
    'Boundless Dynamics', '无界动力', 'boundless-dynamics', 'manufacturing', 'humanoid-robot',
    'CN', 'Beijing', 'Beijing', 2024,
    'Horizon Robotics incubated startup. Focus on end-to-end VLA (Vision-Language-Action) architecture.',
    '地平线孵化企业。专注于端到端VLA（视觉-语言-动作）架构。',
    'angel',
    10000000,
    50000000,
    '2024-06',
    ARRAY['Horizon Robotics', 'Hillhouse Capital'],
    ARRAY['Horizon Robotics', 'Hillhouse Capital', 'Sequoia China Seed Fund'],
    NULL,
    'Horizon Robotics incubated with focus on VLA end-to-end approach. Strong AI chip ecosystem support.',
    ARRAY['Horizon'],
    ARRAY['Humanoid Robot (R&D)'],
    'prototype',
    0,
    NULL,
    'End-to-end VLA architecture with Horizon Robotics AI chip integration.',
    4, 4, 'vla-end-to-end',
    10,
    'midstream',
    'Horizon ecosystem startup with VLA approach. Strong AI chip support. Very early stage.',
    ARRAY['Horizon AI chips', 'VLA architecture'],
    ARRAY['industrial', 'automotive'],
    '{"industrial": 70, "automotive": 30}'::jsonb,
    ARRAY['Horizon Robotics'],
    ARRAY['News Reports', 'Horizon Incubation Announcement'],
    'C',
    'Horizon Robotics incubated. Focus on VLA end-to-end. Very early stage with strong AI chip backing.',
    true, false, 'active', NOW(), NOW()
),

-- ============================================
-- 12. 维他动力（天使轮）- 地平线系
-- ============================================
(
    'Vitality Dynamics', '维他动力', 'vitality-dynamics', 'manufacturing', 'humanoid-robot',
    'CN', 'Beijing', 'Beijing', 2024,
    'Horizon Robotics incubated startup. Focus on embodied AI and large models for industrial scenarios.',
    '地平线孵化企业。专注于具身智能和大模型，应用于工业场景。',
    'angel',
    10000000,
    50000000,
    '2024-07',
    ARRAY['Horizon Robotics', 'Hillhouse Capital'],
    ARRAY['Horizon Robotics', 'Hillhouse Capital', 'MiraclePlus'],
    NULL,
    'Horizon Robotics incubated with focus on embodied AI and industrial applications.',
    ARRAY['Horizon'],
    ARRAY['Humanoid Robot (R&D)'],
    'prototype',
    0,
    NULL,
    'Embodied AI + large models with Horizon Robotics ecosystem support. Focus on industrial scenarios.',
    4, 4, 'embodied-llm',
    10,
    'midstream',
    'Horizon ecosystem startup with embodied AI approach. Focus on industrial applications. Very early stage.',
    ARRAY['Horizon AI chips', 'embodied AI platform'],
    ARRAY['industrial manufacturing'],
    '{"industrial": 100}'::jsonb,
    ARRAY['Horizon Robotics'],
    ARRAY['News Reports', 'Horizon Incubation Announcement'],
    'C',
    'Horizon Robotics incubated. Focus on embodied AI for industrial. Very early stage.',
    true, false, 'active', NOW(), NOW()
),

-- ============================================
-- 13. 它石智航（天使轮）- 清华+谷歌
-- ============================================
(
    'Tars Robotics', '它石智航', 'tars-robotics', 'manufacturing', 'humanoid-robot',
    'CN', 'Beijing', 'Beijing', 2023,
    'Tsinghua + Google background team. Focus on embodied AI and reinforcement learning.',
    '清华+谷歌背景团队。专注于具身智能和强化学习。',
    'angel',
    10000000,
    50000000,
    '2024-03',
    ARRAY['Sequoia China Seed Fund', 'ZhenFund'],
    ARRAY['Sequoia China Seed Fund', 'ZhenFund', 'MiraclePlus'],
    ARRAY['Chen Yilun'],
    'Founded by Chen Yilun, Tsinghua + Google background. Strong research capabilities in embodied AI.',
    ARRAY['Tsinghua', 'Google'],
    ARRAY['TARS'],
    'prototype',
    0,
    NULL,
    'Embodied AI + reinforcement learning with strong academic and industry background.',
    4, 4, 'embodied-rl',
    15,
    'midstream',
    'Tsinghua + Google background team. Strong research focus on embodied AI and RL. Early stage.',
    ARRAY['RL algorithms', 'embodied AI platform'],
    ARRAY['research', 'industrial'],
    '{"research": 80, "industrial": 20}'::jsonb,
    ARRAY['Tsinghua University'],
    ARRAY['News Reports', 'Investment Announcements'],
    'C',
    'Strong Tsinghua + Google background. Focus on embodied AI and RL. Early stage.',
    true, false, 'active', NOW(), NOW()
),

-- ============================================
-- 14. 自变量机器人（天使轮）- 清华+Meta
-- ============================================
(
    'Independent Variable Robotics', '自变量机器人', 'independent-variable-robotics', 'manufacturing', 'humanoid-robot',
    'CN', 'Beijing', 'Beijing', 2023,
    'Tsinghua + Meta background team. Focus on large models and end-to-end learning.',
    '清华+Meta背景团队。专注于大模型和端到端学习。',
    'angel',
    10000000,
    50000000,
    '2024-02',
    ARRAY['Hillhouse Capital', 'MiraclePlus'],
    ARRAY['Hillhouse Capital', 'MiraclePlus', 'ZhenFund'],
    ARRAY['Wang Qian'],
    'Founded by Wang Qian, Tsinghua + Meta background. Focus on large model-driven robotics.',
    ARRAY['Tsinghua', 'Meta'],
    ARRAY['Humanoid Robot (R&D)'],
    'prototype',
    0,
    NULL,
    'Large model + end-to-end learning with strong AI research background.',
    4, 4, 'llm-end-to-end',
    15,
    'midstream',
    'Tsinghua + Meta background team. Large model-driven approach. Early stage.',
    ARRAY['LLM integration', 'end-to-end learning'],
    ARRAY['research', 'industrial'],
    '{"research": 70, "industrial": 30}'::jsonb,
    ARRAY['Tsinghua University'],
    ARRAY['News Reports', 'Investment Announcements'],
    'C',
    'Strong Tsinghua + Meta background. Large model-driven approach. Early stage.',
    true, false, 'active', NOW(), NOW()
),

-- ============================================
-- 15. 加速进化（种子/天使轮）- 清华系
-- ============================================
(
    'Accelerated Evolution', '加速进化', 'accelerated-evolution', 'manufacturing', 'humanoid-robot',
    'CN', 'Beijing', 'Beijing', 2023,
    'Tsinghua background team. Focus on reinforcement learning and simulation for bipedal robots.',
    '清华背景团队。专注于强化学习和仿真，应用于双足机器人。',
    'seed',
    10000000,
    40000000,
    '2024-01',
    ARRAY['MiraclePlus', 'Chuxin Capital'],
    ARRAY['MiraclePlus', 'Chuxin Capital', 'ZhenFund'],
    ARRAY['Cheng Hao'],
    'Founded by Cheng Hao, Tsinghua background. Focus on RL and simulation for bipedal locomotion.',
    ARRAY['Tsinghua'],
    ARRAY['Booster T1'],
    'prototype',
    0,
    NULL,
    'Reinforcement learning + simulation with focus on bipedal locomotion.',
    4, 4, 'rl-simulation',
    12,
    'midstream',
    'Tsinghua background team. Focus on RL and simulation for bipedal. Early stage.',
    ARRAY['RL algorithms', 'simulation platform'],
    ARRAY['research', 'bipedal locomotion'],
    '{"research": 90, "industrial": 10}'::jsonb,
    ARRAY['Tsinghua University'],
    ARRAY['News Reports', 'Investment Announcements'],
    'C',
    'Tsinghua background. RL + simulation focus for bipedal. Early stage.',
    true, false, 'active', NOW(), NOW()
);

-- ============================================
-- 16-39. 其他企业（简化插入，后续可补充完整字段）
-- ============================================

-- 清华系其他企业
INSERT INTO companies (name, name_cn, slug, industry_slug, sub_sector, country, hq_city, hq_province, founded_year, 
    funding_stage, funding_total_usd, university_tags, core_products, unit_shipment, data_reliability, is_tracked, created_at, updated_at)
VALUES 
    ('Lightwheel AI', '光轮智能', 'lightwheel-ai', 'manufacturing', 'humanoid-robot', 'CN', 'Beijing', 'Beijing', 2023,
    'angel', 10000000, ARRAY['Tsinghua'], ARRAY['Humanoid Robot'], 0, 'C', true, NOW(), NOW()),
    ('Yuanluo Tech', '源络科技', 'yuanluo-tech', 'manufacturing', 'humanoid-robot', 'CN', 'Beijing', 'Beijing', 2023,
    'angel', 10000000, ARRAY['Tsinghua'], ARRAY['Humanoid Robot'], 0, 'C', true, NOW(), NOW()),
    ('Ruoyu Tech', '若愚科技', 'ruoyu-tech', 'manufacturing', 'humanoid-robot', 'CN', 'Beijing', 'Beijing', 2023,
    'angel', 10000000, ARRAY['Tsinghua'], ARRAY['Humanoid Robot'], 0, 'C', true, NOW(), NOW());

-- 哈工大系其他企业
INSERT INTO companies (name, name_cn, slug, industry_slug, sub_sector, country, hq_city, hq_province, founded_year, 
    funding_stage, funding_total_usd, university_tags, core_products, unit_shipment, data_reliability, is_tracked, created_at, updated_at)
VALUES 
    ('Qingfei Tech', '清飞科技', 'qingfei-tech', 'manufacturing', 'humanoid-robot', 'CN', 'Shenzhen', 'Guangdong', 2023,
    'angel', 10000000, ARRAY['HIT'], ARRAY['Humanoid Robot'], 0, 'C', true, NOW(), NOW()),
    ('Zhichang Tech', '智昌科技', 'zhichang-tech', 'manufacturing', 'humanoid-robot', 'CN', 'Ningbo', 'Zhejiang', 2016,
    'series-b', 50000000, ARRAY['HIT'], ARRAY['Humanoid Robot'], 0, 'B', true, NOW(), NOW()),
    ('Weijing AI', '伟景智能', 'weijing-ai', 'manufacturing', 'humanoid-robot', 'CN', 'Beijing', 'Beijing', 2016,
    'series-a', 20000000, ARRAY['HIT'], ARRAY['Humanoid Robot'], 0, 'B', true, NOW(), NOW());

-- 浙大系企业
INSERT INTO companies (name, name_cn, slug, industry_slug, sub_sector, country, hq_city, hq_province, founded_year, 
    funding_stage, funding_total_usd, university_tags, core_products, unit_shipment, data_reliability, is_tracked, created_at, updated_at)
VALUES 
    ('DeepRobotics', '云深处科技', 'deeprobotics', 'manufacturing', 'humanoid-robot', 'CN', 'Hangzhou', 'Zhejiang', 2017,
    'series-b', 50000000, ARRAY['ZJU'], ARRAY['Jueying X20', 'Jueying X30'], 500, 'B', true, NOW(), NOW()),
    ('Jiazhi Tech', '迦智科技', 'jiazhi-tech', 'manufacturing', 'humanoid-robot', 'CN', 'Hangzhou', 'Zhejiang', 2016,
    'series-b', 50000000, ARRAY['ZJU'], ARRAY['Mobile Robot'], 0, 'B', true, NOW(), NOW()),
    ('Kairos Tech', '凯乐士科技', 'kairos-tech', 'manufacturing', 'humanoid-robot', 'CN', 'Jiaxing', 'Zhejiang', 2014,
    'series-c', 100000000, ARRAY['ZJU'], ARRAY['Logistics Robot'], 0, 'B', true, NOW(), NOW());

-- 上海交大系其他企业
INSERT INTO companies (name, name_cn, slug, industry_slug, sub_sector, country, hq_city, hq_province, founded_year, 
    funding_stage, funding_total_usd, university_tags, core_products, unit_shipment, data_reliability, is_tracked, created_at, updated_at)
VALUES 
    ('Zhuoyide', '卓益得', 'zhuoyide', 'manufacturing', 'humanoid-robot', 'CN', 'Shanghai', 'Shanghai', 2023,
    'angel', 10000000, ARRAY['SJTU'], ARRAY['Humanoid Robot'], 0, 'C', true, NOW(), NOW());

-- 其他高校/背景企业
INSERT INTO companies (name, name_cn, slug, industry_slug, sub_sector, country, hq_city, hq_province, founded_year, 
    funding_stage, funding_total_usd, university_tags, core_products, unit_shipment, data_reliability, is_tracked, created_at, updated_at)
VALUES 
    ('Tianlian Robotics', '天链机器人', 'tianlian-robotics', 'manufacturing', 'humanoid-robot', 'CN', 'Chengdu', 'Sichuan', 2014,
    'series-b', 30000000, ARRAY['UESTC'], ARRAY['Humanoid Robot'], 0, 'B', true, NOW(), NOW()),
    ('Iron Man Tech', '钢铁侠科技', 'ironman-tech', 'manufacturing', 'humanoid-robot', 'CN', 'Beijing', 'Beijing', 2015,
    'series-a', 20000000, ARRAY['BUAA'], ARRAY['ART-1', 'ART-2'], 0, 'B', true, NOW(), NOW()),
    ('RealMan Robotics', '睿尔曼智能', 'realman-robotics', 'manufacturing', 'humanoid-robot', 'CN', 'Beijing', 'Beijing', 2018,
    'series-a', 20000000, ARRAY['BUAA'], ARRAY['Lightweight Arm'], 100, 'B', true, NOW(), NOW()),
    ('Hewa Robotics', '赫瓦机器人', 'hewa-robotics', 'manufacturing', 'humanoid-robot', 'CN', 'Nanjing', 'Jiangsu', 2018,
    'angel', 10000000, ARRAY['SEU'], ARRAY['Humanoid Robot'], 0, 'C', true, NOW(), NOW());

-- 大厂/生态链企业
INSERT INTO companies (name, name_cn, slug, industry_slug, sub_sector, country, hq_city, hq_province, founded_year, 
    funding_stage, funding_total_usd, university_tags, core_products, unit_shipment, data_reliability, is_tracked, is_public, created_at, updated_at)
VALUES 
    ('Dreame', '追觅科技', 'dreame', 'manufacturing', 'humanoid-robot', 'CN', 'Suzhou', 'Jiangsu', 2017,
    'undisclosed', 0, ARRAY[], ARRAY['Humanoid Robot (R&D)'], 0, 'C', true, false, NOW(), NOW()),
    ('DJI', '大疆', 'dji', 'manufacturing', 'humanoid-robot', 'CN', 'Shenzhen', 'Guangdong', 2006,
    'private', 0, ARRAY[], ARRAY['Humanoid Robot (Rumored)'], 0, 'X', true, false, NOW(), NOW()),
    ('Shanghai Humanoid Robot', '人形机器人（上海）', 'shanghai-humanoid', 'manufacturing', 'humanoid-robot', 'CN', 'Shanghai', 'Shanghai', 2023,
    'undisclosed', 0, ARRAY['Government'], ARRAY['Humanoid Robot'], 0, 'C', true, false, NOW(), NOW());

-- AI公司延伸
INSERT INTO companies (name, name_cn, slug, industry_slug, sub_sector, country, hq_city, hq_province, founded_year, 
    funding_stage, funding_total_usd, university_tags, core_products, unit_shipment, data_reliability, is_tracked, created_at, updated_at)
VALUES 
    ('Zhipu AI', '智谱AI', 'zhipu-ai', 'manufacturing', 'humanoid-robot', 'CN', 'Beijing', 'Beijing', 2019,
    'series-b', 400000000, ARRAY['Tsinghua'], ARRAY['LLM + Humanoid'], 0, 'C', true, NOW(), NOW()),
    ('AISpeech', '思必驰', 'aispeech', 'manufacturing', 'humanoid-robot', 'CN', 'Suzhou', 'Jiangsu', 2007,
    'series-d', 200000000, ARRAY['SJTU', 'Cambridge'], ARRAY['Voice AI + Humanoid'], 0, 'B', true, NOW(), NOW());

-- 上市公司（已存在，更新字段）
UPDATE companies SET 
    sub_sector = 'humanoid-robot',
    funding_total_usd = 0,
    unit_shipment = 0,
    data_reliability = 'C',
    is_tracked = true
WHERE slug IN ('xpeng', 'xiaomi', 'iflytek', 'mobvoi');

-- ============================================
-- 数据验证查询
-- ============================================
SELECT 
    name_cn,
    funding_stage,
    funding_total_usd / 1000000 as funding_m_usd,
    unit_shipment,
    data_reliability,
    university_tags
FROM companies 
WHERE industry_slug = 'manufacturing' AND sub_sector = 'humanoid-robot'
ORDER BY unit_shipment DESC NULLS LAST;
