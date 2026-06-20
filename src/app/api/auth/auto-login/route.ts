import { NextRequest, NextResponse } from 'next/server';
import { EncryptJWT, base64url, calculateJwkThumbprint } from 'jose';
import { hkdf } from '@panva/hkdf';
import { supabase } from '@/lib/db';

/**
 * POST /api/auth/auto-login
 *
 * Used by SubscribeBox when an unauthenticated user submits an email
 * that belongs to an existing user. Creates a JWT session without password.
 *
 * IMPORTANT: next-auth v5 (Auth.js) uses JWE encryption (A256CBC-HS512),
 * NOT plain JWS signing. We must use the same EncryptJWT + HKDF key derivation
 * so that `auth()` can decrypt the token.
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

    // Build JWT payload matching what next-auth's jwt callback expects
    const now = Math.floor(Date.now() / 1000);
    const tokenPayload = {
      sub: String(user.id),
      email: user.email,
      name: user.name,
      subscriptionTier: user.subscription_tier ?? 'free',
      isAdmin: user.is_admin ?? false,
      iat: now,
      exp: now + 24 * 60 * 60,
      jti: crypto.randomUUID(),
    };

    // Derive encryption key exactly like next-auth does
    const secret = process.env.NEXTAUTH_SECRET!;
    // Cookie name used as salt (same as next-auth defaults)
    const cookieName = process.env.NODE_ENV === 'production'
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token';

    const encryptionSecret = await getDerivedEncryptionKey(secret, cookieName);

    // Encrypt using JWE (same as Auth.js)
    const thumbprint = await calculateJwkThumbprint(
      { kty: 'oct', k: base64url.encode(encryptionSecret) },
      `sha${encryptionSecret.byteLength << 3}` as 'sha256' | 'sha384' | 'sha512'
    );

    const encryptedToken = await new EncryptJWT(tokenPayload)
      .setProtectedHeader({ alg: 'dir', enc: 'A256CBC-HS512', kid: thumbprint })
      .setIssuedAt(now)
      .setExpirationTime(now + 24 * 60 * 60)
      .setJti(tokenPayload.jti)
      .encrypt(encryptionSecret);

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

    response.cookies.set(cookieName, encryptedToken, {
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

/**
 * Derives an encryption key from NEXTAUTH_SECRET using HKDF,
 * exactly matching Auth.js's getDerivedEncryptionKey logic.
 */
async function getDerivedEncryptionKey(
  secret: string,
  salt: string
): Promise<Uint8Array> {
  return await hkdf(
    'sha256',
    new TextEncoder().encode(secret),
    new TextEncoder().encode(salt),
    'Auth.js Generated Encryption Key (' + salt + ')',
    64 // A256CBC-HS512 needs 64 bytes
  );
}
