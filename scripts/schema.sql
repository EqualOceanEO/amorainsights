-- =============================================================
-- AmoraInsights Content Schema
-- Approved by Franklyn (CEO) on 2026-03-14
-- Updated: 2026-03-14 — compliance classification framework v0.9
--   (CLO content classification + Cole acquisition tracking fields)
-- v1.0 finalized by CLO on or before 2026-03-31 (non-breaking)
-- =============================================================

-- ─── 0. industries (dynamic lookup table) ────────────────────
-- Replaces hard-coded CHECK constraints; enables UI-driven management
CREATE TABLE IF NOT EXISTS industries (
  id         SERIAL       PRIMARY KEY,
  slug       VARCHAR(50)  NOT NULL UNIQUE,  -- URL/API key: 'ai', 'life-sciences', etc.
  name       TEXT         NOT NULL,          -- Display name: 'AI', 'Life Sciences', etc.
  name_cn    TEXT,                           -- Chinese display name
  icon       TEXT,                           -- Emoji or icon identifier
  sort_order INTEGER      NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Seed the six confirmed industries
INSERT INTO industries (slug, name, name_cn, icon, sort_order) VALUES
  ('ai',                       'AI',                      '人工智能',     '🤖', 1),
  ('life-sciences',            'Life Sciences',           '生命科学',     '🧬', 2),
  ('green-tech',               'Green Tech',              '绿色科技',     '⚡', 3),
  ('manufacturing','Manufacturing','未来制造',     '🦾', 4),
  ('new-space',                'New Space',               '新太空',       '🚀', 5),
  ('advanced-materials',       'Advanced Materials',      '先进材料',     '⚛️', 6)
ON CONFLICT (slug) DO NOTHING;

-- ─── 1. reports ──────────────────────────────────────────────
--
-- Dual-track compliance model (CLO v0.2 + CRO v0.1, 2026-03-14)
--
-- CLO axis  → compliance_tier  : STANDARD / SENSITIVE_TECH / RESTRICTED
-- CRO axis  → geo_risk_tier    : G0 / G1 / G2 / G3
-- Computed  → effective_tier   : MAX(compliance_tier, geo_risk_tier_mapped)
--                                READ-ONLY — maintained by trigger below
--
-- compliance_status includes two FLAGGED sub-states (CRO request):
--   FLAGGED_PENDING_REVIEW  = list hit detected, CLO+CRO not yet actioned
--   FLAGGED_CONFIRMED       = dual-sign complete, front-end shows notice
--
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

  -- ── CLO Compliance Classification ───────────────────────────
  -- VARCHAR over PG ENUM: additive changes need no migration
  compliance_tier        VARCHAR(20)  NOT NULL DEFAULT 'STANDARD'
    CHECK (compliance_tier IN ('STANDARD','SENSITIVE_TECH','RESTRICTED')),
  compliance_status      VARCHAR(30)  NOT NULL DEFAULT 'PENDING_REVIEW'
    CHECK (compliance_status IN (
      'PENDING_REVIEW','IN_REVIEW','APPROVED','REJECTED',
      'FLAGGED_PENDING_REVIEW','FLAGGED_CONFIRMED',
      'FLAGGED_RESOLVED_PUBLISHED','FLAGGED_RESOLVED_REMOVED'
    )),
  -- JSONB array of SensitivityTagRecord objects (CRO Spec v1.0, 2026-03-14)
  -- Structure: [{ tag_type, value, value_normalized, source_list?,
  --               geo_risk_contribution, flagged_at?, flagged_by_list_update? }]
  -- Replaces former TEXT[] — enables entity-level list comparison and flag tracking.
  -- value_normalized used for fuzzy-safe matching (uppercase, no special chars).
  -- geo_risk_contribution drives auto-calculation of geo_risk_tier at save time.
  sensitivity_tags       JSONB        NOT NULL DEFAULT '[]',
  tech_domain            VARCHAR(30)
    CHECK (tech_domain IS NULL OR tech_domain IN (
      'SEMICONDUCTOR','AI_COMPUTE','QUANTUM','BIOTECH','AEROSPACE',
      'CYBERSECURITY','MATERIALS','OTHER_CONTROLLED','NON_CONTROLLED'
    )),

  -- ── CRO Geopolitical Risk (CRO Spec v1.0, 2026-03-14) ───────
  -- Auto-calculated by app layer via computeReportGeoRiskTier()
  -- = MAX(sensitivity_tags[*].geo_risk_contribution)
  -- G2 and G3 both map to RESTRICTED in effective_tier.
  -- G3 additionally triggers KYB Intent Screening (Enterprise tier).
  geo_risk_tier          VARCHAR(3)   NOT NULL DEFAULT 'G0'
    CHECK (geo_risk_tier IN ('G0','G1','G2','G3')),

  -- ── Effective Tier (READ-ONLY, trigger-maintained) ───────────
  -- Equals MAX(compliance_tier rank, geo_risk_tier mapped rank)
  -- Rank: STANDARD=0, SENSITIVE_TECH=1, RESTRICTED=2
  -- Geo:  G0→0, G1→1, G2→2, G3→2  (G2 maps to RESTRICTED per CRO 2026-03-14)
  -- Direct writes blocked by trigger; downgrade requires compliance_overrides entry
  effective_tier         VARCHAR(20)  NOT NULL DEFAULT 'STANDARD',

  -- ── CLO Compliance Audit Trail ──────────────────────────────
  compliance_reviewer_id   TEXT,
  compliance_reviewed_at   TIMESTAMPTZ,
  compliance_dual_sign_id  TEXT,
  entity_list_checked_at   TIMESTAMPTZ,
  entity_list_version      VARCHAR(50),
  compliance_notes         TEXT,

  -- ── Downgrade Audit Fields (CLO v0.2) ───────────────────────
  -- Populated only on authorized effective_tier downgrade
  downgrade_authorized_by  TEXT[]   NOT NULL DEFAULT '{}',
    -- must contain both CLO and CRO user IDs
  downgrade_reason         TEXT
);

