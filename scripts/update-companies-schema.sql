-- =============================================================
-- AMORA Companies Schema Update v2.0
-- 针对人形机器人行业研究报告优化
-- 新增：技术评估、融资详情、产业链位置、商业化数据字段
-- =============================================================

-- 扩展 companies 表
ALTER TABLE companies
    -- 公司基本信息扩展
    ADD COLUMN IF NOT EXISTS slug VARCHAR(100) UNIQUE,
    ADD COLUMN IF NOT EXISTS logo_url TEXT,
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'acquired', 'defunct', 'ipo')),
    
    -- 融资信息
    ADD COLUMN IF NOT EXISTS funding_stage VARCHAR(20),
    ADD COLUMN IF NOT EXISTS funding_total_usd BIGINT, -- 累计融资额（美元）
    ADD COLUMN IF NOT EXISTS funding_total_cny BIGINT, -- 累计融资额（人民币）
    ADD COLUMN IF NOT EXISTS valuation_usd BIGINT, -- 最新估值（美元）
    ADD COLUMN IF NOT EXISTS valuation_date DATE, -- 估值日期
    ADD COLUMN IF NOT EXISTS lead_investors TEXT[], -- 主要投资方
    ADD COLUMN IF NOT EXISTS all_investors TEXT[], -- 全部投资方
    
    -- 团队背景
    ADD COLUMN IF NOT EXISTS founders TEXT[], -- 创始人
    ADD COLUMN IF NOT EXISTS team_background TEXT, -- 团队背景描述
    ADD COLUMN IF NOT EXISTS university_tags TEXT[], -- 高校标签（清华/哈工大/浙大等）
    
    -- 产品信息
    ADD COLUMN IF NOT EXISTS core_products TEXT[], -- 核心产品
    ADD COLUMN IF NOT EXISTS product_status VARCHAR(20), -- 产品状态
    ADD COLUMN IF NOT EXISTS unit_shipment INTEGER, -- 累计出货量
    ADD COLUMN IF NOT EXISTS unit_price_usd INTEGER, -- 单价（美元）
    ADD COLUMN IF NOT EXISTS unit_price_cny INTEGER, -- 单价（人民币）
    
    -- 技术路线
    ADD COLUMN IF NOT EXISTS tech_route TEXT, -- 技术路线描述
    ADD COLUMN IF NOT EXISTS tech_maturity_level INTEGER CHECK (tech_maturity_level BETWEEN 1 AND 9), -- TRL 1-9
    ADD COLUMN IF NOT EXISTS world_model_score INTEGER CHECK (world_model_score BETWEEN 1 AND 5), -- 世界模型能力 1-5
    ADD COLUMN IF NOT EXISTS ai_approach VARCHAR(50), -- AI方法（VLA/分层控制/混合等）
    ADD COLUMN IF NOT EXISTS patent_count INTEGER, -- 专利数量
    
    -- 产业链位置
    ADD COLUMN IF NOT EXISTS supply_chain_tier VARCHAR(20), -- 产业链层级
    ADD COLUMN IF NOT EXISTS ecosystem_position TEXT, -- 生态位描述
    ADD COLUMN IF NOT EXISTS key_components TEXT[], -- 关键自研零部件
    
    -- 客户与场景
    ADD COLUMN IF NOT EXISTS primary_use_cases TEXT[], -- 主要应用场景
    ADD COLUMN IF NOT EXISTS customer_breakdown JSONB, -- 客户结构（JSON格式）
    ADD COLUMN IF NOT EXISTS key_partners TEXT[], -- 关键合作伙伴
    
    -- 数据来源
    ADD COLUMN IF NOT EXISTS data_sources TEXT[], -- 数据来源
    ADD COLUMN IF NOT EXISTS data_reliability VARCHAR(10) CHECK (data_reliability IN ('S', 'A', 'B', 'C', 'X')), -- 数据可信度
    ADD COLUMN IF NOT EXISTS notes TEXT, -- 备注
    
    -- AMORA评分（可选，用于企业评估）
    ADD COLUMN IF NOT EXISTS amora_advancement_score DECIMAL(3,1), -- A-技术先进性
    ADD COLUMN IF NOT EXISTS amora_mastery_score DECIMAL(3,1), -- M-人才优势
    ADD COLUMN IF NOT EXISTS amora_operations_score DECIMAL(3,1), -- O-商业落地
    ADD COLUMN IF NOT EXISTS amora_reach_score DECIMAL(3,1), -- R-全球化
    ADD COLUMN IF NOT EXISTS amora_affinity_score DECIMAL(3,1), -- A-可持续能力
    ADD COLUMN IF NOT EXISTS amora_total_score DECIMAL(3,1); -- 总分

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);
CREATE INDEX IF NOT EXISTS idx_companies_funding_stage ON companies(funding_stage);
CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);
CREATE INDEX IF NOT EXISTS idx_companies_university ON companies USING GIN(university_tags);
CREATE INDEX IF NOT EXISTS idx_companies_data_reliability ON companies(data_reliability);

