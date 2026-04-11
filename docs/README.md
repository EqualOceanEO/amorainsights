# AMORA Insights 技术文档中心

> **项目：** AMORA Insights - 北美行业研究洞察平台  
> **技术栈：** Next.js + Supabase + Vercel  
> **维护团队：** George (CTO) + 技术团队

---

## 📚 文档清单

新成员入职请按顺序阅读：

| 序号 | 文档 | 用途 | 预计阅读时间 |
|------|------|------|-------------|
| 1 | **ONBOARDING.md** | 新成员快速上手 | 20 分钟 |
| 2 | **ENV_TEMPLATE.md** | 环境变量配置指南 | 10 分钟 |
| 3 | **DATABASE_SCHEMA.md** | 数据库表结构详解 | 30 分钟 |
| 4 | **TROUBLESHOOTING.md** | 故障排查手册 | 按需查阅 |
| 5 | **../RUNBOOK.md** | 运维手册（项目根目录）| 15 分钟 |
| 6 | **../AMORA_Research_Framework_v1.0.md** | 研究框架定义 | 20 分钟 |

---

## 🚀 5 分钟快速开始

```bash
# 1. 克隆仓库
git clone https://github.com/EqualOceanEO/amorainsights.git
cd amorainsights

# 2. 安装依赖
npm install

# 3. 配置环境变量（找 George 获取真实值）
cp docs/ENV_TEMPLATE.md .env.local
# 编辑 .env.local 填入真实值

# 4. 启动开发服务器
npm run dev

# 5. 访问 http://localhost:3000
```

---

## 📁 项目结构

```
amorainsights/
├── docs/                      # 📚 团队文档（你在这里）
│   ├── README.md             # 本文档
│   ├── ONBOARDING.md         # 新成员指南
│   ├── ENV_TEMPLATE.md       # 环境变量模板
│   ├── DATABASE_SCHEMA.md    # 数据库结构
│   └── TROUBLESHOOTING.md    # 故障排查
│
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/             # API 路由
│   │   ├── (main)/          # 主站页面
│   │   └── dashboard/       # 用户后台
│   ├── components/          # React 组件
│   └── lib/                 # 工具库
│
├── scripts/                 # 脚本工具
├── public/                  # 静态资源
├── RUNBOOK.md              # 运维手册
└── AMORA_Research_Framework_v1.0.md  # 研究框架
```

---

## 🔑 关键资源

| 资源 | 链接 | 说明 |
|------|------|------|
| 生产环境 | https://amorainsights.com | 线上站点 |
| Vercel Dashboard | https://vercel.com/dashboard | 部署管理 |
| Supabase Dashboard | https://supabase.com/dashboard/project/jqppcuccqkxhhrvndsil | 数据库管理 |
| GitHub 仓库 | https://github.com/EqualOceanEO/amorainsights | 代码托管 |

---

## ⚡ 常用命令

```bash
# 开发
npm run dev              # 启动开发服务器
npm run build           # 构建生产版本
npm run start           # 启动生产服务器

# 部署（PowerShell）
powershell -NoProfile -ExecutionPolicy Bypass -File "scripts/deploy.ps1"

# 数据库迁移（本地 dev server 运行时）
Invoke-WebRequest -Uri "http://localhost:3000/api/admin/migrate?secret=run-migration-now" -UseBasicParsing
```

---

## 🎯 核心概念

### AMORA 双框架

**AMORA Report**（报告章节）：
- **M**apping → 产业链生态位（免费）
- **A**dvancement → 技术先进性（Pro）
- **O**perations → 商业化运营（Pro）
- **R**each → 市场容量（Pro）
- **A**ssets → 资本价值（Pro）

**AMORA Score**（企业评分）：
- **A**dvancement → 技术壁垒
- **M**astery → 人才优势
- **O**perations → 商业落地
- **R**each → 全球化能力
- **A**ffinity → 可持续能力

> ⚠️ **重要：** 两个框架字母相同但含义不同，代码和文档中必须严格区分！

---

## 👥 团队角色

| 角色 | 负责人 | 职责 |
|------|--------|------|
| CTO | George | 技术架构、代码审查、故障处理 |
| CEO | Franklyn | 产品方向、资源协调 |
| CCO | Cole | 内容生产、报告质量 |
| CMO | Celine | 市场运营、用户增长 |

---

## 🆘 获取帮助

1. **先查文档** → 本文档中心 + TROUBLESHOOTING.md
2. **技术问题** → 技术群 @George
3. **紧急故障** → 直接电话联系 George

---

## 📝 文档更新

发现文档有误或需要补充？

1. 修改对应 `.md` 文件
2. 提交 PR 或联系 George
3. 更新 `最后更新` 日期

---

*欢迎加入 AMORA 技术团队！*
