import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const HRI_REPORT_ID = 44;

const CHAPTER_META: Record<string, {
  label: string; label_cn: string; order: number; free: boolean;
}> = {
  m:  { label: 'Mapping',      label_cn: '产业链生态', order: 1, free: true  },
  a:  { label: 'Advancement',  label_cn: '技术先进性', order: 2, free: false },
  o:  { label: 'Operations',   label_cn: '商业化运营', order: 3, free: false },
  r:  { label: 'Reach',         label_cn: '市场容量',   order: 4, free: false },
  a2: { label: 'Assets',        label_cn: '资本价值',   order: 5, free: false },
};

function buildProtectionCSS(): string {
  return `<style>
  body {
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -webkit-touch-callout: none;
  }
  body * {
    pointer-events: none;
  }
  /* Re-enable pointer events for interactive elements */
  canvas, a, button, [onclick], .interactive-zone, .echarts, .amora-radar {
    pointer-events: auto !important;
  }
  /* Watermark */
  .hri-wm {
    position: fixed;
    bottom: 8px;
    right: 12px;
    font-size: 10px;
    color: rgba(255,255,255,0.06);
    font-family: monospace;
    pointer-events: none;
    z-index: 99999;
    letter-spacing: 0.3px;
    font-weight: 300;
  }
  /* Screenshot hint */
  .hri-ss {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    background: rgba(0,0,0,0.92);
    border: 1px solid #fbbf24;
    border-radius: 12px;
    padding: 20px 28px;
    z-index: 999999;
    text-align: center;
    color: #fbbf24;
    font-family: system-ui, sans-serif;
    font-size: 14px;
    display: none;
  }
  .hri-ss.show { display: block; }
  .hri-ss h3 { margin: 0 0 6px; font-size: 15px; font-weight: 600; }
  .hri-ss p { margin: 0; color: #9ca3af; font-size: 12px; }
</style>`;
}

function buildProtectionJS(email: string | null, isPremium: boolean): string {
  return `<script>
(function() {
  // Disable right-click
  document.addEventListener('contextmenu', e => e.preventDefault());

  // Disable copy shortcuts + F12 + DevTools
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) &&
        (e.key === 'c' || e.key === 'a' || e.key === 'p' || e.key === 's' || e.key === 'u')) {
      e.preventDefault();
    }
    if (e.key === 'F12') e.preventDefault();
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'i' || e.key === 'j' || e.key === 'c')) {
      e.preventDefault();
    }
  });

  // PrintScreen detection
  document.addEventListener('keyup', function(e) {
    if (e.key === 'PrintScreen') {
      var w = document.querySelector('.hri-ss');
      if (w) { w.classList.add('show'); setTimeout(function() { w.classList.remove('show'); }, 3000); }
    }
  });

  ${isPremium ? `// DevTools detection (window resize trick) — premium only
  (function(){var threshold=160;setInterval(function(){var devOpen=window.outerWidth-window.innerWidth>threshold||window.outerHeight-window.innerHeight>threshold;if(devOpen){document.body.style.filter='blur(8px)';setTimeout(function(){document.body.style.filter='';},300);}},1000);}());` : ''}

  // Watermark
  var _email = ${email ? `'${email}'` : 'null'};
  if (_email) {
    var _wm = document.createElement('div');
    _wm.className = 'hri-wm';
    _wm.textContent = _email + ' | AMORA Insights';
    document.body.appendChild(_wm);
  }

  // Screenshot warning div
  var _ss = document.createElement('div');
  _ss.className = 'hri-ss';
  _ss.innerHTML = '<h3>Content Protected</h3><p>This content is for AMORA Pro subscribers only.</p>';
  document.body.appendChild(_ss);
})();
</script>`;
}

