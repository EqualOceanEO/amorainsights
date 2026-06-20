# AMORA Insights 建站演示大纲

> **面向对象：** 北科大师兄弟  
> **时长：** 1小时  
> **演示方式：** 快速展示关键步骤 + 代码片段讲解

---

## 项目背景

**AMORA Insights** 是一个面向北美市场的行业研究洞察平台，核心产品是36份行业创新评估报告。采用 **Next.js + Supabase + Vercel** 技术栈，从0到1搭建的全过程由 WorkBuddy 协作完成。

---

## 演示结构（60分钟）

| 阶段 | 内容 | 时长 |
|------|------|------|
| 1. 项目概览 | 展示最终成果 + 技术栈 | 5分钟 |
| 2. 核心架构 | 数据模型设计 + AMORA框架 | 10分钟 |
| 3. 开发实战 | 3个关键功能迭代演示 | 30分钟 |
| 4. 部署运维 | 自动化流程 + 踩坑总结 | 10分钟 |
| 5. Q&A | 自由提问 | 5分钟 |

---

## 阶段一：项目概览（5分钟）

### 1.1 展示最终成果

打开网站演示：
- 首页：行业 Mapping 展示
- 报告页：付费墙设计
- Dashboard：用户订阅管理

### 1.2 技术栈一览

```
前端/全栈: Next.js 14 (App Router) + TypeScript + Tailwind
数据库:     Supabase (PostgreSQL)
部署:       Vercel (新加坡节点)
代码托管:   GitHub
```

### 1.3 项目规模

- **代码量：** 100+ 组件，50+ API 路由
- **数据库：** 10+ 表，支撑新闻/报告/公司/用户全链路
- **核心报告：** 人形机器人HRI-2026（180KB内容，5章节H5）

---

## 阶段二：核心架构（10分钟）

### 2.1 AMORA 双框架（重点！）

**框架1：AMORA Report（报告结构）**

| 字母 | 含义 | 内容 |
|------|------|------|
| **M** | Mapping | 产业链生态位（免费钩子）|
| **A** | Advancement | 技术先进性 |
| **O** | Operations | 商业化运营 |
| **R** | Reach | 市场容量 |
| **A** | Assets | 资本价值（含企业评分）|

**框架2：AMORA Score（企业评分）**

| 字母 | 含义 | 评分维度 |
|------|------|----------|
| **A** | Advancement | 技术壁垒 |
| **M** | Mastery | 人才优势 |
| **O** | Operations | 商业落地 |
| **R** | Reach | 全球化能力 |
| **A** | Affinity | 可持续能力 |

> ⚠️ **关键教训：** 两个框架字母一样但含义不同，代码和文档中必须严格区分！

### 2.2 数据库核心表结构

```sql
-- 三大核心表
news_items      -- 新闻动态
reports         -- 研究报告（含 chapters_json H5内容）
companies       -- 公司数据库（40+字段，支撑AMORA Score）

-- 用户体系
users           -- 用户账户
subscribers     -- 邮件订阅
subscriptions   -- 付费订阅
```

### 2.3 付费墙设计模式

```typescript
// 核心组件：PremiumWall
<PremiumWall>
  <FreeContent />      {/* 免费可见 */}
  <PremiumContent />   {/* Pro用户可见 */}
</PremiumWall>
```

**免费层（Mapping）：** 行业全景、生态位图  
**付费层（Measure/Benchmarking）：** 评分数据、深度分析、对标图表

---

## 阶段三：开发实战（30分钟）

### 3.1 迭代1：数据库设计 + DDL 执行（8分钟）

**场景：** 新增 `companies` 表，支撑企业评分

**Step 1 - 设计表结构**
```typescript
// src/lib/db.ts
export interface Company {
  id: number;
  name: string;
  slug: string;
  industry_slug: string;
  sub_sector: string;
  
  // AMORA Score 五维度
  advancement_score: number;  // 技术壁垒
  mastery_score: number;      // 人才优势
  operations_score: number;   // 商业落地
  reach_score: number;        // 全球化
  affinity_score: number;     // 可持续
  
  // 财务数据
  revenue_usd: number;
  employees: number;
  valuation_usd: number;
  
  // 元数据
  is_public: boolean;
  stock_symbol?: string;
  tags: string[];
}
```

**Step 2 - 执行 DDL（三种方式）**

```powershell
# ✅ 方式A：API 调用（推荐，可复现）
Invoke-WebRequest `
  -Uri "http://localhost:3000/api/admin/migrate?secret=run-migration-now" `
  -UseBasicParsing

# ✅ 方式B：SQL Editor（最直接）
# 打开 https://supabase.com/dashboard/project/xxx/sql/new

# ❌ 踩坑：service_role key 不能执行 DDL
# ❌ 踩坑：pg 直连被防火墙封
```

