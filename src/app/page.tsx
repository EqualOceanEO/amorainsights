import Link from "next/link";

const industries = [
  {
    name: "Future Information",
    description:
      "AI, quantum computing, next-gen communications, and digital infrastructure",
    icon: "🖥️",
  },
  {
    name: "Future Health",
    description:
      "Biotech, precision medicine, medical devices, and health tech innovation",
    icon: "🧬",
  },
  {
    name: "Future Energy",
    description:
      "Renewables, energy storage, hydrogen, and smart grid technologies",
    icon: "⚡",
  },
  {
    name: "Future Space",
    description:
      "Aerospace, satellite tech, space exploration, and commercial spaceflight",
    icon: "🚀",
  },
  {
    name: "Future Materials",
    description:
      "Advanced materials, nanotechnology, and sustainable material science",
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
    description:
      "Moving up the value chain with advanced technologies and premium positioning",
    icon: "📈",
  },
  {
    name: "Intelligent",
    description:
      "AI-driven automation, data analytics, and smart decision-making",
    icon: "🤖",
  },
  {
    name: "Green",
    description:
      "Sustainable practices, carbon neutrality, and environmental responsibility",
    icon: "🌱",
  },
];

const features = [
  {
    name: "Research Reports",
    description:
      "In-depth analysis reports on specific industries and companies",
    icon: "📊",
  },
  {
    name: "Enterprise Database",
    description:
      "Comprehensive database of Chinese tech companies with comparative analysis",
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
    description:
      "Connect with analysts and industry experts for deeper insights",
    icon: "🌐",
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
        <span className="inline-block text-xs font-semibold tracking-widest text-blue-400 uppercase mb-4">
          China Innovation Intelligence
        </span>
        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
          Decoding China&apos;s
          <br />
          <span className="text-blue-400">Future Industries</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10">
          Deep-dive research and analysis on China&apos;s innovation in Future
          Information, Health, Energy, Space, Materials, and Manufacturing.
          Intelligence + Green transformation solutions for the next decade.
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

      {/* ── Six Future Industries ── */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Six Future Industries</h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Comprehensive coverage of China&apos;s strategic focus areas for
            high-end, intelligent, and green transformation
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {industries.map((industry) => (
            <div
              key={industry.name}
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

      {/* ── Three Transformations ── */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-gray-800">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">
            The &ldquo;Three Transformations&rdquo; Framework
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Our analytical lens for understanding China&apos;s industrial
            evolution
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {transformations.map((item) => (
            <div
              key={item.name}
              className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-semibold mb-2">
                {item.name} Transformation
              </h3>
              <p className="text-gray-500 text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-gray-800">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">What You Get</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
        <h2 className="text-3xl font-bold mb-4">Ready to Dive Deep?</h2>
        <p className="text-gray-400 max-w-xl mx-auto mb-8">
          Get access to our research reports, enterprise database, and exclusive
          insights on China&apos;s innovation landscape.
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
