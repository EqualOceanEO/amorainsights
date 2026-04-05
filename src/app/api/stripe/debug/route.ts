import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { default: Stripe } = await import('stripe');
    const hasKey = !!process.env.STRIPE_SECRET_KEY;
    const hasPrice = !!process.env.STRIPE_PRICE_PRO_MONTHLY;
    const keyPrefix = process.env.STRIPE_SECRET_KEY?.substring(0, 7) ?? 'NOT_SET';
    
    // Try to create a Stripe instance
    let instanceOK = false;
    let createError = '';
    try {
      if (hasKey) {
        const s = new Stripe(process.env.STRIPE_SECRET_KEY!);
        instanceOK = true;
      }
    } catch (e: unknown) {
      createError = e instanceof Error ? e.message : String(e);
    }
    
    return NextResponse.json({
      status: 'ok',
      stripeLoaded: true,
      hasKey,
      hasPrice,
      keyPrefix,
      instanceOK,
      createError,
      env: Object.keys(process.env).filter(k => k.startsWith('STRIPE')).map(k => k + '=***'),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ status: 'error', message: msg }, { status: 500 });
  }
}
