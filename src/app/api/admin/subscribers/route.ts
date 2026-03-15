import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET;

/**
 * GET /api/admin/subscribers?secret=xxx
 * Returns subscriber stats grouped by source
 */
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (!INTERNAL_API_SECRET || secret !== INTERNAL_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('subscribers')
    .select('source, confirmed, unsubscribed, subscribed_at')
    .order('subscribed_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Aggregate by source
  const bySource: Record<string, { total: number; confirmed: number; unsubscribed: number }> = {};
  let totalConfirmed = 0;
  let totalUnsub = 0;

  for (const row of data ?? []) {
    const src = row.source ?? 'unknown';
    if (!bySource[src]) bySource[src] = { total: 0, confirmed: 0, unsubscribed: 0 };
    bySource[src].total++;
    if (row.confirmed) { bySource[src].confirmed++; totalConfirmed++; }
    if (row.unsubscribed) { bySource[src].unsubscribed++; totalUnsub++; }
  }

  // Daily signups (last 14 days)
  const daily: Record<string, number> = {};
  for (const row of data ?? []) {
    const day = row.subscribed_at?.slice(0, 10);
    if (day) daily[day] = (daily[day] ?? 0) + 1;
  }

  return NextResponse.json({
    total: data?.length ?? 0,
    confirmed: totalConfirmed,
    unsubscribed: totalUnsub,
    active: (data?.length ?? 0) - totalUnsub,
    by_source: bySource,
    daily_signups: Object.entries(daily)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 14)
      .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {}),
  });
}
