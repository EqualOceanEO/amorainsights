import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabase, getUserByEmail } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

/**
 * GET /api/user/profile
 * Returns current user's profile + subscription info
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await getUserByEmail(session.user.email);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Check subscriber status
  const { data: subscriber } = await supabase
    .from('subscribers')
    .select('id, email, confirmed, unsubscribed, subscribed_at, source')
    .eq('email', user.email)
    .maybeSingle();

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.created_at,
    subscriptionTier: user.subscription_tier ?? 'free',
    subscriptionExpiresAt: user.subscription_expires_at,
    newsletter: subscriber
      ? {
          subscribed: true,
          confirmed: subscriber.confirmed,
          unsubscribed: subscriber.unsubscribed,
          subscribedAt: subscriber.subscribed_at,
          source: subscriber.source,
        }
      : {
          subscribed: false,
          confirmed: false,
          unsubscribed: false,
          subscribedAt: null,
          source: null,
        },
  });
}

/**
 * PATCH /api/user/profile
 * Update user profile (name, password)
 */
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await getUserByEmail(session.user.email);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  try {
    const body = await req.json();
    const updates: Record<string, unknown> = {};

    // Update display name
    if (body.name !== undefined) {
      const name = String(body.name).trim().slice(0, 100);
      updates.name = name || null;
    }

    // Update password (requires current password)
    if (body.newPassword) {
      if (!body.currentPassword) {
        return NextResponse.json({ error: 'Current password is required to set a new password.' }, { status: 400 });
      }

      const valid = await bcrypt.compare(body.currentPassword, user.password);
      if (!valid) {
        return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 403 });
      }

      const newPassword = String(body.newPassword);
      if (newPassword.length < 8) {
        return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
      }

      updates.password = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      console.error('[user/profile] update error:', error);
      return NextResponse.json({ error: 'Update failed.' }, { status: 500 });
    }

    return NextResponse.json({ status: 'updated' });
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
}
