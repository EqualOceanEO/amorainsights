import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';

const FREE_FEATURES = [
  { icon: '📰', text: 'Curated news — all sourced articles, always free' },
  { icon: '📊', text: 'Report summaries & executive overviews' },
  { icon: '🏢', text: 'Basic company profiles (name, description, status)' },
  { icon: '🔍', text: 'AMORA Score overview (5-axis snapshot)' },
  { icon: '📧', text: 'AMORA Weekly briefing — every Friday, free' },
];

const PRO_FEATURES = [
  { icon: '✍️', text: 'Original analysis & deep-dive research articles' },
  { icon: '📄', text: 'Full research reports with data & charts' },
  { icon: '📊', text: 'Interactive AMORA charts & score breakdown' },
  { icon: '💰', text: 'Complete funding, valuation & investor data' },
  { icon: '🧠', text: 'Team, technology & patent intelligence' },
  { icon: '🔗', text: 'Supply chain & customer breakdowns' },
  { icon: '📋', text: 'Searchable report archive with export' },
  { icon: '🚀', text: 'Priority access to new research' },
];

const FAQ = [
  {
    q: 'What is included in the free plan?',
    a: 'All curated news articles (sourced from third parties), report summaries, basic company info, AMORA Score snapshots, and the weekly AMORA briefing.',
  },
  {
    q: 'What does $19.9/month unlock?',
    a: 'Everything: original AMORA analysis articles, full research reports, interactive charts, complete company profiles with funding/technology/supply chain data, and the searchable report archive.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel from your account settings or email us — no questions asked. No long-term commitment.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'All major credit and debit cards via Stripe. Secure, encrypted checkout.',
  },
  {
    q: 'Is there a team or institutional plan?',
    a: 'Yes. Contact us at hello@amorainsights.com for enterprise pricing with API access and team collaboration.',
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <SiteNav />

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 pt-20 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-600/20 text-blue-400 text-xs tracking-widest uppercase px-3 py-1.5 rounded-full mb-6">
          Simple Pricing
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
          One plan. <span className="text-blue-400">Everything included.</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          No tiers, no confusion. Subscribe once, access all AMORA research — 
          original articles, full reports, company intelligence, and interactive data.
        </p>
      </div>

      {/* Pricing cards */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free Plan */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold">Free</h2>
                <span className="text-xs font-medium bg-gray-800 text-gray-400 px-2.5 py-1 rounded-full">
                  No credit card
                </span>
              </div>
              <div className="text-3xl font-bold">$0<span className="text-sm text-gray-500 font-normal ml-1">/forever</span></div>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {FREE_FEATURES.map((f) => (
                <li key={f.text} className="flex items-start gap-3 text-sm text-gray-400">
                  <span className="shrink-0 text-base">{f.icon}</span>
                  <span>{f.text}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/subscribe"
              className="block w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition text-center text-sm"
            >
              Get Started Free
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-gradient-to-b from-blue-900/20 to-gray-900 border-2 border-blue-500/40 rounded-2xl p-6 flex flex-col relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-4 py-1 rounded-full whitespace-nowrap">
              Most Popular
            </div>
            <div className="mb-6 mt-2">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold text-blue-300">Pro</h2>
                <span className="text-xs font-medium bg-green-900/40 text-green-400 px-2.5 py-1 rounded-full">
                  Cancel anytime
                </span>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-3xl font-bold text-white">$19.9</span>
                <span className="text-gray-400 text-sm pb-1">/month</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Billed monthly. No long-term commitment.</p>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-start gap-3 text-sm text-blue-200 font-medium">
                <span className="shrink-0">∞</span>
                <span>Everything in Free, plus:</span>
              </li>
              {PRO_FEATURES.map((f) => (
                <li key={f.text} className="flex items-start gap-3 text-sm text-gray-300">
                  <span className="shrink-0 text-base">{f.icon}</span>
                  <span>{f.text}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/subscribe/pro"
              className="block w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-xl transition text-center text-sm"
            >
              Subscribe Now →
            </Link>
          </div>
        </div>

        {/* Social proof */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-xs text-gray-600">
          <span>🔒 Secure checkout via Stripe</span>
          <span>📦 Instant access after payment</span>
          <span>🌍 500+ analysts trust AMORA</span>
        </div>
      </div>

      {/* FAQ */}
      <section className="border-t border-gray-800 bg-gray-950 py-16">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-lg font-semibold text-center text-gray-300 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQ.map((item) => (
              <div key={item.q} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="text-sm font-medium text-white mb-1">{item.q}</div>
                <div className="text-xs text-gray-400 leading-relaxed">{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
