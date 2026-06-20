# AMORA 技术团队交接清单

> **交接人：** George (CTO)  
> **接收人：** [新成员姓名]  
> **交接日期：** 2026-04-11

---

## 一、代码仓库交接

### 1.1 GitHub 权限

- [ ] 邀请新成员加入 `EqualOceanEO` 组织
- [ ] 赋予 `amorainsights` 仓库 Write 权限
- [ ] 确认新成员能正常 clone/push

### 1.2 仓库地址

```bash
git clone https://github.com/EqualOceanEO/amorainsights.git
```

---

## 二、敏感信息交接

### 2.1 环境变量（.env.local）

**方式 A：1Password 共享（推荐）**
- [ ] 将以下凭据添加到 1Password 共享保险库

**方式 B：加密传输**
- [ ] 使用加密邮件或加密即时通讯工具发送

**必须交接的凭据：**

| 名称 | 用途 | 获取位置 |
|------|------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | 数据库连接 | Supabase Dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 客户端数据库访问 | Supabase Dashboard → API |
| `SUPABASE_SERVICE_ROLE_KEY` | 服务端数据库访问 | Supabase Dashboard → API |
| `RESEND_API_KEY` | 邮件服务 | Resend Dashboard |
| `STRIPE_SECRET_KEY` | 支付处理 | Stripe Dashboard |
| `STRIPE_WEBHOOK_SECRET` | 支付回调验证 | Stripe Dashboard |

### 2.2 第三方平台账号

| 平台 | 用途 | 交接方式 |
|------|------|----------|
| Supabase | 数据库管理 | 邀请为项目成员 |
| Vercel | 部署管理 | 邀请为项目成员 |
| Resend | 邮件服务 | API Key 共享 |
| Stripe | 支付处理 | 邀请为团队成员 |

---

## 三、文档交接

### 3.1 必读文档（按顺序）

| 顺序 | 文档 | 预计阅读时间 | 重点 |
|------|------|--------------|------|
| 1 | `docs/README.md` | 5分钟 | 文档导航 |
| 2 | `docs/ONBOARDING.md` | 30分钟 | 快速上手 |
| 3 | `docs/ENV_TEMPLATE.md` | 10分钟 | 环境配置 |
| 4 | `docs/DATABASE_SCHEMA.md` | 20分钟 | 数据结构 |
| 5 | `docs/TROUBLESHOOTING.md` | 15分钟 | 故障排查 |

### 3.2 项目根目录文档

| 文档 | 内容 |
|------|------|
| `RUNBOOK.md` | 运维手册（数据库操作、部署流程）|
| `AMORA_Research_Framework_v1.0.md` | AMORA 双框架定义 |
| `AMORA-建站演示大纲.md` | 项目演进过程 |

---

## 四、开发环境验证

### 4.1 新成员自检清单

```bash
# 1. 克隆仓库
git clone https://github.com/EqualOceanEO/amorainsights.git
cd amorainsights

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp docs/ENV_TEMPLATE.md .env.local
# 编辑 .env.local，填入真实值

# 4. 启动开发服务器
npm run dev
```

### 4.2 验证点

- [ ] 访问 http://localhost:3000 正常显示首页
- [ ] 访问 http://localhost:3000/companies 显示公司列表
- [ ] 访问 http://localhost:3000/api/news 返回 JSON 数据

---

## 五、数据库访问验证

### 5.1 Supabase Dashboard 访问

- [ ] 能登录 https://supabase.com/dashboard/project/jqppcuccqkxhhrvndsil
- [ ] 能查看 Table Editor 中的表结构
- [ ] 能使用 SQL Editor 执行查询

### 5.2 本地数据库连接测试

```bash
# 启动 dev server 后测试
curl "http://localhost:3000/api/admin/migrate?secret=run-migration-now"
# 应返回 {"status":"ok"}
```

---

## 六、部署权限验证

### 6.1 Vercel 访问

- [ ] 能登录 https://vercel.com/dashboard
- [ ] 能看到 `amorainsights` 项目
- [ ] 能查看部署日志

