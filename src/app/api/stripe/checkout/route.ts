import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXTAUTH_URL ?? 'https://amorainsights.com';

/**
 * POST /api/stripe/checkout
 * Body: { email: string, plan: 'pro_monthly' | 'pro_annual' }
 * Returns: { url: string } — Stripe Checkout session URL
 */
export async function POST(req: NextRequest) {
  // Import Stripe inside the handler to catch module load errors
  let Stripe;
  try {
    Stripe = (await import('stripe')).default;
  } catch (e) {
    console.error('[stripe/checkout] Failed to import Stripe:', e);
    return NextResponse.json({ error: 'Stripe SDK failed to load' }, { status: 500 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'STRIPE_SECRET_KEY not configured' }, { status: 500 });
  }

  const PRICES: Record<string, string> = {
    pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? '',
    pro_annual: process.env.STRIPE_PRICE_PRO_ANNUAL ?? '',
  };

  try {
    const { email, plan } = await req.json();

    if (!email || !plan) {
      return NextResponse.json({ error: 'Missing email or plan' }, { status: 400 });
    }

    const priceId = PRICES[plan];
    if (!priceId) {
      return NextResponse.json({ error: `Unknown plan: ${plan}` }, { status: 400 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${SITE_URL}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/pricing`,
      metadata: { plan, source: 'web_checkout' },
      subscription_data: {
        metadata: { plan },
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    console.error('[stripe/checkout] error:', e);
    return NextResponse.json({ error: `Checkout failed: ${msg}` }, { status: 500 });
  }
}
