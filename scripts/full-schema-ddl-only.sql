-- full-schema-ddl-only.sql
-- DDL only: tables, triggers, indexes (no seed data)
-- Run this first, then full-schema-seed-only.sql

-- ─── 0. industries ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS industries (
  id         SERIAL       PRIMARY KEY,
  slug       VARCHAR(50)  NOT NULL UNIQUE,
  name       TEXT         NOT NULL,
  name_cn    TEXT,
  icon       TEXT,
  sort_order INTEGER      NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

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
  compliance_reviewer_id   TEXT,
  compliance_reviewed_at   TIMESTAMPTZ,
  compliance_dual_sign_id  TEXT,
  entity_list_checked_at   TIMESTAMPTZ,
  entity_list_version      VARCHAR(50),
  compliance_notes         TEXT,
  downgrade_authorized_by  TEXT[]   NOT NULL DEFAULT '{}',
  downgrade_reason         TEXT
);

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
