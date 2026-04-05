# Claw Project Memory

## AMORA 双框架区分（2026-04-03 确认）

> **极易混淆，必须记住：AMORA 有两套完全不同的框架，勿混用！**

| 框架 | 用途 | A | M | O | R | A |
|------|------|---|---|---|---|---|
| **AMORA Report**（行业报告模板） | 研究报告章节结构 | Advancement（技术先进性） | **Mapping（产业链生态位）** | Operations（商业化运营） | **Reach（市场容量）** | **Assets（资本价值）** |
| **AMORA Score**（企业评分框架） | 单家公司评分 | Advancement（技术壁垒） | **Mastery（人才优势）** | Operations（商业落地） | **Reach（全球化能力）** | **Affinity（可持续能力）** |

**HRI-2026 报告各章节对应文件：**
- Part A（Advancement）→ `HRI-2026-Outline-Advancement.md`（1137行）
- Part M（Mapping）→ `HRI-2026-Report-Mapping-Chinese-v1.0.md`（1017行）
- Part O（Operations）→ `HRI-2026-Outline-Operations.md`（765行）
- Part R（Reach）→ `HRI-2026-Outline-Reach.md`（564行）
- Part A2（Assets）→ `HRI-2026-Outline-Assets.md`（365行）
- 整合文件 → `HRI-2026-Outline-COMPLETE.md`（4291行，180KB，v3.0）
- 合并脚本 → `scripts/merge_outlines.py`（一键重新生成整合文件）

---

## 人形机器人研究报告合集（2026-03-27）

已下载8份国内外人形机器人研究报告至 `reports/humanoid-robot/` 目录：

**国际报告（6份）：**
- IDTechEx Humanoid Robots 2025-2035 (样章)
- METATREND Humanoid Robots 2025-2035
- FutureMarkets Humanoid Robots 2024-2035
- DIGITIMES Humanoid Robotics 2025
- Moonshot Humanoid Robot Evolution Report
- NEXERY Humanoid Robot Study 2025

**国内报告（2份）：**
- WIC 人形机器人应用与发展前瞻 2025
- M2觅途 2025人形机器人应用场景洞察白皮书

**关键数据参考：**
- 2025年全球出货量预测：1.45-1.7万台
- 2025年市场规模：$2.92B (MarketsandMarkets) / 28.8亿元 (中国电子报)
- 宇树科技2025年出货量：5500+台（全球第一）

---

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

## news_items 表当前状态（2026-03-24 迁移完成）

**所有字段已就绪**：`id, title, summary, industry_slug, source_url, source_name, is_featured, published_at, created_at, slug, content, cover_image_url, author, tags, is_premium, is_published, company_id, industry_id, sub_sector_id, updated_at`

- 迁移于 2026-03-24 完成，通过 SQL Editor 手动创建 `run_migration` 函数后，用 `/api/admin/migrate` 自动执行
- `run_migration(sql_text TEXT)` 函数已在数据库中存在，以后可直接通过 API 执行 DDL

## 前台 news 页面状态

- API `/api/news` 正常
- `/api/admin/migrate` 端点可用于后续 DDL 变更（需 `?secret=run-migration-now`）

## News 页面 industry 显示 Bug（2026-03-27 修复）

- **问题**：21 条旧 news_items 记录的 `industry_id` 是数字字符串（`"1"`, `"2"` 等），而不是 slug，导致行业标签显示为 `1`
- **修复1（数据）**：直接更新 DB，把 21 条记录的 `industry_id` 从数字改为 slug（`"1"→"ai"` 等）
- **修复2（前端）**：`getIndustryLabel` 和 `industryKey` 改为优先用 `industry_slug`，再 fallback 到 `industry_id`
- **根因**：早期手动插入数据时 `industry_id` 写入的是整数 ID，`industry_slug` 字段才是正确的 slug

- **API**: `GET /api/admin/news-generator?secret=run-migration-now`
  - 每天 06:00 UTC 由 Vercel Cron 自动触发（vercel.json `0 6 * * *`）
  - 生成 6 条一级行业新闻（每个 L1 行业 1 条）+ 最多 8 条公司新闻（轮转 359 家追踪公司）
  - 所有新闻带 `content` 字段（含完整正文）
  - 鉴权：`?secret=run-migration-now`（`MIGRATION_SECRET` 环境变量，已于 2026-03-28 在 Vercel 配置完成）或 Bearer service_role_key
  - **历史故障**：2026-03-26~28 停更，根因是 `MIGRATION_SECRET` 未在 Vercel 设置，3月28日已修复
