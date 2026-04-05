import Link from "next/link";
import SubscribeBox from "@/components/SubscribeBox";

const team = [
  {
    name: "Research Team",
    description:
      "Former analysts from leading investment banks and consultancies with deep expertise in Chinese innovation ecosystems.",
    icon: "🔍",
  },
  {
    name: "Technology Team",
    description:
      "Engineers and data scientists building the tools that turn raw data into actionable intelligence.",
    icon: "💻",
  },
  {
    name: "Advisory Network",
    description:
      "Industry veterans, academics, and operators across the six future industries providing ground-level insight.",
    icon: "🌐",
  },
];

const values = [
  {
    title: "Depth over Breadth",
    body: "We focus on genuine understanding rather than surface-level summaries. Every report is backed by primary research and expert interviews.",
    icon: "📐",
  },
  {
    title: "Evidence-Based",
    body: "Our conclusions are grounded in data, not speculation. We cite sources, show our methodology, and acknowledge uncertainty.",
    icon: "📊",
  },
  {
    title: "Accessible Intelligence",
    body: "Complex topics deserve clear explanations. We translate technical and regulatory complexity into language decision-makers can act on.",
    icon: "💡",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* ── Nav ── */}
      <header className="border-b border-gray-800 bg-gray-900/60 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Amora<span className="text-blue-400">Insights</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-300">
            <Link href="/industries" className="hover:text-white transition">
              Industries
            </Link>
            <Link href="/about" className="text-white font-medium">
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
              Subscribe Now
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <span className="inline-block text-xs font-semibold tracking-widest text-blue-400 uppercase mb-4">
          About Us
        </span>
        <h1 className="text-5xl font-bold mb-6">
          We make China&apos;s innovation
          <br />
          <span className="text-blue-400">legible to the world</span>
        </h1>
        <p className="text-gray-400 text-lg leading-relaxed">
          Amora Insights is an independent research platform dedicated to
          tracking and analysing China&apos;s six future industries. We give
          investors, executives, and researchers the context they need to make
          informed decisions about one of the world&apos;s most dynamic
          innovation ecosystems.
        </p>
      </section>

      {/* ── Mission ── */}
      <section className="border-t border-gray-800 bg-gray-900/40">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">
            China&apos;s industrial transformation is the defining economic
            story of the coming decade. Yet quality intelligence is scattered,
            often behind language barriers, and rarely translated into
            decision-useful formats. We exist to fix that.
          </p>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-gray-800">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">How We Work</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((v) => (
            <div
              key={v.title}
              className="bg-gray-900 border border-gray-800 rounded-xl p-7"
            >
              <div className="text-3xl mb-4">{v.icon}</div>
              <h3 className="font-semibold text-white text-lg mb-2">
                {v.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Team ── */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-gray-800">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">The Team</h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            We bring together research expertise, technology, and on-the-ground
            networks across China&apos;s innovation sectors.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {team.map((member) => (
            <div
              key={member.name}
              className="bg-gray-900 border border-gray-800 rounded-xl p-7 text-center"
            >
              <div className="text-4xl mb-4">{member.icon}</div>
              <h3 className="font-semibold text-white text-lg mb-2">
                {member.name}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {member.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center border-t border-gray-800">
        <h2 className="text-3xl font-bold mb-4">Start Exploring</h2>
        <p className="text-gray-400 max-w-xl mx-auto mb-8">
          Dive into our research reports, industry trackers, and enterprise
          database — all in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-lg transition"
          >
            Subscribe Now
          </Link>
          <Link
            href="/industries"
            className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-8 py-3 rounded-lg transition"
          >
            Browse Industries
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
            <SubscribeBox source="about_page" />
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
