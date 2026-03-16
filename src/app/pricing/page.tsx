import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4">Choose Your Plan</h1>
        <p className="text-gray-400 text-center mb-12">Get access to all AMORA Insights reports</p>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Free Plan */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-2">Free</h2>
            <p className="text-3xl font-bold mb-6">$0<span className="text-sm text-gray-400 font-normal">/mo</span></p>
            <ul className="space-y-3 mb-8 text-sm text-gray-400">
              <li>✓ Limited free reports</li>
              <li>✓ Basic AMORA scores</li>
              <li>✓ Public insights</li>
            </ul>
            <Link
              href="/subscribe"
              className="block w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition text-center"
            >
              Get Started
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-gradient-to-b from-blue-900/30 to-gray-900 border border-blue-600/50 rounded-2xl p-6 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Popular
            </div>
            <h2 className="text-xl font-semibold mb-2">Pro</h2>
            <p className="text-3xl font-bold mb-6">$29<span className="text-sm text-gray-400 font-normal">/mo</span></p>
            <ul className="space-y-3 mb-8 text-sm text-gray-300">
              <li>✓ All 500+ reports</li>
              <li>✓ Full AMORA scores</li>
              <li>✓ Interactive H5 reports</li>
              <li>✓ Quarterly updates</li>
              <li>✓ Export to PDF</li>
            </ul>
            <Link
              href="/subscribe/pro"
              className="block w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-xl transition text-center"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-2">Enterprise</h2>
            <p className="text-3xl font-bold mb-6">Custom</p>
            <ul className="space-y-3 mb-8 text-sm text-gray-400">
              <li>✓ Everything in Pro</li>
              <li>✓ API access</li>
              <li>✓ Custom reports</li>
              <li>✓ Dedicated support</li>
              <li>✓ Team collaboration</li>
            </ul>
            <Link
              href="/contact"
              className="block w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition text-center"
            >
              Contact Sales
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-600 mt-12">
          🔒 Cancel anytime · 📦 Instant access · 🌍 500+ analysts trust AMORA
        </p>
      </div>
    </div>
  );
}
