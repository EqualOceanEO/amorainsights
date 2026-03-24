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

## news_items 表当前状态（2026-03-24 迁移完成）

**所有字段已就绪**：`id, title, summary, industry_slug, source_url, source_name, is_featured, published_at, created_at, slug, content, cover_image_url, author, tags, is_premium, is_published, company_id, industry_id, sub_sector_id, updated_at`

- 迁移于 2026-03-24 完成，通过 SQL Editor 手动创建 `run_migration` 函数后，用 `/api/admin/migrate` 自动执行
- `run_migration(sql_text TEXT)` 函数已在数据库中存在，以后可直接通过 API 执行 DDL

## 前台 news 页面状态

- API `/api/news` 正常，返回 34 条新闻（200 OK）
- 所有字段（slug、industry_id、content 等）均已在数据库中真实存在
- 页面代码无 lint 错误，完全可用
- `/api/admin/migrate` 端点可用于后续 DDL 变更（需 `?secret=run-migration-now`）

## Git 提交与自动部署

- 仓库：`https://github.com/EqualOceanEO/amorainsights.git`，master 分支
- 部署平台：Vercel（区域 sin1），push 到 master **自动触发构建部署**（2-3分钟）
- **一键部署脚本**：`powershell -NoProfile -ExecutionPolicy Bypass -File "c:\Users\51229\WorkBuddy\Claw\scripts\deploy.ps1"`
- 提交信息：写入 `commitmsg.txt`，用 `git commit --file=commitmsg.txt`（避免特殊字符问题）
- push 失败重试 3 次，失败不影响本地 commit
- Vercel 上需配置：`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `MIGRATION_SECRET=run-migration-now`

## Supabase 执行 SQL 的脚本位置

- `scripts/deploy.ps1` — **一键提交+部署**（最常用）
- `scripts/call-migrate-api.ps1` — 调用 `/api/admin/migrate` 执行 DDL
- `scripts/exec-ddl.ps1` — 使用 PAT 通过 Management API 执行 SQL（需要有效 PAT）
- `scripts/migrate-pg.mjs` — Node.js pg 直连（被防火墙封，不可用）
- **完整运维手册**：项目根目录 `RUNBOOK.md`
