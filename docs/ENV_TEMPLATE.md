# AMORA 环境变量模板

> **注意：** 此文件包含敏感信息模板，实际值请从 1Password 或找 George 获取。
> 
> 复制此文件为 `.env.local` 并填入真实值。

---

## Supabase 数据库（必需）

```bash
# 项目 Ref: jqppcuccqkxhhrvndsil
NEXT_PUBLIC_SUPABASE_URL=https://jqppcuccqkxhhrvndsil.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
```

**获取方式：**
1. 登录 https://supabase.com/dashboard/project/jqppcuccqkxhhrvndsil
2. Project Settings → API
3. 复制 URL、anon key、service_role key

---

## 迁移密钥（必需）

```bash
MIGRATION_SECRET=run-migration-now
```

用于调用 `/api/admin/migrate` 执行数据库 DDL。

---

## Resend 邮件服务（生产必需）

```bash
RESEND_API_KEY=re_...
```

**获取方式：** https://resend.com/api-keys

---

## Stripe 支付（生产必需）

```bash
# 测试环境
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# 生产环境
# STRIPE_SECRET_KEY=sk_live_...
# STRIPE_WEBHOOK_SECRET=whsec_...
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

**获取方式：** https://dashboard.stripe.com/apikeys

---

## Vercel 环境变量（生产环境配置）

在 Vercel Dashboard 中配置：

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
MIGRATION_SECRET
RESEND_API_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

**配置路径：**
Vercel Dashboard → Project Settings → Environment Variables

---

## 本地开发 vs 生产环境

| 环境 | 配置文件 | 说明 |
|------|----------|------|
| 本地开发 | `.env.local` | 本地开发使用，不提交到 git |
| Vercel 生产 | Dashboard 配置 | 生产环境变量 |

⚠️ **永远不要将 `.env.local` 提交到 git！** 已添加到 `.gitignore`。
