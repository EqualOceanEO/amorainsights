import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET;

// Auth helper — secret OR admin session
async function requireAdmin(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (INTERNAL_API_SECRET && secret === INTERNAL_API_SECRET) return true;
  const session = await auth();
  if (!session?.user) return { error: 'Unauthorized', status: 401 };
  const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin ?? false;
  if (!isAdmin) return { error: 'Admin access required', status: 403 };
  return true;
}

/**
 * GET /api/admin/subscribers/list
 * Returns paginated subscriber list for admin UI
 * Auth: INTERNAL_API_SECRET OR admin session
 */
export async function GET(req: NextRequest) {
  const authResult = await requireAdmin(req);
  if (authResult !== true) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const url = req.nextUrl;
  const page = parseInt(url.searchParams.get('page') ?? '1');
  const pageSize = 30;
  const search = url.searchParams.get('q') ?? '';
  const filter = url.searchParams.get('filter') ?? 'all';
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('subscribers')
    .select(
      'id, email, source, confirmed, confirmed_at, unsubscribed, subscribed_at, plan, plan_status, stripe_customer_id',
      { count: 'exact' }
    )
    .order('subscribed_at', { ascending: false })
    .range(from, to);

  if (search) query = query.ilike('email', `%${search}%`);
  if (filter === 'confirmed') query = query.eq('confirmed', true).eq('unsubscribed', false);
  if (filter === 'unsubscribed') query = query.eq('unsubscribed', true);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Batch-lookup users by email to add user info (name, subscription_tier)
  const emails = (data ?? []).map((r: { email: string }) => r.email);
  let userMap: Record<string, { id: number; name: string | null; subscription_tier: string }> = {};
  if (emails.length > 0) {
    // Supabase supports `in` filter for up to ~100 items per batch
    // For larger sets, we chunk but for now 30 per page is safe
    const { data: users } = await supabase
      .from('users')
      .select('id, email, name, subscription_tier')
      .in('email', emails);
    if (users) {
      for (const u of users) {
        userMap[u.email] = { id: u.id, name: u.name, subscription_tier: u.subscription_tier ?? 'free' };
      }
    }
  }

  const enriched = (data ?? []).map((r: Record<string, unknown>) => ({
    ...r,
    user: userMap[(r.email as string)] ?? null,
  }));

  return NextResponse.json({
    data: enriched,
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  });
}
