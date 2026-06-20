-- ========================================================
-- news_items 表迁移 SQL
-- 在 Supabase SQL Editor 里运行：
-- https://supabase.com/dashboard/project/jqppcuccqkxhhrvndsil/sql/new
-- ========================================================

ALTER TABLE news_items ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE news_items ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE news_items ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE news_items ADD COLUMN IF NOT EXISTS author TEXT;
ALTER TABLE news_items ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE news_items ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE news_items ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE news_items ADD COLUMN IF NOT EXISTS company_id BIGINT;
ALTER TABLE news_items ADD COLUMN IF NOT EXISTS industry_id TEXT;
ALTER TABLE news_items ADD COLUMN IF NOT EXISTS sub_sector_id TEXT;
ALTER TABLE news_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

UPDATE news_items SET slug = 'news-' || id::text WHERE slug IS NULL OR slug = '';
UPDATE news_items SET industry_id = industry_slug WHERE industry_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_news_items_slug ON news_items(slug);
CREATE INDEX IF NOT EXISTS idx_news_items_industry_id ON news_items(industry_id);
CREATE INDEX IF NOT EXISTS idx_news_items_published ON news_items(published_at DESC) WHERE is_published = TRUE;

-- Verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'news_items' 
ORDER BY ordinal_position;
