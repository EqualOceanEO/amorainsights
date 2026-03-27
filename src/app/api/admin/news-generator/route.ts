import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { INDUSTRY_HIERARCHY } from '@/lib/industries';

export const dynamic = 'force-dynamic';

// ─── Content templates per industry ───────────────────────────────────────────

const INDUSTRY_TEMPLATES: Record<string, string[]> = {
  'ai': [
    'Foundation Models continue to advance rapidly, with latest benchmarks showing significant improvements in reasoning and multimodal capabilities across leading developers.',
    'AI Agents are being deployed at scale across enterprise workflows, with autonomous task completion rates reaching new highs in production environments.',
    'AI Semiconductors demand remains robust as hyperscalers compete to secure leading-edge GPU and AI accelerator supply for training and inference workloads.',
    'Computer Vision applications are expanding into industrial inspection, autonomous driving, and medical imaging, driven by transformer-based architectures.',
    'NLP & Speech models are achieving near-human performance on complex comprehension tasks, enabling new categories of intelligent document processing.',
    'AI for Science platforms are accelerating drug discovery, materials science, and climate modeling, with several breakthrough publications in top journals.',
  ],
  'life-sciences': [
    'Gene Editing therapies are advancing through clinical trials with improved safety profiles, targeting a growing range of monogenic and complex diseases.',
    'Synthetic Biology platforms are enabling programmable cell factories for sustainable manufacturing of chemicals, materials, and therapeutics.',
    'Cell Therapy candidates are demonstrating durable remission rates in hematologic malignancies, with regulators increasingly open to accelerated approval pathways.',
    'AI Drug Discovery platforms are reducing preclinical timelines by 40-60%, with multiple AI-designed compounds entering human trials.',
    'Medical Devices innovation continues in minimally invasive surgical robotics and continuous monitoring sensors for chronic disease management.',
    'Genomics & Diagnostics tests are becoming standard of care in oncology and rare disease diagnosis, with declining sequencing costs expanding access.',
  ],
  'green-tech': [
    'EV Battery technology is advancing toward higher energy density and faster charging, with solid-state battery prototypes showing promising durability data.',
    'Green Hydrogen production costs are declining as electrolyzer manufacturing scales, with several large projects reaching final investment decision.',
    'Solar Photovoltaics conversion efficiency records continue to fall, with perovskite-silicon tandems approaching commercial viability.',
    'Energy Storage deployments are accelerating globally as grid operators seek flexibility, with lithium-iron-phosphate chemistries dominating stationary storage.',
    'Carbon Capture & Removal projects are securing offtake agreements with corporate buyers, though scale-up pathways remain capital-intensive.',
    'Circular Economy initiatives are gaining traction in electronics, textiles, and packaging as brands face regulatory pressure and consumer demand for sustainability.',
  ],
  'manufacturing': [
    'Advanced manufacturing techniques including additive manufacturing and precision machining are enabling new product architectures across aerospace and healthcare.',
    'Supply chain reshoring investments are creating domestic manufacturing capacity in critical sectors, supported by policy incentives.',
    'Industrial automation and robotics adoption is accelerating, particularly in labor-constrained markets and high-mix production environments.',
  ],
  'new-space': [
    'Launch Vehicle development continues with reusable rocket technology reducing launch costs by over 60% compared to expendable alternatives.',
    'Satellite Internet constellations are expanding global broadband coverage, with low-latency services now available in underserved regions.',
    'Earth Observation capabilities are delivering real-time data for agriculture, insurance, defense, and climate monitoring applications.',
    'Space Propulsion innovations including electric and chemical propulsion systems are enabling longer-duration missions and more efficient orbital transfers.',
    'Low-Altitude Economy applications are emerging in urban air mobility, drone delivery, and aerial inspection services.',
    'Space Manufacturing in microgravity is enabling production of high-value materials impossible to manufacture on Earth.',
  ],
  'advanced-materials': [
    'Carbon Fiber & Composites are displacing traditional materials in automotive and aerospace applications, driven by strength-to-weight requirements.',
    'Semiconductor Materials innovation is critical for continued Moore\'s Law scaling, with new gate-all-around transistor architectures entering production.',
    'Battery Materials supply chains are being diversified and expanded as global EV adoption accelerates and grid storage demand grows.',
    'Metamaterials are enabling new optical and acoustic properties for applications in telecommunications, sensing, and stealth technology.',
    'Graphene & Carbon Nanocomposites are showing promise in thermal management, flexible electronics, and barrier coatings.',
    'Biomaterials advances are enabling next-generation medical implants and tissue scaffolds with improved biocompatibility and degradation profiles.',
  ],
};

// ─── Company news angles ───────────────────────────────────────────────────────

