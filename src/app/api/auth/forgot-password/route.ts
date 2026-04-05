import { NextRequest, NextResponse } from 'next/server';
import { supabase, getUserByEmail } from '@/lib/db';
import bcrypt from 'bcryptjs';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = 'AMORA Insights <noreply@amorainsights.com>';
const SITE_URL = process.env.NEXTAUTH_URL ?? 'https://amorainsights.com';
const TOKEN_EXPIRY_MINUTES = 60;

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/forgot-password
 * Body: { email: string }
 *
 * Flow:
 * 1. Validate email
 * 2. Find user by email
 * 3. Generate a secure reset token (crypto.randomUUID)
 * 4. Store token + expiry in users table
 * 5. Send password reset email with link
 *
 * Always returns 200 even if email doesn't exist (security best practice).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email ?? '').trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    // Ensure the reset token columns exist (idempotent DDL)
    try {
      await supabase.rpc('run_migration', {
        sql_text: `
          ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token TEXT;
          ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_expires_at TIMESTAMPTZ;
        `,
      });
    } catch {
      // Columns might already exist or run_migration not available — ignore
    }

    // Find user
    const user = await getUserByEmail(email);

    if (user) {
      // Generate secure token
      const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
      const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000).toISOString();

      // Store token in DB
      const { error: updateError } = await supabase
        .from('users')
        .update({
          password_reset_token: token,
          password_reset_expires_at: expiresAt,
        })
        .eq('id', user.id);

      if (!updateError && RESEND_API_KEY) {
        // Send reset email
        const resetUrl = `${SITE_URL}/reset-password?token=${token}`;
        await sendResetEmail(email, resetUrl).catch((e) =>
          console.error('[forgot-password] email send error:', e)
        );
      }

      if (updateError) {
        console.error('[forgot-password] DB update error:', updateError);
      }
    }

    // Always return success to avoid email enumeration
    return NextResponse.json({
      message: 'If an account exists with this email, you will receive a password reset link.',
    });
  } catch (e) {
    console.error('[forgot-password] unexpected error:', e);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

async function sendResetEmail(email: string, resetUrl: string) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#060d1c;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#060d1c;padding:48px 24px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

  <!-- Logo -->
  <tr><td style="padding-bottom:36px;">
    <table cellpadding="0" cellspacing="0"><tr>
      <td style="padding-right:12px;vertical-align:middle;">
        <svg width="36" height="36" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#1d4ed8"/>
            <stop offset="100%" stop-color="#60a5fa"/>
          </linearGradient></defs>
          <rect width="32" height="32" rx="7" fill="#0a1628"/>
          <rect x="5" y="9" width="22" height="3" rx="1.5" fill="url(#g)"/>
          <rect x="5" y="15" width="16" height="3" rx="1.5" fill="url(#g)" opacity="0.7"/>
          <rect x="5" y="21" width="10" height="3" rx="1.5" fill="url(#g)" opacity="0.4"/>
        </svg>
      </td>
      <td style="vertical-align:middle;">
        <span style="font-family:Georgia,serif;font-size:18px;font-weight:700;letter-spacing:3px;color:#ffffff;">AMORA</span>
        <span style="font-family:Georgia,serif;font-size:18px;font-weight:700;letter-spacing:3px;color:#3b82f6;"> INSIGHTS</span>
      </td>
    </tr></table>
  </td></tr>

  <!-- Hero -->
  <tr><td style="padding-bottom:12px;">
    <p style="margin:0;font-size:28px;font-weight:700;color:#ffffff;line-height:1.3;font-family:Georgia,serif;">
      Reset your password
    </p>
  </td></tr>
  <tr><td style="padding-bottom:32px;">
    <p style="margin:0;font-size:15px;color:#94a3b8;line-height:1.7;">
      We received a request to reset the password for your account. Click the button below to set a new password. This link will expire in 1 hour.
    </p>
  </td></tr>

  <!-- CTA -->
  <tr><td style="padding:0 0 32px;">
    <a href="${resetUrl}"
       style="display:inline-block;background:#2563eb;color:#ffffff;font-size:14px;font-weight:600;padding:14px 36px;border-radius:8px;text-decoration:none;">
      Reset Password
    </a>
  </td></tr>

  <!-- Fallback link -->
  <tr><td style="padding-bottom:32px;">
    <p style="margin:0;font-size:13px;color:#64748b;line-height:1.7;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <span style="color:#3b82f6;word-break:break-all;">${resetUrl}</span>
    </p>
  </td></tr>

  <!-- Divider -->
  <tr><td style="padding-bottom:24px;">
    <div style="height:1px;background:linear-gradient(to right,#1d4ed820,#3b82f640,#1d4ed820);"></div>
  </td></tr>

  <!-- Security note -->
  <tr><td style="padding-bottom:24px;">
    <p style="margin:0;font-size:12px;color:#475569;line-height:1.6;">
      If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
    </p>
  </td></tr>

  <!-- Footer -->
  <tr><td>
    <p style="margin:0;font-size:11px;color:#1e3a5f;">
      &copy; 2026 AmoraInsights
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [email],
      subject: 'Reset your password — AMORA Insights',
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(JSON.stringify(err));
  }
}
