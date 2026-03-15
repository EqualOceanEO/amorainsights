import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = 'AMORA Insights <noreply@amorainsights.com>';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email ?? '').trim().toLowerCase();
    const source = (body.source ?? 'website').trim().slice(0, 64);

    // Basic email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    // Upsert — on conflict do nothing, return existing row status
    const { data, error } = await supabase
      .from('subscribers')
      .upsert({ email, source }, { onConflict: 'email', ignoreDuplicates: true })
      .select('email, subscribed_at')
      .maybeSingle();

    if (error) {
      console.error('[subscribe] DB error:', error);
      return NextResponse.json({ error: 'Subscription failed. Please try again.' }, { status: 500 });
    }

    // Check if already existed (upsert returned nothing on duplicate)
    if (!data) {
      return NextResponse.json({ status: 'already_subscribed' });
    }

    // Send confirmation email via Resend
    if (RESEND_API_KEY) {
      await sendConfirmationEmail(email).catch((e) =>
        console.error('[subscribe] email send error:', e)
      );
    }

    return NextResponse.json({ status: 'subscribed' });
  } catch (e) {
    console.error('[subscribe] unexpected error:', e);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

async function sendConfirmationEmail(email: string) {
  const html = `
    <div style="background:#060d1c;padding:48px 40px;font-family:-apple-system,Arial,sans-serif;color:#fff;max-width:560px;margin:0 auto;border-radius:12px;">
      <div style="margin-bottom:32px;">
        <svg width="40" height="40" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#1d4ed8"/><stop offset="100%" stop-color="#60a5fa"/></linearGradient></defs>
          <rect width="32" height="32" rx="7" fill="#060d1c"/>
          <rect x="5" y="9" width="22" height="3" rx="1.5" fill="url(#g)"/>
          <rect x="5" y="15" width="16" height="3" rx="1.5" fill="url(#g)" opacity="0.7"/>
          <rect x="5" y="21" width="10" height="3" rx="1.5" fill="url(#g)" opacity="0.4"/>
        </svg>
      </div>
      <h1 style="font-family:Georgia,serif;font-size:24px;font-weight:700;letter-spacing:2px;color:#fff;margin:0 0 8px;">AMORA <span style="color:#3b82f6;">INSIGHTS</span></h1>
      <p style="color:#475569;font-size:12px;letter-spacing:2px;margin:0 0 32px;">WEEKLY BRIEFING</p>
      <p style="font-size:16px;color:#cbd5e1;line-height:1.7;margin:0 0 16px;">欢迎订阅 AMORA Weekly 深科技简报。</p>
      <p style="font-size:14px;color:#64748b;line-height:1.8;">每周我们将为你精选前沿科技行业动态、产业研究结论与深度观察——AI、生命科学、绿色科技、智能制造、商业航天、先进材料，六大赛道，一周一报。</p>
      <div style="margin:36px 0;padding:20px 24px;background:#0a1628;border-left:3px solid #3b82f6;border-radius:0 8px 8px 0;">
        <p style="font-size:13px;color:#94a3b8;margin:0;line-height:1.6;">首期简报将在下周五送达。<br>如需取消订阅，回复此邮件即可。</p>
      </div>
      <p style="font-size:12px;color:#1e3a5f;margin:0;">© 2026 AmoraInsights · <a href="https://amorainsights.com" style="color:#1e3a5f;">amorainsights.com</a></p>
    </div>
  `;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [email],
      subject: '欢迎订阅 AMORA Weekly 深科技简报',
      html,
    }),
  });
}
