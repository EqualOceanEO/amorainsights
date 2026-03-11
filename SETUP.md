# Amora Insights - 用户系统配置指南

## 🚀 快速开始

### 1️⃣ 配置 Neon 数据库

1. 访问 https://neon.tech 并登录
2. 创建一个新项目 `amorainsights`
3. 复制数据库连接字符串（Connection string）
4. 编辑 `.env.local` 文件，替换 `POSTGRES_URL` 的值

```env
POSTGRES_URL="postgresql://your_user:your_password@ep-xxx-xxx.us-east-2.aws.neon.tech/amorainsights?sslmode=require"
```

### 2️⃣ 安装依赖

```bash
cd amorainsights
npm install
```

### 3️⃣ 初始化数据库

```bash
npm run db:init
```

### 4️⃣ 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 📁 用户系统功能

- ✅ 用户注册 (`/signup`)
- ✅ 用户登录 (`/login`)
- ✅ 会话管理 (JWT)
- ✅ 密码加密 (bcrypt)
- ✅ 数据库存储 (Neon PostgreSQL)

## 🔐 安全特性

- 密码使用 bcrypt 加密存储
- JWT session 策略，30 天有效期
- 输入验证和错误处理
- SQL 注入防护（使用参数化查询）

## 📝 下一步

1. 添加邮箱验证
2. 添加密码重置功能
3. 添加 OAuth 登录（Google/GitHub）
4. 添加用户个人资料页面
5. 添加权限管理

---

_有问题随时找 Amora！✨_
