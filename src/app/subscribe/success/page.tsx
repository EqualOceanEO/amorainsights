import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Welcome to AMORA Pro',
};

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-blue-600/10 border border-blue-500/30 flex items-center justify-center mx-auto mb-8">
          <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="font-serif text-3xl font-bold mb-3">
          Welcome to <span className="text-blue-400">AMORA Pro</span>
        </h1>
        <p className="text-slate-400 text-base leading-relaxed mb-8">
          Your 7-day free trial has started. You now have full access to all reports and deep-dive analysis.
        </p>

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
