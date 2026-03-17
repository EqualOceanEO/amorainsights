-- Run in Supabase SQL Editor
-- Extend news_items with richer fields

ALTER TABLE news_items
  ADD COLUMN IF NOT EXISTS slug            TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS content         TEXT,
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
  ADD COLUMN IF NOT EXISTS author          TEXT,
  ADD COLUMN IF NOT EXISTS tags            TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_premium      BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_published    BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS company_id      BIGINT,
  ADD COLUMN IF NOT EXISTS updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Back-fill slug from id for existing rows
UPDATE news_items SET slug = 'news-item-' || id WHERE slug IS NULL;

-- Index
CREATE INDEX IF NOT EXISTS idx_news_items_slug         ON news_items(slug);
CREATE INDEX IF NOT EXISTS idx_news_items_published_at ON news_items(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_items_industry     ON news_items(industry_slug);
CREATE INDEX IF NOT EXISTS idx_news_items_tags         ON news_items USING GIN(tags);