**Step 3 - 创建迁移脚本**
```powershell
# scripts/add-companies-table.ps1
$sql = @"
CREATE TABLE IF NOT EXISTS companies (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  industry_slug TEXT NOT NULL,
  advancement_score DECIMAL(3,1),
  mastery_score DECIMAL(3,1),
  operations_score DECIMAL(3,1),
  reach_score DECIMAL(3,1),
  affinity_score DECIMAL(3,1),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
"@

# 调用 run_migration RPC
$body = @{ sql_text = $sql } | ConvertTo-Json
Invoke-RestMethod `
  -Uri "$env:NEXT_PUBLIC_SUPABASE_URL/rest/v1/rpc/run_migration" `
  -Method POST `
  -Headers @{ 
    "apikey" = $env:SUPABASE_SERVICE_ROLE_KEY
    "Authorization" = "Bearer $env:SUPABASE_SERVICE_ROLE_KEY"
    "Content-Type" = "application/json"
  } `
  -Body $body
```

### 3.2 迭代2：API 路由 + 数据查询（10分钟）

**场景：** 构建 `/api/companies` 接口，支持筛选和搜索

**Step 1 - 创建 API 路由**
```typescript
// src/app/api/companies/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // 解析筛选参数
  const industry = searchParams.get('industry');
  const subSector = searchParams.get('sub_sector');
  const search = searchParams.get('search');
  
  // 构建查询
  let query = supabase.from('companies').select('*');
  
  if (industry) {
    query = query.eq('industry_slug', industry);
  }
  
  if (subSector) {
    // ⚠️ 关键：tags 是 text[] 类型，用 contains 而非 ilike
    query = query.contains('tags', [subSector]);
  }
  
  if (search) {
    query = query.ilike('name', `%${search}%`);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ data });
}
```

**Step 2 - 关键踩坑点**

```typescript
// ❌ 错误：tags 字段不能用 ilike
query = query.ilike('tags', `%${subSector}%`);

// ✅ 正确：text[] 类型用 contains
query = query.contains('tags', [subSector]);

// ❌ 错误：忘记 export dynamic（Vercel 返回 404）
// ✅ 正确：API route 必须声明
dexport const dynamic = 'force-dynamic';
```

**Step 3 - 前端调用**
```typescript
// src/components/CompanyList.tsx
async function fetchCompanies(filters: FilterParams) {
  const params = new URLSearchParams();
  if (filters.industry) params.set('industry', filters.industry);
  if (filters.subSector) params.set('sub_sector', filters.subSector);
  
  const response = await fetch(`/api/companies?${params}`);
  const { data } = await response.json();
  return data;
}
```

### 3.3 迭代3：H5 报告系统（12分钟）

**场景：** 人形机器人报告 HRI-2026，5章节H5阅读器

**Step 1 - 数据存储设计**
```typescript
// reports 表结构
interface Report {
  id: number;
  title: string;
  slug: string;
  
  // H5 章节内容存储在 JSONB 字段
  chapters_json: {
    mapping: string;      // HTML 内容
    advancement: string;  // HTML 内容（Pro）
    operations: string;   // HTML 内容（Pro）
    reach: string;        // HTML 内容（Pro）
    assets: string;       // HTML 内容（Pro）
  };
  
  production_status: 'draft' | 'published' | 'approved';
  is_premium: boolean;
}
```

**Step 2 - 章节内容 API**
```typescript
// src/app/api/hri-chapters/[chapter]/route.ts
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic'; // ⚠️ 必须！

export async function GET(
  request: Request,
  { params }: { params: { chapter: string } }
) {
  const { chapter } = params;
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  // 获取报告数据
  const { data: report } = await supabase
    .from('reports')
    .select('chapters_json, is_premium')
    .eq('id', 44)
    .single();
  
  // 权限检查
  const isFreeChapter = chapter === 'mapping';
  if (!isFreeChapter && report.is_premium) {
    // 检查用户订阅状态...
  }
  
  // 返回章节 HTML
  const html = report.chapters_json[chapter];
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}
```

