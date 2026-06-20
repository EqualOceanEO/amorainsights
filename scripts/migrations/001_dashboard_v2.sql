-- ============================================================================
-- Dashboard v2 Migration: User Companies, Watchlist, Benchmark Groups
-- Run against Supabase SQL Editor or via psql
-- Date: 2026-06-20
-- ============================================================================

-- 1. user_companies — user-submitted/managed company profiles
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_companies (
  id            BIGSERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  name_cn       TEXT,
  industry_slug TEXT NOT NULL,
  sub_sector    TEXT,
  description   TEXT,
  founded_year  INTEGER,
  country       TEXT NOT NULL DEFAULT 'China',
  hq_city       TEXT,
  hq_province   TEXT,
  website       TEXT,
  employee_count INTEGER,
  funding_stage TEXT,
  funding_total_usd NUMERIC(18,2),
  valuation_usd     NUMERIC(18,2),
  revenue_range     TEXT,            -- e.g. '<1M', '1M-10M', '10M-100M', '100M+'
  business_model    TEXT,            -- B2B, B2C, B2G, Platform, etc.
  core_products     TEXT,
  tech_route        TEXT,
  key_partners      TEXT,
  primary_use_cases TEXT,
  competitors       TEXT,
  logo_url          TEXT,
  data_source       TEXT DEFAULT 'user',  -- 'user', 'imported', 'verified'
  is_published      BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_companies_user_id ON user_companies(user_id);
CREATE INDEX IF NOT EXISTS idx_user_companies_industry ON user_companies(industry_slug);

-- 2. user_watchlist — companies/entities the user is tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_watchlist (
  id            BIGSERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id    INTEGER REFERENCES companies(id) ON DELETE SET NULL,
  user_company_id INTEGER REFERENCES user_companies(id) ON DELETE SET NULL,
  added_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes         TEXT,
  alert_enabled BOOLEAN DEFAULT true,
  -- ensure at least one reference is set
  CONSTRAINT watchlist_has_target CHECK (
    company_id IS NOT NULL OR user_company_id IS NOT NULL
  ),
  -- prevent duplicate watches
  CONSTRAINT watchlist_unique_user_company UNIQUE (user_id, company_id),
  CONSTRAINT watchlist_unique_user_uc UNIQUE (user_id, user_company_id)
);

CREATE INDEX IF NOT EXISTS idx_user_watchlist_user ON user_watchlist(user_id);

-- 3. user_benchmark_groups — saved comparison sets
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_benchmark_groups (
  id            BIGSERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  company_ids   INTEGER[] NOT NULL DEFAULT '{}',      -- companies table IDs
  user_company_ids INTEGER[] NOT NULL DEFAULT '{}',   -- user_companies table IDs
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_benchmark_groups_user ON user_benchmark_groups(user_id);

-- 4. Enable RLS for new tables
-- ============================================================================
ALTER TABLE user_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_benchmark_groups ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies — users can only access their own data
-- ============================================================================

-- user_companies: CRUD by owner
CREATE POLICY "Users can view own companies"
  ON user_companies FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own companies"
  ON user_companies FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own companies"
  ON user_companies FOR UPDATE
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own companies"
  ON user_companies FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- user_watchlist: CRUD by owner
CREATE POLICY "Users can view own watchlist"
  ON user_watchlist FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own watchlist"
  ON user_watchlist FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own watchlist"
  ON user_watchlist FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- user_benchmark_groups: CRUD by owner
CREATE POLICY "Users can view own benchmark groups"
  ON user_benchmark_groups FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own benchmark groups"
  ON user_benchmark_groups FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own benchmark groups"
  ON user_benchmark_groups FOR UPDATE
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own benchmark groups"
  ON user_benchmark_groups FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- 6. Service role bypass (for server-side operations)
-- ============================================================================
-- All policies above are bypassed when using service_role key (server-side)
-- which is what our lib/db.ts uses. No additional policy needed.
