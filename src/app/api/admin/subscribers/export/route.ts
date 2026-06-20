import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET;

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
 * GET /api/admin/subscribers/export
 * Export all subscribers as CSV
 * Auth: INTERNAL_API_SECRET OR admin session
 */
export async function GET(req: NextRequest) {
  const authResult = await requireAdmin(req);
  if (authResult !== true) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { data, error } = await supabase
    .from('subscribers')
    .select('*')
    .order('subscribed_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const headers = [
    'id', 'email', 'source', 'confirmed', 'confirmed_at',
    'unsubscribed', 'subscribed_at', 'plan', 'plan_status', 'stripe_customer_id'
  ];

  const rows = (data ?? []).map((r: Record<string, unknown>) =>
    headers.map((h) => {
      const val = r[h];
      if (val === null || val === undefined) return '';
      if (typeof val === 'boolean') return val ? 'true' : 'false';
      return String(val).replace(/"/g, '""');
    }).map((v) => `"${v}"`).join(',')
  );

  const csv = [headers.join(','), ...rows].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
