import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/orders
 * Params: page, pageSize, status, email, sync (bool)
 * 
 * If sync=true: fetch latest invoices from Stripe, upsert into orders table, then return list.
 * Otherwise: return paginated list from local orders table.
 */
export async function GET(req: NextRequest) {
  // Auth check
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin ?? false;
  if (!isAdmin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const url = req.nextUrl;
  const page = parseInt(url.searchParams.get('page') ?? '1');
  const pageSize = parseInt(url.searchParams.get('pageSize') ?? '30');
  const status = url.searchParams.get('status') ?? '';
  const email = url.searchParams.get('email') ?? '';
  const doSync = url.searchParams.get('sync') === 'true';

  // ── Sync from Stripe if requested ──────────────────────────────
  if (doSync) {
    try {
      const syncResult = await syncStripeInvoices();
      // Continue to return the list after sync
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('[admin/orders] Stripe sync error:', msg);
      // Don't fail the whole request — return what we have locally
    }
  }

  // ── Query local orders table ──────────────────────────────────
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);
  if (email) query = query.ilike('email', `%${email}%`);

  const { data, error, count } = await query.range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get summary stats
  const { count: totalCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'paid');

  const { data: revenueData } = await supabase
    .from('orders')
    .select('amount_usd')
    .eq('status', 'paid');

  const totalRevenue = (revenueData ?? []).reduce((sum, r) => sum + (Number(r.amount_usd) || 0), 0);

  const { count: activeSubs } = await supabase
    .from('orders')
    .select('stripe_subscription_id', { count: 'exact', head: true })
    .not('stripe_subscription_id', 'is', null)
    .eq('status', 'paid');

  return NextResponse.json({
    data: data ?? [],
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
    stats: {
      paidOrders: totalCount ?? 0,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      activeSubscriptions: activeSubs ?? 0,
    },
  });
}

/**
 * Fetch all invoices from Stripe and upsert into orders table.
 * Only pulls invoices from the last 90 days to avoid excessive API calls.
 */
async function syncStripeInvoices() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }

  const { default: StripeSDK } = await import('stripe');
  const stripe = new StripeSDK(process.env.STRIPE_SECRET_KEY);

  let synced = 0;
  let hasMore = true;
  let startingAfter: string | undefined;

  // Only sync last 90 days
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  while (hasMore) {
    const params: Record<string, unknown> = {
      limit: 100,
      created: { gte: Math.floor(ninetyDaysAgo.getTime() / 1000) },
    };
    if (startingAfter) params.starting_after = startingAfter;

    const invoices = await stripe.invoices.list(params as any);

    for (const rawInv of invoices.data) {
      // Stripe TS SDK types lag behind the API; cast to access runtime fields
      const inv = rawInv as any;

      const email = inv.customer_email
        ?? (typeof inv.customer === 'object' ? inv.customer?.email : null)
        ?? '';

      if (!email) continue;

      const customerId = typeof inv.customer === 'string' ? inv.customer : inv.customer?.id ?? '';

      const amountUsd = inv.total > 0 ? (inv.total / 100) : 0;
      const status = inv.status === 'paid' ? 'paid'
        : inv.status === 'void' ? 'voided'
        : inv.status === 'uncollectible' ? 'uncollectible'
        : inv.status ?? 'draft';

      // Stripe TS SDK may use status_transitions.paid_at or legacy paid_at
      const paidAtTimestamp = inv.status_transitions?.paid_at ?? inv.paid_at ?? null;
      const paidAt = inv.status === 'paid' && paidAtTimestamp
        ? new Date(paidAtTimestamp * 1000).toISOString()
        : null;

      const billingPeriod = inv.billing_reason === 'subscription_create' ? 'first'
        : inv.billing_reason === 'subscription_cycle' ? 'recurring'
        : inv.billing_reason === 'subscription_update' ? 'upgrade'
        : inv.billing_reason ?? null;

      const description = inv.lines.data.length > 0
        ? inv.lines.data.map((l: any) => l.description).filter(Boolean).join(', ')
        : null;

      const firstLine = inv.lines.data[0];
      const plan = firstLine?.plan?.nickname ?? firstLine?.plan?.id
        ?? firstLine?.price?.nickname ?? firstLine?.price?.id
        ?? null;

      // Upsert by stripe_invoice_id
      const { error } = await supabase.from('orders').upsert(
        {
          stripe_invoice_id: inv.id,
          stripe_subscription_id: inv.subscription as string ?? null,
          stripe_customer_id: customerId || null,
          email: email.toLowerCase(),
          amount_usd: amountUsd,
          currency: inv.currency ?? 'usd',
          status,
          plan,
          billing_period: billingPeriod,
          paid_at: paidAt,
          hosted_invoice_url: inv.hosted_invoice_url ?? null,
          description,
        },
        { onConflict: 'stripe_invoice_id' }
      );

      if (!error) synced++;
    }

    hasMore = invoices.has_more;
    startingAfter = invoices.data.length > 0
      ? invoices.data[invoices.data.length - 1].id
      : undefined;
  }

  return { synced };
}
