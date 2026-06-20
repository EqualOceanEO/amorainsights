import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// ─── Content Protection Helpers ───────────────────────────────────────────────

function buildProtectionCSS(): string {
  return `<style>
  body { user-select: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; -webkit-touch-callout: none; }
  body * { pointer-events: none; }
  canvas, a, button, [onclick], .interactive-zone, .echarts, .amora-radar { pointer-events: auto !important; }
  .amora-wm { position: fixed; bottom: 8px; right: 12px; font-size: 10px; color: rgba(255,255,255,0.06); font-family: monospace; pointer-events: none; z-index: 99999; letter-spacing: 0.3px; }
</style>`;
}

function buildProtectionJS(email: string | null): string {
  return `<script>
(function(){
  document.addEventListener('contextmenu',function(e){e.preventDefault()});
  document.addEventListener('keydown',function(e){
    if((e.ctrlKey||e.metaKey)&&(e.key==='c'||e.key==='a'||e.key==='p'||e.key==='s'||e.key==='u')) e.preventDefault();
    if(e.key==='F12') e.preventDefault();
    if((e.ctrlKey||e.metaKey)&&e.shiftKey&&(e.key==='i'||e.key==='j'||e.key==='c')) e.preventDefault();
  });
  ${email ? `var _wm=document.createElement('div');_wm.className='amora-wm';_wm.textContent='${email} | AMORA Insights';document.body.appendChild(_wm);` : ''}
})();
</script>`;
}

// ─── GET Handler ──────────────────────────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Auth check
  const session = await auth();
  const tier = (session?.user as { subscriptionTier?: string })?.subscriptionTier ?? 'free';
  const isPro = tier === 'pro';
  const userEmail = session?.user?.email ?? null;

  // Query DB
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: report, error } = await sb
    .from('reports')
    .select('title, slug, html_content, html_free, is_premium, report_format')
    .eq('slug', slug)
    .in('production_status', ['published', 'approved'])
    .single();

  if (error || !report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  // Determine which HTML to serve
  let html: string | null = null;

  if (isPro && report.html_content) {
    html = report.html_content; // PRO users get the full version
  } else if (report.html_free) {
    html = report.html_free;    // Free users get the preview
  } else if (report.html_content) {
    html = report.html_content; // Fallback to PRO if no free version
  }

  if (!html) {
    return NextResponse.json({ error: 'No content available' }, { status: 404 });
  }

  // Inject protection
  const protectionCSS = buildProtectionCSS();
  const protectionJS = buildProtectionJS(userEmail);
  html = html.replace('</body>', protectionCSS + protectionJS + '</body>');

  // Add noindex for premium content
  if (report.is_premium && !html.includes('name="robots"')) {
    html = html.replace('<head>', '<head>\n<meta name="robots" content="noindex, follow">');
  }

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'private, max-age=3600',
      'X-AMORA-Access': isPro ? 'pro' : 'free',
      'X-AMORA-Report': slug,
    },
  });
}
