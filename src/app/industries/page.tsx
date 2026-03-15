import Link from "next/link";
import SubscribeBox from "@/components/SubscribeBox";

const industries = [
  {
    name: "Future Information",
    icon: "🖥️",
    badge: "High Activity",
    badgeColor: "bg-blue-900/50 text-blue-300",
    description:
      "AI large models, quantum computing, next-generation semiconductors, 6G communications, and digital infrastructure powering China's data economy.",
    topics: [
      "Large Language Models",
      "Quantum Computing",
      "Advanced Semiconductors",
      "6G Networks",
      "Edge Computing",
    ],
    reports: 6,
  },
  {
    name: "Future Health",
    icon: "🧬",
    badge: "Growing",
    badgeColor: "bg-green-900/50 text-green-300",
    description:
      "Biotech innovation, precision medicine, CRISPR gene editing, medical device manufacturing, and health-tech platforms transforming patient care.",
    topics: [
      "Gene Editing",
      "Precision Medicine",
      "Medical Devices",
      "AI Diagnostics",
      "Drug Discovery",
    ],
    reports: 4,
  },
  {
    name: "Future Energy",
    icon: "⚡",
    badge: "High Activity",
    badgeColor: "bg-blue-900/50 text-blue-300",
    description:
      "Solar, wind, and battery storage dominance; hydrogen economy development; smart grid modernisation; and EV supply chain leadership.",
    topics: [
      "Battery Storage",
      "Solar Technology",
      "Hydrogen Economy",
      "EV Supply Chain",
      "Smart Grid",
    ],
    reports: 5,
  },
  {
    name: "Future Space",
    icon: "🚀",
    badge: "Emerging",
    badgeColor: "bg-purple-900/50 text-purple-300",
    description:
      "Commercial spaceflight, satellite internet constellations, lunar exploration, space-based manufacturing, and low-Earth orbit services.",
    topics: [
      "Commercial Launch",
      "Satellite Internet",
      "Lunar Programme",
      "Space Manufacturing",
      "Remote Sensing",
    ],
    reports: 3,
  },
  {
    name: "Future Materials",
    icon: "🔬",
    badge: "Emerging",
    badgeColor: "bg-purple-900/50 text-purple-300",
    description:
      "Graphene, carbon fibre, rare earth processing, bio-based materials, and advanced composites enabling next-generation products.",
    topics: [
      "Graphene",
      "Carbon Fibre",
      "Rare Earth Processing",
      "Bio-materials",
      "Nanomaterials",
    ],
    reports: 3,
  },
  {
    name: "Future Manufacturing",
    icon: "🏭",
    badge: "High Activity",
    badgeColor: "bg-blue-900/50 text-blue-300",
    description:
      "Humanoid robotics, industrial automation, smart factory deployment, additive manufacturing, and the digitalisation of China's production base.",
    topics: [
      "Humanoid Robots",
      "Industrial Automation",
      "Smart Factories",
      "3D Printing",
      "Digital Twins",
    ],
    reports: 3,
  },
];

export default function IndustriesPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* ── Nav ── */}
      <header className="border-b border-gray-800 bg-gray-900/60 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Amora<span className="text-blue-400">Insights</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-300">
            <Link href="/industries" className="text-white font-medium">
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
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <span className="inline-block text-xs font-semibold tracking-widest text-blue-400 uppercase mb-4">
          Coverage
        </span>
        <h1 className="text-5xl font-bold mb-4">Six Future Industries</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          China&apos;s government has designated these six sectors as strategic
          national priorities. We track every significant development across all
          of them.
        </p>
      </section>

      {/* ── Industry Cards ── */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {industries.map((industry) => (
            <div
              key={industry.name}
              className="bg-gray-900 border border-gray-800 hover:border-blue-600 rounded-2xl p-7 transition group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{industry.icon}</span>
                  <h2 className="text-xl font-bold text-white group-hover:text-blue-300 transition">
                    {industry.name}
                  </h2>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${industry.badgeColor}`}
                >
                  {industry.badge}
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-400 text-sm leading-relaxed mb-5">
                {industry.description}
              </p>

              {/* Topics */}
              <div className="flex flex-wrap gap-2 mb-5">
                {industry.topics.map((topic) => (
                  <span
                    key={topic}
                    className="text-xs bg-gray-800 text-gray-400 px-3 py-1 rounded-full border border-gray-700"
                  >
                    {topic}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                <span className="text-xs text-gray-500">
                  {industry.reports} reports available
                </span>
                <Link
                  href="/signup"
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium transition"
                >
                  Access reports →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-gray-800 bg-gray-900/40">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Get Full Access to All Industries
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-8">
            Subscribe to unlock all research reports, company profiles, and
            weekly intelligence digests across all six sectors.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold px-10 py-3 rounded-lg transition"
          >
            Start Free Trial
          </Link>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="py-16 border-t border-gray-800 bg-gray-950">
        <div className="max-w-xl mx-auto px-6 text-center">
          <p className="text-xs tracking-widest text-blue-500 uppercase mb-4">Every Friday</p>
          <h2 className="text-2xl font-bold text-white mb-3 font-serif">AMORA Weekly</h2>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            Six frontier tracks, one briefing a week. No account required.
          </p>
          <div className="max-w-sm mx-auto">
            <SubscribeBox source="industries_page" />
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
              China Innovation Intelligence
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
