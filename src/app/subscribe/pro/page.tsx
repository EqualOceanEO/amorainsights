'use client';

import { useState } from 'react';
import Link from 'next/link';
import { trackEvent } from '@/components/AnalyticsProvider';

const FEATURES_FREE = [
  'Weekly briefing digest (6 tracks)',
  'Top 3 headlines per track',
  'Public report summaries',
];

const FEATURES_PRO = [
  'Everything in Free',
  'Full original analysis articles',
  'Complete research reports with data charts',
  'Interactive AMORA score breakdowns',
  'Full company profiles & funding data',
  'Supply chain & customer intelligence',
  'Searchable report archive with export',
  'Priority access to new research',
];

export default function ProPage() {
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState<'pro_monthly'>('pro_monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCheckout() {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setLoading(true);

    // Track upgrade intent
    await trackEvent('upgrade_click', {
      category: 'billing',
      properties: { plan, email_domain: email.split('@')[1] ?? 'unknown' },
    });

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, plan }),
      }).then(r => r.json());

      if (res.url) {
        window.location.href = res.url;
      } else {
        setError(res.error ?? 'Something went wrong. Please try again.');
        setLoading(false);
      }
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <defs><linearGradient id="nl" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1d4ed8"/><stop offset="100%" stopColor="#60a5fa"/>
              </linearGradient></defs>
              <rect width="32" height="32" rx="7" fill="#060d1c"/>
              <rect x="5" y="9" width="22" height="3" rx="1.5" fill="url(#nl)"/>
              <rect x="5" y="15" width="16" height="3" rx="1.5" fill="url(#nl)" opacity="0.7"/>
              <rect x="5" y="21" width="10" height="3" rx="1.5" fill="url(#nl)" opacity="0.4"/>
            </svg>
            <span className="font-serif font-bold tracking-widest text-sm">AMORA</span>
          </Link>
          <Link href="/subscribe" className="text-xs text-slate-500 hover:text-slate-300 transition">
            Free plan →
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-400 text-xs tracking-widest uppercase mb-6">
            7-day free trial · Cancel anytime
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Go deeper with <span className="text-blue-400">AMORA Pro</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Full reports, data, and archives for investors and researchers who need the complete picture.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto mb-16">
          {/* Free */}
          <div className="p-6 rounded-xl border border-white/8 bg-white/2">
            <div className="mb-4">
              <div className="text-xs text-slate-500 tracking-widest uppercase mb-1">Basic</div>
              <div className="text-3xl font-bold">Free</div>
              <div className="text-xs text-slate-500 mt-1">Forever</div>
            </div>
            <ul className="space-y-2 mb-6">
              {FEATURES_FREE.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-400">
                  <span className="text-slate-600 mt-0.5">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/subscribe"
              className="block text-center text-sm text-slate-400 border border-white/10 rounded-lg py-2.5 hover:border-white/20 transition">
              Subscribe free →
            </Link>
          </div>

          {/* Pro */}
          <div className="p-6 rounded-xl border border-blue-500/40 bg-blue-600/5 relative">
            <div className="absolute -top-3 left-6">
              <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">Most Popular</span>
            </div>
            <div className="mb-4">
              <div className="text-xs text-blue-400 tracking-widest uppercase mb-1">Pro</div>
              <div className="flex items-end gap-2">
                <div className="text-3xl font-bold">
                  $19.9
                </div>
                <div className="text-slate-400 text-sm pb-1">/month</div>
              </div>
              <p className="text-xs text-slate-500 mt-1">Billed monthly. Cancel anytime.</p>
            </div>

            <ul className="space-y-2 mb-6">
              {FEATURES_PRO.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-blue-400 mt-0.5">✓</span> {f}
                </li>
              ))}
            </ul>

            {/* Email input */}
            <div className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCheckout()}
                placeholder="your@email.com"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition"
              />
              {error && <p className="text-xs text-red-400">{error}</p>}
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm py-3 rounded-lg transition">
                {loading ? 'Redirecting...' : 'Start 7-day free trial →'}
              </button>
              <p className="text-xs text-slate-600 text-center">No charge during trial · Cancel anytime</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-xl mx-auto">
          <h2 className="text-sm font-semibold text-slate-400 tracking-widest uppercase mb-6 text-center">FAQ</h2>
          <div className="space-y-4">
            {[
              { q: 'What happens after the free trial?', a: 'You\'ll be charged at the start of your billing cycle. We\'ll send a reminder 3 days before the trial ends.' },
              { q: 'Can I cancel anytime?', a: 'Yes. Cancel from your account settings or email us — no questions asked.' },
              { q: 'What payment methods are accepted?', a: 'All major credit and debit cards via Stripe. Secure, encrypted checkout.' },
              { q: 'Is there a team or institutional plan?', a: 'Yes. Contact us at hello@amorainsights.com for enterprise pricing.' },
            ].map(item => (
              <div key={item.q} className="border border-white/5 rounded-lg p-4">
                <div className="text-sm font-medium text-white mb-1">{item.q}</div>
                <div className="text-xs text-slate-500 leading-relaxed">{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
