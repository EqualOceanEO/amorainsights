'use client';

import { useState, useMemo } from 'react';
import type { UserCompany, Company, IndustrySlug } from '@/lib/db';

interface Props {
  userCompanies: UserCompany[];
  platformCompanies: Company[];
  industryMeta: Record<IndustrySlug, { name: string; name_cn: string; icon: string }>;
  allIndustrySlugs: IndustrySlug[];
}

const SCORE_DIMENSIONS = [
  { key: 'advancement', label: 'Advancement', desc: 'Technology maturity & R&D depth', weight: 25 },
  { key: 'mastery', label: 'Mastery', desc: 'Team expertise & IP portfolio', weight: 25 },
  { key: 'operations', label: 'Operations', desc: 'Supply chain & production capability', weight: 20 },
  { key: 'reach', label: 'Reach', desc: 'Market presence & customer base', weight: 15 },
  { key: 'affinity', label: 'Affinity', desc: 'Ecosystem partnerships & capital access', weight: 15 },
];

// Simple radar chart using CSS/SVG
function RadarChart({ scores, maxScore = 100 }: { scores: number[]; maxScore?: number }) {
  const labels = ['Advancement', 'Mastery', 'Operations', 'Reach', 'Affinity'];
  const size = 200;
  const center = size / 2;
  const radius = 80;
  const angleStep = (2 * Math.PI) / scores.length;

  const points = scores.map((score, i) => {
    const r = (score / maxScore) * radius;
    const angle = angleStep * i - Math.PI / 2;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  });

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Grid rings */}
      {[0.2, 0.4, 0.6, 0.8, 1].map((scale) => (
        <polygon
          key={scale}
          points={scores.map((_, i) => {
            const r = radius * scale;
            const angle = angleStep * i - Math.PI / 2;
            return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
          }).join(' ')}
          fill="none"
          stroke="#374151"
          strokeWidth="0.5"
        />
      ))}
      {/* Axes */}
      {scores.map((_, i) => {
        const angle = angleStep * i - Math.PI / 2;
        return (
          <line
            key={i}
            x1={center} y1={center}
            x2={center + radius * Math.cos(angle)}
            y2={center + radius * Math.sin(angle)}
            stroke="#374151" strokeWidth="0.5"
          />
        );
      })}
      {/* Data */}
      <path d={pathData} fill="rgba(59,130,246,0.2)" stroke="#3b82f6" strokeWidth="1.5" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#3b82f6" />
      ))}
      {/* Labels */}
      {scores.map((_, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const lx = center + (radius + 20) * Math.cos(angle);
        const ly = center + (radius + 20) * Math.sin(angle);
        return (
          <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
            className="fill-gray-500" style={{ fontSize: '9px' }}>
            {labels[i]}
          </text>
        );
      })}
    </svg>
  );
}

