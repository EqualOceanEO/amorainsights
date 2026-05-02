'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

interface SubscribeBoxProps {
  source?: string;
  compact?: boolean; // true = single-line inline, false = stacked card
  className?: string;
}

export default function SubscribeBox({
  source = 'website',
  compact = false,
  className = '',
}: SubscribeBoxProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'subscribed' | 'already' | 'auto-logged-in' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Use global auth context — single source of truth
  const { user: session, loading: checking } = useAuth();
  const [newsletterSubscribed, setNewsletterSubscribed] = useState<boolean | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const fetchNewsletterStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        setNewsletterSubscribed(data.newsletter?.subscribed ?? false);
      }
    } catch {
      setNewsletterSubscribed(false);
    } finally {
      setProfileLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!checking && session?.email) {
      fetchNewsletterStatus();
    } else if (!checking) {
      setProfileLoaded(true);
    }
  }, [checking, session, fetchNewsletterStatus]);

  // Subscribe / unsubscribe toggle for logged-in users
  async function toggleNewsletter() {
    if (!session) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/user/newsletter/unsubscribe', {
        method: newsletterSubscribed ? 'DELETE' : 'POST',
      });
      if (res.ok) {
        const newState = !newsletterSubscribed;
        setNewsletterSubscribed(newState);
        setStatus(newState ? 'subscribed' : 'already');
      } else {
        setStatus('error');
        setErrorMsg('Failed to update subscription.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Network error.');
    }
  }

  // For logged-in users who want to subscribe via the box
  async function subscribeLoggedIn() {
    if (!session) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.email, source }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus('error');
        setErrorMsg(data.error ?? 'Something went wrong.');
      } else {
        setNewsletterSubscribed(true);
        setStatus('subscribed');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Network error.');
    }
  }

  // Submit handler for non-logged-in users
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      // Step 1: Check if this email belongs to an existing user
      const loginRes = await fetch('/api/auth/auto-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const loginData = await loginRes.json();

      if (loginData.exists) {
        // Auto-logged in! Refresh auth context and check subscription
        const subRes = await fetch('/api/user/profile');
        if (subRes.ok) {
          const subData = await subRes.json();
          setNewsletterSubscribed(subData.newsletter?.subscribed ?? false);
        }
        // Ensure newsletter subscription is active
        await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), source }),
        });
        setNewsletterSubscribed(true);
        setStatus('auto-logged-in');
        return;
      }

      // Step 2: Not a registered user — normal subscribe flow
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus('error');
        setErrorMsg(data.error ?? 'Something went wrong.');
      } else if (data.status === 'already_subscribed') {
        setStatus('already');
      } else {
        setStatus('subscribed');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Network error. Please try again.');
    }
  }

  // ── Loading state ──
  if (checking || !profileLoaded) {
    // compact: show nothing while loading (avoids layout shift)
    if (compact) return null;
    return (
      <div className={`rounded-xl border border-blue-900/40 bg-gradient-to-b from-[#0a1628] to-[#060d1c] p-6 ${className}`}>
        <div className="flex items-center gap-3 text-slate-500 text-sm">
          <div className="w-4 h-4 border-2 border-slate-600 border-t-blue-400 rounded-full animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  // ── Pro users: don't show subscribe box ──
  if (session?.subscriptionTier === 'pro') {
    return null;
  }

  // ── Logged-in user view ──
  if (session) {
    const tier = session.subscriptionTier ?? 'free';
    const displayName = session.name || session.email;

    if (status === 'auto-logged-in') {
      return (
        <div className={`rounded-xl border border-green-800/40 bg-gradient-to-b from-[#0a1628] to-[#060d1c] p-6 ${className}`}>
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-600/10 border border-green-600/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Welcome back, {displayName}!</h3>
              <p className="text-xs text-slate-500 mt-0.5">Auto-signed in · Subscription confirmed</p>
            </div>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            Your AMORA Weekly subscription is active. Manage your preferences in the dashboard.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition"
          >
            Go to Dashboard →
          </a>
        </div>
      );
    }

    if (status === 'subscribed') {
      return (
        <div className={`flex items-center gap-3 ${className}`}>
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600/20">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-white">Subscribed!</p>
            <p className="text-xs text-slate-500">Your AMORA Weekly is on its way.</p>
          </div>
        </div>
      );
    }

    // Compact logged-in view — hide entirely (nav already shows login state)
    if (compact) {
      return null;
    }

    // Full card logged-in view
    return (
      <div className={`rounded-xl border border-blue-900/40 bg-gradient-to-b from-[#0a1628] to-[#060d1c] p-6 ${className}`}>
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-lg font-bold text-blue-300">
            {(displayName || '?')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">
              {displayName}
              {tier === 'pro' && (
                <span className="ml-2 text-[10px] font-bold text-blue-400 bg-blue-600/20 px-1.5 py-0.5 rounded align-middle">PRO</span>
              )}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{session.email}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center gap-2">
            {newsletterSubscribed ? (
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            )}
            <span className={`text-sm font-medium ${newsletterSubscribed ? 'text-green-400' : 'text-slate-400'}`}>
              AMORA Weekly
            </span>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${newsletterSubscribed ? 'text-green-400 bg-green-600/10' : 'text-slate-500 bg-slate-700/50'}`}>
            {newsletterSubscribed ? 'Subscribed' : 'Not subscribed'}
          </span>
        </div>

        <div className="flex gap-3">
          {newsletterSubscribed ? (
            <button
              onClick={toggleNewsletter}
              disabled={status === 'loading'}
              className="flex-1 py-2.5 text-sm font-medium border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 rounded-lg transition disabled:opacity-50"
            >
              {status === 'loading' ? 'Updating…' : 'Unsubscribe'}
            </button>
          ) : (
            <button
              onClick={subscribeLoggedIn}
              disabled={status === 'loading'}
              className="flex-1 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg transition"
            >
              {status === 'loading' ? 'Subscribing…' : 'Subscribe to AMORA Weekly'}
            </button>
          )}
          <a
            href="/dashboard"
            className="px-4 py-2.5 text-sm font-medium border border-white/10 text-slate-400 hover:text-white hover:border-white/20 rounded-lg transition"
          >
            Dashboard
          </a>
        </div>

        {status === 'error' && (
          <p className="mt-3 text-xs text-red-400">{errorMsg}</p>
        )}
      </div>
    );
  }

  // ── Non-logged-in success states ──
  if (status === 'subscribed') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600/20">
          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-white">You&apos;re in!</p>
          <p className="text-xs text-slate-500">Check your email — account created + weekly briefing confirmed.</p>
        </div>
      </div>
    );
  }

  if (status === 'already') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-700/50">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm text-slate-400">Already subscribed — see you next Friday.</p>
      </div>
    );
  }

  // ── Compact non-logged-in view ──
  if (compact) {
    return (
      <div className={className}>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="flex-1 min-w-0 px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg transition whitespace-nowrap"
          >
            {status === 'loading' ? '...' : 'Subscribe'}
          </button>
        </form>
        {status === 'error' && (
          <p className="mt-1 text-xs text-red-400">{errorMsg}</p>
        )}
        <div className="border-t border-gray-800/60 mt-4" />
      </div>
    );
  }

  // ── Full card non-logged-in view ──
  return (
    <div className={`rounded-xl border border-blue-900/40 bg-gradient-to-b from-[#0a1628] to-[#060d1c] p-6 ${className}`}>
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-600/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white tracking-wide">AMORA Weekly</h3>
          <p className="text-xs text-slate-500 mt-0.5">Six frontier tracks · Every Friday</p>
        </div>
      </div>
      <p className="text-sm text-slate-400 mb-4 leading-relaxed">
        AI, Life Sciences, Green Tech, Smart Manufacturing, Commercial Space, Advanced Materials — one briefing a week, no account required.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="w-full px-4 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg transition"
        >
          {status === 'loading' ? 'Subscribing…' : 'Subscribe for free'}
        </button>
        {status === 'error' && (
          <p className="text-xs text-red-400">{errorMsg}</p>
        )}
      </form>
    </div>
  );
}