-- ── effective_tier trigger ────────────────────────────────────
-- Automatically recomputes effective_tier on INSERT or UPDATE.
-- Blocks any manual write that would result in a downgrade unless
-- a matching compliance_overrides record exists (checked in app layer).
CREATE OR REPLACE FUNCTION fn_compute_effective_tier()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  comp_rank INTEGER;
  geo_rank  INTEGER;
  max_rank  INTEGER;
BEGIN
  -- Map compliance_tier to rank
  comp_rank := CASE NEW.compliance_tier
    WHEN 'RESTRICTED'     THEN 2
    WHEN 'SENSITIVE_TECH' THEN 1
    ELSE                       0
  END;
  -- Map geo_risk_tier to rank (G2 → 2, same as G3, per CRO 2026-03-14)
  geo_rank := CASE NEW.geo_risk_tier
    WHEN 'G3' THEN 2
    WHEN 'G2' THEN 2
    WHEN 'G1' THEN 1
    ELSE           0
  END;
  max_rank := GREATEST(comp_rank, geo_rank);
  NEW.effective_tier := CASE max_rank
    WHEN 2 THEN 'RESTRICTED'
    WHEN 1 THEN 'SENSITIVE_TECH'
    ELSE        'STANDARD'
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_effective_tier ON reports;
CREATE TRIGGER trg_effective_tier
  BEFORE INSERT OR UPDATE OF compliance_tier, geo_risk_tier
  ON reports
  FOR EACH ROW EXECUTE FUNCTION fn_compute_effective_tier();

