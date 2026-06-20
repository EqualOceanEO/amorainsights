# AMORA Insights — Component Library

## Overview

All shared components live in `src/components/`. They follow a consistent pattern:
- **'use client'** directive where needed (interactivity, hooks)
- **TypeScript interfaces** for all props
- **Tailwind CSS v4** for styling (dark theme by default)
- **Accessible** — semantic HTML + ARIA attributes where applicable

---

## Layout Components

### `SiteNav`
- **Path**: `src/components/SiteNav.tsx`
- **Type**: Client Component
- **Props**: `{ activePath?: string }`
- **Description**: Global navigation bar with industry dropdown (L1/L2 hierarchy), user menu (avatar, Pro badge, sign out), and theme toggle.
- **Dependencies**: `useAuth()`, `next-auth/react`, `@/lib/industries`

### `SiteFooter`
- **Path**: `src/components/SiteFooter.tsx`
- **Type**: Server Component
- **Props**: None
- **Description**: Three-column footer with brand, research links, company links, and legal disclaimer. Uses `role="contentinfo"` and `role="list"` for accessibility.

---

## Utility Components

### `ConfirmDialog`
- **Path**: `src/components/ConfirmDialog.tsx`
- **Type**: Client Component
- **Props**:
  ```ts
  {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;    // default: "Confirm"
    cancelLabel?: string;     // default: "Cancel"
    variant?: 'danger' | 'warning' | 'default';
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  }
  ```
- **Description**: Reusable confirmation modal with keyboard support (Escape to cancel, auto-focus on confirm button). Used in admin pages for delete operations.
- **Accessibility**: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby`

### `ThemeToggle`
- **Path**: `src/components/ThemeToggle.tsx`
- **Type**: Client Component
- **Props**: None
- **Description**: Dark/Light mode toggle button. Persists preference in `localStorage`. Renders sun/moon SVG icons. Placed in `SiteNav`.

### `AnalyticsProvider`
- **Path**: `src/components/AnalyticsProvider.tsx`
- **Type**: Client Component (wrapped in `<Suspense>`)
- **Description**: Tracks pageviews and custom events. Uses `sessionStorage` for session ID and UTM params. Integrates with Vercel Analytics and Speed Insights.

### `EventBeacon`
- **Path**: `src/components/EventBeacon.tsx`
- **Type**: Client Component
- **Description**: Lightweight event tracking emitter for custom analytics events.

---

## Content Components

### `PremiumWall`
- **Path**: `src/components/PremiumWall.tsx`
- **Type**: Client Component
- **Props**: `{ variant: 'news' | 'report' | 'company'; compact?: boolean; slug?: string }`
- **Description**: Paywall overlay. Auto-detects user session and Pro status. Pro users see nothing (returns `null`). Free/guest users see blurred preview + upgrade CTA ($19.9/month).

### `ChartBlock`
- **Path**: `src/components/ChartBlock.tsx`
- **Type**: Client Component
- **Props**: `{ option: EChartsOption; title?: string; height?: number }`
- **Description**: Adaptive chart component. Pro/Enterprise users get full ECharts interactive charts with PNG export. Free users see a static SVG ghost preview with lock overlay.

### `H5ReportViewer`
- **Path**: `src/components/H5ReportViewer.tsx`
- **Type**: Client Component
- **Props**: `{ htmlContent: string }`
- **Description**: Sandboxed iframe renderer for H5/HTML format reports. Uses `srcdoc` for security.

### `ReadingProgress`
- **Path**: `src/components/ReadingProgress.tsx`
- **Type**: Client Component
- **Props**: None
- **Description**: Fixed position reading progress bar at the top of the viewport. Uses `scroll` event listener.

### `SubscribeBox`
- **Path**: `src/components/SubscribeBox.tsx`
- **Type**: Client Component
- **Props**: `{ source: string; compact?: boolean }`
- **Description**: Email subscription form with multi-state handling (logged out, logged in, already subscribed, Pro). Posts to `/api/subscribe`.

### `ShareBar`
- **Path**: `src/components/ShareBar.tsx`
- **Type**: Client Component
- **Props**: `{ url: string; title: string }`
- **Description**: Social sharing buttons (Twitter/X, LinkedIn, Facebook, Reddit, WhatsApp, Email, Copy Link).

### `IndustryFilterBar`
- **Path**: `src/components/IndustryFilterBar.tsx`
- **Type**: Client Component
- **Props**: `{ selectedL1?: string; selectedL2?: string; onL1Change, onL2Change }`
- **Description**: Two-level industry filter bar (L1 category tabs → L2 sub-sector chips).

---

## Page Templates

### `loading.tsx`
- **Path**: `src/app/loading.tsx`
- **Description**: Global loading skeleton with spinning border + pulsing text.

### `error.tsx`
- **Path**: `src/app/error.tsx`
- **Description**: Global error boundary with error digest, retry button, and home link.

### `not-found.tsx`
- **Path**: `src/app/not-found.tsx`
- **Description**: 404 page with large "404" display and home link.

---

## Route Protection

### `src/proxy.ts`
- **Path**: `src/proxy.ts`
- **Description**: Cookie-based middleware. Protects `/dashboard` and `/admin` routes. Redirects unauthenticated users to `/login` with `callbackUrl`.

### Admin Layout
- **Path**: `src/app/admin/layout.tsx`
- **Description**: Checks `isAdmin` role via `auth()`. Non-admin users redirected to `/403`.

### Dashboard Layout
- **Path**: `src/app/dashboard/layout.tsx`
- **Description**: Checks authentication via `auth()`. Unauthenticated users redirected to `/login`.

---

## API Routes

All API routes are under `src/app/api/`. Key endpoints:

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/auth/register` | POST | Public (rate-limited) | User registration |
| `/api/auth/[...nextauth]` | * | Public | NextAuth v5 handler |
| `/api/auth/session` | GET | Public | Session info |
| `/api/subscribe` | POST | Public (rate-limited) | Newsletter subscription |
| `/api/stripe/checkout` | POST | Auth required | Create Stripe checkout |
| `/api/stripe/webhook` | POST | Stripe signature | Stripe event handler |
| `/api/news` | GET | Public | News list (paginated) |
| `/api/companies` | GET | Public | Company list |
| `/api/admin/*` | * | Admin only | Admin CRUD operations |

