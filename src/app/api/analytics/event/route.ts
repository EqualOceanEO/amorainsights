import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/analytics/event
 * Records a named user behavior event (signup, report_view, upgrade_click, etc.)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json().catch(() => ({}));

    const {
      event_name,
      event_category,
      properties,
      path,
      session_id,
    } = body as {
      event_name: string;
      event_category?: string;
      properties?: Record<string, unknown>;
      path?: string;
      session_id?: string;
    };

    if (!event_name) return NextResponse.json({ ok: false }, { status: 400 });

    const userId = session?.user?.id ? parseInt(session.user.id) : null;

    await supabase.from('user_events').insert({
      user_id: userId,
      session_id: session_id ?? null,
      event_name,
      event_category: event_category ?? null,
      properties: properties ?? {},
      path: path ?? null,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
