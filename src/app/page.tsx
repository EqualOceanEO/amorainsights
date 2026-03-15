import Link from "next/link";
import SubscribeBox from "@/components/SubscribeBox";

const industries = [
  {
    slug: "ai",
    name: "AI",
    description:
      "Foundation models, applied AI, autonomous systems, and the infrastructure powering the next wave of intelligence.",
    icon: "🤖",
  },
  {
    slug: "life-sciences",
    name: "Life Sciences",
    description:
      "Biotech, precision medicine, genomics, MedTech, and the convergence of biology with engineering.",
    icon: "🧬",
  },
  {
    slug: "green-tech",
    name: "Green Tech",
    description:
      "Clean energy, energy storage, climate tech, next-gen EVs, and the infrastructure for a decarbonized economy.",
    icon: "⚡",
  },
  {
    slug: "intelligent-manufacturing",
    name: "Intelligent Manufacturing",
    description:
      "Robotics, industrial automation, smart factories, and the digitization of physical production.",
    icon: "🦾",
  },
  {
    slug: "new-space",
    name: "New Space",
    description:
      "Commercial spaceflight, satellite constellations, deep-space exploration, and space-derived data services.",
    icon: "🚀",
  },
  {
    slug: "advanced-materials",
    name: "Advanced Materials",
    description:
      "Semiconductor materials, next-gen chips, nanomaterials, and the science enabling every other frontier industry.",
    icon: "⚛️",
  },
];

const pillars = [
  {
    label: "Quantitative",
    heading: "Measure what matters",
    description:
      "Every analysis is grounded in data — financials, patents, capacity metrics, and application benchmarks. No narratives without numbers.",
    icon: "📐",
  },
  {
    label: "Comparative",
    heading: "Cross-market perspective",
    description:
      "We put US, Chinese, and global players side by side. Understanding one market in isolation is no longer enough.",
    icon: "⚖️",
  },
  {
    label: "Applied",
    heading: "From lab to deployment",
    description:
      "We focus on technologies that are reaching real-world scale — not concept papers. Depth over breadth, always.",
    icon: "🎯",
  },
];

const features = [
  {
    name: "Research Reports",
    description:
      "In-depth, data-driven reports benchmarking frontier tech companies and industry dynamics across markets.",
    icon: "📊",
  },
  {
    name: "Company Profiles",
    description:
      "Structured profiles on leading and emerging deep-tech companies — financials, products, and competitive position.",
    icon: "🗄️",
  },
  {
    name: "News & Insights",
    description:
      "Curated daily coverage of frontier tech developments, filtered for signal over noise.",
    icon: "📰",
  },
  {
    name: "Member Exclusives",
    description:
      "Premium content, data exports, and early access to reports for subscribers.",
    icon: "⭐",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* ── Navigation ── */}
      <header className="border-b border-gray-800 bg-gray-900/60 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Amora<span className="text-blue-400">Insights</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-300">
            <Link href="/industries" className="hover:text-white transition">
              Industries
            </Link>
            <Link href="/about" className="hover:text-white transition">
              About
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-gray-300 hover:text-white transition"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-semibold transition"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <span className="inline-block text-xs font-semibold tracking-widest text-blue-400 uppercase mb-6">
          Frontier Tech Research
        </span>
        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 tracking-tight">
          Mapping Industries.{" "}
          <span className="text-blue-400">Measuring Applications.</span>
          <br />
          Benchmarking the World.
        </h1>
        <p className="text-gray-300 text-xl max-w-2xl mx-auto mb-10">
          Clarity on frontier tech, before the market catches up.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-lg transition"
          >
            Start Free Trial
          </Link>
          <Link
            href="/industries"
            className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-8 py-3 rounded-lg transition"
          >
            Explore Industries
          </Link>
        </div>
      </section>

      {/* ── Six Industries ── */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-gray-800">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Six Frontier Industries</h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Comprehensive coverage across the industries defining the next decade of innovation.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {industries.map((industry) => (
            <div
              key={industry.slug}
              className="bg-gray-900 border border-gray-800 hover:border-blue-600 rounded-xl p-6 transition group cursor-pointer"
            >
              <div className="text-3xl mb-3">{industry.icon}</div>
              <h3 className="font-semibold text-white group-hover:text-blue-300 transition mb-2">
                {industry.name}
              </h3>
              <p className="text-sm text-gray-500">{industry.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Three Pillars ── */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-gray-800">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">How We Think</h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Three principles behind every piece of research we publish.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((pillar) => (
            <div
              key={pillar.label}
              className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center"
            >
              <div className="text-4xl mb-4">{pillar.icon}</div>
              <span className="text-xs font-semibold tracking-widest text-blue-400 uppercase">
                {pillar.label}
              </span>
              <h3 className="text-xl font-semibold mt-2 mb-3">{pillar.heading}</h3>
              <p className="text-gray-500 text-sm">{pillar.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-gray-800">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">What You Get</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6"
            >
              <div className="text-2xl mb-3">{feature.icon}</div>
              <h3 className="font-semibold text-white mb-1">{feature.name}</h3>
              <p className="text-sm text-gray-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center border-t border-gray-800">
        <h2 className="text-3xl font-bold mb-4">
          Get ahead of the market.
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto mb-8">
          Access research reports, company profiles, and curated frontier tech insights — built for investors, strategists, and research teams.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-lg transition"
          >
            Start Free Trial
          </Link>
          <Link
            href="/about"
            className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-8 py-3 rounded-lg transition"
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* ── Newsletter Subscribe Section ── */}
      <section className="py-20 border-t border-gray-800 bg-gray-950">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-xs tracking-widest text-blue-500 uppercase mb-4">每周五送达</p>
          <h2 className="text-3xl font-bold text-white mb-4 font-serif">AMORA Weekly</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            六大前沿赛道深度简报，无需注册账号，免费订阅。
          </p>
          <div className="max-w-sm mx-auto">
            <SubscribeBox source="homepage" />
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-bold text-lg">
              Amora<span className="text-blue-400">Insights</span>
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              Mapping Industries. Measuring Applications. Benchmarking the World.
            </div>
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-gray-300 transition">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-gray-300 transition">
              Terms
            </Link>
            <Link href="/contact" className="hover:text-gray-300 transition">
              Contact
            </Link>
          </div>
          <div className="text-xs text-gray-600">
            © 2026 Amora Insights. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
