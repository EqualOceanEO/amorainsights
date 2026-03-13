import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Navigation */}
      <nav>
        <div>Amora Insights</div>
        <div>
          <Link href="/industries">Industries</Link>
          <Link href="/about">About</Link>
          <Link href="/subscribe">Subscribe</Link>
          <Link href="/signin">Sign In</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section>
        <h1>China Innovation Intelligence</h1>
        <h2>DECODING CHINA'S FUTURE INDUSTRIES</h2>
        <p>
          Deep-dive research and analysis on China's innovation in Future Information, 
          Health, Energy, Space, Materials, and Manufacturing. Intelligence + Green 
          transformation solutions for the next decade.
        </p>
        <div>
          <button>Start Free Trial</button>
          <button>Explore Industries</button>
        </div>
      </section>

      {/* Six Future Industries */}
      <section>
        <h2>SIX FUTURE INDUSTRIES</h2>
        <p>
          Comprehensive coverage of China's strategic focus areas for high-end, 
          intelligent, and green transformation
        </p>
        <div>
          {industries.map((industry, index) => (
            <div key={index}>
              <div>{industry.icon}</div>
              <h3>{industry.name}</h3>
              <p>{industry.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Three Transformations */}
      <section>
        <h2>THE "THREE TRANSFORMATIONS" FRAMEWORK</h2>
        <p>Our analytical lens for understanding China's industrial evolution</p>
        <div>
          {transformations.map((item, index) => (
            <div key={index}>
              <div>{item.icon}</div>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section>
        <h2>WHAT YOU GET</h2>
        <div>
          {features.map((feature, index) => (
            <div key={index}>
              <div>{feature.icon}</div>
              <h3>{feature.name}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA / Subscribe */}
      <section>
        <h2>READY TO DIVE DEEP?</h2>
        <p>
          Get access to our research reports, enterprise database, and exclusive 
          insights on China's innovation landscape.
        </p>
        <div>
          <button>Start Free Trial</button>
          <button>Learn More</button>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div>Amora Insights</div>
        <div>China Innovation Intelligence</div>
        <div>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <div>© 2026 Amora Insights. All rights reserved.</div>
      </footer>
    </>
  );
}

// 数据定义
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
