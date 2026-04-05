import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/stripe/verify?session_id=xxx
 * After checkout success, verify the session and activate the user's Pro tier.
 */
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id');
  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  try {
    const { default: StripeSDK } = await import('stripe');
    const stripe = new StripeSDK(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'subscription'],
    });

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed', paid: false });
    }

    const email = session.customer_email || (session.customer as any)?.email;
    const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;

    if (!email) {
      return NextResponse.json({ error: 'No email found on session' }, { status: 400 });
    }

    // Update subscribers table
    await supabase.from('subscribers').upsert(
      { email, stripe_customer_id: customerId, plan: 'pro', plan_status: 'active', confirmed: true },
      { onConflict: 'email' }
    );

    // Update users table subscription tier
    const { error } = await supabase
      .from('users')
      .update({ subscription_tier: 'pro' })
      .eq('email', email);

    return NextResponse.json({
      success: true,
      email,
      paid: true,
      dbUpdated: !error,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[stripe/verify] error:', e);
    return NextResponse.json({ error: `Verification failed: ${msg}` }, { status: 500 });
  }
}
