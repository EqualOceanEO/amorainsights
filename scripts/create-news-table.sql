-- ================================================================
-- AMORA Insights — news table migration
-- Run this in Supabase SQL Editor
-- ================================================================

CREATE TABLE IF NOT EXISTS news (
  id              BIGSERIAL PRIMARY KEY,
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  summary         TEXT,
  content         TEXT,
  source_url      TEXT,
  source_name     TEXT,
  author          TEXT,
  cover_image_url TEXT,
  industry_slug   TEXT NOT NULL DEFAULT 'ai',
  company_id      BIGINT REFERENCES companies(id) ON DELETE SET NULL,
  company_ids     BIGINT[] DEFAULT '{}',
  tags            TEXT[] DEFAULT '{}',
  is_premium      BOOLEAN NOT NULL DEFAULT FALSE,
  is_published    BOOLEAN NOT NULL DEFAULT FALSE,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_industry_slug ON news(industry_slug);
CREATE INDEX IF NOT EXISTS idx_news_company_id ON news(company_id);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_is_published ON news(is_published);
CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);
CREATE INDEX IF NOT EXISTS idx_news_company_ids ON news USING GIN(company_ids);
CREATE INDEX IF NOT EXISTS idx_news_tags ON news USING GIN(tags);

-- Enable RLS
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Policy: published news is public
CREATE POLICY "Public can read published news"
  ON news FOR SELECT
  USING (is_published = true);

-- Policy: service role can do anything (admin)
CREATE POLICY "Service role full access"
  ON news FOR ALL
  USING (auth.role() = 'service_role');