// Level-1 industry ID map (from industries table)
const INDUSTRY_ID_MAP: Record<string, number> = {
  'ai': 1,
  'life-sciences': 2,
  'green-tech': 3,
  'manufacturing': 4,
  'new-space': 5,
  'advanced-materials': 6,
};

// Sub-sector slug → ID map (level-2 from industries table)
const SUB_SECTOR_SLUG_MAP: Record<string, number> = {
  'ai-foundation-models': 49,
  'ai-agents': 50,
  'ai-semiconductors': 51,
  'computer-vision': 52,
  'nlp-speech': 53,
  'ai-for-science': 54,
  'gene-editing': 55,
  'synthetic-biology': 56,
  'cell-therapy': 57,
  'drug-discovery-ai': 58,
  'medical-devices': 59,
  'genomics-diagnostics': 60,
  'ev-batteries': 61,
  'green-hydrogen': 62,
  'solar-photovoltaics': 63,
  'energy-storage': 64,
  'carbon-capture': 65,
  'circular-economy': 66,
  'humanoid-robots': 67,
  'industrial-robots': 68,
  'iiot-smart-factory': 69,
  'additive-manufacturing': 70,
  'digital-twin': 71,
  'autonomous-vehicles': 72,
  'launch-vehicles': 73,
  'satellite-internet': 74,
  'earth-observation': 75,
  'space-propulsion': 76,
  'low-altitude': 77,
  'space-manufacturing': 78,
  'carbon-fiber': 79,
  'semiconductors-materials': 80,
  'battery-materials': 81,
  'metamaterials': 82,
  'graphene': 83,
  'biomaterials': 84,
};

