# AMORA 技术团队 Onboarding 指南

> **致新成员：** 欢迎加入 AMORA 技术团队！这份文档帮你快速上手，避免重复踩坑。
> 
> **最后更新：** 2026-04-11  
> **维护人：** George (CTO)

---

## 一、项目概览

### 1.1 项目定位
**AMORA Insights** 是面向北美市场的行业研究洞察平台，核心产品是 36 份行业创新评估报告。

### 1.2 技术栈

| 层级 | 技术 | 用途 |
|------|------|------|
| 前端/全栈 | Next.js 14 (App Router) + TypeScript + Tailwind | 主站开发 |
| 数据库 | Supabase (PostgreSQL) | 数据存储 |
| 部署 | Vercel (新加坡节点 sin1) | 生产环境 |
| 代码托管 | GitHub | 版本控制 |
| 邮件服务 | Resend | 邮件发送 |
| 支付 | Stripe | 订阅付费 |

### 1.3 项目规模
- 代码：100+ 组件，50+ API 路由
- 数据库：10+ 核心表
- 核心报告：HRI-2026 人形机器人报告（180KB 内容，5 章节 H5）

---

## 二、快速开始（30 分钟上手）

### 2.1 克隆仓库

```bash
git clone https://github.com/EqualOceanEO/amorainsights.git
cd amorainsights
npm install
```

### 2.2 配置环境变量

创建 `.env.local` 文件：

```bash
# Supabase 连接（找 George 或查看 1Password）
NEXT_PUBLIC_SUPABASE_URL=https://jqppcuccqkxhhrvndsil.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# 迁移密钥
MIGRATION_SECRET=run-migration-now

# Resend 邮件（生产环境需要）
RESEND_API_KEY=re_...

# Stripe 支付（生产环境需要）
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
```

### 2.3 启动开发服务器

```bash
npm run dev
# 访问 http://localhost:3000
```

---

## 三、核心文档清单（必读）

### 3.1 架构设计文档

| 文档 | 路径 | 说明 |
|------|------|------|
| **运维手册** | `RUNBOOK.md` | 数据库操作、部署流程、故障排查 |
| **研究框架** | `AMORA_Research_Framework_v1.0.md` | AMORA 双框架定义、报告结构 |
| **演示大纲** | `AMORA-建站演示大纲.md` | 项目演进过程、关键迭代 |

### 3.2 关键代码文件

| 文件 | 说明 |
|------|------|
| `src/lib/db.ts` | 所有 TypeScript 类型定义 |
| `src/lib/supabase.ts` | Supabase 客户端配置 |
| `src/components/H5ReportViewer.tsx` | H5 报告阅读器 |
| `src/components/PremiumWall.tsx` | 付费墙组件 |
| `scripts/deploy.ps1` | 一键部署脚本 |

---

## 四、数据库操作规范（重要！）

### 4.1 凭据信息

```
Project Ref: jqppcuccqkxhhrvndsil
Dashboard:   https://supabase.com/dashboard/project/jqppcuccqkxhhrvndsil
SQL Editor:  https://supabase.com/dashboard/project/jqppcuccqkxhhrvndsil/sql/new
```

### 4.2 DDL 执行方式（建表/改结构）

**方式 A：API 调用（推荐）**
```powershell
# 本地 dev server 运行时调用
Invoke-WebRequest `
  -Uri "http://localhost:3000/api/admin/migrate?secret=run-migration-now" `
  -UseBasicParsing
```

**方式 B：SQL Editor（最直接）**
- 打开 Dashboard → SQL Editor → 粘贴 SQL → Run

**方式 C：PowerShell 脚本**
```powershell
# 参考 scripts/ 目录下的 .ps1 文件模板
```

### 4.3 ⚠️ 禁止操作

| 禁止 | 原因 |
|------|------|
| service_role key 直接执行 DDL | 无权限 |
| pg 直连 5432/6543 端口 | 防火墙封禁 |
| node -e 内联 SQL | PowerShell 截断 |
| .mjs 文件内嵌中文 | Windows 编码崩溃 |

### 4.4 DML 数据操作

```typescript
// 在 Next.js 服务端代码中使用
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // 服务端用 service_role
)

// 查询
const { data, error } = await supabase.from('companies').select('*')

// 插入
await supabase.from('news_items').insert({ title: '...', ... })
```

---

## 五、Git 工作流

