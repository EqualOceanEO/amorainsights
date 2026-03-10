import Link from "next/link";

export default function Home() {
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
          <div className="hidden items-center gap-8 md:flex">
            <Link href="#industries" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              Industries
            </Link>
            <Link href="#about" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              About
            </Link>
            <Link href="#subscribe" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              Subscribe
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-24 md:py-32">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
            <span className="flex h-2 w-2 items-center justify-center">
              <span className="animate-pulse rounded-full bg-blue-500 h-2 w-2"></span>
            </span>
            China Innovation Intelligence
          </div>
          <h1 className="mb-8 text-5xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white md:text-7xl">
            Decoding China's{" "}
            <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 bg-clip-text text-transparent">
              Future Industries
            </span>
          </h1>
          <p className="mx-auto mb-12 max-w-3xl text-xl text-slate-600 dark:text-slate-400">
            Deep-dive research and analysis on China's innovation in{" "}
            <span className="font-semibold text-slate-900 dark:text-white">
              Future Information, Health, Energy, Space, Materials, and Manufacturing
            </span>
            . Intelligence + Green transformation solutions for the next decade.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="#subscribe"
              className="w-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 sm:w-auto"
            >
              Start Free Trial
            </Link>
            <Link
              href="#industries"
              className="w-full rounded-full border border-slate-300 bg-white px-8 py-4 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 sm:w-auto"
            >
              Explore Industries
            </Link>
          </div>
        </div>
      </section>

      {/* Six Future Industries */}
      <section id="industries" className="border-t border-slate-200 bg-slate-50 px-6 py-24 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">
              Six Future Industries
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-400">
              Comprehensive coverage of China's strategic focus areas for high-end, intelligent, and green transformation
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {industries.map((industry, index) => (
              <div
                key={index}
                className="group rounded-2xl border border-slate-200 bg-white p-8 transition-all hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700"
              >
                <div className="mb-4 text-4xl">{industry.icon}</div>
                <h3 className="mb-3 text-xl font-semibold text-slate-900 dark:text-white">
                  {industry.name}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {industry.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Three Transformations */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">
              The "Three Transformations" Framework
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-400">
              Our analytical lens for understanding China's industrial evolution
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {transformations.map((item, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-3xl text-white shadow-lg">
                  {item.icon}
                </div>
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

      {/* Features */}
      <section className="border-t border-slate-200 bg-slate-50 px-6 py-24 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">
              What You Get
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">
                    {feature.name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / Subscribe */}
      <section id="subscribe" className="px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-16 text-center shadow-2xl md:px-16 md:py-24">
            <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">
              Ready to Dive Deep?
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-blue-100">
              Get access to our research reports, enterprise database, and exclusive insights on China's innovation landscape.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="w-full rounded-full bg-white px-8 py-4 text-base font-semibold text-blue-600 transition-colors hover:bg-blue-50 sm:w-auto"
              >
                Start Free Trial
              </Link>
              <Link
                href="#about"
                className="w-full rounded-full border border-white/30 bg-transparent px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-12 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Amora Insights
              </span>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                China Innovation Intelligence
              </p>
            </div>
            <div className="flex gap-6 text-sm text-slate-600 dark:text-slate-400">
              <Link href="#" className="hover:text-slate-900 dark:hover:text-white">Privacy</Link>
              <Link href="#" className="hover:text-slate-900 dark:hover:text-white">Terms</Link>
              <Link href="#" className="hover:text-slate-900 dark:hover:text-white">Contact</Link>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-200 pt-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-500">
            © 2026 Amora Insights. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

const industries = [
  {
    name: "Future Information",
    description: "AI, quantum computing, next-gen communications, and digital infrastructure",
    icon: "🖥️",
  },
  {
    name: "Future Health",
    description: "Biotech, precision medicine, medical devices, and health tech innovation",
    icon: "🧬",
  },
  {
    name: "Future Energy",
    description: "Renewables, energy storage, hydrogen, and smart grid technologies",
    icon: "⚡",
  },
  {
    name: "Future Space",
    description: "Aerospace, satellite tech, space exploration, and commercial spaceflight",
    icon: "🚀",
  },
  {
    name: "Future Materials",
    description: "Advanced materials, nanotechnology, and sustainable material science",
    icon: "🔬",
  },
  {
    name: "Future Manufacturing",
    description: "Robotics, automation, smart factories, and industrial IoT",
    icon: "🏭",
  },
];

const transformations = [
  {
    name: "Advanced",
    description: "Moving up the value chain with advanced technologies and premium positioning",
    icon: "📈",
  },
  {
    name: "Intelligent Transformation",
    description: "AI-driven automation, data analytics, and smart decision-making",
    icon: "🤖",
  },
  {
    name: "Green Transformation",
    description: "Sustainable practices, carbon neutrality, and environmental responsibility",
    icon: "🌱",
  },
];

const features = [
  {
    name: "Research Reports",
    description: "In-depth analysis reports on specific industries and companies",
    icon: "📊",
  },
  {
    name: "Enterprise Database",
    description: "Comprehensive database of Chinese tech companies with comparative analysis",
    icon: "🗄️",
  },
  {
    name: "News & Insights",
    description: "Daily curated news and expert commentary on innovation trends",
    icon: "📰",
  },
  {
    name: "Email Newsletter",
    description: "Weekly digest of key developments delivered to your inbox",
    icon: "📧",
  },
  {
    name: "Member Exclusives",
    description: "Premium content, data exports, and early access to reports",
    icon: "⭐",
  },
  {
    name: "Expert Network",
    description: "Connect with analysts and industry experts for deeper insights",
    icon: "🌐",
  },
];
