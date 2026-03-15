import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/analytics/pageview
 * Records a page view event. Called client-side on every navigation.
 * Intentionally permissive — never 500 to the client.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json().catch(() => ({}));

    const {
      path,
      referrer,
      session_id,
      utm_source,
      utm_medium,
      utm_campaign,
      duration_sec,
    } = body as Record<string, string | number>;

    if (!path) return NextResponse.json({ ok: false }, { status: 400 });

    // Basic device/browser detection from UA
    const ua = req.headers.get('user-agent') ?? '';
    const device_type = /mobile|android|iphone|ipad/i.test(ua)
      ? 'mobile'
      : /tablet/i.test(ua)
      ? 'tablet'
      : 'desktop';
    const browser = /edg/i.test(ua)
      ? 'Edge'
      : /chrome/i.test(ua)
      ? 'Chrome'
      : /safari/i.test(ua)
      ? 'Safari'
      : /firefox/i.test(ua)
      ? 'Firefox'
      : 'Other';

    // IP hashing (privacy-safe — no raw IP stored)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '';
    const ip_hash = ip
      ? Buffer.from(ip).toString('base64').slice(0, 16)
      : null;

    // Country from Vercel's CDN header
    const country = req.headers.get('x-vercel-ip-country') ?? null;

    const userId = session?.user?.id ? parseInt(session.user.id) : null;

    await supabase.from('page_views').insert({
      user_id: userId,
      session_id: session_id ?? null,
      path: String(path),
      referrer: referrer ? String(referrer) : null,
      utm_source: utm_source ? String(utm_source) : null,
      utm_medium: utm_medium ? String(utm_medium) : null,
      utm_campaign: utm_campaign ? String(utm_campaign) : null,
      country,
      device_type,
      browser,
      ip_hash,
      duration_sec: duration_sec ? Number(duration_sec) : null,
    });

    return NextResponse.json({ ok: true });
  } catch {
    // Silently swallow — analytics should never break the product
    return NextResponse.json({ ok: false });
  }
}