-- 创建触发器：自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 创建 company_funding 表（融资历史明细）
CREATE TABLE IF NOT EXISTS company_funding (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    round VARCHAR(20) NOT NULL, -- 轮次（Seed/Angel/Pre-A/A/B/C/D/IPO等）
    round_date DATE, -- 融资日期
    amount_usd BIGINT, -- 金额（美元）
    amount_cny BIGINT, -- 金额（人民币）
    valuation_usd BIGINT, -- 投后估值（美元）
    valuation_cny BIGINT, -- 投后估值（人民币）
    lead_investor TEXT, -- 领投方
    co_investors TEXT[], -- 跟投方
    funding_purpose TEXT, -- 资金用途
    data_source TEXT, -- 数据来源
    data_reliability VARCHAR(10) CHECK (data_reliability IN ('S', 'A', 'B', 'C', 'X')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_company_funding_company_id ON company_funding(company_id);
CREATE INDEX IF NOT EXISTS idx_company_funding_round ON company_funding(round);

DROP TRIGGER IF EXISTS update_company_funding_updated_at ON company_funding;
CREATE TRIGGER update_company_funding_updated_at
    BEFORE UPDATE ON company_funding
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 创建 company_financials 表（财务数据）
CREATE TABLE IF NOT EXISTS company_financials (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    report_year INTEGER NOT NULL,
    report_quarter INTEGER, -- 1/2/3/4，年报为NULL
    report_type VARCHAR(10) CHECK (report_type IN ('annual', 'quarterly', 'ipo_prospectus')),
    
    -- 收入数据
    revenue_usd BIGINT, -- 营收（美元）
    revenue_cny BIGINT, -- 营收（人民币）
    gross_profit_usd BIGINT, -- 毛利（美元）
    gross_margin DECIMAL(5,2), -- 毛利率
    net_profit_usd BIGINT, -- 净利（美元）
    net_margin DECIMAL(5,2), -- 净利率
    
    -- 研发投入
    rd_expense_usd BIGINT, -- 研发费用（美元）
    rd_ratio DECIMAL(5,2), -- 研发费用率
    
    -- 资产负债
    total_assets_usd BIGINT, -- 总资产
    total_debt_usd BIGINT, -- 总负债
    cash_usd BIGINT, -- 现金及等价物
    
    -- 运营数据
    employee_count INTEGER, -- 员工数
    
    data_source TEXT,
    data_reliability VARCHAR(10) CHECK (data_reliability IN ('S', 'A', 'B', 'C', 'X')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(company_id, report_year, report_quarter)
);

CREATE INDEX IF NOT EXISTS idx_company_financials_company_id ON company_financials(company_id);
CREATE INDEX IF NOT EXISTS idx_company_financials_year ON company_financials(report_year);

DROP TRIGGER IF EXISTS update_company_financials_updated_at ON company_financials;
CREATE TRIGGER update_company_financials_updated_at
    BEFORE UPDATE ON company_financials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 创建 company_supply_chain 表（供应链/产业链位置）
CREATE TABLE IF NOT EXISTS company_supply_chain (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- 产业链位置
    supply_chain_tier VARCHAR(20) NOT NULL, -- upstream/midstream/downstream
    ecosystem_position TEXT, -- 详细生态位描述
    
    -- 关键供应商
    key_suppliers JSONB, -- [{"name": "", "component": "", "country": ""}]
    import_dependency DECIMAL(3,2), -- 进口依赖度 0-1
    
    -- 关键客户
    key_customers JSONB, -- [{"name": "", "industry": "", "revenue_share": ""}]
    export_restriction_risk VARCHAR(10), -- 出口管制风险等级
    
    -- 自研能力
    in_house_components TEXT[], -- 自研零部件
    outsourced_components TEXT[], -- 外购零部件
    
    -- 供应链韧性评估
    supply_chain_resilience_score INTEGER CHECK (supply_chain_resilience_score BETWEEN 1 AND 5),
    
    data_source TEXT,
    data_reliability VARCHAR(10) CHECK (data_reliability IN ('S', 'A', 'B', 'C', 'X')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_company_supply_chain_company_id ON company_supply_chain(company_id);
CREATE INDEX IF NOT EXISTS idx_company_supply_chain_tier ON company_supply_chain(supply_chain_tier);

DROP TRIGGER IF EXISTS update_company_supply_chain_updated_at ON company_supply_chain;
CREATE TRIGGER update_company_supply_chain_updated_at
    BEFORE UPDATE ON company_supply_chain
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 创建 company_operations 表（商业化运营数据）
CREATE TABLE IF NOT EXISTS company_operations (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- 产品上市
    product_launch_date DATE, -- 产品上市日期
    latest_product_version TEXT, -- 最新产品版本
    
    -- 销售数据
    cumulative_shipment INTEGER, -- 累计出货量
    annual_shipment_2024 INTEGER, -- 2024年出货量
    annual_shipment_2025 INTEGER, -- 2025年出货量
    
    -- 客户结构
    customer_breakdown JSONB, -- {"education": 73.6, "industrial": 10, "service": 9, "other": 7.4}
    
    -- 应用场景
    primary_scenarios TEXT[], -- 主要应用场景
    scenario_maturity JSONB, -- 各场景成熟度评分
    
    -- 合作伙伴
    key_partners TEXT[], -- 关键合作伙伴
    oem_partners TEXT[], -- OEM合作方
    
    -- 商业化质量评估
    commercialization_stage VARCHAR(20), -- 商业化阶段
    revenue_model TEXT, -- 收入模式
    unit_economics JSONB, -- 单位经济模型
    
    data_source TEXT,
    data_reliability VARCHAR(10) CHECK (data_reliability IN ('S', 'A', 'B', 'C', 'X')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_company_operations_company_id ON company_operations(company_id);

DROP TRIGGER IF EXISTS update_company_operations_updated_at ON company_operations;
CREATE TRIGGER update_company_operations_updated_at
    BEFORE UPDATE ON company_operations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 创建 company_technology 表（技术评估）
CREATE TABLE IF NOT EXISTS company_technology (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- 技术路线
    tech_domain VARCHAR(50), -- 技术领域
    ai_approach VARCHAR(50), -- AI方法（VLA/分层控制/混合/传统）
    control_architecture TEXT, -- 控制架构描述
    
    -- 世界模型能力评估（1-5分）
    world_model_overall INTEGER CHECK (world_model_overall BETWEEN 1 AND 5),
    environment_perception INTEGER CHECK (environment_perception BETWEEN 1 AND 5), -- 环境理解
    physics_prediction INTEGER CHECK (physics_prediction BETWEEN 1 AND 5), -- 物理预测
    planning_decision INTEGER CHECK (planning_decision BETWEEN 1 AND 5), -- 规划决策
    sim2real_capability INTEGER CHECK (sim2real_capability BETWEEN 1 AND 5), -- Sim2Real
    data_engine INTEGER CHECK (data_engine BETWEEN 1 AND 5), -- 数据引擎
    
    -- 技术成熟度
    trl_level INTEGER CHECK (trl_level BETWEEN 1 AND 9), -- 技术成熟度等级
    
    -- 专利与研发
    patent_count INTEGER, -- 专利数量
    core_patents TEXT[], -- 核心专利
    rd_team_size INTEGER, -- 研发团队规模
    
    -- 技术差异化
    key_tech_advantages TEXT[], -- 核心技术优势
    tech_gaps TEXT[], -- 技术短板
    
    -- 技术对比评估
    tech_comparison_vs_leaders TEXT, -- 与领先者对比
    
    data_source TEXT,
    data_reliability VARCHAR(10) CHECK (data_reliability IN ('S', 'A', 'B', 'C', 'X')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_company_technology_company_id ON company_technology(company_id);

DROP TRIGGER IF EXISTS update_company_technology_updated_at ON company_technology;
CREATE TRIGGER update_company_technology_updated_at
    BEFORE UPDATE ON company_technology
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 添加注释
COMMENT ON TABLE companies IS '公司主表，包含基本信息、融资、技术、产业链等综合数据';
COMMENT ON TABLE company_funding IS '公司融资历史明细';
COMMENT ON TABLE company_financials IS '公司财务数据（年报/季报）';
COMMENT ON TABLE company_supply_chain IS '公司供应链/产业链位置分析';
COMMENT ON TABLE company_operations IS '公司商业化运营数据';
COMMENT ON TABLE company_technology IS '公司技术能力评估（含世界模型）';
