import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { supabase } from '@/lib/db';

/**
 * POST /api/auth/auto-login
 *
 * Used by SubscribeBox when an unauthenticated user submits an email
 * that belongs to an existing user. Creates a JWT session without password.
 *
 * Body: { email: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const normalized = (email ?? '').trim().toLowerCase();

    if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      return NextResponse.json({ error: 'Invalid email.' }, { status: 400 });
    }

    // Check if user exists
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, subscription_tier, is_admin')
      .eq('email', normalized)
      .maybeSingle();

    if (error || !user) {
      return NextResponse.json({ exists: false });
    }

    // User exists — create a JWT token using jose (same lib next-auth uses)
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);
    const now = Math.floor(Date.now() / 1000);

    const token = await new SignJWT({
      sub: String(user.id),
      email: user.email,
      name: user.name,
      subscriptionTier: user.subscription_tier ?? 'free',
      isAdmin: user.is_admin ?? false,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(now)
      .setExpirationTime(now + 24 * 60 * 60)
      .sign(secret);

    // Set the session cookie
    const response = NextResponse.json({
      exists: true,
      user: {
        id: String(user.id),
        email: user.email,
        name: user.name,
        subscriptionTier: user.subscription_tier ?? 'free',
        isAdmin: user.is_admin ?? false,
      },
    });

    // Use the same cookie name as next-auth
    const cookieName = process.env.NODE_ENV === 'production'
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token';

    response.cookies.set(cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (e) {
    console.error('[auto-login] error:', e);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
