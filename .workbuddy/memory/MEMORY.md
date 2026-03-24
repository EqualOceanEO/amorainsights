# Claw Project Memory

## Supabase Access Credentials

- **Project Ref**: jqppcuccqkxhhrvndsil
- **Supabase URL**: https://jqppcuccqkxhhrvndsil.supabase.co
- **Service Role Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc
- **DB Direct URL (封了)**: postgresql://postgres:nERCb24AMq2VAMZ4@db.jqppcuccqkxhhrvndsil.supabase.co:5432/postgres
- **PAT (已过期)**: sbp_2d9e51cc04f38bb94e7b1394ed8c1d064126a8cc

## 执行 DDL 的唯一可靠方式

1. 生成新的 PAT：https://supabase.com/dashboard/account/tokens
2. 或者直接在 SQL Editor 执行：https://supabase.com/dashboard/project/jqppcuccqkxhhrvndsil/sql/new
3. service_role key **不能**通过网络 API 执行 DDL（只能做数据 CRUD）
4. Supabase Management API (`api.supabase.com`) **只接受 PAT**，不接受 service_role key
5. 直连 PostgreSQL (5432/6543) 被本地防火墙封了

## news_items 表当前状态（2026-03-24）

当前字段：`created_at, id, industry_slug, is_featured, published_at, source_name, source_url, summary, title`

**缺少字段（需要迁移）**：`slug, content, cover_image_url, author, tags, is_premium, is_published, company_id, industry_id, sub_sector_id, updated_at`

**迁移 SQL**（需要在 SQL Editor 或通过 PAT 执行）：
```sql
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
```

还需要先创建辅助函数（一次性）：
```sql
CREATE OR REPLACE FUNCTION public.run_migration(sql_text TEXT)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN EXECUTE sql_text; RETURN 'ok'; EXCEPTION WHEN OTHERS THEN RETURN SQLERRM; END; $$;
```

## 前台 news 页面状态

- API `/api/news` 正常，返回 34 条新闻（200 OK）
- 代码通过 fallback 处理缺失字段（`slug = 'news-' + id`, `industry_id = industry_slug`）
- 页面代码无 lint 错误
- 数据库迁移未执行，但页面基本可用

## Supabase 执行 SQL 的脚本位置

- `scripts/exec-ddl.ps1` — 使用 PAT 通过 Management API 执行 SQL（需要有效 PAT）
- `scripts/migrate-pg.mjs` — Node.js pg 直连（被防火墙封）
- `scripts/run-migration.ps1` — 旧 PAT 方式
