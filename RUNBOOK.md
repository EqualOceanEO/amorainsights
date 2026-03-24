# Claw / AMORA Insights — 运维手册 (RUNBOOK)

> **团队必读。** 本文档记录了数据库操作、代码提交、自动部署的唯一正确方式。
> 每次有新的发现或规则变更，必须更新此文件。

---

## 1. 技术栈概览

| 层 | 技术 | 说明 |
|---|---|---|
| 前端/全栈 | Next.js 14 (App Router) | 部署在 Vercel，区域 sin1（新加坡）|
| 数据库 | Supabase (PostgreSQL) | Project Ref: `jqppcuccqkxhhrvndsil` |
| 代码仓库 | GitHub | `https://github.com/EqualOceanEO/amorainsights.git` |
| 自动部署 | Vercel + GitHub | push to `master` → 自动触发 Vercel 构建部署 |

---

## 2. 数据库操作 — 唯一正确方式

### 2.1 凭据

```
Supabase URL:       https://jqppcuccqkxhhrvndsil.supabase.co
Service Role Key:   见 .env 中 SUPABASE_SERVICE_ROLE_KEY
Anon Key:           见 .env 中 NEXT_PUBLIC_SUPABASE_ANON_KEY
SQL Editor:         https://supabase.com/dashboard/project/jqppcuccqkxhhrvndsil/sql/new
```

### 2.2 能用 vs 不能用（已踩坑验证）

| 方式 | 能否用 | 说明 |
|---|---|---|
| SQL Editor（Dashboard）| ✅ 可用 | 最直接，DDL/DML 都行 |
| `/api/admin/migrate` API | ✅ 可用 | 通过 `run_migration()` RPC 执行 DDL |
| service_role key + REST API | ✅ 可用 | 只做数据 CRUD（SELECT/INSERT/UPDATE/DELETE）|
| service_role key + DDL | ❌ 不行 | PostgREST 角色没有 DDL 权限 |
| Management API (api.supabase.com) | ❌ 不行 | 只接受 PAT，不接受 service_role key |
| pg 直连 5432/6543 | ❌ 被封 | 本地防火墙封了所有 PostgreSQL 直连端口 |
| node -e 内联 SQL | ❌ 不行 | 内容被 PowerShell 吞掉/截断 |
| .mjs 内嵌中文/emoji | ❌ 不行 | Windows 编码崩溃 |

### 2.3 执行 DDL（ALTER TABLE / CREATE INDEX 等）

**方式 A：通过 `/api/admin/migrate` 自动执行（推荐）**

前提：数据库中已有 `public.run_migration(sql_text TEXT)` 函数（已创建，永久有效）。

```powershell
# 调用迁移 API（本地 dev server 运行时）
Invoke-WebRequest -Uri "http://localhost:3000/api/admin/migrate?secret=run-migration-now" -UseBasicParsing
```

或者用现成的脚本：
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "c:\Users\51229\WorkBuddy\Claw\scripts\call-migrate-api.ps1"
```

**方式 B：直接在 SQL Editor 运行**

打开 https://supabase.com/dashboard/project/jqppcuccqkxhhrvndsil/sql/new，粘贴 SQL，点 Run。

### 2.4 执行 DML（数据读写）

```typescript
// 在 Next.js 服务端代码中
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // 服务端用 service_role key
)

// 查询
const { data, error } = await supabase.from('news_items').select('*')

// 插入
await supabase.from('news_items').insert({ title: '...', ... })
```

### 2.5 `run_migration` 函数说明

数据库中已存在，无需重建：

```sql
-- 这个函数已经在数据库中，不需要再创建
-- 调用方式：
SELECT public.run_migration('ALTER TABLE xxx ADD COLUMN IF NOT EXISTS yyy TEXT');
-- 返回 'ok' 表示成功，返回错误信息表示失败
```

### 2.6 写 DDL 脚本的正确方式（PowerShell）

```powershell
# ✅ 正确：写 .ps1 文件，用绝对路径执行，SQL 用变量
$sql = "ALTER TABLE news_items ADD COLUMN IF NOT EXISTS new_col TEXT"
$body = '{"sql_text":"' + $sql + '"}'
$bytes = [System.Text.Encoding]::UTF8.GetBytes('{"name":"run_migration","args":{"sql_text":"' + $sql + '"}}')
# 用 Invoke-WebRequest 发送到 /rest/v1/rpc/run_migration

