import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/subscribers/list
 * Returns paginated subscriber list for admin UI
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const page = parseInt(url.searchParams.get('page') ?? '1');
  const pageSize = 30;
  const search = url.searchParams.get('q') ?? '';
  const filter = url.searchParams.get('filter') ?? 'all';
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('subscribers')
    .select('id, email, source, confirmed, unsubscribed, subscribed_at', { count: 'exact' })
    .order('subscribed_at', { ascending: false })
    .range(from, to);

  if (search) query = query.ilike('email', `%${search}%`);
  if (filter === 'confirmed') query = query.eq('confirmed', true).eq('unsubscribed', false);
  if (filter === 'unsubscribed') query = query.eq('unsubscribed', true);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    data: data ?? [],
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  });
}
