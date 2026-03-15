'use client';

import { useState } from 'react';

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
  const [status, setStatus] = useState<'idle' | 'loading' | 'subscribed' | 'already' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
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

  if (status === 'subscribed') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600/20">
          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-white">You're subscribed!</p>
          <p className="text-xs text-slate-500">Confirmation sent. First issue arrives next Friday.</p>
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

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
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
        {status === 'error' && (
          <p className="absolute top-full mt-1 text-xs text-red-400">{errorMsg}</p>
        )}
      </form>
    );
  }

  // Full card version
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
