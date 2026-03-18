/**
 * Industry hierarchy configuration (Level 1 & Level 2)
 * Used across news pages, admin forms, and other components
 */

export const INDUSTRY_HIERARCHY = [
  {
    level1: { id: 'ai', label: 'AI' },
    level2: ['Large Language Models', 'Computer Vision', 'NLP', 'Robotics']
  },
  {
    level1: { id: 'ai-semiconductors', label: 'AI Semiconductors' },
    level2: ['GPU', 'TPU', 'AI Chip Design', 'Memory']
  },
  {
    level1: { id: 'semiconductors', label: 'Semiconductors' },
    level2: ['Foundry', 'Design', 'Materials', 'Equipment']
  },
  {
    level1: { id: 'autonomous-vehicles', label: 'Autonomous Vehicles' },
    level2: ['Passenger', 'Logistics', 'Sensors', 'Software']
  },
  {
    level1: { id: 'green-tech', label: 'Green Tech' },
    level2: ['Solar', 'Wind', 'Battery', 'Carbon Capture']
  },
  {
    level1: { id: 'life-sciences', label: 'Life Sciences' },
    level2: ['Biotech', 'Pharma', 'Medical Devices', 'Diagnostics']
  },
  {
    level1: { id: 'new-space', label: 'New Space' },
    level2: ['Launch Services', 'Satellites', 'Ground Infra', 'Space Tourism']
  },
  {
    level1: { id: 'advanced-materials', label: 'Advanced Materials' },
    level2: ['Composites', 'Graphene', 'Ceramics', 'Polymers']
  },
  {
    level1: { id: 'humanoid-robots', label: 'Humanoid Robots' },
    level2: ['Hardware', 'Software', 'AI', 'Manufacturing']
  },
  {
    level1: { id: 'ai-agents', label: 'AI Agents' },
    level2: ['Autonomous Agents', 'Multi-Agent Systems', 'Agent Frameworks']
  },
  {
    level1: { id: 'launch-vehicles', label: 'Launch Vehicles' },
    level2: ['Reusable', 'Small Lift', 'Heavy Lift']
  },
  {
    level1: { id: 'gene-editing', label: 'Gene Editing' },
    level2: ['CRISPR', 'Base Editing', 'Prime Editing']
  },
  {
    level1: { id: 'ev-batteries', label: 'EV Batteries' },
    level2: ['Lithium', 'Solid-State', 'Alternative Chemistry']
  },
  {
    level1: { id: 'energy-storage', label: 'Energy Storage' },
    level2: ['Battery', 'Thermal', 'Mechanical']
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
  'ai-semiconductors': 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  'semiconductors': 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
  'autonomous-vehicles': 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
  'green-tech': 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  'life-sciences': 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
  'new-space': 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
  'advanced-materials': 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  'humanoid-robots': 'bg-teal-500/10 text-teal-400 border border-teal-500/20',
  'ai-agents': 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  'launch-vehicles': 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
  'gene-editing': 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
  'ev-batteries': 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  'energy-storage': 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
};

export const INDUSTRY_DOT_COLORS: Record<string, string> = {
  'ai': 'bg-blue-400',
  'ai-semiconductors': 'bg-purple-400',
  'semiconductors': 'bg-violet-400',
  'autonomous-vehicles': 'bg-cyan-400',
  'green-tech': 'bg-emerald-400',
  'life-sciences': 'bg-rose-400',
  'new-space': 'bg-indigo-400',
  'advanced-materials': 'bg-orange-400',
  'humanoid-robots': 'bg-teal-400',
  'ai-agents': 'bg-blue-400',
  'launch-vehicles': 'bg-indigo-400',
  'gene-editing': 'bg-rose-400',
  'ev-batteries': 'bg-emerald-400',
  'energy-storage': 'bg-yellow-400',
};
