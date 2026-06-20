# Amora Insights - Technical Analysis

## Executive Summary

Amora Insights is an AI-powered research insights platform built with Next.js 16 and modern web technologies. The project uses serverless architecture with Neon PostgreSQL and Supabase for backend services.

---

## Project Structure

```
amorainsights/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Homepage (/)
│   │   ├── globals.css      # Global styles
│   │   ├── about/           # About page (/about)
│   │   ├── dashboard/       # Dashboard (auth required)
│   │   ├── industries/      # Industries page
│   │   ├── login/           # Login page
│   │   ├── signup/          # Signup page
│   │   └── api/auth/        # Authentication API routes
│   ├── lib/                 # Utility libraries
│   │   ├── auth.ts          # Authentication configuration
│   │   ├── db.ts            # Database operations
│   │   └── supabase.ts      # Supabase client
│   └── middleware.ts        # Route protection middleware
├── scripts/                 # Utility scripts
│   └── init-db.ts          # Database initialization
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── .env.example            # Environment variables template
└── README.md               # Documentation
```

---

## Technology Stack

### Core Framework
- **Next.js 16.1.6** - React framework with App Router
- **React 19.2.3** - UI library
- **TypeScript 5** - Type-safe development

### Authentication & Security
- **NextAuth.js v5 (beta)** - Authentication provider
- **bcryptjs** - Password hashing (10 rounds)
- **JWT** - Session management
- **Middleware** - Route protection

### Database & Backend
- **Neon Database (PostgreSQL)** - Serverless database
- **Supabase** - Backend services integration
- **@neondatabase/serverless** - Neon client driver

### Styling & UI
- **Tailwind CSS v4** - Utility-first CSS framework
- **PostCSS** - CSS processing
- **globals.css** - Global styles

### Development Tools
- **ESLint 9** - Code linting
- **tsx 4.19.3** - TypeScript execution
- **dotenv 17.3.1** - Environment variable loading

---

## Route Architecture

### Public Routes
| Route | Description | File |
|-------|-------------|------|
| `/` | Homepage | `src/app/page.tsx` |
| `/about` | About page | `src/app/about/page.tsx` |
| `/industries` | Industries overview | `src/app/industries/page.tsx` |
| `/login` | User login | `src/app/login/page.tsx` |
| `/signup` | User registration | `src/app/signup/page.tsx` |

### Protected Routes
| Route | Description | File |
|-------|-------------|------|
| `/dashboard` | User dashboard | `src/app/dashboard/page.tsx` |

### API Routes
| Route | Description | File |
|-------|-------------|------|
| `/api/auth/*` | NextAuth endpoints | `src/app/api/auth/*` |

---

## Database Schema

### Users Table
- User account information
- Email (unique constraint)
- Password (hashed with bcrypt)
- Timestamps

### Sessions Table
- Session storage for JWT
- User association
- Expiration management

---

## Security Features

1. **Password Security**
   - bcrypt hashing with 10 salt rounds
   - Minimum 8 characters requirement

2. **Session Management**
   - JWT-based authentication
   - Secure session storage

3. **Data Validation**
   - Email uniqueness validation
   - SQL injection prevention
   - Input sanitization

4. **Route Protection**
   - Middleware-based auth checks
   - Protected dashboard routes

---

## Environment Configuration

### Required Variables
```bash
POSTGRES_URL=postgresql://user:password@host/database
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Generating Secrets
```bash
openssl rand -base64 32
```

---

## Deployment Configuration

### Vercel (Based on project context)
- Platform: Vercel
- Build Command: `npm run build`
- Output Directory: `.next`
- Environment Variables: Must be configured in Vercel dashboard

---

## Development Workflow

### Setup
```bash
npm install
cp .env.example .env
# Configure .env variables
```

### Database Initialization
```bash
npm run db:init
```

### Development Server
```bash
npm run dev
# Visit http://localhost:3000
```

### Production Build
```bash
npm run build
npm run start
```

---

## Key Considerations

### NextAuth.js v5 (Beta)
- Currently using beta version
- May have breaking changes in future releases
- Monitor for stable release

### Neon Database
- Serverless PostgreSQL
- Requires proper connection string configuration
- Auto-scaling capabilities

### Supabase Integration
- Additional backend services
- May be used for specific features (auth, storage, etc.)
- Coordinate with NextAuth usage

---

## Known Dependencies

### Critical
- Next.js 16.1.6
- React 19.2.3
- NextAuth.js v5 beta
- Neon PostgreSQL

### Development
- TypeScript 5
- Tailwind CSS v4
- ESLint 9

---

## Next Steps

1. Complete source code retrieval from GitHub
2. Set up local database with Neon
3. Configure environment variables
4. Test authentication flow
5. Verify Vercel deployment settings

---

**Analysis Date**: March 13, 2026
**Analyzer**: George (CTO - AmoraInsights)
