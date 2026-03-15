import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? '';

/**
 * POST /api/stripe/webhook
 * Handles Stripe events to update subscriber plan status in Supabase
 */
export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
    apiVersion: '2026-02-25.clover',
  });

  const body = await req.text();
  const sig = req.headers.get('stripe-signature') ?? '';

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
  } catch (e) {
    console.error('[stripe/webhook] signature verification failed:', e);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const email = session.customer_email;
        const customerId = session.customer as string;
        if (email) {
          await supabase.from('subscribers').upsert(
            { email, stripe_customer_id: customerId, plan: 'pro', plan_status: 'active', confirmed: true },
            { onConflict: 'email' }
          );
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const status = sub.status; // active, past_due, canceled, etc.
        const plan = status === 'active' || status === 'trialing' ? 'pro' : 'basic';
        await supabase.from('subscribers')
          .update({ plan, plan_status: status })
          .eq('stripe_customer_id', customerId);
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        await supabase.from('subscribers')
          .update({ plan: 'basic', plan_status: 'canceled' })
          .eq('stripe_customer_id', customerId);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        await supabase.from('subscribers')
          .update({ plan_status: 'past_due' })
          .eq('stripe_customer_id', customerId);
        break;
      }
    }
  } catch (e) {
    console.error('[stripe/webhook] handler error:', e);
    return NextResponse.json({ error: 'Handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

