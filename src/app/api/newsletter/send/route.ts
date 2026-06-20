import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { auth } from '@/lib/auth';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET;
const FROM_EMAIL = 'AMORA Insights <weekly@amorainsights.com>';
const SITE_URL = process.env.NEXTAUTH_URL ?? 'https://amorainsights.com';

/**
 * POST /api/newsletter/send
 *
 * Auth: accepts either INTERNAL_API_SECRET (cron/external) or admin session (dashboard)
 * Body: {
 *   secret?: string,         // INTERNAL_API_SECRET (alternative auth)
 *   subject: string,         // e.g. "AMORA Weekly — Mar 15, 2026"
 *   issue_number: number,    // e.g. 1
 *   date_label: string,      // e.g. "March 15, 2026"
 *   preview_text: string,    // shown in inbox preview
 *   sections: [              // up to 6 track sections
 *     {
 *       track: string,       // e.g. "AI & LLMs"
 *       icon: string,        // emoji
 *       headline: string,    // 1 sentence
 *       body: string,        // 2-4 sentences, HTML allowed
 *       link?: string,       // optional report URL
 *       link_label?: string, // e.g. "Read full report →"
 *     }
 *   ],
 *   closing?: string,        // optional closing note
 *   test_email?: string,     // if set, only send to this email (dry run)
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Auth check: accept INTERNAL_API_SECRET OR admin session
    const isSecretValid = INTERNAL_API_SECRET && body.secret === INTERNAL_API_SECRET;
    let isAdmin = false;

    if (!isSecretValid) {
      const session = await auth();
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      isAdmin = (session.user as { isAdmin?: boolean }).isAdmin ?? false;
      if (!isAdmin) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }
    }

    const { subject, issue_number, date_label, preview_text, sections, closing, test_email } = body;

    if (!subject || !sections?.length) {
      return NextResponse.json({ error: 'Missing required fields: subject, sections' }, { status: 400 });
    }

    // Get active subscribers (or just test email)
    let recipients: string[] = [];

    if (test_email) {
      recipients = [test_email];
    } else {
      const { data, error } = await supabase
        .from('subscribers')
        .select('email')
        .eq('confirmed', true)
        .eq('unsubscribed', false);

      if (error) {
        console.error('[newsletter] DB error:', error);
        return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
      }
      recipients = (data ?? []).map((r: { email: string }) => r.email);
    }

    if (recipients.length === 0) {
      return NextResponse.json({ status: 'no_recipients', sent: 0 });
    }

    if (!RESEND_API_KEY) {
      return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
    }

    // Send in batches of 50 (Resend batch limit)
    const BATCH_SIZE = 50;
    let sent = 0;
    let failed = 0;

    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE);

      // Build individual emails for each recipient (for personalized unsubscribe links)
      const emails = batch.map(email => ({
        from: FROM_EMAIL,
        to: [email],
        subject,
        headers: { 'X-Entity-Ref-ID': `amora-weekly-${issue_number}-${email}` },
        html: buildWeeklyHtml({ issue_number, date_label, preview_text, sections, closing, email }),
      }));

      const res = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(emails),
      }).then(r => r.json());

      if (res.data) {
        sent += res.data.length;
      } else {
        console.error('[newsletter] batch error:', res);
        failed += batch.length;
      }
    }

    return NextResponse.json({ status: 'sent', sent, failed, total: recipients.length });
  } catch (e) {
    console.error('[newsletter] unexpected error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// ─── Email Template ────────────────────────────────────────────────────────

interface Section {
  track: string;
  icon: string;
  headline: string;
  body: string;
  link?: string;
  link_label?: string;
}

function buildWeeklyHtml({
  issue_number,
  date_label,
  preview_text,
  sections,
  closing,
  email,
}: {
  issue_number: number;
  date_label: string;
  preview_text: string;
  sections: Section[];
  closing?: string;
  email: string;
}) {
  const unsubUrl = `${SITE_URL}/api/unsubscribe?email=${encodeURIComponent(email)}`;

  const sectionHtml = sections.map((s: Section) => `
    <tr><td style="padding-bottom:28px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <!-- Track label -->
        <tr><td style="padding-bottom:10px;">
          <span style="display:inline-flex;align-items:center;gap:6px;background:#0a1628;border:1px solid #1e3a5f;border-radius:20px;padding:4px 12px;">
            <span style="font-size:14px;">${s.icon}</span>
            <span style="font-size:10px;font-weight:600;letter-spacing:1.5px;color:#3b82f6;text-transform:uppercase;">${s.track}</span>
          </span>
        </td></tr>
        <!-- Headline -->
        <tr><td style="padding-bottom:8px;">
          <p style="margin:0;font-size:17px;font-weight:700;color:#ffffff;font-family:Georgia,serif;line-height:1.4;">${s.headline}</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding-bottom:${s.link ? '14px' : '0'};">
          <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.8;">${s.body}</p>
        </td></tr>
        ${s.link ? `
        <tr><td>
          <a href="${s.link}" style="font-size:12px;color:#3b82f6;text-decoration:none;font-weight:500;">${s.link_label ?? 'Read full report →'}</a>
        </td></tr>` : ''}
      </table>
    </td></tr>
    <tr><td style="padding-bottom:28px;">
      <div style="height:1px;background:#0f2040;"></div>
    </td></tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${date_label} — AMORA Weekly</title>
</head>
<body style="margin:0;padding:0;background:#060d1c;">
<!-- Preview text trick -->
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preview_text}&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌</div>

<table width="100%" cellpadding="0" cellspacing="0" style="background:#060d1c;padding:40px 24px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">

  <!-- Header -->
  <tr><td style="padding-bottom:8px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td>
        <span style="font-family:Georgia,serif;font-size:16px;font-weight:700;letter-spacing:3px;color:#ffffff;">AMORA</span>
        <span style="font-family:Georgia,serif;font-size:16px;font-weight:700;letter-spacing:3px;color:#3b82f6;"> INSIGHTS</span>
      </td>
      <td align="right">
        <span style="font-size:11px;color:#334155;letter-spacing:1px;">ISSUE #${String(issue_number).padStart(3, '0')}</span>
      </td>
    </tr></table>
  </td></tr>

  <!-- Date bar -->
  <tr><td style="padding-bottom:36px;">
    <div style="height:1px;background:linear-gradient(to right,#1d4ed830,#3b82f660,#1d4ed830);margin-bottom:10px;"></div>
    <p style="margin:0;font-size:11px;color:#475569;letter-spacing:2px;text-transform:uppercase;">${date_label} · WEEKLY BRIEFING</p>
  </td></tr>

  <!-- Sections -->
  <table width="100%" cellpadding="0" cellspacing="0">
    ${sectionHtml}
  </table>

  <!-- Closing note -->
  ${closing ? `
  <tr><td style="padding:28px 0;">
    <div style="background:#0a1628;border-left:3px solid #3b82f6;border-radius:0 8px 8px 0;padding:20px 24px;">
      <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.7;">${closing}</p>
    </div>
  </td></tr>` : ''}

  <!-- CTA -->
  <tr><td style="padding:28px 0 36px;">
    <table cellpadding="0" cellspacing="0"><tr>
      <td style="background:#1d4ed8;border-radius:6px;">
        <a href="${SITE_URL}/reports" style="display:inline-block;padding:12px 24px;font-size:13px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.5px;">Browse All Reports →</a>
      </td>
    </tr></table>
  </td></tr>

  <!-- Footer -->
  <tr><td>
    <div style="height:1px;background:#0f2040;margin-bottom:24px;"></div>
    <p style="margin:0 0 6px;font-size:11px;color:#1e3a5f;line-height:1.6;">
      You're receiving this because you subscribed at <a href="${SITE_URL}" style="color:#1e3a5f;">${SITE_URL}</a>.
    </p>
    <p style="margin:0;font-size:11px;color:#1e3a5f;">
      <a href="${unsubUrl}" style="color:#334155;text-decoration:underline;">Unsubscribe</a>
      &nbsp;·&nbsp; © 2026 AmoraInsights
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}