- **详情页**：`src/app/news/[slug]/page.tsx`，content 展示区扩大（xl:grid-cols-[1fr_280px]），text-lg leading-loose，字数统计 footer
- **sub-sector**：列表页和详情页均用 SUB_SECTOR_NAMES 映射（ industries 表 ID 49-84）显示子行业名称

## 搜索框和一二级联动重新设计（2026-03-27）

- `IndustryFilterBar` v3：right-side extra 按钮与 L1 tabs 同行，L2 独占第二行
- News 页面（`src/app/news/page.tsx`）内嵌专属 filter 区，不再用通用组件
  - **Row 1**：L1 行业 tabs（居左，水平滚动）+ 搜索框（居右，固定 w-52）
  - **Row 2**：L2 sub-sectors，仅当 L1 选中时显示，pill 样式
  - 二级联动状态：`industryL2` state，切换 L1 自动重置
- `src/app/api/news/route.ts` 新增 `sub_sector` 参数支持（ilike tags 过滤）
- 添加 `scrollbar-hide` utility 类（globals.css）隐藏滚动条
- **构建修复（2026-03-27）**：`news-generator/route.ts` 中 `Company` 类型未定义导致 Vercel 构建失败，改为 `any[]` 修复
- **API 修复（2026-03-27）**：`tags` 字段是 `text[]` 数组，不能用 `ilike`，改用 `.contains('tags', [subSector])` (`@>` 操作符)，修复 "operator does not exist: text[] ~~* unknown" 错误
- **Companies 页面同步（2026-03-27）**：内嵌专属 filter，Row1=L1+搜索，Row2=L2，Row3=地区+Listed/Private，去掉 IndustryFilterBar 依赖
- **Companies API 修复（2026-03-27）**：`/api/companies` 原来用 `industry_id`/`sub_sector_id`（整数）过滤，但页面传的是 slug 字符串，改为用 `industry_slug` + `sub_sector`（字符串）过滤，同时去掉多余的 industries 表 JOIN
- **Reports 页面同步（2026-03-27）**：Server Component 改为 Client Component，内嵌 filter，Row1=L1+搜索框(w-52)+Free/Premium，Row2=L2，直接用 supabase-js 查询，不再依赖 getReports server function
- **Reports 数据修复（2026-03-27）**：reports 表无 `is_published` 列，实际用 `production_status` 字段（'draft'/'published'）；12 条记录已改为 `production_status='published'`；前端查询改用 `.in('production_status', ['published', 'approved'])`
- **Companies 空状态宽度修复（2026-03-27）**：No companies match 时加 `w-full` 确保撑满 max-w-7xl

## 页面标题样式规范（全站统一，2026-03-27）

- h1：`text-3xl font-bold`（不加 tracking-tight）
- 副标题 p：`text-gray-400 mt-1`
- 三页（News/Reports/Companies）均已对齐

## 页面布局规范（全站统一）

- **数据密集型列表页**（news、reports、companies 等）：主容器用 `max-w-7xl mx-auto px-6`，全宽响应式
- **内容型页面**（about、pricing、subscribe、详情页等）：可用 `max-w-4xl` / `max-w-5xl`，窄一点更易读
- 所有页面在移动端通过 Tailwind 自适应缩放，`px-6` 保持左右内边距
- 新建页面默认用 `max-w-7xl mx-auto px-6`，内容页按需缩窄

## Git 代理配置（2026-03-24 修复）

- git push 需要走代理才能访问 GitHub，系统代理端口：`localhost:15236`
- 已全局配置：`git config --global http.proxy http://localhost:15236` 和 `https.proxy` 同上
- 如果代理端口变了，重新运行上面命令更新即可

## Git 提交与自动部署

