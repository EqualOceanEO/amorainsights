'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [verifying, setVerifying] = useState(!!sessionId);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) return;

    fetch(`/api/stripe/verify?session_id=${sessionId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setVerified(true);
        } else {
          setError(data.error || 'Verification failed');
        }
      })
      .catch(e => {
        setError('Network error');
        console.error(e);
      })
      .finally(() => setVerifying(false));
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        {/* Icon */}
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-8 ${
          verifying ? 'bg-yellow-600/10 border border-yellow-500/30' :
          verified ? 'bg-blue-600/10 border border-blue-500/30' :
          error ? 'bg-red-600/10 border border-red-500/30' :
          'bg-blue-600/10 border border-blue-500/30'
        }`}>
          {verifying ? (
            <svg className="w-8 h-8 text-yellow-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : verified ? (
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>

        <h1 className="font-serif text-3xl font-bold mb-3">
          Welcome to <span className="text-blue-400">AMORA Pro</span>
        </h1>

        {verifying ? (
          <p className="text-yellow-400 text-base mb-8">Activating your subscription...</p>
        ) : error ? (
          <p className="text-red-400 text-base mb-8">{error}</p>
        ) : (
          <p className="text-slate-400 text-base leading-relaxed mb-8">
            Your subscription is now active. You have full access to all reports and deep-dive analysis.
          </p>
        )}

        <div className="bg-white/3 border border-white/8 rounded-xl p-5 mb-8 text-left space-y-3">
          {[
            '✓ Full research reports unlocked',
            '✓ Deep-dive data and charts',
            '✓ Complete archive access',
            '✓ Confirmation email on its way',
          ].map(item => (
            <p key={item} className="text-sm text-slate-300">{item}</p>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/reports"
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-6 py-3 rounded-lg transition">
            Browse Reports →
          </Link>
          <Link href="/"
            className="border border-white/10 hover:border-white/20 text-slate-400 text-sm px-6 py-3 rounded-lg transition">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
