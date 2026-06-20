# AMORA 数据库表结构文档

> **维护人：** George (CTO)  
> **最后更新：** 2026-04-11  
> **Project Ref：** jqppcuccqkxhhrvndsil

---

## 核心表概览

| 表名 | 用途 | 关键字段 |
|------|------|----------|
| `companies` | 公司数据库 | AMORA Score 五维度评分 |
| `news_items` | 新闻动态 | 行业关联、标签系统 |
| `reports` | 研究报告 | chapters_json H5内容 |
| `users` | 用户账户 | 订阅层级 |
| `subscribers` | 邮件订阅 | Newsletter |
| `subscriptions` | 付费订阅 | Stripe 关联 |
| `industries` | 行业分类 | L1/L2 层级 |

---

## 1. companies 表

公司数据库，支撑 AMORA Score 评分体系。

```sql
CREATE TABLE companies (
  id BIGSERIAL PRIMARY KEY,
  
  -- 基础信息
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  
  -- 行业关联（使用 slug 而非 ID，URL 友好）
  industry_slug TEXT NOT NULL,
  sub_sector TEXT,
  sub_sector_id TEXT,
  
  -- AMORA Score 五维度评分 (1-10)
  advancement_score DECIMAL(3,1),  -- 技术壁垒
  mastery_score DECIMAL(3,1),      -- 人才优势
  operations_score DECIMAL(3,1),   -- 商业落地
  reach_score DECIMAL(3,1),        -- 全球化能力
  affinity_score DECIMAL(3,1),     -- 可持续能力
  
  -- 财务数据
  revenue_usd BIGINT,
  revenue_cny BIGINT,
  employees INTEGER,
  valuation_usd BIGINT,
  valuation_cny BIGINT,
  
  -- 上市信息
  is_public BOOLEAN DEFAULT false,
  stock_symbol TEXT,
  stock_exchange TEXT,
  
  -- 元数据
  tags TEXT[],
  website_url TEXT,
  logo_url TEXT,
  country TEXT,
  founded_year INTEGER,
  
  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 关键说明

- **industry_slug**: 使用 URL-safe 的 slug（如 `humanoid-robot`），而非整数 ID
- **sub_sector**: 字符串存储，配合 `tags` 数组做筛选
- **评分字段**: DECIMAL(3,1) 存储 0.0-10.0 的评分

---

## 2. news_items 表

新闻动态，关联行业和公司。

```sql
CREATE TABLE news_items (
  id BIGSERIAL PRIMARY KEY,
  
  -- 内容
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  slug TEXT UNIQUE NOT NULL,
  
  -- 媒体
  cover_image_url TEXT,
  author TEXT,
  
  -- 来源
  source_url TEXT,
  source_name TEXT,
  
  -- 行业关联
  industry_slug TEXT,
  industry_id TEXT,
  sub_sector_id TEXT,
  company_id BIGINT REFERENCES companies(id),
  
  -- 标签系统（text[] 数组类型）
  tags TEXT[],
  
  -- 状态控制
  is_featured BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  
  -- 时间
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 关键说明

- **tags**: `text[]` 数组类型，筛选时用 `.contains()` 方法
- **is_premium**: true 表示仅 Pro 用户可见
- **company_id**: 外键关联 companies 表

### 筛选示例

```typescript
// ❌ 错误：text[] 不能用 ilike
supabase.from('news_items').ilike('tags', '%robot%')

// ✅ 正确：用 contains 方法
supabase.from('news_items').contains('tags', ['humanoid-robot'])
```

---

## 3. reports 表

研究报告，H5 内容存储在 JSONB 字段。

```sql
CREATE TABLE reports (
  id BIGSERIAL PRIMARY KEY,
  
  -- 基础信息
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  
  -- H5 章节内容（JSONB 格式）
  chapters_json JSONB DEFAULT '{}',
  
  -- 传统 HTML 内容（兼容旧报告）
  html_content TEXT,
  
  -- 行业关联
  industry_slug TEXT,
  industry_id TEXT,
  
  -- 封面
  cover_image_url TEXT,
  
  -- 付费控制
  is_premium BOOLEAN DEFAULT false,
  
  -- 生产状态（注意：没有 is_published 字段）
  production_status TEXT DEFAULT 'draft', -- 'draft' | 'published' | 'approved'
  
  -- 元数据
  author TEXT,
  published_date DATE,
  version TEXT DEFAULT '1.0',
  
  -- 统计
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  
  -- 时间
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### chapters_json 结构

```json
{
  "mapping": "<html>...</html>",
  "advancement": "<html>...</html>",
  "operations": "<html>...</html>",
  "reach": "<html>...</html>",
  "assets": "<html>...</html>"
}
```

### 关键说明

- **production_status**: 使用字符串枚举，无 `is_published` 字段
- **chapters_json**: 存储 H5 章节 HTML 内容，HRI-2026 报告约 185KB

---

## 4. users 表

用户账户，NextAuth.js 集成。

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 认证
  email TEXT UNIQUE NOT NULL,
  email_verified TIMESTAMPTZ,
  
  -- 密码（bcrypt 哈希）
  password_hash TEXT,
  
  -- 个人信息
  name TEXT,
  avatar_url TEXT,
  
  -- 订阅层级
  subscription_tier TEXT DEFAULT 'free', -- 'free' | 'pro' | 'enterprise'
  
  -- Stripe 关联
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  
  -- 角色
  role TEXT DEFAULT 'user', -- 'user' | 'admin'
  
  -- 时间
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. subscribers 表

邮件订阅，独立于 users 表。

```sql
CREATE TABLE subscribers (
  id BIGSERIAL PRIMARY KEY,
  
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  
  -- 订阅状态
  is_active BOOLEAN DEFAULT true,
  
  -- 来源追踪
  source TEXT DEFAULT 'website',
  
  -- 时间
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 6. industries 表

行业分类，L1/L2 层级结构。

```sql
CREATE TABLE industries (
  id TEXT PRIMARY KEY,
  
  -- 层级
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  level INTEGER NOT NULL, -- 1 = L1, 2 = L2
  
  -- 父行业（L2 才有）
  parent_id TEXT REFERENCES industries(id),
  
  -- 描述
  description TEXT,
  
  -- 排序
  sort_order INTEGER DEFAULT 0,
  
  -- 状态
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 示例数据

| id | name | slug | level | parent_id |
|----|------|------|-------|-----------|
| robotics | 机器人 | robotics | 1 | null |
| humanoid-robot | 人形机器人 | humanoid-robot | 2 | robotics |
| quadruped-robot | 四足机器人 | quadruped-robot | 2 | robotics |

---

## 常用查询示例

### 查询公司及其 AMORA Score

```sql
SELECT 
  name,
  advancement_score,
  mastery_score,
  operations_score,
  reach_score,
  affinity_score,
  (advancement_score + mastery_score + operations_score + reach_score + affinity_score) / 5 as overall_score
FROM companies
WHERE industry_slug = 'humanoid-robot'
ORDER BY overall_score DESC;
```

### 查询某行业的最新新闻

```sql
SELECT * FROM news_items
WHERE industry_slug = 'humanoid-robot'
  AND is_published = true
ORDER BY published_at DESC
LIMIT 10;
```

### 查询 Pro 用户

```sql
SELECT * FROM users
WHERE subscription_tier = 'pro'
  AND email_verified IS NOT NULL;
```

---

## 索引建议

```sql
-- companies 表索引
CREATE INDEX idx_companies_industry ON companies(industry_slug);
CREATE INDEX idx_companies_sub_sector ON companies(sub_sector);

-- news_items 表索引
CREATE INDEX idx_news_industry ON news_items(industry_slug);
CREATE INDEX idx_news_company ON news_items(company_id);
CREATE INDEX idx_news_published ON news_items(published_at DESC);

-- reports 表索引
CREATE INDEX idx_reports_industry ON reports(industry_slug);
CREATE INDEX idx_reports_status ON reports(production_status);
```

---

## 数据备份

```bash
# 使用 Supabase CLI 导出
supabase db dump -f backup.sql

# 或使用 pg_dump（需直连权限）
pg_dump -h db.xxx.supabase.co -U postgres -d postgres > backup.sql
```

---

*有任何表结构变更需求，请先找 George 讨论。*
