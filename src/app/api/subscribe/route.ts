import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase, getUserByEmail } from '@/lib/db';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = 'AMORA Insights <noreply@amorainsights.com>';
const SITE_URL = process.env.NEXTAUTH_URL ?? 'https://amorainsights.com';

/**
 * POST /api/subscribe
 *
 * Flow:
 * 1. Validate email
 * 2. Upsert into subscribers table (newsletter)
 * 3. Check if user exists in users table
 *    - If NOT exists → auto-create account with random password + send "set password" email
 *    - If exists → skip user creation, just confirm newsletter
 * 4. Send welcome email (newsletter confirmation + set-password link if new user)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email ?? '').trim().toLowerCase();
    const source = (body.source ?? 'website').trim().slice(0, 64);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    // ─── 1. Upsert subscriber (newsletter) ─────────────────────────────
    const { data: subscriber, error: subError } = await supabase
      .from('subscribers')
      .upsert({ email, source }, { onConflict: 'email', ignoreDuplicates: true })
      .select('id, email, subscribed_at')
      .maybeSingle();

    if (subError) {
      console.error('[subscribe] DB error:', subError);
      return NextResponse.json({ error: 'Subscription failed. Please try again.' }, { status: 500 });
    }

    const isNewSubscriber = !!subscriber;
    if (isNewSubscriber) {
      await supabase
        .from('subscribers')
        .update({ confirmed: true, confirmed_at: new Date().toISOString() })
        .eq('id', subscriber.id);
    }

    // ─── 2. Auto-create user account if not exists ─────────────────────
    let isNewUser = false;
    try {
      const existingUser = await getUserByEmail(email);

      if (!existingUser) {
        // Generate a random password (user will set their own via email link)
        const randomPassword = crypto.randomUUID().replace(/-/g, '').slice(0, 20);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        // Create user with a "needs_password_reset" flag via name field convention
        // We store a special marker: name = null means fresh auto-created account
        const { error: createUserError } = await supabase
          .from('users')
          .insert({
            email,
            password: hashedPassword,
            name: null, // null = auto-created, needs to set display name
            subscription_tier: 'free',
            acquisition_channel: 'organic',
          });

        if (createUserError) {
          // If unique constraint violation, another request created it concurrently — that's fine
          if (!createUserError.message.includes('duplicate') && !createUserError.message.includes('unique')) {
            console.error('[subscribe] auto-create user error:', createUserError.message);
          }
        } else {
          isNewUser = true;
        }
      }
    } catch (e) {
      console.error('[subscribe] auto-create user error:', e);
      // Non-blocking — newsletter subscription still succeeds
    }

    // ─── 3. Send email ─────────────────────────────────────────────────
    if (!RESEND_API_KEY) {
      console.error('[subscribe] RESEND_API_KEY is not configured — email not sent.');
    } else {
      await sendEmail(email, isNewUser).catch((e) =>
        console.error('[subscribe] email send error:', e)
      );
    }

    // ─── 4. Return response ────────────────────────────────────────────
    if (!isNewSubscriber) {
      return NextResponse.json({ status: 'already_subscribed' });
    }

    return NextResponse.json({
      status: 'subscribed',
      accountCreated: isNewUser,
    });
  } catch (e) {
    console.error('[subscribe] unexpected error:', e);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

// ─── Email templates ────────────────────────────────────────────────────────

async function sendEmail(email: string, isNewUser: boolean) {
  const unsubUrl = `${SITE_URL}/api/unsubscribe?email=${encodeURIComponent(email)}`;

  let html: string;
  let subject: string;

  if (isNewUser) {
    subject = 'Welcome to AMORA — your account is ready';
    html = buildNewUserEmail(email, unsubUrl);
  } else {
    subject = 'Welcome to AMORA Weekly — your first issue is Friday';
    html = buildNewsletterEmail(email, unsubUrl);
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [email],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(JSON.stringify(err));
  }
}

function buildNewUserEmail(email: string, unsubUrl: string): string {
  return `<!DOCTYPE html>
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
      Your account is ready.
    </p>
  </td></tr>
  <tr><td style="padding-bottom:32px;">
    <p style="margin:0;font-size:15px;color:#94a3b8;line-height:1.7;">
      Welcome to AMORA Insights. Your free account has been created automatically when you subscribed. You now have access to curated weekly briefings across six frontier technology tracks.
    </p>
  </td></tr>

  <!-- Divider -->
  <tr><td style="padding-bottom:32px;">
    <div style="height:1px;background:linear-gradient(to right,#1d4ed830,#3b82f660,#1d4ed830);"></div>
  </td></tr>

  <!-- Set password CTA -->
  <tr><td style="padding:28px 0;">
    <div style="background:linear-gradient(135deg,#0f2040,#0a1628);border:1px solid #1e3a5f;border-radius:12px;padding:28px 32px;">
      <p style="margin:0 0 6px;font-size:13px;color:#3b82f6;font-weight:600;letter-spacing:1px;text-transform:uppercase;">Next step</p>
      <p style="margin:0 0 16px;font-size:20px;font-weight:700;color:#ffffff;font-family:Georgia,serif;">Set your password</p>
      <p style="margin:0 0 24px;font-size:13px;color:#64748b;line-height:1.6;">
        To sign in later and manage your subscription, set a password for your account:
      </p>
      <a href="${SITE_URL}/login?email=${encodeURIComponent(email)}"
         style="display:inline-block;background:#2563eb;color:#ffffff;font-size:14px;font-weight:600;padding:12px 32px;border-radius:8px;text-decoration:none;">
        Set Password →
      </a>
      <p style="margin:12px 0 0;font-size:12px;color:#475569;">
        Your email: <strong style="color:#94a3b8;">${email}</strong>
      </p>
    </div>
  </td></tr>

  <!-- What you get -->
  <tr><td style="padding-bottom:8px;">
    <p style="margin:0 0 16px;font-size:11px;letter-spacing:2px;color:#475569;text-transform:uppercase;">What you get with your free account</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td width="50%" style="padding:0 6px 12px 0;">
          <div style="background:#0a1628;border:1px solid #1e3a5f;border-radius:8px;padding:16px;">
            <div style="font-size:12px;font-weight:600;color:#e2e8f0;margin-bottom:4px;">📰 Curated News</div>
            <div style="font-size:12px;color:#64748b;">All sourced articles, always free</div>
          </div>
        </td>
        <td width="50%" style="padding:0 0 12px 6px;">
          <div style="background:#0a1628;border:1px solid #1e3a5f;border-radius:8px;padding:16px;">
            <div style="font-size:12px;font-weight:600;color:#e2e8f0;margin-bottom:4px;">📧 Weekly Briefing</div>
            <div style="font-size:12px;color:#64748b;">6 tracks every Friday</div>
          </div>
        </td>
      </tr>
      <tr>
        <td width="50%" style="padding:0 6px 12px 0;">
          <div style="background:#0a1628;border:1px solid #1e3a5f;border-radius:8px;padding:16px;">
            <div style="font-size:12px;font-weight:600;color:#e2e8f0;margin-bottom:4px;">📊 Report Summaries</div>
            <div style="font-size:12px;color:#64748b;">Executive overviews at no cost</div>
          </div>
        </td>
        <td width="50%" style="padding:0 0 12px 6px;">
          <div style="background:#0a1628;border:1px solid #1e3a5f;border-radius:8px;padding:16px;">
            <div style="font-size:12px;font-weight:600;color:#e2e8f0;margin-bottom:4px;">🔍 Company Snapshots</div>
            <div style="font-size:12px;color:#64748b;">Basic profiles & AMORA scores</div>
          </div>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- Upgrade CTA -->
  <tr><td style="padding:24px 0;">
    <div style="background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.15);border-radius:12px;padding:24px 28px;">
      <p style="margin:0 0 4px;font-size:13px;color:#f59e0b;font-weight:600;">Want full access?</p>
      <p style="margin:0 0 16px;font-size:13px;color:#94a3b8;line-height:1.6;">
        Upgrade to <strong style="color:#fbbf24;">AMORA Pro</strong> ($19.9/month) for full reports, deep-dive analysis, and complete company intelligence.
      </p>
      <a href="${SITE_URL}/pricing"
         style="display:inline-block;background:rgba(245,158,11,0.15);color:#fbbf24;font-size:13px;font-weight:600;padding:10px 24px;border-radius:8px;text-decoration:none;border:1px solid rgba(245,158,11,0.3);">
        View Pro Plan
      </a>
    </div>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding-top:24px;">
    <div style="height:1px;background:linear-gradient(to right,#1d4ed820,#3b82f640,#1d4ed820);margin-bottom:20px;"></div>
    <p style="margin:0 0 8px;font-size:11px;color:#334155;line-height:1.6;">
      You subscribed at <a href="${SITE_URL}" style="color:#334155;">${SITE_URL}</a>.
    </p>
    <p style="margin:0;font-size:11px;color:#1e3a5f;">
      <a href="${unsubUrl}" style="color:#334155;text-decoration:underline;">Unsubscribe</a>
      &nbsp;·&nbsp;
      © 2026 AmoraInsights
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

function buildNewsletterEmail(email: string, unsubUrl: string): string {
  return `<!DOCTYPE html>
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
      You're in. Welcome to<br>AMORA Weekly.
    </p>
  </td></tr>
  <tr><td style="padding-bottom:32px;">
    <p style="margin:0;font-size:15px;color:#94a3b8;line-height:1.7;">
      Every Friday, we distill the week's most important signals across six frontier tracks into a 10-minute briefing built for investors, researchers, and operators who can't afford to miss what's next.
    </p>
  </td></tr>

  <!-- Divider -->
  <tr><td style="padding-bottom:32px;">
    <div style="height:1px;background:linear-gradient(to right,#1d4ed830,#3b82f660,#1d4ed830);"></div>
  </td></tr>

  <!-- Six tracks -->
  <tr><td style="padding-bottom:8px;">
    <p style="margin:0 0 16px;font-size:11px;letter-spacing:2px;color:#475569;text-transform:uppercase;">Six Frontier Tracks</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td width="33%" style="padding:0 6px 12px 0;">
          <div style="background:#0a1628;border:1px solid #1e3a5f;border-radius:8px;padding:14px 16px;">
            <div style="font-size:18px;margin-bottom:6px;">🤖</div>
            <div style="font-size:12px;font-weight:600;color:#e2e8f0;">AI &amp; LLMs</div>
          </div>
        </td>
        <td width="33%" style="padding:0 6px 12px;">
          <div style="background:#0a1628;border:1px solid #1e3a5f;border-radius:8px;padding:14px 16px;">
            <div style="font-size:18px;margin-bottom:6px;">🧬</div>
            <div style="font-size:12px;font-weight:600;color:#e2e8f0;">Life Sciences</div>
          </div>
        </td>
        <td width="33%" style="padding:0 0 12px 6px;">
          <div style="background:#0a1628;border:1px solid #1e3a5f;border-radius:8px;padding:14px 16px;">
            <div style="font-size:18px;margin-bottom:6px;">⚡</div>
            <div style="font-size:12px;font-weight:600;color:#e2e8f0;">Green Tech</div>
          </div>
        </td>
      </tr>
      <tr>
        <td width="33%" style="padding:0 6px 0 0;">
          <div style="background:#0a1628;border:1px solid #1e3a5f;border-radius:8px;padding:14px 16px;">
            <div style="font-size:18px;margin-bottom:6px;">🏭</div>
            <div style="font-size:12px;font-weight:600;color:#e2e8f0;">Smart Mfg.</div>
          </div>
        </td>
        <td width="33%" style="padding:0 6px;">
          <div style="background:#0a1628;border:1px solid #1e3a5f;border-radius:8px;padding:14px 16px;">
            <div style="font-size:18px;margin-bottom:6px;">🚀</div>
            <div style="font-size:12px;font-weight:600;color:#e2e8f0;">Space</div>
          </div>
        </td>
        <td width="33%" style="padding:0 0 0 6px;">
          <div style="background:#0a1628;border:1px solid #1e3a5f;border-radius:8px;padding:14px 16px;">
            <div style="font-size:18px;margin-bottom:6px;">🔬</div>
            <div style="font-size:12px;font-weight:600;color:#e2e8f0;">Materials</div>
          </div>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- CTA -->
  <tr><td style="padding:32px 0;">
    <div style="background:linear-gradient(135deg,#0f2040,#0a1628);border:1px solid #1e3a5f;border-radius:12px;padding:28px 32px;">
      <p style="margin:0 0 6px;font-size:13px;color:#3b82f6;font-weight:600;letter-spacing:1px;text-transform:uppercase;">First issue</p>
      <p style="margin:0 0 20px;font-size:20px;font-weight:700;color:#ffffff;font-family:Georgia,serif;">Arrives this Friday</p>
      <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;">
        In the meantime, browse our latest reports at<br>
        <a href="${SITE_URL}/reports" style="color:#3b82f6;text-decoration:none;">${SITE_URL}/reports</a>
      </p>
    </div>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding-top:24px;">
    <div style="height:1px;background:linear-gradient(to right,#1d4ed820,#3b82f640,#1d4ed820);margin-bottom:20px;"></div>
    <p style="margin:0 0 8px;font-size:11px;color:#334155;line-height:1.6;">
      You subscribed to AMORA Weekly at <a href="${SITE_URL}" style="color:#334155;">${SITE_URL}</a>.
    </p>
    <p style="margin:0;font-size:11px;color:#1e3a5f;">
      <a href="${unsubUrl}" style="color:#334155;text-decoration:underline;">Unsubscribe</a>
      &nbsp;·&nbsp;
      © 2026 AmoraInsights
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}
