import type { Metadata } from 'next';
import SubscribeBox from '@/components/SubscribeBox';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Subscribe — AMORA Weekly 深科技简报',
  description: '每周精选 AI、生命科学、绿色科技、智能制造、商业航天、先进材料六大赛道深度洞察，无需注册，免费订阅。',
};

const tracks = [
  { icon: '🤖', name: 'AI & 大模型' },
  { icon: '🧬', name: '生命科学' },
  { icon: '⚡', name: '绿色科技' },
  { icon: '🏭', name: '智能制造' },
  { icon: '🚀', name: '商业航天' },
  { icon: '🔬', name: '先进材料' },
];

export default function SubscribePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <defs><linearGradient id="nl" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#1d4ed8"/><stop offset="100%" stopColor="#60a5fa"/></linearGradient></defs>
              <rect width="32" height="32" rx="7" fill="#060d1c"/>
              <rect x="5" y="9" width="22" height="3" rx="1.5" fill="url(#nl)"/>
              <rect x="5" y="15" width="16" height="3" rx="1.5" fill="url(#nl)" opacity="0.7"/>
              <rect x="5" y="21" width="10" height="3" rx="1.5" fill="url(#nl)" opacity="0.4"/>
            </svg>
            <span className="font-serif font-bold tracking-widest text-sm">AMORA</span>
          </Link>
          <Link href="/reports" className="text-xs text-slate-500 hover:text-slate-300 transition">
            浏览报告 →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-400 text-xs tracking-widest uppercase mb-8">
          每周五送达
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
          AMORA Weekly<br />
          <span className="text-blue-400">深科技简报</span>
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed mb-12">
          六大前沿赛道，每周精选研究结论与行业洞察。<br className="hidden sm:block" />
          无需注册账号，填邮箱即可免费订阅。
        </p>

        {/* Subscribe box */}
        <div className="max-w-sm mx-auto mb-16">
          <SubscribeBox source="subscribe_page" />
        </div>

        {/* Tracks */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-16">
          {tracks.map((t) => (
            <div key={t.name} className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white/3 border border-white/5">
              <span className="text-xl">{t.icon}</span>
              <span className="text-xs text-slate-500">{t.name}</span>
            </div>
          ))}
        </div>

        {/* Social proof / features */}
        <div className="grid sm:grid-cols-3 gap-4 text-left">
          {[
            { title: '每周一报', desc: '精炼不堆砌，10分钟读完核心结论' },
            { title: '研究支撑', desc: '结论有数据、有来源，不是二手摘抄' },
            { title: '随时退订', desc: '回复邮件即可退订，零骚扰承诺' },
          ].map((f) => (
            <div key={f.title} className="p-4 rounded-lg border border-white/5 bg-white/2">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span className="text-sm font-medium text-white">{f.title}</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