### 6.2 部署测试

```bash
# 新成员执行一次测试提交
git checkout -b test-branch
echo "# Test" >> test.md
git add test.md
git commit -m "test: 验证部署权限"
git push origin test-branch

# 在 Vercel Dashboard 确认有 Preview Deployment
# 然后删除测试分支
git checkout master
git branch -D test-branch
git push origin --delete test-branch
```

---

## 七、知识转移（建议面对面/视频会议）

### 7.1 核心概念讲解（30分钟）

- [ ] **AMORA 双框架**：Report（报告结构）vs Score（企业评分）
- [ ] **付费墙设计**：免费层（Mapping）vs 付费层（Measure/Benchmarking）
- [ ] **H5 报告系统**：chapters_json 存储结构

### 7.2 代码走读（30分钟）

- [ ] `src/lib/db.ts` - 类型定义
- [ ] `src/components/H5ReportViewer.tsx` - 报告阅读器
- [ ] `src/components/PremiumWall.tsx` - 付费墙
- [ ] `scripts/deploy.ps1` - 部署脚本

### 7.3 常见问题演示（20分钟）

- [ ] 如何执行数据库 DDL
- [ ] 如何调试 API 404 问题
- [ ] 如何处理 PowerShell 编码问题

---

## 八、WorkBuddy 配置同步（如使用）

如果新成员也使用 WorkBuddy，需要同步：

### 8.1 配置文件位置

```
Windows: C:\Users\[用户名]\.workbuddy\
macOS:   ~/.workbuddy/
Linux:   ~/.workbuddy/
```

### 8.2 需要同步的内容

| 文件夹/文件 | 内容 | 同步方式 |
|-------------|------|----------|
| `memory/` | 项目记忆 | 复制或重新生成 |
| `skills/` | 安装的技能 | 重新安装 |
| `automations/` | 自动化任务 | 复制或重新配置 |
| `mcp.json` | MCP 服务器配置 | 复制 |

### 8.3 快速同步命令

**原电脑（George）：**
```powershell
# 打包配置
Compress-Archive -Path "$env:USERPROFILE\.workbuddy\memory" -DestinationPath "$env:USERPROFILE\Desktop\workbuddy-memory.zip"
```

**新电脑：**
```powershell
# 解压到相同位置
Expand-Archive -Path "C:\Users\[新成员]\Downloads\workbuddy-memory.zip" -DestinationPath "$env:USERPROFILE\.workbuddy\"
```

---

## 九、第一周任务建议

### Day 1-2：环境搭建
- [ ] 完成开发环境配置
- [ ] 阅读所有文档
- [ ] 成功运行本地 dev server

### Day 3-4：代码熟悉
- [ ] 阅读核心组件代码
- [ ] 完成一次小改动（如修改文案）
- [ ] 完成第一次 commit & push

### Day 5：实战任务
- [ ] 独立完成一个小功能或 bug 修复
- [ ] 参与代码审查

---

## 十、支持渠道

| 问题类型 | 联系人 | 响应时间 |
|----------|--------|----------|
| 紧急技术问题 | George | 2小时内 |
| 产品需求确认 | Franklyn | 1个工作日内 |
| 内容相关问题 | Cole | 1个工作日内 |
| 账号权限问题 | George | 4小时内 |

---

## 十一、交接确认签字

| 项目 | 交接人确认 | 接收人确认 |
|------|------------|------------|
| GitHub 权限 | ☐ | ☐ |
| 环境变量 | ☐ | ☐ |
| 第三方平台权限 | ☐ | ☐ |
| 文档阅读完成 | ☐ | ☐ |
| 开发环境运行正常 | ☐ | ☐ |
| 数据库访问正常 | ☐ | ☐ |
| 部署权限正常 | ☐ | ☐ |
| 知识转移完成 | ☐ | ☐ |

**交接人签字：** _________________ 日期：________

**接收人签字：** _________________ 日期：________

---

*此清单完成后，新成员应能独立进行日常开发和部署工作。*
