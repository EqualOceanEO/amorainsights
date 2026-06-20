# AMORA 故障排查手册

> **维护人：** George (CTO)  
> **最后更新：** 2026-04-11

---

## 快速诊断流程

遇到问题按以下顺序排查：

1. **本地能复现吗？** → 本地修复 → 提交部署
2. **只有生产环境有问题？** → 检查 Vercel 日志
3. **数据库相关？** → 检查 Supabase 状态

---

## 1. Vercel 部署问题

### 1.1 构建失败

**症状：** `npm run build` 报错，TypeScript 编译失败

**常见原因：**
- 类型错误
- 缺少环境变量
- 依赖版本冲突

**解决：**
```typescript
// next.config.ts 添加（已配置）
export default {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}
```

**长期方案：**
本地先运行 `npm run build` 确保通过，再 push。

---

### 1.2 API 返回 404

**症状：** `/api/xxx` 接口返回 404，本地正常

**原因：** Vercel 默认静态优化，动态路由需要声明

**解决：**
```typescript
// 所有 API route 文件顶部添加：
export const dynamic = 'force-dynamic';

// 示例：src/app/api/hri-chapters/[chapter]/route.ts
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { chapter: string } }
) {
  // ...
}
```

---

### 1.3 环境变量缺失

**症状：** 生产环境数据库连不上、API 报错

**检查清单：**
```
Vercel Dashboard → Project Settings → Environment Variables

必须配置：
☑ NEXT_PUBLIC_SUPABASE_URL
☑ NEXT_PUBLIC_SUPABASE_ANON_KEY
☑ SUPABASE_SERVICE_ROLE_KEY
☑ MIGRATION_SECRET
```

**注意：** `.env.local` 不会上传到 Vercel，必须在 Dashboard 手动配置。

---

## 2. 数据库问题

### 2.1 DDL 执行失败

**症状：** 建表、加列、改结构失败

**错误信息：**
```
permission denied for schema public
```

**原因：** service_role key 没有 DDL 权限

**正确方式：**

**方式 A：API 调用（推荐）**
```powershell
# 本地 dev server 运行时
Invoke-WebRequest `
  -Uri "http://localhost:3000/api/admin/migrate?secret=run-migration-now" `
  -UseBasicParsing
```

**方式 B：SQL Editor**
1. 打开 https://supabase.com/dashboard/project/jqppcuccqkxhhrvndsil/sql/new
2. 粘贴 SQL
3. 点击 Run

**方式 C：PowerShell 脚本**
```powershell
# scripts/ 目录下有模板
# 参考：scripts/add-column.ps1
```

---

### 2.2 DML 查询失败

**症状：** SELECT/INSERT/UPDATE 报错

**常见错误：**

**错误 1：text[] 类型筛选失败**
```typescript
// ❌ 错误
supabase.from('news_items').ilike('tags', '%robot%')

// ✅ 正确
dsupabase.from('news_items').contains('tags', ['humanoid-robot'])
```

**错误 2：字段不存在**
```
column "is_published" does not exist
```

检查表结构，可能是 `production_status` 而非 `is_published`。

---

### 2.3 连接超时

**症状：** 数据库查询很慢或超时

**排查：**
1. 检查 Supabase Dashboard → Database → Usage
2. 查看是否有慢查询
3. 确认索引是否存在

**优化：**
```sql
-- 添加索引
CREATE INDEX idx_news_published ON news_items(published_at DESC);
```

---

## 3. Git 问题

### 3.1 push 失败（Connection was reset）

**症状：**
```
fatal: unable to access 'https://github.com/...':
OpenSSL SSL_read: Connection was reset, errno 10054
```

**原因：** 网络问题，GitHub 连接不稳定

**解决：**
```powershell
# 配置代理（已全局配置）
git config --global http.proxy http://localhost:15236
git config --global https.proxy http://localhost:15236

# 重试 push
git push origin master
```

**注意：** 代码已本地 commit，push 失败不影响，稍后重试即可。

---

### 3.2 提交信息乱码

**症状：** 中文提交信息显示乱码

**解决：**
```powershell
# 不写 -m 参数，用文件存储提交信息
git commit --file=commitmsg.txt
```

---

## 4. 开发环境问题

### 4.1 PowerShell 执行策略

**症状：**
```
无法加载脚本，因为在此系统上禁止运行脚本
```

**解决：**
```powershell
# 临时绕过（每次执行时加）
powershell -NoProfile -ExecutionPolicy Bypass -File "scripts/deploy.ps1"

# 或永久修改（管理员权限）
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

### 4.2 npm install 失败

**症状：** 依赖安装失败，网络超时

**解决：**
```bash
# 使用淘宝镜像
npm config set registry https://registry.npmmirror.com

# 或恢复官方
npm config set registry https://registry.npmjs.org

# 重新安装
rm -rf node_modules package-lock.json
npm install
```

---

### 4.3 端口被占用

**症状：**
```
Port 3000 is already in use
```

**解决：**
```bash
# 查找占用进程（Windows）
netstat -ano | findstr :3000

# 或换端口启动
npm run dev -- --port 3001
```

---

## 5. 功能问题

### 5.1 付费墙不生效

**症状：** Pro 内容对免费用户可见

**排查：**
1. 检查 `PremiumWall` 组件是否正确使用
2. 检查用户 `subscription_tier` 字段
3. 检查 session 是否正确获取

**代码检查：**
```typescript
// 正确用法
<PremiumWall>
  <FreeContent />
  <PremiumContent />
</PremiumWall>

// 检查用户订阅状态
const { data: session } = await supabase.auth.getSession();
const isPro = session?.user?.subscription_tier === 'pro';
```

---

### 5.2 H5 报告加载失败

**症状：** 报告章节内容不显示

**排查清单：**
1. API 是否返回 404？→ 加 `export const dynamic = 'force-dynamic'`
2. chapters_json 字段是否有数据？
3. 网络请求是否成功？

**调试：**
```bash
# 直接访问 API 测试
curl http://localhost:3000/api/hri-chapters/mapping
```

---

### 5.3 邮件发送失败

**症状：** 订阅确认邮件收不到

**排查：**
1. Resend API Key 是否配置？
2. 发件域名是否验证？
3. 收件箱是否在垃圾邮件文件夹？

---

## 6. 紧急联系

| 问题类型 | 紧急程度 | 联系人 |
|----------|----------|--------|
| 生产环境宕机 | 🔴 P0 | George 立即 |
| 数据库数据丢失 | 🔴 P0 | George 立即 |
| 支付功能异常 | 🟡 P1 | George + Franklyn |
| 一般功能问题 | 🟢 P2 | 技术群讨论 |

---

## 7. 常用调试命令

```bash
# 本地构建测试
npm run build

# 检查 TypeScript 错误
npx tsc --noEmit

# 检查环境变量
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"

# 测试 API
curl http://localhost:3000/api/news

# 查看 Git 日志
git log --oneline -10

# 查看 Vercel 部署日志
# Vercel Dashboard → Deployments → 点击具体部署
```

---

*遇到未记录的问题，解决后请更新此文档。*
