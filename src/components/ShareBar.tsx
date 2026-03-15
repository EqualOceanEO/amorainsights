'use client';

import { useEffect, useState } from 'react';

interface ShareBarProps {
  title: string;
  summary: string;
  url?: string; // defaults to window.location.href
  variant?: 'horizontal' | 'floating'; // horizontal = inline row, floating = left sidebar
}

const platforms = [
  {
    id: 'twitter',
    label: 'Twitter / X',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.256 5.63 5.909-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    getUrl: (title: string, url: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url + '&utm_medium=twitter')}`,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    getUrl: (_: string, url: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url + '&utm_medium=linkedin')}`,
  },
  {
    id: 'facebook',
    label: 'Facebook',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    getUrl: (_: string, url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url + '&utm_medium=facebook')}`,
  },
  {
    id: 'reddit',
    label: 'Reddit',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
      </svg>
    ),
    getUrl: (title: string, url: string) =>
      `https://www.reddit.com/submit?url=${encodeURIComponent(url + '&utm_medium=reddit')}&title=${encodeURIComponent(title)}`,
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
    getUrl: (title: string, url: string) =>
      `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url + '&utm_medium=whatsapp')}`,
  },
  {
    id: 'email',
    label: 'Email',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    getUrl: (title: string, url: string, summary: string) =>
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(summary + '\n\n' + url + '&utm_medium=email')}`,
  },
];

export default function ShareBar({ title, summary, url, variant = 'horizontal' }: ShareBarProps) {
  const [pageUrl, setPageUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const base = url ?? window.location.href;
    const u = new URL(base);
    u.searchParams.set('utm_source', 'share');
    setPageUrl(u.toString());
  }, [url]);

  function handleShare(platform: typeof platforms[0]) {
    const shareUrl = platform.getUrl(title, pageUrl, summary);
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
  }

  async function handleNativeShare() {
    if (navigator.share) {
      await navigator.share({ title, text: summary, url: pageUrl });
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Top 3 for compact use
  const primary = platforms.filter((p) => ['twitter', 'linkedin', 'email'].includes(p.id));

  if (variant === 'floating') {
    return (
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-2">
        {primary.map((p) => (
          <button
            key={p.id}
            onClick={() => handleShare(p)}
            title={p.label}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#0a1628] border border-blue-900/40 text-slate-400 hover:text-blue-400 hover:border-blue-600/50 transition"
          >
            {p.icon}
          </button>
        ))}
        <button
          onClick={handleCopy}
          title="Copy link"
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#0a1628] border border-blue-900/40 text-slate-400 hover:text-blue-400 hover:border-blue-600/50 transition"
        >
          {copied ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-green-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          )}
        </button>
      </div>
    );
  }

  // Horizontal full bar (for article bottom)
  return (
    <div className="rounded-xl border border-blue-900/30 bg-[#0a1628]/60 p-5">
      <p className="text-xs font-medium text-slate-500 tracking-widest uppercase mb-4">分享这篇报告</p>
      <div className="flex flex-wrap gap-2">
        {platforms.map((p) => (
          <button
            key={p.id}
            onClick={() => handleShare(p)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/8 text-slate-400 hover:text-white hover:bg-blue-600/20 hover:border-blue-600/40 transition text-sm"
          >
            {p.icon}
            <span className="hidden sm:inline">{p.label}</span>
          </button>
        ))}
        {/* Native share on mobile */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            onClick={handleNativeShare}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600/20 border border-blue-600/40 text-blue-400 hover:bg-blue-600/30 transition text-sm sm:hidden"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            分享
          </button>
        )}
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/8 text-slate-400 hover:text-white transition text-sm ml-auto"
        >
          {copied ? (
            <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-green-400"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg><span className="text-green-400">已复制</span></>
          ) : (
            <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg><span>复制链接</span></>
          )}
        </button>
      </div>
    </div>
  );
}
