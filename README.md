# Amora Insights

AI-powered research insights platform.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Authentication**: NextAuth.js v5 (beta)
- **Database**: Neon Database (PostgreSQL serverless)
- **Password Encryption**: bcryptjs
- **Styling**: Tailwind CSS v4
- **Backend**: Supabase

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
```bash
cp .env.example .env
```

Required environment variables:
- `POSTGRES_URL` - Neon database connection string
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL` - App URL (use `http://localhost:3000` for development)

### 3. Database Initialization
Database tables will be automatically created on first run:
- `users` table - User account information
- `sessions` table - Session storage

### 4. Start Development Server
```bash
npm run dev
```

Visit http://localhost:3000

## Routes
- `/` - Homepage (no auth required)
- `/login` - Login page (no auth required)
- `/signup` - Signup page (no auth required)
- `/dashboard` - User dashboard (auth required)
- `/about` - About page
- `/industries` - Industries page
- `/api/auth/...` - Authentication API routes

## Security Features
- bcrypt password encryption (10 rounds)
- JWT session management
- SQL injection protection
- Email uniqueness validation
- Minimum password length (8 characters)
- Route protection middleware
