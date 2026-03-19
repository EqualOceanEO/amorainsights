/**
 * Industry hierarchy configuration (Level 1 & Level 2)
 * Used across news pages, admin forms, and other components
 */

export const INDUSTRY_HIERARCHY = [
  {
    level1: { id: 'ai', label: 'AI' },
    level2: ['Foundation Models', 'AI Agents', 'AI Semiconductors', 'Computer Vision', 'NLP & Speech', 'AI for Science']
  },
  {
    level1: { id: 'life-sciences', label: 'Life Sciences' },
    level2: ['Gene Editing', 'Synthetic Biology', 'Cell Therapy', 'AI Drug Discovery', 'Medical Devices', 'Genomics & Diagnostics']
  },
  {
    level1: { id: 'green-tech', label: 'Green Tech' },
    level2: ['EV Batteries', 'Green Hydrogen', 'Solar Photovoltaics', 'Energy Storage', 'Carbon Capture & Removal', 'Circular Economy']
  },
  {
    level1: { id: 'manufacturing', label: 'Manufacturing' },
    level2: []
  },
  {
    level1: { id: 'new-space', label: 'New Space' },
    level2: ['Launch Vehicles', 'Satellite Internet', 'Earth Observation', 'Space Propulsion', 'Low-Altitude Economy', 'Space Manufacturing']
  },
  {
    level1: { id: 'advanced-materials', label: 'Advanced Materials' },
    level2: ['Carbon Fiber & Composites', 'Semiconductor Materials', 'Battery Materials', 'Metamaterials', 'Graphene & Carbon Nanocomposites', 'Biomaterials']
  }
];

// Flatten to simple industry list for backward compatibility
export const INDUSTRIES = [
  { slug: '', label: 'All' },
  ...INDUSTRY_HIERARCHY.map(h => ({ slug: h.level1.id, label: h.level1.label }))
];

// Get level 2 options by level 1 ID
export function getLevel2Options(level1Id: string): string[] {
  const group = INDUSTRY_HIERARCHY.find(h => h.level1.id === level1Id);
  return group?.level2 || [];
}

// Get level 1 label by slug
export function getLevel1Label(slug: string): string {
  if (slug === '') return 'All';
  const group = INDUSTRY_HIERARCHY.find(h => h.level1.id === slug);
  return group?.level1.label || slug;
}

// Color mapping
export const INDUSTRY_COLORS: Record<string, string> = {
  'ai': 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  'life-sciences': 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
  'green-tech': 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  'manufacturing': 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  'new-space': 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
  'advanced-materials': 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
};

export const INDUSTRY_DOT_COLORS: Record<string, string> = {
  'ai': 'bg-blue-400',
  'life-sciences': 'bg-rose-400',
  'green-tech': 'bg-emerald-400',
  'manufacturing': 'bg-amber-400',
  'new-space': 'bg-indigo-400',
  'advanced-materials': 'bg-orange-400',
};