**Step 3 - H5 阅读器组件**
```typescript
// src/components/H5ReportViewer.tsx
'use client';

import { useState, useEffect } from 'react';

const CHAPTERS = [
  { id: 'mapping', name: 'Mapping', label: '产业链生态位', free: true },
  { id: 'advancement', name: 'Advancement', label: '技术先进性', free: false },
  { id: 'operations', name: 'Operations', label: '商业化运营', free: false },
  { id: 'reach', name: 'Reach', label: '市场容量', free: false },
  { id: 'assets', name: 'Assets', label: '资本价值', free: false },
];

export function H5ReportViewer({ reportId }: { reportId: number }) {
  const [activeChapter, setActiveChapter] = useState('mapping');
  const [content, setContent] = useState('');
  const [isPro, setIsPro] = useState(false);
  
  useEffect(() => {
    // 检查用户订阅
    checkSubscription().then(setIsPro);
  }, []);
  
  useEffect(() => {
    const chapter = CHAPTERS.find(c => c.id === activeChapter);
    
    if (!chapter?.free && !isPro) {
      setContent(''); // 显示付费墙
      return;
    }
    
    // 加载章节内容
    fetch(`/api/hri-chapters/${activeChapter}`)
      .then(r => r.text())
      .then(setContent);
  }, [activeChapter, isPro]);
  
  return (
    <div className="flex h-screen">
      {/* 左侧章节导航 */}
      <nav className="w-64 border-r">
        {CHAPTERS.map(ch => (
          <button
            key={ch.id}
            onClick={() => setActiveChapter(ch.id)}
            className={activeChapter === ch.id ? 'active' : ''}
          >
            <span>{ch.name}</span>
            <span>{ch.label}</span>
            {!ch.free && <ProBadge />}
          </button>
        ))}
      </nav>
      
      {/* 右侧内容区 */}
      <main className="flex-1 overflow-auto">
        {content ? (
          <div dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          <PremiumWall onSubscribe={() => {}} />
        )}
      </main>
    </div>
  );
}
```

**Step 4 - 内容生成流程**
```
1. 研究员用 Word 写报告 → 
2. 导出 HTML / 手动转 HTML → 
3. 脚本导入 Supabase chapters_json 字段 → 
4. H5 阅读器动态加载
```

---

## 阶段四：部署运维（10分钟）

### 4.1 Git 工作流

```powershell
# 一键提交部署脚本
powershell -NoProfile -ExecutionPolicy Bypass -File "scripts/deploy.ps1"
```

**脚本内容：**
```powershell
# scripts/deploy.ps1
git add -A

# 提交信息写在文件里，避免特殊字符问题
git commit --file=commitmsg.txt

# push 到 master，Vercel 自动部署
git push origin master
```

**提交信息规范：**
```
feat: 新增公司评分雷达图

- 添加 Recharts 雷达图组件
- 集成 AMORA Score 五维度数据
- 支持行业均值对比线
```

### 4.2 Vercel 自动部署

```
GitHub Push → Vercel Build → Deploy to sin1 (新加坡)
     ↑              ↓              ↓
  本地开发    构建日志查看    2-3分钟上线
```

**环境变量配置（必须！）：**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
MIGRATION_SECRET=run-migration-now
```

### 4.3 踩坑总结

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| Vercel 404 | 缺少 `export const dynamic = 'force-dynamic'` | 所有 API route 加上 |
| 构建失败 | TypeScript 严格检查 | `next.config.ts` 加 `ignoreBuildErrors: true` |
| 数据库连不上 | 环境变量未配置 | Vercel Dashboard 手动配置 |
| PowerShell 乱码 | .mjs 内嵌中文 | 改用 .ps1 脚本，SQL 用变量 |
| git push 失败 | 网络问题 | 配置代理 localhost:15236 |

---

## 附录：核心文件速查

```
项目根目录/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API 路由
│   │   │   ├── companies/
│   │   │   ├── hri-chapters/
│   │   │   └── admin/
│   │   ├── (main)/            # 主站页面
│   │   └── dashboard/         # 用户后台
│   ├── components/            # React 组件
│   │   ├── H5ReportViewer.tsx
│   │   ├── PremiumWall.tsx
│   │   └── SubscribeBox.tsx
│   └── lib/
│       ├── db.ts              # 类型定义
│       └── supabase.ts        # 客户端
├── scripts/
│   ├── deploy.ps1             # 一键部署
│   ├── merge_outlines.py      # 报告合并脚本
│   └── setup_hri_chapters.mjs # H5内容导入
├── RUNBOOK.md                 # 运维手册
└── AMORA_Research_Framework_v1.0.md  # 研究框架
```

---

## 演示技巧

1. **提前准备好：** 本地 dev server 已启动，浏览器标签页打开关键页面
2. **代码展示：** 用 VS Code 分屏，一边演示一边展示代码
3. **强调 WorkBuddy 价值：**
   - 数据库设计 → 自动生成 DDL 脚本
   - API 开发 → 自动处理类型和错误
   - 踩坑解决 → 快速定位和修复问题
4. **互动环节：** 让听众提一个功能需求，现场演示如何实现

---

*文档生成时间：2026-04-09*  
*适用项目：AMORA Insights / Claw*