### Security Features
- **Rate Limiting**: In-memory per-IP on `/api/auth/register` (5 req/min) and `/api/subscribe` (10 req/min)
- **CSRF Protection**: Origin/Referer validation on `/api/auth/register`
- **Password Hashing**: bcrypt with cost factor 12 (server-side only)

---

## State Management

### `AuthContext`
- **Path**: `src/context/AuthContext.tsx`
- **Provides**: `{ user, loading, refresh }`
- **Hook**: `useAuth()`
- **Description**: Client-side auth state. Fetches session from `/api/auth/session` and cross-checks subscription tier from `/api/user/tier` to avoid stale JWT cache.

---

## Database Layer

### `src/lib/db.ts`
- **Exports**: `supabase` client, all TypeScript types, CRUD functions
- **Key types**: `User`, `Report`, `NewsItem`, `Company`, `IndustrySlug`, `ComplianceTier`, `GeoRiskTier`
- **Key functions**: `createUser`, `getUserByEmail`, `getReports`, `getCompanies`, `getDashboardStats`

### `src/lib/auth.ts`
- **Exports**: `handlers`, `signIn`, `signOut`, `auth`
- **Strategy**: NextAuth v5 with JWT sessions + credentials provider
- **JWT Claims**: `subscriptionTier`, `isAdmin`

---

## SEO

| File | Purpose |
|------|---------|
| `src/app/robots.ts` | Robots.txt — allows all, disallows `/dashboard/`, `/admin/`, `/api/` |
| `src/app/sitemap.ts` | XML sitemap — static routes with priority/change frequency |
| `src/app/layout.tsx` | Global metadata: `metadataBase`, OG images, Twitter cards, robots directives |
