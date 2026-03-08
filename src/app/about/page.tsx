import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Amora Insights
            </span>
          </Link>
          <div className="flex items-center gap-8">
            <Link href="/" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              Home
            </Link>
            <Link
              href="/"
              className="rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-8 text-5xl font-bold text-slate-900 dark:text-white md:text-6xl">
            About Amora Insights
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Bridging the gap between China's innovation ecosystem and the global business community
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="border-t border-slate-200 bg-white px-6 py-24 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-3xl font-bold text-slate-900 dark:text-white">Our Mission</h2>
          <div className="prose prose-lg dark:prose-invert">
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Amora Insights was founded with a clear purpose: to provide the global business community with 
              deep, actionable intelligence on China's rapidly evolving innovation landscape.
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              We focus on the{" "}
              <span className="font-semibold text-slate-900 dark:text-white">
                Six Future Industries
              </span>{" "}
              that will shape the next decade: Future Information, Future Health, Future Energy, 
              Future Space, Future Materials, and Future Manufacturing.
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Through our analytical framework of the{" "}
              <span className="font-semibold text-slate-900 dark:text-white">
                "Three Transformations"
              </span>{" "}
              (High-End, Intelligent, and Green), we help investors, executives, and policymakers 
              understand not just what's happening in China, but why it matters for the future.
            </p>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="border-t border-slate-200 bg-slate-50 px-6 py-24 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 text-3xl font-bold text-slate-900 dark:text-white text-center">What We Offer</h2>
          <div className="grid gap-8 md:grid-cols-2">
            {offerings.map((item, index) => (
              <div key={index} className="rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 text-3xl">{item.icon}</div>
                <h3 className="mb-3 text-xl font-semibold text-slate-900 dark:text-white">
                  {item.name}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-16 shadow-2xl md:px-16">
            <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">
              Ready to Get Started?
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-blue-100">
              Join our community of innovators, investors, and decision-makers who rely on Amora Insights for China intelligence.
            </p>
            <Link
              href="/signup"
              className="inline-block rounded-full bg-white px-8 py-4 text-base font-semibold text-blue-600 transition-colors hover:bg-blue-50"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-12 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl text-center text-sm text-slate-500 dark:text-slate-500">
          © 2026 Amora Insights. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

const offerings = [
  {
    name: "Research Reports",
    description: "Comprehensive analysis of specific industries, companies, and technologies with actionable insights",
    icon: "📊",
  },
  {
    name: "Enterprise Database",
    description: "Searchable database of Chinese tech companies with financials, funding, and competitive positioning",
    icon: "🗄️",
  },
  {
    name: "Daily Insights",
    description: "Curated news and expert commentary on the latest developments in China's innovation ecosystem",
    icon: "📰",
  },
  {
    name: "Membership Community",
    description: "Access to exclusive content, data exports, and networking with other professionals",
    icon: "🌐",
  },
];
