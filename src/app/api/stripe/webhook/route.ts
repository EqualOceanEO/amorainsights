import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? '';

/**
 * POST /api/stripe/webhook
 * Handles Stripe events to update subscriber plan status in Supabase
 * Also updates users.subscription_tier for auth session
 */
export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '');

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
          // Update subscribers table
          await supabase.from('subscribers').upsert(
            { email, stripe_customer_id: customerId, plan: 'pro', plan_status: 'active', confirmed: true },
            { onConflict: 'email' }
          );

          // Update users table subscription tier
          await supabase
            .from('users')
            .update({ subscription_tier: 'pro' })
            .eq('email', email);
        }

        // Also try to update by stripe_customer_id
        if (customerId) {
          const { data: subscriber } = await supabase
            .from('subscribers')
            .select('email')
            .eq('stripe_customer_id', customerId)
            .maybeSingle();

          if (subscriber?.email) {
            await supabase
              .from('users')
              .update({ subscription_tier: 'pro' })
              .eq('email', subscriber.email);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const status = sub.status; // active, past_due, canceled, etc.
        const plan = status === 'active' || status === 'trialing' ? 'pro' : 'basic';
        const tier = plan === 'pro' ? 'pro' : 'free';

        await supabase.from('subscribers')
          .update({ plan, plan_status: status })
          .eq('stripe_customer_id', customerId);

        // Sync to users table
        const { data: subscriber } = await supabase
          .from('subscribers')
          .select('email')
          .eq('stripe_customer_id', customerId)
          .maybeSingle();

        if (subscriber?.email) {
          await supabase
            .from('users')
            .update({ subscription_tier: tier })
            .eq('email', subscriber.email);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        await supabase.from('subscribers')
          .update({ plan: 'basic', plan_status: 'canceled' })
          .eq('stripe_customer_id', customerId);

        // Downgrade user
        const { data: subscriber } = await supabase
          .from('subscribers')
          .select('email')
          .eq('stripe_customer_id', customerId)
          .maybeSingle();

        if (subscriber?.email) {
          await supabase
            .from('users')
            .update({ subscription_tier: 'free' })
            .eq('email', subscriber.email);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        await supabase.from('subscribers')
          .update({ plan_status: 'past_due' })
          .eq('stripe_customer_id', customerId);

        // Don't immediately downgrade — let Stripe retry
        break;
      }
    }
  } catch (e) {
    console.error('[stripe/webhook] handler error:', e);
    return NextResponse.json({ error: 'Handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
