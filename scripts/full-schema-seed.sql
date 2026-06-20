-- =============================================================
-- AMORA Insights — Full Schema + Seed Data  v1.0
-- RUN THIS IN: Supabase Dashboard > SQL Editor
-- https://supabase.com/dashboard/project/jqppcuccqkxhhrvndsil/sql/new
-- Approved by Franklyn (CEO)
-- CLO compliance fields v0.2 · CRO geo-risk fields v1.0
-- Updated: 2026-03-14
-- =============================================================

-- ─── 0. industries (lookup table) ────────────────────────────
CREATE TABLE IF NOT EXISTS industries (
  id         SERIAL       PRIMARY KEY,
  slug       VARCHAR(50)  NOT NULL UNIQUE,
  name       TEXT         NOT NULL,
  name_cn    TEXT,
  icon       TEXT,
  sort_order INTEGER      NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

INSERT INTO industries (slug, name, name_cn, icon, sort_order) VALUES
  ('ai',                       'AI',                      '人工智能', '🤖', 1),
  ('life-sciences',            'Life Sciences',           '生命科学', '🧬', 2),
  ('green-tech',               'Green Tech',              '绿色科技', '⚡', 3),
  ('manufacturing','Manufacturing','未来制造', '🦾', 4),
  ('new-space',                'New Space',               '新太空',   '🚀', 5),
  ('advanced-materials',       'Advanced Materials',      '先进材料', '⚛️', 6)
ON CONFLICT (slug) DO NOTHING;

-- ─── 1. reports ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reports (
  id               BIGSERIAL    PRIMARY KEY,
  title            TEXT         NOT NULL,
  slug             VARCHAR(255) NOT NULL UNIQUE,
  summary          TEXT         NOT NULL,
  content          TEXT,
  cover_image_url  TEXT,
  industry_slug    VARCHAR(50)  NOT NULL REFERENCES industries(slug),
  is_premium       BOOLEAN      NOT NULL DEFAULT false,
  author           TEXT,
  tags             TEXT[]       NOT NULL DEFAULT '{}',
  view_count       INTEGER      NOT NULL DEFAULT 0,
  published_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  -- Compliance (CLO v0.2 + CRO v1.0)
  compliance_tier   VARCHAR(20)  NOT NULL DEFAULT 'STANDARD'
    CHECK (compliance_tier IN ('STANDARD','SENSITIVE_TECH','RESTRICTED')),
  compliance_status VARCHAR(30)  NOT NULL DEFAULT 'PENDING_REVIEW'
    CHECK (compliance_status IN (
      'PENDING_REVIEW','IN_REVIEW','APPROVED','REJECTED',
      'FLAGGED_PENDING_REVIEW','FLAGGED_CONFIRMED',
      'FLAGGED_RESOLVED_PUBLISHED','FLAGGED_RESOLVED_REMOVED'
    )),
  sensitivity_tags  JSONB        NOT NULL DEFAULT '[]',
  tech_domain       VARCHAR(30)
    CHECK (tech_domain IS NULL OR tech_domain IN (
      'SEMICONDUCTOR','AI_COMPUTE','QUANTUM','BIOTECH','AEROSPACE',
      'CYBERSECURITY','MATERIALS','OTHER_CONTROLLED','NON_CONTROLLED'
    )),
  geo_risk_tier     VARCHAR(3)   NOT NULL DEFAULT 'G0'
    CHECK (geo_risk_tier IN ('G0','G1','G2','G3')),
  effective_tier    VARCHAR(20)  NOT NULL DEFAULT 'STANDARD',

  -- Audit trail
  compliance_reviewer_id   TEXT,
  compliance_reviewed_at   TIMESTAMPTZ,
  compliance_dual_sign_id  TEXT,
  entity_list_checked_at   TIMESTAMPTZ,
  entity_list_version      VARCHAR(50),
  compliance_notes         TEXT,
  downgrade_authorized_by  TEXT[]   NOT NULL DEFAULT '{}',
  downgrade_reason         TEXT
);

-- effective_tier trigger
CREATE OR REPLACE FUNCTION fn_compute_effective_tier()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE comp_rank INT; geo_rank INT; max_rank INT;
BEGIN
  comp_rank := CASE NEW.compliance_tier
    WHEN 'RESTRICTED'     THEN 2 WHEN 'SENSITIVE_TECH' THEN 1 ELSE 0 END;
  geo_rank := CASE NEW.geo_risk_tier
    WHEN 'G3' THEN 2 WHEN 'G2' THEN 2 WHEN 'G1' THEN 1 ELSE 0 END;
  max_rank := GREATEST(comp_rank, geo_rank);
  NEW.effective_tier := CASE max_rank
    WHEN 2 THEN 'RESTRICTED' WHEN 1 THEN 'SENSITIVE_TECH' ELSE 'STANDARD' END;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_effective_tier ON reports;
CREATE TRIGGER trg_effective_tier
  BEFORE INSERT OR UPDATE OF compliance_tier, geo_risk_tier
  ON reports FOR EACH ROW EXECUTE FUNCTION fn_compute_effective_tier();

CREATE INDEX IF NOT EXISTS idx_reports_industry         ON reports(industry_slug);
CREATE INDEX IF NOT EXISTS idx_reports_published        ON reports(published_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_reports_is_premium       ON reports(is_premium);
CREATE INDEX IF NOT EXISTS idx_reports_slug             ON reports(slug);
CREATE INDEX IF NOT EXISTS idx_reports_compliance_tier  ON reports(compliance_tier);
CREATE INDEX IF NOT EXISTS idx_reports_effective_tier   ON reports(effective_tier);
CREATE INDEX IF NOT EXISTS idx_reports_comp_status      ON reports(compliance_status);
CREATE INDEX IF NOT EXISTS idx_reports_geo_risk         ON reports(geo_risk_tier);
CREATE INDEX IF NOT EXISTS idx_reports_sensitivity_tags ON reports USING GIN (sensitivity_tags);

-- ─── 2. news_items ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS news_items (
  id            BIGSERIAL    PRIMARY KEY,
  title         TEXT         NOT NULL,
  summary       TEXT         NOT NULL,
  industry_slug VARCHAR(50)  NOT NULL REFERENCES industries(slug),
  source_url    TEXT,
  source_name   TEXT,
  is_featured   BOOLEAN      NOT NULL DEFAULT false,
  published_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_industry    ON news_items(industry_slug);
CREATE INDEX IF NOT EXISTS idx_news_published   ON news_items(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_is_featured ON news_items(is_featured);

-- ─── 3. companies ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS companies (
  id              BIGSERIAL    PRIMARY KEY,
  name            TEXT         NOT NULL,
  name_cn         TEXT,
  industry_slug   VARCHAR(50)  NOT NULL REFERENCES industries(slug),
  sub_sector      TEXT,
  description     TEXT,
  description_cn  TEXT,
  founded_year    INTEGER,
  country         VARCHAR(10)  NOT NULL DEFAULT 'CN',
  hq_city         TEXT,
  hq_province     TEXT,
  website         TEXT,
  ticker          VARCHAR(20),
  exchange        VARCHAR(20),
  employee_count  INTEGER,
  is_tracked      BOOLEAN      NOT NULL DEFAULT true,
  is_public       BOOLEAN      NOT NULL DEFAULT false,
  tags            TEXT[]       NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companies_industry   ON companies(industry_slug);
CREATE INDEX IF NOT EXISTS idx_companies_is_tracked ON companies(is_tracked);
CREATE INDEX IF NOT EXISTS idx_companies_name       ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_province   ON companies(hq_province);
CREATE INDEX IF NOT EXISTS idx_companies_country    ON companies(country);

-- ─── 4. SEED DATA — Reports (2 per industry) ─────────────────

INSERT INTO reports (title, slug, summary, industry_slug, is_premium, author, tags, published_at,
  compliance_tier, compliance_status, geo_risk_tier, sensitivity_tags) VALUES
-- AI — foundation models: STANDARD, no entity-list exposure
('2026 China AI Foundation Model Landscape',
 '2026-china-ai-foundation-model-landscape',
 'A comprehensive analysis of China''s top foundation model players including Baidu ERNIE, Alibaba Qwen, Zhipu AI GLM, and emerging challengers. Covers capability benchmarks, deployment scale, and enterprise adoption trends.',
 'ai', false, 'AMORA Research', ARRAY['foundation-models','china-ai','llm','enterprise'], NOW() - INTERVAL '2 days',
 'STANDARD', 'APPROVED', 'G0', '[]'::JSONB),

-- AI — agentic AI: STANDARD, approved
('Agentic AI in Chinese Enterprise: 2026 Adoption Report',
 '2026-agentic-ai-chinese-enterprise',
 'How China''s manufacturing and financial sectors are deploying AI agents for autonomous workflow automation. Key findings from 50+ enterprise case studies.',
 'ai', true, 'AMORA Research', ARRAY['ai-agents','enterprise','automation','china'], NOW() - INTERVAL '5 days',
 'STANDARD', 'APPROVED', 'G0', '[]'::JSONB),

-- Life Sciences — CRISPR: SENSITIVE_TECH (BIOTECH, dual-use potential)
('CRISPR Therapeutics Pipeline: China vs Global Race',
 'crispr-therapeutics-pipeline-china-2026',
 'Mapping the competitive landscape of Chinese biotech firms in CRISPR gene editing — from Qi Biodesign to EdiGene. Regulatory pathways, clinical trials, and IP strategy.',
 'life-sciences', false, 'AMORA Research', ARRAY['crispr','gene-editing','biotech','clinical-trials'], NOW() - INTERVAL '7 days',
 'SENSITIVE_TECH', 'APPROVED', 'G1',
 '[{"tag_type":"TECHNOLOGY","value":"CRISPR dual-use","value_normalized":"CRISPR DUAL USE","source_list":"INTERNAL","geo_risk_contribution":"G1","flagged_at":null,"flagged_by_list_update":null}]'::JSONB),

-- Life Sciences — SynBio: SENSITIVE_TECH
('Synthetic Biology Hubs: Shenzhen and Beijing Deep Dive',
 'synthetic-biology-hubs-shenzhen-beijing-2026',
 'An investment intelligence report on China''s two leading synthetic biology clusters. Covers key companies, research institutions, funding trends, and policy tailwinds.',
 'life-sciences', true, 'AMORA Research', ARRAY['synthetic-biology','shenzhen','beijing','biotech-hubs'], NOW() - INTERVAL '10 days',
 'SENSITIVE_TECH', 'APPROVED', 'G1',
 '[{"tag_type":"TECHNOLOGY","value":"Synthetic biology dual-use","value_normalized":"SYNTHETIC BIOLOGY DUAL USE","source_list":"INTERNAL","geo_risk_contribution":"G1","flagged_at":null,"flagged_by_list_update":null}]'::JSONB),

-- Green Tech — EV Battery: STANDARD
('China EV Battery Supply Chain: 2026 Disruption Map',
 'china-ev-battery-supply-chain-2026',
 'Analyzing the full battery value chain from lithium extraction to recycling. CATL, BYD, CALB competitive dynamics and the solid-state battery inflection point.',
 'green-tech', false, 'AMORA Research', ARRAY['ev-battery','catl','byd','supply-chain','solid-state'], NOW() - INTERVAL '3 days',
 'STANDARD', 'APPROVED', 'G0', '[]'::JSONB),

-- Green Tech — Green Hydrogen: STANDARD
('Green Hydrogen: China''s Electrolyzer Manufacturers Go Global',
 'green-hydrogen-china-electrolyzer-global-2026',
 'China now produces 60% of global electrolyzers. This report profiles CSSC, Sungrow, and Peric''s international expansion strategies and cost curves.',
 'green-tech', true, 'AMORA Research', ARRAY['green-hydrogen','electrolyzer','clean-energy','export'], NOW() - INTERVAL '8 days',
 'STANDARD', 'APPROVED', 'G0', '[]'::JSONB),

-- Intelligent Mfg — Humanoid Robots: STANDARD
('Humanoid Robots: China''s Manufacturing Bet',
 'humanoid-robots-china-manufacturing-2026',
 'From Unitree to UBTECH to BYD''s internal robotics division — analyzing China''s humanoid robot ecosystem and the roadmap to factory floor deployment.',
 'manufacturing', false, 'AMORA Research', ARRAY['humanoid-robots','unitree','factory-automation','robotics'], NOW() - INTERVAL '4 days',
 'STANDARD', 'APPROVED', 'G0', '[]'::JSONB),

-- Intelligent Mfg — IIoT: SENSITIVE_TECH (Huawei referenced — G1 indirect)
('Industrial IoT Platform Wars: Siemens vs Chinese Champions',
 'industrial-iot-platform-wars-2026',
 'Comparing Siemens MindSphere against Huawei FusionPlant, SANY ROOTCLOUD, and Haier COSMOPlat for China''s smart factory market. Who is winning and why.',
 'manufacturing', true, 'AMORA Research', ARRAY['iiot','smart-factory','siemens','huawei','digital-twin'], NOW() - INTERVAL '12 days',
 'SENSITIVE_TECH', 'APPROVED', 'G1',
 '[{"tag_type":"ENTITY","value":"Huawei Technologies Co.","value_normalized":"HUAWEI TECHNOLOGIES CO","source_list":"BIS_ENTITY_LIST","geo_risk_contribution":"G1","flagged_at":null,"flagged_by_list_update":null}]'::JSONB),

-- New Space — Launch Vehicles: SENSITIVE_TECH (aerospace ECCN 9E001)
('China Commercial Space: 2026 Launch Vehicle Showdown',
 'china-commercial-space-launch-vehicle-2026',
 'LandSpace Zhuque-3, CAS Space, Space Pioneer — the new generation of Chinese reusable rockets and how they compare to SpaceX''s cost curves.',
 'new-space', false, 'AMORA Research', ARRAY['launch-vehicle','reusable-rockets','landspace','commercial-space'], NOW() - INTERVAL '6 days',
 'SENSITIVE_TECH', 'APPROVED', 'G1',
 '[{"tag_type":"TECHNOLOGY","value":"9E001","value_normalized":"9E001","source_list":"INTERNAL","geo_risk_contribution":"G1","flagged_at":null,"flagged_by_list_update":null}]'::JSONB),

-- New Space — Satcom: SENSITIVE_TECH
('Low Earth Orbit Satcom: China''s Guowang vs StarLink',
 'china-leo-satcom-guowang-starlink-2026',
 'China''s 13,000-satellite Guowang constellation is entering launch phase. This report maps competitive dynamics, spectrum rights, and enterprise connectivity opportunities.',
 'new-space', true, 'AMORA Research', ARRAY['leo-satcom','guowang','starlink','satellite-internet'], NOW() - INTERVAL '14 days',
 'SENSITIVE_TECH', 'APPROVED', 'G1',
 '[{"tag_type":"TECHNOLOGY","value":"9A012","value_normalized":"9A012","source_list":"INTERNAL","geo_risk_contribution":"G1","flagged_at":null,"flagged_by_list_update":null}]'::JSONB),

-- Advanced Materials — Carbon Fiber: SENSITIVE_TECH (1C/1E ECCN, COMAC supply)
('Carbon Fiber in Aerospace: China Breaks Western Monopoly',
 'carbon-fiber-aerospace-china-2026',
 'Zhongjian Carbon Fiber and Guangwei Composites have achieved T800/T1000 grade certification. Analysis of China''s supply chain independence strategy for aerospace composites.',
 'advanced-materials', false, 'AMORA Research', ARRAY['carbon-fiber','aerospace','composites','supply-chain-independence'], NOW() - INTERVAL '9 days',
 'SENSITIVE_TECH', 'APPROVED', 'G1',
 '[{"tag_type":"TECHNOLOGY","value":"1C010","value_normalized":"1C010","source_list":"INTERNAL","geo_risk_contribution":"G1","flagged_at":null,"flagged_by_list_update":null}]'::JSONB),

-- Advanced Materials — Perovskite Solar: STANDARD
('Perovskite Solar Cells: China''s Next Clean Tech Dominance Play',
 'perovskite-solar-cells-china-2026',
 'China leads in perovskite solar commercialization. Key players Microquanta, GCL, and Longi''s perovskite division — module efficiency records, production scale-up timelines.',
 'advanced-materials', true, 'AMORA Research', ARRAY['perovskite','solar-cells','clean-tech','gcl','longi'], NOW() - INTERVAL '11 days',
 'STANDARD', 'APPROVED', 'G0', '[]'::JSONB);

-- ─── 5. SEED DATA — News Items ────────────────────────────────

INSERT INTO news_items (title, summary, industry_slug, source_name, is_featured, published_at) VALUES
('Baidu releases ERNIE 5.0 with multimodal reasoning breakthrough',
 'Baidu''s latest foundation model achieves state-of-the-art on Chinese legal and medical benchmarks, with integrated vision-language capabilities.',
 'ai', 'TechCrunch China', true, NOW() - INTERVAL '4 hours'),

('DeepSeek R2 tops global coding benchmarks in March 2026 evaluation',
 'DeepSeek''s newest reasoning model outperforms competitors on HumanEval+ and SWE-bench, raising questions about US export control effectiveness.',
 'ai', 'MIT Technology Review', true, NOW() - INTERVAL '8 hours'),

('BYD launches solid-state battery pilot production line in Shenzhen',
 'BYD confirms 20GWh solid-state battery pilot facility operational, targeting 2027 vehicle integration. Energy density exceeds 400Wh/kg in lab conditions.',
 'green-tech', 'Reuters', true, NOW() - INTERVAL '6 hours'),

('Unitree G1 humanoid robot enters automotive factory trials at SAIC',
 'SAIC Motor has deployed 50 Unitree G1 units for assembly line testing in its Shanghai facility, marking China''s first large-scale humanoid robot industrial deployment.',
 'manufacturing', 'South China Morning Post', false, NOW() - INTERVAL '12 hours'),

('China''s Guowang constellation launches first 100 satellites',
 'The first batch of Guowang LEO satellites successfully deployed, with full global coverage targeted for 2028. Initial enterprise beta service begins Q3 2026.',
 'new-space', 'Space News', false, NOW() - INTERVAL '1 day'),

('Zhongjian Carbon Fiber receives COMAC certification for C919 supply',
 'China''s leading carbon fiber manufacturer achieves full qualification for domestic narrow-body aircraft, reducing dependence on Toray and Hexcel imports.',
 'advanced-materials', 'Aviation Week', false, NOW() - INTERVAL '2 days'),

('EdiGene receives IND approval for CRISPR blood disorder therapy',
 'China''s EdiGene becomes second Chinese biotech to receive clinical trial approval for ex vivo CRISPR therapy, targeting sickle cell disease and beta-thalassemia.',
 'life-sciences', 'Nature Biotechnology', true, NOW() - INTERVAL '3 hours'),

('LandSpace Zhuque-3 completes first reusable flight demonstration',
 'China''s first methane-fueled reusable launch vehicle successfully recovered its booster stage, achieving a milestone comparable to SpaceX Falcon 9 in 2015.',
 'new-space', 'Xinhua', true, NOW() - INTERVAL '2 hours');

-- ─── 6. SEED DATA — Companies ─────────────────────────────────

INSERT INTO companies (name, name_cn, industry_slug, sub_sector, description, country, hq_city, hq_province, founded_year, is_public, is_tracked, tags) VALUES
-- AI
('Zhipu AI', '智谱AI', 'ai', 'Foundation Models',
 'Developer of the GLM series of large language models. Backed by Tsinghua University research. Key enterprise AI platform provider.',
 'CN', 'Beijing', 'Beijing', 2019, false, true, ARRAY['llm','foundation-model','enterprise-ai']),

('Moonshot AI', '月之暗面', 'ai', 'Foundation Models',
 'Creator of the Kimi long-context AI model. Raised over $1B in 2024-2025. Known for 1M+ token context window capabilities.',
 'CN', 'Beijing', 'Beijing', 2023, false, true, ARRAY['llm','long-context','consumer-ai']),

('Manus AI', '万象AI', 'ai', 'AI Agents',
 'Developer of autonomous AI agents for complex task completion. One of the first Chinese companies to deploy general-purpose AI agents commercially.',
 'CN', 'Beijing', 'Beijing', 2024, false, true, ARRAY['ai-agents','autonomous-ai']),

-- Life Sciences
('EdiGene', '博雅辑因', 'life-sciences', 'Gene Editing',
 'Clinical-stage gene editing company focused on CRISPR therapies for blood disorders and cancer. IND approved for multiple programs.',
 'CN', 'Beijing', 'Beijing', 2015, false, true, ARRAY['crispr','gene-therapy','clinical-stage']),

('Qi Biodesign', '齐禾生科', 'life-sciences', 'Synthetic Biology',
 'Synthetic biology platform company focused on industrial enzyme engineering and biomanufacturing. Key player in China''s SynBio hub.',
 'CN', 'Shenzhen', 'Guangdong', 2020, false, true, ARRAY['synthetic-biology','industrial-biotech','enzyme']),

-- Green Tech
('CATL', '宁德时代', 'green-tech', 'EV Batteries',
 'World''s largest EV battery manufacturer by volume. Dominant in LFP and NCM chemistry, investing heavily in solid-state and sodium-ion.',
 'CN', 'Ningde', 'Fujian', 2011, true, true, ARRAY['ev-battery','catl','solid-state','lfp']),

('Sungrow Power', '阳光电源', 'green-tech', 'Green Hydrogen',
 'Leading inverter and energy storage company expanding into green hydrogen via electrolyzer manufacturing. Strong international presence.',
 'CN', 'Hefei', 'Anhui', 1997, true, true, ARRAY['inverter','energy-storage','green-hydrogen','electrolyzer']),

-- Intelligent Manufacturing
('Unitree Robotics', '宇树科技', 'manufacturing', 'Humanoid Robots',
 'China''s leading quadruped and humanoid robot company. H1 and G1 models deployed in industrial settings globally.',
 'CN', 'Hangzhou', 'Zhejiang', 2016, false, true, ARRAY['humanoid-robot','quadruped','factory-automation']),

('UBTECH Robotics', '优必选', 'manufacturing', 'Humanoid Robots',
 'Pioneer in humanoid robotics, listed on HKEX. Walker S series deployed in BYD and NIO factories for quality inspection tasks.',
 'CN', 'Shenzhen', 'Guangdong', 2012, true, true, ARRAY['humanoid-robot','hkex-listed','automotive']),

-- New Space
('LandSpace', '蓝箭航天', 'new-space', 'Launch Vehicles',
 'Developer of China''s first methane-fueled orbital rocket Zhuque-2. Working on reusable Zhuque-3 to compete with SpaceX Falcon 9.',
 'CN', 'Beijing', 'Beijing', 2015, false, true, ARRAY['launch-vehicle','reusable','methane-rocket']),

('CAS Space', '中科宇航', 'new-space', 'Launch Vehicles',
 'Spin-off from Chinese Academy of Sciences. Focuses on solid-fuel and hybrid launch vehicles for small satellite deployment.',
 'CN', 'Beijing', 'Beijing', 2018, false, true, ARRAY['launch-vehicle','small-sat','cas-spinoff']),

-- Advanced Materials
('Zhongjian Carbon Fiber', '中简科技', 'advanced-materials', 'Carbon Fiber',
 'China''s first company to achieve T800-grade carbon fiber production at scale. Qualified supplier for COMAC C919 airframe components.',
 'CN', 'Changzhou', 'Jiangsu', 2008, true, true, ARRAY['carbon-fiber','aerospace','t800','comac']),

('Microquanta Semiconductor', '纤纳光电', 'advanced-materials', 'Perovskite Solar',
 'World leader in perovskite solar module efficiency, holding multiple certified records. Commercial production facility operational in Hangzhou.',
 'CN', 'Hangzhou', 'Zhejiang', 2015, false, true, ARRAY['perovskite','solar','clean-tech','efficiency-record']);

-- ─── Verification ─────────────────────────────────────────────
SELECT 
  (SELECT COUNT(*) FROM industries)  AS industries,
  (SELECT COUNT(*) FROM reports)     AS reports,
  (SELECT COUNT(*) FROM news_items)  AS news_items,
  (SELECT COUNT(*) FROM companies)   AS companies;
