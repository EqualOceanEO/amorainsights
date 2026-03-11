# Amora Insights

AI-powered research insights platform.

## User System Features

✅ **Complete Authentication System**

- User registration with email/password
- Secure login with bcrypt password hashing
- JWT-based sessions (30-day expiry)
- Protected dashboard route
- Sign out functionality

### Tech Stack

- **Framework:** Next.js 16 with App Router
- **Auth:** NextAuth.js v5 (beta)
- **Database:** Neon Database (PostgreSQL serverless)
- **Password Hashing:** bcryptjs
- **Styling:** Tailwind CSS v4

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

**Required variables:**

- `POSTGRES_URL` - Your Neon Database connection string
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL` - Your app URL (use `http://localhost:3000` for dev)

### 3. Initialize Database

The database tables will be created automatically on first run. Tables created:

- `users` - User accounts (id, name, email, password_hash, timestamps)
- `sessions` - Session storage (for future use)

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Routes

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Home page | No |
| `/login` | Sign in page | No |
| `/signup` | Registration page | No |
| `/dashboard` | User dashboard | **Yes** |
| `/api/auth/signup` | Registration API | No |
| `/api/auth/[...nextauth]` | NextAuth handlers | No |

## User Flow

1. **Sign Up** → User creates account with name, email, password
2. **Login** → User signs in with credentials
3. **Dashboard** → Redirected to protected dashboard
4. **Sign Out** → User can log out from dashboard

## Security Features

- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT sessions with secure secrets
- ✅ SQL injection prevention (parameterized queries)
- ✅ Email uniqueness validation
- ✅ Password minimum length (8 chars)
- ✅ Protected routes via middleware

## Next Steps

- [ ] Email verification
- [ ] Password reset flow
- [ ] OAuth providers (Google, GitHub)
- [ ] User profile editing
- [ ] Subscription/payment integration
- [ ] Admin dashboard
