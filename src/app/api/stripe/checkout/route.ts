import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXTAUTH_URL ?? 'https://amorainsights.com';

// Price IDs — set these in Stripe dashboard and add to env vars
const PRICES = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? '',   // $14.9/month
  pro_annual: process.env.STRIPE_PRICE_PRO_ANNUAL ?? '',     // $99/year
};

/**
 * POST /api/stripe/checkout
 * Body: { email: string, plan: 'pro_monthly' | 'pro_annual' }
 * Returns: { url: string } — Stripe Checkout session URL
 */
export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
    apiVersion: '2026-02-25.clover',
  });

  // Quick env check
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY env var.' }, { status: 500 });
  }

  try {
    const { email, plan } = await req.json();

    if (!email || !plan) {
      return NextResponse.json({ error: 'Missing email or plan' }, { status: 400 });
    }

    const priceId = PRICES[plan as keyof typeof PRICES];
    if (!priceId) {
      return NextResponse.json({ error: `Unknown plan: ${plan}. Set STRIPE_PRICE_${plan.toUpperCase()} env var.` }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${SITE_URL}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/subscribe/pro`,
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

