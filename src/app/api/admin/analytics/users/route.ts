import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/analytics/users
 * Returns user list with activity stats for admin user management
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const page = parseInt(url.searchParams.get('page') ?? '1');
  const pageSize = parseInt(url.searchParams.get('pageSize') ?? '20');
  const search = url.searchParams.get('q') ?? '';
  const tier = url.searchParams.get('tier') ?? '';
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('users')
    .select('id, email, name, created_at, is_admin, subscription_tier, subscription_expires_at, acquisition_channel', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
  }
  if (tier) {
    query = query.eq('subscription_tier', tier);
  }

  const { data: users, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // For each user, get last seen (last page_view) + total page views + total events
  const userIds = (users ?? []).map((u) => u.id);
  const [pvData, evData] = await Promise.all([
    supabase
      .from('page_views')
      .select('user_id, created_at')
      .in('user_id', userIds)
      .order('created_at', { ascending: false }),
    supabase
      .from('user_events')
      .select('user_id, event_name, created_at')
      .in('user_id', userIds),
  ]);

  // Build stats map per user
  const pvMap: Record<number, { count: number; lastSeen: string | null }> = {};
  for (const row of pvData.data ?? []) {
    if (!pvMap[row.user_id]) pvMap[row.user_id] = { count: 0, lastSeen: null };
    pvMap[row.user_id].count++;
    if (!pvMap[row.user_id].lastSeen) pvMap[row.user_id].lastSeen = row.created_at;
  }

  const evMap: Record<number, number> = {};
  for (const row of evData.data ?? []) {
    evMap[row.user_id] = (evMap[row.user_id] ?? 0) + 1;
  }

  const enriched = (users ?? []).map((u) => ({
    ...u,
    pageViews: pvMap[u.id]?.count ?? 0,
    lastSeen: pvMap[u.id]?.lastSeen ?? null,
    totalEvents: evMap[u.id] ?? 0,
  }));

  return NextResponse.json({
    data: enriched,
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  });
}

/**
 * PATCH /api/admin/analytics/users
 * Update user fields (subscription_tier, is_admin)
 */
export async function PATCH(req: NextRequest) {
  const { id, ...updates } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  // Whitelist updatable fields
  const allowed = ['subscription_tier', 'is_admin', 'name', 'subscription_expires_at'];
  const patch: Record<string, unknown> = {};
  for (const k of allowed) {
    if (k in updates) patch[k] = updates[k];
  }

  const { error } = await supabase.from('users').update(patch).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