### 5.1 一键部署

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "scripts/deploy.ps1"
```

### 5.2 手动流程

```powershell
git add -A

# 提交信息写在 commitmsg.txt，避免特殊字符问题
git commit --file=commitmsg.txt

git push origin master
```

### 5.3 提交规范

```
feat: 新增功能
fix: 修复 bug
refactor: 重构
chore: 杂项
```

---

## 六、核心概念：AMORA 双框架

### 6.1 AMORA Report（报告章节结构）

| 字母 | 含义 | 付费墙 |
|------|------|--------|
| **M** | Mapping（产业链生态位）| 免费 |
| **A** | Advancement（技术先进性）| Pro |
| **O** | Operations（商业化运营）| Pro |
| **R** | Reach（市场容量）| Pro |
| **A** | Assets（资本价值）| Pro |

### 6.2 AMORA Score（企业评分）

| 字母 | 含义 | 评分维度 |
|------|------|----------|
| **A** | Advancement | 技术壁垒 |
| **M** | Mastery | 人才优势 |
| **O** | Operations | 商业落地 |
| **R** | Reach | 全球化能力 |
| **A** | Affinity | 可持续能力 |

> ⚠️ **关键：** 两个框架字母一样但含义不同，代码和文档中必须严格区分！

---

## 七、常见踩坑清单

### 7.1 Vercel 部署

| 问题 | 原因 | 解决 |
|------|------|------|
| API 返回 404 | 缺少 dynamic export | 加 `export const dynamic = 'force-dynamic'` |
| 构建失败 | TypeScript 严格检查 | `next.config.ts` 加 `ignoreBuildErrors: true` |
| 数据库连不上 | 环境变量未配置 | Vercel Dashboard 配置环境变量 |

### 7.2 数据库

| 问题 | 原因 | 解决 |
|------|------|------|
| tags 筛选失败 | text[] 类型用错方法 | 用 `.contains('tags', [value])` 而非 `ilike` |
| DDL 执行失败 | 权限不足 | 用 `/api/admin/migrate` 或 SQL Editor |

### 7.3 开发环境

| 问题 | 原因 | 解决 |
|------|------|------|
| PowerShell 乱码 | 编码问题 | 文件用 UTF-8，SQL 用变量存储 |
| git push 失败 | 网络问题 | 配置代理 localhost:15236 |

---

## 八、项目结构速查

```
amorainsights/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API 路由
│   │   │   ├── companies/     # 公司相关 API
│   │   │   ├── hri-chapters/  # H5 报告章节 API
│   │   │   └── admin/         # 管理后台 API
│   │   ├── (main)/            # 主站页面
│   │   │   ├── news/          # 新闻列表/详情
│   │   │   ├── reports/       # 报告列表/详情
│   │   │   └── companies/     # 公司列表/详情
│   │   └── dashboard/         # 用户后台
│   ├── components/            # React 组件
│   │   ├── H5ReportViewer.tsx # H5 报告阅读器
│   │   ├── PremiumWall.tsx    # 付费墙
│   │   ├── SubscribeBox.tsx   # 订阅组件
│   │   └── ui/                # 基础 UI 组件
│   └── lib/
│       ├── db.ts              # 类型定义
│       ├── supabase.ts        # Supabase 客户端
│       └── utils.ts           # 工具函数
├── scripts/                   # 脚本工具
│   ├── deploy.ps1             # 一键部署
│   ├── merge_outlines.py      # 报告合并
│   └── setup_hri_chapters.mjs # H5 内容导入
├── public/                    # 静态资源
├── docs/                      # 团队文档
└── package.json
```

---

## 九、关键资源链接

| 资源 | 链接 |
|------|------|
| 生产环境 | https://amorainsights.com |
| Vercel Dashboard | https://vercel.com/dashboard |
| Supabase Dashboard | https://supabase.com/dashboard/project/jqppcuccqkxhhrvndsil |
| GitHub 仓库 | https://github.com/EqualOceanEO/amorainsights |

---

## 十、联系与支持

| 角色 | 负责人 | 职责 |
|------|--------|------|
| CTO | George | 技术架构、代码审查 |
| CEO | Franklyn | 产品方向、资源协调 |
| CCO | Cole | 内容生产、报告质量 |

**紧急情况：** 数据库 DDL 执行失败、生产环境故障 → 立即联系 George

---

*欢迎加入 AMORA 技术团队！有任何问题随时提问。*
