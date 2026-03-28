import { createClient } from '@supabase/supabase-js';
const s = createClient(
  'https://jqppcuccqkxhhrvndsil.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc'
);

const companies = [
  {
    name: 'Unitree Robotics',
    name_cn: '宇树科技',
    industry_slug: 'manufacturing',
    sub_sector: 'Humanoid Robots',
    description: 'Leading humanoid and quadruped robot manufacturer. Unitree H1/G1 humanoid robots priced at $16K-$90K. 2025 shipments: 5500+ units globally, ranked #1 by volume. Founded 2016 by Wang Xingxing.',
    country: 'CN',
    is_public: false,
    is_tracked: true,
    tags: ['h1', 'g1', 'go2', 'quadruped', 'humanoid'],
    founded_year: 2016,
    employee_count: 1000,
    slug: 'unitree-robotics',
  },
  {
    name: 'Figure AI',
    name_cn: null,
    industry_slug: 'manufacturing',
    sub_sector: 'Humanoid Robots',
    description: 'US humanoid robot startup developing Figure 01/02 for automotive and logistics. Partnered with BMW for factory deployment. Raised $675M at $2.6B valuation.',
    country: 'US',
    is_public: false,
    is_tracked: true,
    tags: ['figure-01', 'figure-02', 'bmw', 'openai', 'manufacturing'],
    founded_year: 2022,
    employee_count: 300,
    slug: 'figure-ai',
  },
  {
    name: 'Agility Robotics',
    name_cn: null,
    industry_slug: 'manufacturing',
    sub_sector: 'Humanoid Robots',
    description: 'Developer of Digit, a bipedal humanoid robot designed for warehouse logistics. Amazon partnership for package handling. Subsidiary of Schaeffler AG.',
    country: 'US',
    is_public: false,
    is_tracked: true,
    tags: ['digit', 'amazon', 'bipedal', 'warehouse', 'logistics'],
    founded_year: 2015,
    employee_count: 200,
    slug: 'agility-robotics',
  },
  {
    name: 'Boston Dynamics',
    name_cn: null,
    industry_slug: 'manufacturing',
    sub_sector: 'Humanoid Robots',
    description: 'Pioneer in dynamic robotics. Atlas humanoid robot demonstrates advanced mobility and manipulation. Also produces Spot quadruped and Stretch warehouse robot. Owned by Hyundai.',
    country: 'US',
    is_public: false,
    is_tracked: true,
    tags: ['atlas', 'spot', 'stretch', 'hyundai', 'dynamic-locomotion'],
    founded_year: 1992,
    employee_count: 1000,
    slug: 'boston-dynamics',
  },
  {
    name: 'UBTECH Robotics',
    name_cn: '优必选',
    industry_slug: 'manufacturing',
    sub_sector: 'Humanoid Robots',
    description: 'Chinese humanoid robot company (HK: 9880). Walker S humanoid deployed in BYD, NIO, Dongfeng factories. 2024 revenue HK$700M. First commercially deployed humanoid in auto manufacturing.',
    country: 'CN',
    is_public: true,
    is_tracked: true,
    tags: ['walker-s', 'byd', 'nio', 'humanoid', 'hk9880'],
    founded_year: 2012,
    employee_count: 1800,
    slug: 'ubtech-robotics',
  },
  {
    name: 'Fourier Intelligence',
    name_cn: '傅利叶智能',
    industry_slug: 'manufacturing',
    sub_sector: 'Humanoid Robots',
    description: 'Chinese humanoid robot company developing GR-1/GR-2 general-purpose humanoids. Focus on rehabilitation robotics and industrial applications. Raised Series C.',
    country: 'CN',
    is_public: false,
    is_tracked: true,
    tags: ['gr-1', 'gr-2', 'rehabilitation', 'general-purpose', 'embodied-ai'],
    founded_year: 2015,
    employee_count: 600,
    slug: 'fourier-intelligence',
  },
  {
    name: '1X Technologies',
    name_cn: null,
    industry_slug: 'manufacturing',
    sub_sector: 'Humanoid Robots',
    description: 'Norwegian humanoid robot company (formerly Halodi Robotics) backed by OpenAI. Neo humanoid robot targets household and light industrial tasks. Raised $100M+ Series B.',
    country: 'US',
    is_public: false,
    is_tracked: true,
    tags: ['neo', 'eve', 'openai', 'household', 'bipedal'],
    founded_year: 2014,
    employee_count: 150,
    slug: '1x-technologies',
  },
  {
    name: 'Sanctuary AI',
    name_cn: null,
    industry_slug: 'manufacturing',
    sub_sector: 'Humanoid Robots',
    description: 'Canadian humanoid AI company developing Phoenix humanoid with Carbon AI cognitive architecture. Focus on general-purpose labor automation. Backed by Microsoft.',
    country: 'US',
    is_public: false,
    is_tracked: true,
    tags: ['phoenix', 'carbon-ai', 'microsoft', 'general-purpose', 'cognitive'],
    founded_year: 2018,
    employee_count: 200,
    slug: 'sanctuary-ai',
  },
  {
    name: 'Apptronik',
    name_cn: null,
    industry_slug: 'manufacturing',
    sub_sector: 'Humanoid Robots',
    description: 'US humanoid robot company developing Apollo for industrial and logistics applications. Partnered with NASA and GXO Logistics. Raised Series A backed by Google.',
    country: 'US',
    is_public: false,
    is_tracked: true,
    tags: ['apollo', 'nasa', 'gxo', 'google', 'logistics'],
    founded_year: 2016,
    employee_count: 150,
    slug: 'apptronik',
  },
  {
    name: 'Agibot',
    name_cn: '智元机器人',
    industry_slug: 'manufacturing',
    sub_sector: 'Humanoid Robots',
    description: 'Chinese humanoid robot startup co-founded by Zhiyuan. A2 humanoid robot for manufacturing and logistics. Raised 700M RMB, valued at ~10B RMB. Backed by multiple strategic investors.',
    country: 'CN',
    is_public: false,
    is_tracked: true,
    tags: ['a2', 'a2-w', 'embodied-ai', 'manufacturing', 'logistics'],
    founded_year: 2023,
    employee_count: 500,
    slug: 'agibot',
  },
];

// First check which ones already exist by slug
const slugs = companies.map(c => c.slug);
const { data: existing } = await s.from('companies').select('id, name, slug').in('slug', slugs);
console.log(`Already in DB (${existing?.length ?? 0}):`, existing?.map(c => c.slug).join(', '));

// For existing ones: just update sub_sector to 'Humanoid Robots'
if (existing && existing.length > 0) {
  const existingSlugs = existing.map(e => e.slug);
  const { error: updateErr } = await s.from('companies')
    .update({ sub_sector: 'Humanoid Robots', industry_slug: 'manufacturing' })
    .in('slug', existingSlugs);
  if (updateErr) console.error('Update error:', updateErr.message);
  else console.log(`Updated ${existingSlugs.length} existing companies to Humanoid Robots`);
}

// Insert only new ones
const existingSlugsSet = new Set(existing?.map(e => e.slug) ?? []);
const toInsert = companies.filter(c => !existingSlugsSet.has(c.slug));
if (toInsert.length > 0) {
  console.log(`Inserting ${toInsert.length} new companies...`);
  const { data: inserted, error } = await s.from('companies').insert(toInsert).select('id, name');
  if (error) console.error('Insert error:', error.message);
  else {
    console.log(`Inserted ${inserted.length} new companies:`);
    inserted.forEach(c => console.log(`  [${c.id}] ${c.name}`));
  }
} else {
  console.log('No new companies to insert (all already exist, sub_sector updated).');
}
