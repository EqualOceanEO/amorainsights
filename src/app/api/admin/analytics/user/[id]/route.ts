import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/analytics/user/[id]
 * Returns a single user's full lifecycle journey:
 *   - profile
 *   - page view history
 *   - event timeline
 *   - session map
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = parseInt(id);
  if (isNaN(userId)) return NextResponse.json({ error: 'invalid id' }, { status: 400 });

  const [userRes, pvRes, evRes] = await Promise.all([
    supabase
      .from('users')
      .select('id, email, name, created_at, is_admin, subscription_tier, subscription_expires_at, acquisition_channel, conversion_last_touch, last_content_slug')
      .eq('id', userId)
      .maybeSingle(),

    supabase
      .from('page_views')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(500),

    supabase
      .from('user_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(500),
  ]);

  if (!userRes.data) return NextResponse.json({ error: 'user not found' }, { status: 404 });

  // Build session groups from page_views
  const sessionMap: Record<string, { pages: typeof pvRes.data; start: string; end: string }> = {};
  for (const pv of pvRes.data ?? []) {
    const sid = pv.session_id ?? 'unknown';
    if (!sessionMap[sid]) {
      sessionMap[sid] = { pages: [], start: pv.created_at, end: pv.created_at };
    }
    sessionMap[sid].pages!.push(pv);
    if (pv.created_at < sessionMap[sid].start) sessionMap[sid].start = pv.created_at;
    if (pv.created_at > sessionMap[sid].end) sessionMap[sid].end = pv.created_at;
  }

  // Merge timeline: both page_views and events sorted by time
  const pvTimeline = (pvRes.data ?? []).map((pv) => ({
    type: 'pageview' as const,
    time: pv.created_at,
    path: pv.path,
    referrer: pv.referrer,
    device: pv.device_type,
    country: pv.country,
    session_id: pv.session_id,
    duration_sec: pv.duration_sec,
  }));
  const evTimeline = (evRes.data ?? []).map((ev) => ({
    type: 'event' as const,
    time: ev.created_at,
    event_name: ev.event_name,
    event_category: ev.event_category,
    properties: ev.properties,
    path: ev.path,
    session_id: ev.session_id,
  }));
  const timeline = [...pvTimeline, ...evTimeline].sort(
    (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
  );

  // Stats summary
  const totalPvs = pvRes.data?.length ?? 0;
  const totalEvents = evRes.data?.length ?? 0;
  const sessionCount = Object.keys(sessionMap).length;
  const lastSeen = pvRes.data?.[0]?.created_at ?? evRes.data?.[0]?.created_at ?? null;
  const firstSeen = pvRes.data?.length
    ? [...pvRes.data].sort((a, b) => a.created_at.localeCompare(b.created_at))[0].created_at
    : null;

  // Top pages for this user
  const pathCounts: Record<string, number> = {};
  for (const pv of pvRes.data ?? []) {
    pathCounts[pv.path] = (pathCounts[pv.path] ?? 0) + 1;
  }
  const topPages = Object.entries(pathCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([path, count]) => ({ path, count }));

  return NextResponse.json({
    user: userRes.data,
    stats: { totalPvs, totalEvents, sessionCount, lastSeen, firstSeen },
    topPages,
    timeline: timeline.slice(0, 200), // return latest 200
    sessions: Object.entries(sessionMap).map(([sid, s]) => ({
      session_id: sid,
      start: s.start,
      end: s.end,
      pageCount: s.pages?.length ?? 0,
    })).sort((a, b) => b.start.localeCompare(a.start)).slice(0, 50),
  });
}
