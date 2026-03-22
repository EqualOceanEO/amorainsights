-- =============================================================
-- AMORA Insights — Companies Schema Migration
-- 正确化 companies 表设计：
--   1. 添加 slug 字段（用于 URL）
--   2. 添加 industry_id 字段（外键关联 industries.id）
--   3. 添加 sub_sector_id 字段（二级也用外键）
--   4. 数据迁移：从 industry_slug/sub_sector 字符串转换为 ID
-- =============================================================

BEGIN;

-- Step 1: 添加新字段
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS industry_id INTEGER REFERENCES industries(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS sub_sector_id INTEGER REFERENCES industries(id) ON DELETE SET NULL;

-- Step 2: 生成 slug（从 name 转小写，特殊字符替换为连字符）
UPDATE companies
  SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]', '-', 'g'))
  WHERE slug IS NULL;

-- Step 3: 清理 slug（去除多余/首尾连字符）
UPDATE companies
  SET slug = REGEXP_REPLACE(REGEXP_REPLACE(slug, '-+', '-', 'g'), '^-|-$', '', 'g')
  WHERE slug IS NOT NULL;

-- Step 4: 迁移 industry_id（通过 industry_slug 查询 industries 表）
UPDATE companies c
  SET industry_id = (
    SELECT id FROM industries WHERE slug = c.industry_slug
  )
  WHERE industry_id IS NULL;

-- Step 5: 迁移 sub_sector_id（通过 sub_sector 名称匹配 industries）
UPDATE companies c
  SET sub_sector_id = (
    SELECT id FROM industries WHERE name = c.sub_sector
  )
  WHERE sub_sector IS NOT NULL AND sub_sector_id IS NULL;

-- Step 6: 添加唯一索引和普通索引
CREATE UNIQUE INDEX IF NOT EXISTS companies_slug_unique ON companies(slug);
CREATE INDEX IF NOT EXISTS companies_industry_id_idx ON companies(industry_id);
CREATE INDEX IF NOT EXISTS companies_sub_sector_id_idx ON companies(sub_sector_id);

-- Step 7: 验证数据迁移
SELECT
  COUNT(*) AS total_companies,
  COUNT(slug) AS companies_with_slug,
  COUNT(industry_id) AS companies_with_industry_id,
  COUNT(sub_sector_id) AS companies_with_sub_sector_id
FROM companies;

-- Step 8: 检查是否有迁移失败的记录（industry_id 为空）
SELECT id, name, industry_slug, industry_id, sub_sector, sub_sector_id
FROM companies
WHERE industry_id IS NULL OR (sub_sector IS NOT NULL AND sub_sector_id IS NULL)
LIMIT 10;

COMMIT;