export default function ScoringClient({ userCompanies, platformCompanies, industryMeta, allIndustrySlugs }: Props) {
  const [selectedIndustry, setSelectedIndustry] = useState<IndustrySlug | 'all'>('all');
  const [sortBy, setSortBy] = useState<'total' | 'advancement' | 'mastery' | 'operations' | 'reach' | 'affinity'>('total');

  const allCompanies = useMemo(() => {
    const combined: (Company & { source: string })[] = [
      ...platformCompanies.map((c) => ({ ...c, source: 'platform' })),
    ];
    if (selectedIndustry !== 'all') {
      return combined.filter((c) => c.industry_slug === selectedIndustry);
    }
    return combined;
  }, [platformCompanies, selectedIndustry]);

  const sorted = useMemo(() => {
    return [...allCompanies].sort((a, b) => {
      const getScore = (c: Company) => {
        switch (sortBy) {
          case 'advancement': return c.amora_advancement_score ?? 0;
          case 'mastery': return c.amora_mastery_score ?? 0;
          case 'operations': return c.amora_operations_score ?? 0;
          case 'reach': return c.amora_reach_score ?? 0;
          case 'affinity': return c.amora_affinity_score ?? 0;
          default: return c.amora_total_score ?? 0;
        }
      };
      return getScore(b) - getScore(a);
    }).filter((c) => (c.amora_total_score ?? 0) > 0);
  }, [allCompanies, sortBy]);

  const topCompany = sorted[0];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">AMORA Scoring</h1>
        <p className="text-gray-400 text-sm mt-1">Five-dimension evaluation framework for frontier tech companies.</p>
      </div>

      {/* Scoring Framework */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
        <h2 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">Scoring Framework</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {SCORE_DIMENSIONS.map((dim) => (
            <div key={dim.key} className="text-center">
              <div className="text-2xl font-bold text-blue-400">{dim.weight}%</div>
              <div className="text-sm font-medium text-white mt-1">{dim.label}</div>
              <p className="text-xs text-gray-500 mt-1">{dim.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top Ranked */}
      {topCompany && (
        <div className="bg-gradient-to-r from-blue-900/30 to-gray-900 border border-blue-900/30 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-6">
            <RadarChart scores={[
              topCompany.amora_advancement_score ?? 0,
              topCompany.amora_mastery_score ?? 0,
              topCompany.amora_operations_score ?? 0,
              topCompany.amora_reach_score ?? 0,
              topCompany.amora_affinity_score ?? 0,
            ]} />
            <div>
              <p className="text-xs text-blue-400 font-medium uppercase tracking-wider mb-1">Top Ranked</p>
              <h3 className="text-xl font-bold text-white">{topCompany.name}</h3>
              {topCompany.name_cn && <p className="text-sm text-gray-400">{topCompany.name_cn}</p>}
              <div className="flex gap-4 mt-3">
                <div>
                  <div className="text-3xl font-bold text-blue-400">{topCompany.amora_total_score}</div>
                  <div className="text-xs text-gray-500">Total Score</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {SCORE_DIMENSIONS.map((dim) => {
                    const scoreKey = `amora_${dim.key}_score` as keyof Company;
                    return (
                      <div key={dim.key} className="text-center">
                        <div className="text-sm font-medium text-gray-300">{topCompany[scoreKey] as number ?? '—'}</div>
                        <div className="text-[10px] text-gray-600">{dim.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={selectedIndustry}
          onChange={(e) => setSelectedIndustry(e.target.value as IndustrySlug | 'all')}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Industries</option>
          {allIndustrySlugs.map((slug) => (
            <option key={slug} value={slug}>{industryMeta[slug].icon} {industryMeta[slug].name}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="total">Sort by Total Score</option>
          <option value="advancement">Sort by Advancement</option>
          <option value="mastery">Sort by Mastery</option>
          <option value="operations">Sort by Operations</option>
          <option value="reach">Sort by Reach</option>
          <option value="affinity">Sort by Affinity</option>
        </select>
        <span className="text-sm text-gray-500 self-center ml-auto">{sorted.length} companies scored</span>
      </div>

      {/* Score Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left text-gray-500 text-xs">
              <th className="px-4 py-3 font-medium w-8">#</th>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium text-center">Total</th>
              <th className="px-4 py-3 font-medium text-center">Adv.</th>
              <th className="px-4 py-3 font-medium text-center">Mas.</th>
              <th className="px-4 py-3 font-medium text-center">Ops.</th>
              <th className="px-4 py-3 font-medium text-center">Rea.</th>
              <th className="px-4 py-3 font-medium text-center">Aff.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {sorted.map((company, idx) => (
              <tr key={company.id} className="hover:bg-gray-800/50 transition">
                <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                <td className="px-4 py-3">
                  <span className="text-white font-medium">{company.name}</span>
                  {company.name_cn && <span className="text-gray-500 ml-1.5 text-xs">{company.name_cn}</span>}
                  <span className="text-xs text-gray-600 ml-2">{industryMeta[company.industry_slug]?.icon}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-blue-400 font-bold">{company.amora_total_score ?? '—'}</span>
                </td>
                <td className="px-4 py-3 text-center text-gray-400">{company.amora_advancement_score ?? '—'}</td>
                <td className="px-4 py-3 text-center text-gray-400">{company.amora_mastery_score ?? '—'}</td>
                <td className="px-4 py-3 text-center text-gray-400">{company.amora_operations_score ?? '—'}</td>
                <td className="px-4 py-3 text-center text-gray-400">{company.amora_reach_score ?? '—'}</td>
                <td className="px-4 py-3 text-center text-gray-400">{company.amora_affinity_score ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
