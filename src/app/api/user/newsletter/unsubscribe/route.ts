import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * POST /api/user/newsletter/unsubscribe
 * Unsubscribe current user from newsletter
 */
export async function POST() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const email = session.user.email;

  const { error } = await supabase
    .from('subscribers')
    .update({ unsubscribed: true })
    .eq('email', email);

  if (error) {
    console.error('[user/newsletter/unsubscribe] error:', error);
    return NextResponse.json({ error: 'Failed to unsubscribe.' }, { status: 500 });
  }

  return NextResponse.json({ status: 'unsubscribed' });
}

/**
 * DELETE /api/user/newsletter/unsubscribe
 * Re-subscribe (opt back in)
 */
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const email = session.user.email;

  // First check if subscriber record exists
  const { data: existing } = await supabase
    .from('subscribers')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (!existing) {
    // Create subscriber record
    const { error } = await supabase
      .from('subscribers')
      .insert({
        email,
        source: 'dashboard',
        confirmed: true,
        confirmed_at: new Date().toISOString(),
        unsubscribed: false,
      });

    if (error) {
      console.error('[user/newsletter/resubscribe] error:', error);
      return NextResponse.json({ error: 'Failed to subscribe.' }, { status: 500 });
    }

    return NextResponse.json({ status: 'subscribed' });
  }

  // Update existing record
  const { error } = await supabase
    .from('subscribers')
    .update({
      unsubscribed: false,
      confirmed: true,
      confirmed_at: new Date().toISOString(),
    })
    .eq('email', email);

  if (error) {
    console.error('[user/newsletter/resubscribe] error:', error);
    return NextResponse.json({ error: 'Failed to re-subscribe.' }, { status: 500 });
  }

  return NextResponse.json({ status: 'resubscribed' });
}
