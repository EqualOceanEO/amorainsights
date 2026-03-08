import Link from "next/link";

export default function IndustriesPage() {
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
              href="/signup"
              className="rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="mb-6 text-5xl font-bold text-slate-900 dark:text-white md:text-6xl">
            Six Future Industries
          </h1>
          <p className="mx-auto max-w-3xl text-xl text-slate-600 dark:text-slate-400">
            China's strategic focus areas for the next decade — where high-end, intelligent, 
            and green transformation converge to shape the global economy
          </p>
        </div>
      </section>

      {/* Industries Grid */}
      <section className="border-t border-slate-200 bg-white px-6 py-24 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8">
            {industries.map((industry, index) => (
              <div
                key={index}
                className="group rounded-2xl border border-slate-200 bg-white p-8 transition-all hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700 md:p-12"
              >
                <div className="flex flex-col gap-6 md:flex-row md:items-start">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-4xl text-white shadow-lg">
                    {industry.icon}
                  </div>
                  <div className="flex-1">
                    <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
                      {industry.name}
                    </h2>
                    <p className="mb-6 text-lg text-slate-600 dark:text-slate-400">
                      {industry.description}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {industry.topics.map((topic, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Three Transformations */}
      <section className="border-t border-slate-200 bg-slate-50 px-6 py-24 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">
              The "Three Transformations" Framework
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-400">
              Our analytical lens for understanding China's industrial evolution across all six sectors
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {transformations.map((item, index) => (
              <div key={index} className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
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

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-16 shadow-2xl md:px-16 md:py-24">
            <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">
              Dive Deeper
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-blue-100">
              Get access to our full enterprise database, research reports, and exclusive analysis on all six future industries.
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

const industries = [
  {
    name: "Future Information",
    description: "Next-generation computing, communications, and digital infrastructure powering the intelligent economy. From quantum computing to 6G networks, China is investing heavily in the foundational technologies that will define the information age.",
    icon: "🖥️",
    topics: ["AI & Machine Learning", "Quantum Computing", "6G Communications", "Semiconductors", "Cloud Infrastructure", "Cybersecurity"],
  },
  {
    name: "Future Health",
    description: "Revolutionary biotechnology, precision medicine, and health tech innovations extending human lifespan and quality of life. China's health tech sector is rapidly evolving with breakthroughs in genomics, drug discovery, and medical devices.",
    icon: "🧬",
    topics: ["Biotechnology", "Precision Medicine", "Medical Devices", "Drug Discovery", "Digital Health", "Genomics"],
  },
  {
    name: "Future Energy",
    description: "Clean energy technologies, storage solutions, and smart grids enabling the transition to carbon neutrality. China leads globally in solar, wind, and battery technology, driving the world's energy transformation.",
    icon: "⚡",
    topics: ["Solar & Wind", "Energy Storage", "Hydrogen", "Smart Grids", "Nuclear Fusion", "Carbon Capture"],
  },
  {
    name: "Future Space",
    description: "Aerospace engineering, satellite technology, and commercial spaceflight opening the final frontier. China's space program continues to achieve milestones in exploration, communication, and commercial applications.",
    icon: "🚀",
    topics: ["Satellite Technology", "Space Exploration", "Commercial Spaceflight", "Launch Systems", "Space Stations", "Deep Space"],
  },
  {
    name: "Future Materials",
    description: "Advanced materials science enabling breakthroughs across all industries. From nanomaterials to sustainable alternatives, material innovation is the foundation of technological progress.",
    icon: "🔬",
    topics: ["Nanomaterials", "Graphene", "Biomaterials", "Smart Materials", "Sustainable Materials", "Composites"],
  },
  {
    name: "Future Manufacturing",
    description: "Robotics, automation, and smart factories reshaping production. China's manufacturing sector is undergoing intelligent transformation with Industry 4.0 technologies leading the way.",
    icon: "🏭",
    topics: ["Industrial Robotics", "Automation", "Smart Factories", "Industrial IoT", "3D Printing", "Digital Twins"],
  },
];

const transformations = [
  {
    name: "High-End Transformation",
    description: "Moving up the global value chain through advanced technologies, premium positioning, and intellectual property creation. Chinese companies are shifting from 'made in China' to 'innovated in China'.",
    icon: "📈",
  },
  {
    name: "Intelligent Transformation",
    description: "AI-driven automation, data analytics, and smart decision-making permeating all industries. Intelligence is becoming the core competitive advantage in the digital economy.",
    icon: "🤖",
  },
  {
    name: "Green Transformation",
    description: "Sustainable practices, carbon neutrality commitments, and environmental responsibility driving business strategy. Green is no longer optional — it's essential for long-term success.",
    icon: "🌱",
  },
];
