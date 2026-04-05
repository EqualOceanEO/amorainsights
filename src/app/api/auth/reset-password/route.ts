import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/reset-password
 * Body: { token: string, password: string }
 *
 * Flow:
 * 1. Validate inputs
 * 2. Find user by reset token (case-insensitive)
 * 3. Check token hasn't expired
 * 4. Hash new password and update user
 * 5. Clear reset token fields
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = (body.token ?? '').trim();
    const password = body.password ?? '';

    if (!token || token.length < 16) {
      return NextResponse.json({ error: 'Invalid reset token.' }, { status: 400 });
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters.' },
        { status: 400 }
      );
    }

    // Find user with this token and check expiry
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('id, email, password_reset_token, password_reset_expires_at')
      .not('password_reset_token', 'is', null);

    if (fetchError) {
      console.error('[reset-password] DB error:', fetchError);
      return NextResponse.json({ error: 'Database error.' }, { status: 500 });
    }

    const user = users?.find(
      (u) => u.password_reset_token?.toLowerCase() === token.toLowerCase()
    );

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired reset link.' }, { status: 400 });
    }

    // Check expiry
    const expiresAt = user.password_reset_expires_at ? new Date(user.password_reset_expires_at) : null;
    if (!expiresAt || expiresAt < new Date()) {
      // Clear expired token
      await supabase
        .from('users')
        .update({ password_reset_token: null, password_reset_expires_at: null })
        .eq('id', user.id);

      return NextResponse.json({ error: 'This reset link has expired. Please request a new one.' }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password: hashedPassword,
        password_reset_token: null,
        password_reset_expires_at: null,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('[reset-password] update error:', updateError);
      return NextResponse.json({ error: 'Failed to reset password.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Password has been reset successfully.' });
  } catch (e) {
    console.error('[reset-password] unexpected error:', e);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