function buildPreviewPage(chapter: string): string {
  const meta = CHAPTER_META[chapter];
  const colorMap: Record<string, string> = { m: '#00d4ff', a: '#ff006e', o: '#06d6a0', r: '#ffbe0b', a2: '#9775fa' };
  const color = colorMap[chapter] || '#3b82f6';
  const partLabel = chapter === 'a2' ? 'A\u2082' : chapter.toUpperCase();

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Part ${partLabel}: ${meta?.label} - HRI 2026 | AMORA Insights</title>
<meta name="robots" content="noindex, follow">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a0f;color:#9ca3af;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:32px 16px}
.card{max-width:480px;width:100%;background:#111827;border:1px solid #374151;border-radius:16px;padding:40px 32px;text-align:center}
.badge{display:inline-flex;align-items:center;padding:6px 16px;border-radius:9999px;font-size:12px;font-weight:700;letter-spacing:.08em;margin-bottom:20px;border:1px solid ${color}40;color:${color};background:${color}10}
h1{font-size:22px;font-weight:700;color:#f9fafb;margin-bottom:6px}
.subtitle{font-size:14px;color:#6b7280;margin-bottom:28px}
.items{text-align:left;margin-bottom:28px}
.item{display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid #1f2937;font-size:13px;color:#9ca3af}
.item:last-child{border-bottom:none}
.cta{display:inline-block;background:${color};color:#fff;text-decoration:none;padding:12px 32px;border-radius:10px;font-size:14px;font-weight:600;transition:opacity .2s}
.cta:hover{opacity:.85}
.note{margin-top:16px;font-size:12px;color:#4b5563}
.note a{color:#6b7280;text-decoration:none}
.note a:hover{color:#9ca3af}
</style>
</head>
<body>
<div class="card">
  <div class="badge">PART ${partLabel}</div>
  <h1>${meta?.label ?? ''}</h1>
  <p class="subtitle">${meta?.label_cn ?? ''} - HRI 2026</p>
  <div class="items">
    <div class="item"><span style="font-size:18px">🔒</span><span>This chapter is exclusive to AMORA Pro subscribers</span></div>
    <div class="item"><span style="font-size:18px">📊</span><span>Interactive charts and company comparisons</span></div>
    <div class="item"><span style="font-size:18px">📈</span><span>Detailed data tables and investment insights</span></div>
    <div class="item"><span style="font-size:18px">🏆</span><span>Full AMORA scoring and valuation data</span></div>
  </div>
  <a href="/pricing" class="cta">Upgrade to Pro - Unlock All Chapters</a>
  <p class="note">Already a subscriber? <a href="/login">Sign in</a></p>
</div>
</body>
</html>`;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ chapter: string }> }
) {
  const { chapter } = await params;

  // Validate chapter
  if (!CHAPTER_META[chapter]) {
    return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
  }

  const meta = CHAPTER_META[chapter];

  // Auth check
  const session = await auth();
  const tier = (session?.user as { subscriptionTier?: string })?.subscriptionTier ?? 'free';
  const isPro = tier === 'pro';
  const userEmail = session?.user?.email ?? null;
  const unlocked = meta.free || isPro;

  // Read from DB
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: report } = await sb
    .from('reports')
    .select('chapters_json, title')
    .eq('id', HRI_REPORT_ID)
    .single();

  const chapters: Record<string, { html: string; free: boolean }> =
    (report?.chapters_json as Record<string, { html: string; free: boolean }>) || {};

  const chapterData = chapters[chapter];

  // Return preview for locked content
  if (!unlocked || !chapterData?.html) {
    return new NextResponse(buildPreviewPage(chapter), {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
        'X-HRI-Chapter': chapter,
        'X-HRI-Access': 'preview',
      },
    });
  }

  // Wrap with protection for premium content
  const protectionCSS = buildProtectionCSS();
  const protectionJS = buildProtectionJS(userEmail, !meta.free);

  // Inject protection after </body>
  let html = chapterData.html;
  html = html.replace('</body>', protectionCSS + protectionJS + '</body>');

  // Also add meta robots noindex for premium content
  if (!meta.free) {
    if (!html.includes('name="robots"')) {
      html = html.replace('<head>', '<head>\n<meta name="robots" content="noindex, follow">');
    }
  }

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'private, max-age=3600',
      'X-HRI-Chapter': chapter,
      'X-HRI-Access': meta.free ? 'free' : (isPro ? 'pro' : 'preview'),
    },
  });
}