# ❌ 禁止：powershell -Command 内联 SQL（内容被截断）
# ❌ 禁止：.mjs 文件内嵌中文字符（Windows 编码崩溃）
# ❌ 禁止：BEGIN...COMMIT 事务（Supabase API 不支持多语句事务）
```

---

## 3. 代码提交与自动部署

### 3.1 完整工作流（每次功能开发后执行）

```powershell
# 一键提交部署脚本
powershell -NoProfile -ExecutionPolicy Bypass -File "c:\Users\51229\WorkBuddy\Claw\scripts\deploy.ps1"
```

脚本内容（`scripts/deploy.ps1`）：
1. `git add -A`
2. `git commit --file=commitmsg.txt`（提交信息写在 commitmsg.txt，避免特殊字符问题）
3. `git push origin master`
4. push 成功后 Vercel 自动触发构建部署（通常 2-3 分钟）

### 3.2 提交规范

提交信息写入 `commitmsg.txt`，格式：
```
feat/fix/refactor/chore: 简短描述

- 改动点1
- 改动点2
```

### 3.3 Vercel 自动部署说明

- 仓库连接：GitHub `EqualOceanEO/amorainsights` master 分支
- 每次 push 到 master，Vercel 自动构建部署
- 部署日志：https://vercel.com/dashboard（用绑定账号登录）
- 环境变量在 Vercel Dashboard 中配置（`.env` 文件不会上传）
- **注意**：Vercel 上必须配置与本地 `.env` 相同的环境变量，否则生产环境无法连接数据库

### 3.4 Vercel 环境变量（生产环境必须配置）

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
MIGRATION_SECRET=run-migration-now
```

---

## 4. 本地开发启动

```powershell
cd "c:\Users\51229\WorkBuddy\Claw"
npm run dev
# 访问 http://localhost:3000
```

---

## 5. 关键 API 端点

| 端点 | 用途 | 认证 |
|---|---|---|
| `GET /api/news` | 获取新闻列表 | 无需认证 |
| `GET /api/news/[slug]` | 获取单条新闻 | 无需认证 |
| `GET/POST /api/admin/news` | 管理后台 CRUD | service_role key |
| `GET /api/admin/migrate?secret=xxx` | 执行数据库 DDL 迁移 | secret 参数 |

---

## 6. 数据库表结构（当前）

### `news_items`

| 字段 | 类型 | 说明 |
|---|---|---|
| id | BIGINT PK | 自增主键 |
| title | TEXT | 标题 |
| summary | TEXT | 摘要 |
| content | TEXT | 正文（Markdown/HTML）|
| slug | TEXT | URL 友好标识符 |
| cover_image_url | TEXT | 封面图 |
| author | TEXT | 作者 |
| tags | TEXT[] | 标签数组 |
| industry_id | TEXT | 行业 ID（新）|
| industry_slug | TEXT | 行业 slug（旧，保留兼容）|
| sub_sector_id | TEXT | 子行业 ID |
| company_id | BIGINT | 关联公司 |
| source_url | TEXT | 来源链接 |
| source_name | TEXT | 来源名称 |
| is_featured | BOOLEAN | 是否置顶 |
| is_premium | BOOLEAN | 是否付费 |
| is_published | BOOLEAN | 是否发布 |
| published_at | TIMESTAMPTZ | 发布时间 |
| created_at | TIMESTAMPTZ | 创建时间 |
| updated_at | TIMESTAMPTZ | 更新时间 |

---

## 7. 故障排查

### Q: git push 失败（Connection was reset）
A: 网络问题，代码已本地 commit，稍后重试 push。Vercel 有时需要科学上网。

### Q: 数据库 DDL 执行失败
A: 先确认 `run_migration` 函数存在 → 调用 `/api/admin/migrate` → 失败则直接用 SQL Editor。

### Q: Vercel 构建失败
A: 检查 TypeScript 编译错误，本地先 `npm run build` 验证。

### Q: 需要新的 Supabase PAT
A: 在 https://supabase.com/dashboard/account/tokens 生成，更新 MEMORY.md 和 scripts/exec-ddl.ps1。

---

*最后更新：2026-03-24*