function slugify(text: string): string {
  return text.replace(/\s+\&\s+/g, '-').replace(/\s+/g, '-').toLowerCase();
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildContent(title: string, industrySlug: string, companyName?: string): string {
  const industryName = {
    'ai': 'Artificial Intelligence',
    'life-sciences': 'Life Sciences',
    'green-tech': 'Green Technology',
    'manufacturing': 'Advanced Manufacturing',
    'new-space': 'New Space',
    'advanced-materials': 'Advanced Materials',
  }[industrySlug] || industrySlug;

  const lines = [
    `${title}.`,
    ``,
    companyName
      ? `${companyName} continues to execute on its strategic roadmap in the ${industryName} sector, with recent developments drawing attention from industry observers and investors alike.`
      : `The ${industryName} sector is experiencing notable activity as companies advance their technology and commercial strategies.`,
    ``,
    `Market participants are closely monitoring execution milestones and competitive positioning as the landscape evolves. Supply chain dynamics, regulatory developments, and macroeconomic factors remain key variables influencing near-term trajectories.`,
    ``,
    `Industry analysts note that differentiated technology assets, defensible moats, and scalable business models are increasingly important as investor scrutiny intensifies across the ${industryName} value chain.`,
  ];

  return lines.join('\n\n');
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || '';
  const secret = req.headers.get('x-migration-secret') || req.nextUrl.searchParams.get('secret');

  // Auth: accept secret param OR Bearer token matching service role key
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const tokenMatches = authHeader.startsWith('Bearer ') &&
    authHeader.slice(7).trim() === serviceKey;

  if (secret !== process.env.MIGRATION_SECRET && !tokenMatches) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10); // e.g. "2026-03-25"
    const todayStart = `${dateStr}T00:00:00Z`;

    // ── 1. Get all tracked companies ─────────────────────────────────────────
    const { data: companies, error: coErr } = await supabase
      .from('companies')
      .select('id, name, name_cn, industry_slug, sub_sector, description, country')
      .eq('is_tracked', true);

    if (coErr) return NextResponse.json({ error: coErr.message }, { status: 500 });
    const companyList: any[] = (companies as any[]) || [];

    // ── 2. Check which companies already have news today ───────────────────
    const { data: existingToday } = await supabase
      .from('news_items')
      .select('company_id')
      .gte('published_at', todayStart)
      .not('company_id', 'is', null);

    const alreadyCovered = new Set((existingToday || []).map((r: any) => r.company_id));

    // ── 3. Check existing news today by industry ─────────────────────────────
    const { data: existingIndustries } = await supabase
      .from('news_items')
      .select('industry_slug')
      .gte('published_at', todayStart)
      .not('industry_slug', 'is', null);

    const industryNewsCount: Record<string, number> = {};
    (existingIndustries || []).forEach((r: any) => {
      const ind = r.industry_slug;
      industryNewsCount[ind] = (industryNewsCount[ind] || 0) + 1;
    });

    // ── 4. Generate news items ───────────────────────────────────────────────
    const toInsert: any[] = [];

    // 4a. Industry-level news (1-2 per industry per day)
    for (const group of INDUSTRY_HIERARCHY) {
      const existingCount = industryNewsCount[group.level1.id] || 0;
      const targetCount = Math.max(1, Math.min(2, 2 - existingCount));
      const industryIdInt = INDUSTRY_ID_MAP[group.level1.id] || 1;

      for (let i = 0; i < targetCount; i++) {
        const templates = INDUSTRY_TEMPLATES[group.level1.id] || [];
        const templateText = templates.length > 0
          ? randomElement(templates)
          : `${group.level1.label} sector continues to attract significant investment and innovation activity.`;

        const authors = ['Research Team', 'Senior Analyst', 'Industry Correspondent', 'Tech Desk'];
        const sources = [
          { name: 'AMORA Intelligence', url: 'https://amorainsights.com' },
          { name: 'Industry Wire', url: null },
          { name: 'Frontier Tech Monitor', url: null },
        ];

        const source = randomElement(sources);
        const slugBase = generateSlug(`${group.level1.id}-${dateStr}-${i + 1}`);

        // Pick a random level-2 sub-sector if available
        const subSector = group.level2.length > 0 ? randomElement(group.level2) : null;
        const subSectorIdInt = subSector ? (SUB_SECTOR_SLUG_MAP[slugify(subSector)] || null) : null;

        toInsert.push({
          title: `${group.level1.label} Sector Update: ${templateText.slice(0, 80)}`,
          slug: slugBase,
          summary: `${group.level1.label} — ${templateText}`,
          content: buildContent(`${group.level1.label} Sector Update`, group.level1.id),
          industry_slug: group.level1.id,
          industry_id: industryIdInt,
          sub_sector_id: subSectorIdInt,
          source_name: source.name,
          source_url: source.url,
          author: randomElement(authors),
          cover_image_url: null,
          tags: [group.level1.id, 'daily-update', 'sector-analysis'],
          is_premium: false,
          is_published: true,
          is_featured: false,
          company_id: null,
          published_at: today.toISOString(),
        });
      }
    }

    // 4b. Company-level news (rotate through companies, ~5-10 per day)
    const uncoveredCompanies = companyList.filter(c => !alreadyCovered.has(c.id));
    const companiesToCover = uncoveredCompanies.slice(0, 8); // max 8 new company news per run

    for (const company of companiesToCover) {
      const templates = INDUSTRY_TEMPLATES[company.industry_slug] || [];
      const templateText = templates.length > 0 ? randomElement(templates) : 'continues to advance its technology and market position.';

      const sources = [
        { name: 'AMORA Intelligence', url: 'https://amorainsights.com' },
        { name: 'Industry Wire', url: null },
        { name: 'VC Desk', url: null },
        { name: 'Tech Markets Daily', url: null },
      ];
      const source = randomElement(sources);
      const slugBase = generateSlug(`${company.name.toLowerCase().replace(/\s+/g, '-')}-${dateStr}`);

      const industryIdInt = INDUSTRY_ID_MAP[company.industry_slug] || null;
      const subSectorIdInt = company.sub_sector ? (SUB_SECTOR_SLUG_MAP[slugify(company.sub_sector)] || null) : null;

      toInsert.push({
        title: `${company.name} ${templateText.slice(0, 70)}`,
        slug: slugBase,
        summary: `${company.name} (${company.country}) — ${templateText}`,
        content: buildContent(`${company.name} Update`, company.industry_slug, company.name),
        industry_slug: company.industry_slug,
        industry_id: industryIdInt,
        sub_sector_id: subSectorIdInt,
        source_name: source.name,
        source_url: source.url,
        author: 'Research Team',
        cover_image_url: null,
        tags: [company.industry_slug, 'company-news', company.country],
        is_premium: false,
        is_published: true,
        is_featured: false,
        company_id: company.id,
        published_at: today.toISOString(),
      });
    }

    // ── 5. Insert all news items ─────────────────────────────────────────────
    let inserted = 0;
    let errors = 0;

    if (toInsert.length > 0) {
      const { data: insertedData, error: insertErr } = await supabase
        .from('news_items')
        .insert(toInsert)
        .select('id');

      if (insertErr) {
        console.error('[news-generator] Insert error:', insertErr);
        errors = toInsert.length;
      } else {
        inserted = (insertedData || []).length;
      }
    }

    // ── 6. Return summary ───────────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      date: dateStr,
      generated: {
        industryNews: INDUSTRY_HIERARCHY.length,
        companyNews: companiesToCover.length,
        total: toInsert.length,
        inserted,
        errors,
      },
      coverage: {
        totalCompanies: companyList.length,
        companiesWithNewsToday: alreadyCovered.size,
        uncoveredCompanies: uncoveredCompanies.length,
      },
    });

  } catch (err: any) {
    console.error('[news-generator] Unexpected error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