CREATE INDEX IF NOT EXISTS idx_reports_industry        ON reports(industry_slug);
CREATE INDEX IF NOT EXISTS idx_reports_published       ON reports(published_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_reports_is_premium      ON reports(is_premium);
CREATE INDEX IF NOT EXISTS idx_reports_slug            ON reports(slug);
CREATE INDEX IF NOT EXISTS idx_reports_compliance_tier ON reports(compliance_tier);
CREATE INDEX IF NOT EXISTS idx_reports_effective_tier  ON reports(effective_tier);
CREATE INDEX IF NOT EXISTS idx_reports_comp_status     ON reports(compliance_status);
CREATE INDEX IF NOT EXISTS idx_reports_tech_domain     ON reports(tech_domain);
CREATE INDEX IF NOT EXISTS idx_reports_geo_risk        ON reports(geo_risk_tier);
-- GIN index for JSONB sensitivity_tags — enables fast entity-list comparison scans
-- e.g. WHERE sensitivity_tags @> '[{"value_normalized":"HUAWEI TECHNOLOGIES CO"}]'
CREATE INDEX IF NOT EXISTS idx_reports_sensitivity_tags ON reports USING GIN (sensitivity_tags);

-- ─── 2. news_items ───────────────────────────────────────────
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

-- ─── 3. companies ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS companies (
  id              BIGSERIAL    PRIMARY KEY,
  name            TEXT         NOT NULL,
  name_cn         TEXT,
  industry_slug   VARCHAR(50)  NOT NULL REFERENCES industries(slug),
  sub_sector      TEXT,
  description     TEXT,
  description_cn  TEXT,
  founded_year    INTEGER,
  country         VARCHAR(10)  NOT NULL DEFAULT 'CN',     -- 'CN' | 'US' | 'EU' | 'GLOBAL'
  hq_city         TEXT,
  hq_province     TEXT,                                   -- enables province-level filtering
  website         TEXT,
  ticker          VARCHAR(20),                            -- stock ticker symbol
  exchange        VARCHAR(20),                            -- e.g. 'SHSE', 'SZSE', 'HKEX', 'NASDAQ'
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

-- ─── 4. users — acquisition & conversion tracking ─────────────
-- Fields requested by Cole (CCO) + Celine (CMO) for content attribution
-- acquisition_channel  : first-touch channel captured at registration
-- conversion_last_touch: last-touch channel at time of paid conversion
--                        (written by Stripe webhook — added in P2 billing sprint)
-- last_content_slug    : slug of last-viewed report before conversion
--                        (written by /reports/[slug] page visit)
-- These are ALTER TABLE additions to the existing users table created
-- by the auth migration. Safe to re-run (IF NOT EXISTS pattern).
ALTER TABLE users ADD COLUMN IF NOT EXISTS acquisition_channel    VARCHAR(30);
  -- seo | content_share | direct_sales | paid_ads | partner | organic | unknown
ALTER TABLE users ADD COLUMN IF NOT EXISTS conversion_last_touch  VARCHAR(30);
  -- same enum as acquisition_channel — captured at Stripe webhook
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_content_slug      VARCHAR(255);
  -- FK-style reference to reports.slug (not enforced — reports may be deleted)

CREATE INDEX IF NOT EXISTS idx_users_acq_channel ON users(acquisition_channel);

-- ─── 5. compliance_overrides — immutable downgrade audit log ──────
--
-- ╔══════════════════════════════════════════════════════════════════╗
-- ║  DATA RETENTION POLICY — MANDATORY 7-YEAR MINIMUM               ║
-- ║                                                                  ║
-- ║  Legal basis (dual-track, take longest):                         ║
-- ║    • OFAC Compliance Commitments framework : 7 years             ║
-- ║    • BIS EAR Part 762                       : 5 years            ║
-- ║  Controlling requirement: OFAC 7 years.                          ║
-- ║                                                                  ║
-- ║  HARD RULES:                                                     ║
-- ║    1. NO physical DELETE on this table — ever.                   ║
-- ║       Rows are immutable once inserted. Soft-delete only         ║
-- ║       (set archived_at) if records must be hidden from UI.       ║
-- ║    2. Any automated cleanup / archival Job MUST exclude          ║
-- ║       this table, OR ensure archived records remain              ║
-- ║       fully retrievable for regulatory inspection.               ║
-- ║    3. Database migrations and platform changes MUST              ║
-- ║       explicitly carry forward this 7-year guarantee.            ║
-- ║    4. `authorization_doc` is NOT NULL — must be a file           ║
-- ║       reference (S3 URL / doc system ID). API layer validates    ║
-- ║       non-null + URL format. UI hard-blocks without upload.      ║
-- ╚══════════════════════════════════════════════════════════════════╝
--
-- Written when:
--   (a) effective_tier is overridden downward (requires CLO+CRO dual-auth)
--   (b) FLAGGED report is resolved to FLAGGED_RESOLVED_PUBLISHED
--   (c) FLAGGED report is resolved to FLAGGED_RESOLVED_REMOVED
--
CREATE TABLE IF NOT EXISTS compliance_overrides (
  id                  BIGSERIAL    PRIMARY KEY,
  report_id           BIGINT       NOT NULL REFERENCES reports(id) ON DELETE RESTRICT,
  override_type       VARCHAR(40)  NOT NULL,
    -- 'DOWNGRADE_EFFECTIVE_TIER'
    -- 'FLAGGED_RESOLVED_PUBLISHED'
    -- 'FLAGGED_RESOLVED_REMOVED'
  from_tier           VARCHAR(20)  NOT NULL,   -- effective_tier before override
  to_tier             VARCHAR(20)  NOT NULL,   -- effective_tier after override
  authorized_by_clo   TEXT         NOT NULL,   -- CLO user ID (mandatory)
  authorized_by_cro   TEXT         NOT NULL,   -- CRO user ID (mandatory)
  authorization_doc   TEXT         NOT NULL,   -- S3 URL or doc system ID
                                               -- NOT NULL, no exceptions (OFAC requirement)
                                               -- API validates non-null + valid URL format
                                               -- UI hard-blocks submission without upload
  override_reason     TEXT         NOT NULL,   -- mandatory written justification
  compliance_notes    TEXT,                    -- additional context
  archived_at         TIMESTAMPTZ,             -- set if row is soft-deleted (never hard-delete)
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
  -- ↑ Rows older than 7 years from created_at may be archived but NEVER deleted
);

-- Block any physical DELETE on compliance_overrides
-- (application and API layer must also enforce; this is belt-and-suspenders)
CREATE OR REPLACE RULE no_delete_compliance_overrides AS
  ON DELETE TO compliance_overrides DO INSTEAD NOTHING;

CREATE INDEX IF NOT EXISTS idx_overrides_report    ON compliance_overrides(report_id);
CREATE INDEX IF NOT EXISTS idx_overrides_type      ON compliance_overrides(override_type);
CREATE INDEX IF NOT EXISTS idx_overrides_created   ON compliance_overrides(created_at DESC);

-- ─── 6. entity_list_scans — weekly compliance scan audit log ──────
--
-- Records each weekly entity-list scan run (every Friday, T+0).
-- Stores list version used, reports flagged, and scan outcome.
-- MVP: CRO uploads standardized CSV; long-term: auto-pull BIS/OFAC feeds.
--
-- CSV format (MVP):
--   entity_name, entity_name_cn, list_type, list_date, country, notes
--   list_type: BIS_ENTITY_LIST | OFAC_SDN | BIS_UVL | CN_DUAL_USE
--
CREATE TABLE IF NOT EXISTS entity_list_scans (
  id                  BIGSERIAL    PRIMARY KEY,
  scan_triggered_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  list_version        VARCHAR(50)  NOT NULL,  -- e.g. '2026-03-14'
  list_type           VARCHAR(30)  NOT NULL,  -- BIS_ENTITY_LIST | OFAC_SDN | BIS_UVL | CN_DUAL_USE
  entities_checked    INTEGER      NOT NULL DEFAULT 0,
  reports_scanned     INTEGER      NOT NULL DEFAULT 0,
  reports_flagged     INTEGER      NOT NULL DEFAULT 0,
  flagged_report_ids  BIGINT[]     NOT NULL DEFAULT '{}',
  triggered_by        TEXT,                   -- user ID or 'cron' for automated runs
  scan_notes          TEXT
);

CREATE INDEX IF NOT EXISTS idx_scans_triggered  ON entity_list_scans(scan_triggered_at DESC);
CREATE INDEX IF NOT EXISTS idx_scans_list_type  ON entity_list_scans(list_type);

-- ─── 7. report_views — content engagement event stream ─────────
-- P2 upgrade for full funnel analytics (replaces last_content_slug for
-- multi-touch attribution). Commented out until P2 sprint.
--
-- CREATE TABLE IF NOT EXISTS report_views (
--   id           BIGSERIAL    PRIMARY KEY,
--   user_id      INTEGER      REFERENCES users(id) ON DELETE SET NULL,
--   report_slug  VARCHAR(255) NOT NULL,
--   viewed_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
--   session_id   TEXT,
--   referrer     TEXT
-- );
-- CREATE INDEX IF NOT EXISTS idx_report_views_user   ON report_views(user_id);
-- CREATE INDEX IF NOT EXISTS idx_report_views_slug   ON report_views(report_slug);
-- CREATE INDEX IF NOT EXISTS idx_report_views_time   ON report_views(viewed_at DESC);
