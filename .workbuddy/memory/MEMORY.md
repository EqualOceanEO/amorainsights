# Claw Project Memory

## AMORA 双框架（必须区分，勿混用）

| 框架 | 用途 | A | M | O | R | A |
|------|------|---|---|---|---|---|
| **AMORA Report**（报告章节） | 研究报告结构 | Advancement | Mapping | Operations | Reach | Assets |
| **AMORA Score**（企业评分） | 单家公司评分 | Advancement | Mastery | Operations | Reach | Affinity |

**HRI-2026 报告文件：**
- 整合文件 → `HRI-2026-Outline-COMPLETE.md`（4291行，180KB，v3.0）
- 合并脚本 → `scripts/merge_outlines.py`
- H5 五章节：Mapping(free) / Advancement / Operations / Reach / Assets(均为 PRO)
- H5 Viewer：`src/components/H5ReportViewer.tsx` + API `src/app/api/hri-chapters/[chapter]/route.ts`
- 章节内容存储：Supabase `reports` 表 id=44 的 `chapters_json` JSONB 字段（185KB）
- **关键**：API route 必须有 `export const dynamic = 'force-dynamic'`，否则 Vercel 返回 404

---

## Supabase Access Credentials

- **Project Ref**: jqppcuccqkxhhrvndsil
- **Supabase URL**: https://jqppcuccqkxhhrvndsil.supabase.co
- **Service Role Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc

## DDL 执行方式

1. SQL Editor：https://supabase.com/dashboard/project/jqppcuccqkxhhrvndsil/sql/new（最可靠）
2. API：`POST /api/admin/migrate?secret=run-migration-now` 调用 `run_migration(sql_text)` RPC（dev server 运行时有效）
3. service_role key 不能执行 DDL；pg 直连被防火墙封；Management API 只接受 PAT
4. PAT 已过期，需要时去 https://supabase.com/dashboard/account/tokens 生成新的

---

## 数据库关键表结构

### news_items 表
字段：`id, title, summary, industry_slug, source_url, source_name, is_featured, published_at, created_at, slug, content, cover_image_url, author, tags(text[]), is_premium, is_published, company_id, industry_id, sub_sector_id, updated_at`
- `tags` 是 `text[]`，过滤用 `.contains('tags', [subSector])` 而非 ilike

### reports 表
- `production_status` 字段（'draft'/'published'/'approved'），无 `is_published` 列
- `chapters_json` JSONB 字段存储 H5 章节 HTML

---

## 用户订阅 + 认证架构（2026-04-05）

### 核心流程
- **SubscribeBox** → `/api/subscribe` → 同时：upsert `subscribers` + 自动创建 `users` 账户（若不存在）+ 发送欢迎邮件

### Session 架构
- `/api/auth/session` — Client Component 读取 session
- `SiteNav` — 自主获取 session，登录后头像+下拉，Pro 用户显示 PRO 徽章
- `PremiumWall` — Pro 用户不渲染
- `auth.ts` JWT callback 从 DB 刷新 subscriptionTier

### Dashboard
- `/dashboard/account`：个人信息、订阅层级、Newsletter、改密码
- `/dashboard/newsletter`（admin-only）：6 track 编辑器
- API：`/api/user/profile`（GET+PATCH）、`/api/user/newsletter/unsubscribe`

---

## 项目规范

### Git & 部署
- 仓库：`https://github.com/EqualOceanEO/amorainsights.git`，master 分支
- push 到 master → Vercel 自动部署（sin1，2-3分钟）
- 一键部署：`powershell -NoProfile -ExecutionPolicy Bypass -File "c:\Users\51229\WorkBuddy\Claw\scripts\deploy.ps1"`
- 提交信息写 `commitmsg.txt` 再 `git commit --file=commitmsg.txt`（避免特殊字符）
- git push 需代理：`localhost:15236`（已全局配置）
- **Vercel 必须配置**：`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `MIGRATION_SECRET=run-migration-now`

### 代码规范
- `package.json` 必须 `"type": "module"`（否则 Turbopack 报 78 个 CommonJS/ESM 冲突）
- CommonJS 脚本用 `.cjs` 后缀
- `next.config.ts` 需 `eslint.ignoreDuringBuilds: true` + `typescript.ignoreBuildErrors: true`（解除 Vercel Turbopack 严格检查）
- `Company` 接口在 `src/lib/db.ts`，含 40+ 字段

### 页面布局规范
- 列表页（news/reports/companies）：`max-w-7xl mx-auto px-6`
- 内容页（about/pricing/详情页）：`max-w-4xl` / `max-w-5xl`
- h1：`text-3xl font-bold`，副标题：`text-gray-400 mt-1`

### 过滤器规范（2026-03-27）
- News/Reports/Companies 页均内嵌专属 filter：Row1=L1 tabs + 搜索框(w-52)，Row2=L2 sub-sectors
- Companies 过滤用 `industry_slug` + `sub_sector`（字符串），不用整数 ID

### News 自动生成
- Vercel Cron：每天 06:00 UTC，`/api/admin/news-generator?secret=run-migration-now`
- 生成 6 条 L1 行业新闻 + 最多 8 条公司新闻（轮转 359 家）

---

## Pending 任务

1. **SubscribeBox 优化**：已登录用户显示邮箱（不重复订阅）；未登录输入已注册邮箱时直接帮他登录
2. **Logo 调整**：去掉 "insights" 文字，只保留 "AMORA"，中间不需要竖线，本地预览确认后上传