- 仓库：`https://github.com/EqualOceanEO/amorainsights.git`，master 分支
- 部署平台：Vercel（区域 sin1），push 到 master **自动触发构建部署**（2-3分钟）
- **一键部署脚本**：`scripts/deploy.ps1`（如存在）
- 提交信息：写入 `commitmsg.txt`，用 `git commit --file=commitmsg.txt`（避免特殊字符问题）；或直接 `git commit -m "..."`（注意 NUL 字节问题）
- push 失败重试 3 次，失败不影响本地 commit
- Vercel 上需配置：`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `MIGRATION_SECRET=run-migration-now`
- **package.json 必须用 `"type": "module"`**（2026-04-04 确认），否则 Turbopack 会报 78 个 CommonJS vs ESM 冲突错误

## package.json type: "module" 重要提示（2026-04-04）

- 项目所有 .ts/.tsx 源码使用 ESM import/export，`package.json` 必须声明 `"type": "module"`
- 如果需要写 CommonJS 脚本（如 PPT 生成），必须用 `.cjs` 后缀
- 本地构建有上层 lockfile 警告（`C:\Users\51229\package-lock.json`），不影响 Vercel 构建
- `Company` 接口在 `src/lib/db.ts` 中定义，包含 funding、AMORA scores、team、products、supply chain 等 40+ 字段

## 用户订阅 + 注册自动化（2026-04-05 部署）

### 核心流程
- **SubscribeBox 提交 email** → `/api/subscribe` → 同时完成：
  1. Upsert `subscribers` 表（newsletter）
  2. 若 `users` 表无此 email → 自动创建账户（random password + bcrypt），name=null（auto-created 标记）
  3. 发送欢迎邮件（含 Set Password 链接 → `/login?email=xxx`）
- 用户收到邮件后点链接到 /login 设置密码（但当前 /login 还不支持密码设置，需要后续开发 /account/reset-password）

### Session 架构
- `/api/auth/session` — 新建端点，供 Client Component 读取 session
- `SiteNav` — 自主获取 session（不需要 props），登录后显示头像+下拉菜单
- `PremiumWall` — 检查 session，Pro 用户返回 null（不渲染付费墙）
- `auth.ts` — JWT callback 中从 DB 刷新 subscriptionTier
- Stripe webhook — checkout/subscription 事件同时更新 `users.subscription_tier`

### 前台改动
- **Admin 入口已从 SiteNav 移除**（仅后台 /admin/* 路由保留，前台不显示链接）
- Pro 用户在 Nav 显示 PRO 徽章（蓝色）
- 未登录用户看到 Sign In + Start Free 按钮
- 已登录 Free 用户看到头像 + Upgrade to Pro 菜单项

### Dashboard 账户管理（2026-04-05 commit f77c9a2）
- **布局**：`/dashboard/layout.tsx` + `DashboardSidebar.tsx`（左侧导航：Overview/Account/Newsletter(Admin)/Admin Panel）
- **Account 页面**（`/dashboard/account`）：个人信息编辑、订阅层级显示、Newsletter 订阅/退订、密码修改
- **Newsletter 页面**（`/dashboard/newsletter`，admin-only）：6 track section 编辑器、test email dry run、全量发送
- **API**：`/api/user/profile`（GET+PATCH）、`/api/user/newsletter/unsubscribe`（POST 退订/DELETE 重订阅）
- `/api/newsletter/send` 和 `/api/admin/subscribers` 同时支持 INTERNAL_API_SECRET 和 admin session 鉴权

## Supabase 执行 SQL 的脚本位置

- `scripts/deploy.ps1` — **一键提交+部署**（最常用）
- `scripts/call-migrate-api.ps1` — 调用 `/api/admin/migrate` 执行 DDL
- `scripts/exec-ddl.ps1` — 使用 PAT 通过 Management API 执行 SQL（需要有效 PAT）
- `scripts/migrate-pg.mjs` — Node.js pg 直连（被防火墙封，不可用）
- **完整运维手册**：项目根目录 `RUNBOOK.md`

## News 详情页修复（2026-03-26）

**问题**：`maybeSingle()` 在数据库存在重复 slug 时报错 "multiple rows returned"，导致详情页显示 "Server Component Error"

**修复**：`src/app/api/news/[slug]/route.ts` 中将 `maybeSingle()` 改为 `.limit(1)` + 手动检查数组长度，即使有重复记录也返回第一条

**注意**：数据库中 `new-space-2026-03-25-1` 等 slug 可能仍有重复记录，建议后续清理

## News 每日自动化异常（2026-03-26）

- **问题**：Vercel Cron (`/api/admin/news-generator`) 今天未自动执行
- **原因**：API 端点返回 404，可能是部署问题或 cron 配置失效
- **临时处理**：直接通过 Supabase REST API 插入 13 条新闻（5 条行业 + 8 条公司）
- **乱码修复**：PowerShell 脚本中 em-dash `—` (U+2014) 被错误编码为 `E9 88 A5`，导致显示为乱码。用 hex bytes `E2 80 94` 直接写入修复了 13 条 summary 记录
- **建议**：检查 Vercel 部署状态和 cron 配置
