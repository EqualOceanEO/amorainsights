import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/analytics/overview
 * Returns site-wide analytics summary for the admin dashboard
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const days = parseInt(url.searchParams.get('days') ?? '30');
  const since = new Date(Date.now() - days * 86400_000).toISOString();

  const [
    pvTotal,
    pvUnique,
    userCount,
    eventCount,
    topPages,
    dailyPvs,
    deviceBreakdown,
    countryBreakdown,
    topEvents,
    funnelData,
  ] = await Promise.all([
    // Total page views in period
    supabase
      .from('page_views')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', since),

    // Unique sessions in period — query directly to avoid RPC dependency
    supabase
      .from('page_views')
      .select('session_id')
      .gte('created_at', since)
      .not('session_id', 'is', null),

    // Total registered users
    supabase
      .from('users')
      .select('id', { count: 'exact', head: true }),

    // Total events in period
    supabase
      .from('user_events')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', since),

    // Top 10 pages
    supabase
      .from('page_views')
      .select('path')
      .gte('created_at', since)
      .limit(5000),

    // Daily page views (last N days)
    supabase
      .from('page_views')
      .select('created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: true }),

    // Device breakdown
    supabase
      .from('page_views')
      .select('device_type')
      .gte('created_at', since),

    // Country breakdown
    supabase
      .from('page_views')
      .select('country')
      .gte('created_at', since)
      .limit(5000),

    // Top events
    supabase
      .from('user_events')
      .select('event_name')
      .gte('created_at', since)
      .limit(5000),

    // Funnel: signup → first_login → report_view → upgrade_click
    supabase
      .from('user_events')
      .select('event_name, user_id')
      .in('event_name', ['user_registered', 'user_login', 'report_view', 'upgrade_click'])
      .gte('created_at', since),
  ]);

  // --- Unique sessions (counted client-side from the session_id column) ---
  const uniqueSessionsCount = new Set(
    (pvUnique.data ?? []).map((r: { session_id: string }) => r.session_id)
  ).size;

  // --- Aggregate top pages ---
  const pageCounts: Record<string, number> = {};
  for (const row of topPages.data ?? []) {
    pageCounts[row.path] = (pageCounts[row.path] ?? 0) + 1;
  }
  const topPagesList = Object.entries(pageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([path, views]) => ({ path, views }));

  // --- Daily PV series ---
  const dayCounts: Record<string, number> = {};
  for (const row of dailyPvs.data ?? []) {
    const day = row.created_at.slice(0, 10);
    dayCounts[day] = (dayCounts[day] ?? 0) + 1;
  }
  // Fill all days in range
  const dailySeries: { date: string; views: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400_000).toISOString().slice(0, 10);
    dailySeries.push({ date: d, views: dayCounts[d] ?? 0 });
  }

  // --- Device breakdown ---
  const deviceCounts: Record<string, number> = {};
  for (const row of deviceBreakdown.data ?? []) {
    const k = row.device_type ?? 'unknown';
    deviceCounts[k] = (deviceCounts[k] ?? 0) + 1;
  }

  // --- Country breakdown ---
  const countryCounts: Record<string, number> = {};
  for (const row of countryBreakdown.data ?? []) {
    const k = row.country ?? 'Unknown';
    countryCounts[k] = (countryCounts[k] ?? 0) + 1;
  }
  const topCountries = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([country, views]) => ({ country, views }));

  // --- Top events ---
  const eventCounts: Record<string, number> = {};
  for (const row of topEvents.data ?? []) {
    eventCounts[row.event_name] = (eventCounts[row.event_name] ?? 0) + 1;
  }
  const topEventsList = Object.entries(eventCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  // --- Funnel ---
  const funnelSteps = ['user_registered', 'user_login', 'report_view', 'upgrade_click'];
  const funnelCounts: Record<string, Set<string | number>> = {};
  for (const step of funnelSteps) funnelCounts[step] = new Set();
  for (const row of funnelData.data ?? []) {
    if (funnelSteps.includes(row.event_name)) {
      funnelCounts[row.event_name].add(row.user_id ?? row.event_name + '_anon');
    }
  }
  const funnel = funnelSteps.map((step) => ({
    step,
    label: step.replace(/_/g, ' '),
    users: funnelCounts[step].size,
  }));

  return NextResponse.json({
    summary: {
      totalPageViews: pvTotal.count ?? 0,
      uniqueSessions: uniqueSessionsCount,
      totalUsers: userCount.count ?? 0,
      totalEvents: eventCount.count ?? 0,
    },
    topPages: topPagesList,
    dailySeries,
    deviceBreakdown: deviceCounts,
    topCountries,
    topEvents: topEventsList,
    funnel,
    periodDays: days,
  });
}
