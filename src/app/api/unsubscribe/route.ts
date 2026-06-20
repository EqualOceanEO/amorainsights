import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email') ?? '';

  if (!email) {
    return new NextResponse('<p style="font-family:sans-serif;padding:40px;">Invalid unsubscribe link.</p>', {
      status: 400, headers: { 'Content-Type': 'text/html' }
    });
  }

  const { error } = await supabase
    .from('subscribers')
    .update({ unsubscribed: true })
    .eq('email', email.trim().toLowerCase());

  if (error) {
    console.error('[unsubscribe] DB error:', error);
    return new NextResponse('<p style="font-family:sans-serif;padding:40px;">Something went wrong. Please try again.</p>', {
      status: 500, headers: { 'Content-Type': 'text/html' }
    });
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Unsubscribed — AMORA</title>
<style>body{margin:0;background:#060d1c;font-family:-apple-system,Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;color:#fff;}
.card{max-width:440px;text-align:center;padding:48px 32px;}
h1{font-family:Georgia,serif;font-size:24px;font-weight:700;margin:0 0 12px;}
p{color:#64748b;font-size:14px;line-height:1.7;margin:0 0 28px;}
a{color:#3b82f6;text-decoration:none;font-size:13px;}
</style></head>
<body><div class="card">
  <div style="font-size:40px;margin-bottom:20px;">👋</div>
  <h1>You've been unsubscribed</h1>
  <p>You won't receive any more emails from AMORA Weekly.<br>Changed your mind? You can always re-subscribe.</p>
  <a href="https://amorainsights.com/subscribe">Re-subscribe →</a>
</div></body>
</html>`;

  return new NextResponse(html, { status: 200, headers: { 'Content-Type': 'text/html' } });
}
