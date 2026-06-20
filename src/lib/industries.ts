/**
 * Industry hierarchy configuration (Level 1 & Level 2)
 * Used across news pages, admin forms, and other components
 */

interface Level2Item {
  name: string;   // Display name (e.g. "Cell Therapy")
  slug: string;   // URL-friendly slug (e.g. "cell-therapy")
}

interface IndustryGroup {
  level1: { id: string; label: string };
  level2: Level2Item[];
}

export const INDUSTRY_HIERARCHY: IndustryGroup[] = [
  {
    level1: { id: 'ai', label: 'AI' },
    level2: [
      { name: 'Foundation Models', slug: 'foundation-models' },
      { name: 'AI Agents', slug: 'ai-agents' },
      { name: 'AI Semiconductors', slug: 'ai-semiconductors' },
      { name: 'Computer Vision', slug: 'computer-vision' },
      { name: 'NLP & Speech', slug: 'nlp-speech' },
      { name: 'AI for Science', slug: 'ai-for-science' },
    ],
  },
  {
    level1: { id: 'life-sciences', label: 'Life Sciences' },
    level2: [
      { name: 'Gene Editing', slug: 'gene-editing' },
      { name: 'Synthetic Biology', slug: 'synthetic-biology' },
      { name: 'Cell Therapy', slug: 'cell-therapy' },
      { name: 'AI Drug Discovery', slug: 'ai-drug-discovery' },
      { name: 'Medical Devices', slug: 'medical-devices' },
      { name: 'Genomics & Diagnostics', slug: 'genomics-diagnostics' },
    ],
  },
  {
    level1: { id: 'green-tech', label: 'Green Tech' },
    level2: [
      { name: 'EV Batteries', slug: 'ev-batteries' },
      { name: 'Green Hydrogen', slug: 'green-hydrogen' },
      { name: 'Solar Photovoltaics', slug: 'solar-photovoltaics' },
      { name: 'Energy Storage', slug: 'energy-storage' },
      { name: 'Carbon Capture & Removal', slug: 'carbon-capture-removal' },
      { name: 'Circular Economy', slug: 'circular-economy' },
    ],
  },
  {
    level1: { id: 'manufacturing', label: 'Manufacturing' },
    level2: [
      { name: 'Industrial Robots', slug: 'industrial-robots' },
      { name: 'Humanoid Robots', slug: 'humanoid-robots' },
      { name: 'Additive Manufacturing', slug: 'additive-manufacturing' },
      { name: 'Digital Twin', slug: 'digital-twin' },
      { name: 'IIoT & Smart Factory', slug: 'iiot-smart-factory' },
      { name: 'Autonomous Vehicles', slug: 'autonomous-vehicles' },
    ],
  },
  {
    level1: { id: 'new-space', label: 'New Space' },
    level2: [
      { name: 'Launch Vehicles', slug: 'launch-vehicles' },
      { name: 'Satellite Internet', slug: 'satellite-internet' },
      { name: 'Earth Observation', slug: 'earth-observation' },
      { name: 'Space Propulsion', slug: 'space-propulsion' },
      { name: 'Low-Altitude Economy', slug: 'low-altitude-economy' },
      { name: 'Space Manufacturing', slug: 'space-manufacturing' },
    ],
  },
  {
    level1: { id: 'advanced-materials', label: 'Advanced Materials' },
    level2: [
      { name: 'Carbon Fiber', slug: 'carbon-fiber' },
      { name: 'Semiconductor Materials', slug: 'semiconductor-materials' },
      { name: 'Battery Materials', slug: 'battery-materials' },
      { name: 'Metamaterials', slug: 'metamaterials' },
      { name: 'Graphene', slug: 'graphene' },
      { name: 'Biomaterials', slug: 'biomaterials' },
    ],
  },
];

// Flatten to simple industry list for backward compatibility
export const INDUSTRIES = [
  { slug: '', label: 'All' },
  ...INDUSTRY_HIERARCHY.map(h => ({ slug: h.level1.id, label: h.level1.label }))
];

// Get level 2 items (name + slug) by level 1 ID
export function getLevel2Options(level1Id: string): Level2Item[] {
  const group = INDUSTRY_HIERARCHY.find(h => h.level1.id === level1Id);
  return group?.level2 || [];
}

// Get level 2 slugs only (for generateStaticParams)
export function getLevel2Slugs(level1Id: string): string[] {
  return getLevel2Options(level1Id).map(item => item.slug);
}

// Resolve a slug back to its display name
export function getSubSectorName(slug: string, level1Id?: string): string {
  if (level1Id) {
    const items = getLevel2Options(level1Id);
    const found = items.find(i => i.slug === slug);
    if (found) return found.name;
  }
  // fallback: search all groups
  for (const group of INDUSTRY_HIERARCHY) {
    const found = group.level2.find(i => i.slug === slug);
    if (found) return found.name;
  }
  return slug;
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
