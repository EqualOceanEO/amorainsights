import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// 25 AMORA standard metrics
export const METRICS = [
  // Advancement
  { key: 'core_patent_density',       label: 'Core Patent Density',        dimension: 'A' },
  { key: 'rd_intensity',              label: 'R&D Intensity',               dimension: 'A' },
  { key: 'technology_readiness_level',label: 'Technology Readiness Level',  dimension: 'A' },
  { key: 'proprietary_algorithm_ratio',label: 'Proprietary Algorithm Ratio',dimension: 'A' },
  { key: 'tech_talent_density',       label: 'Tech Talent Density',         dimension: 'A' },
  // Mastery
  { key: 'founding_team_depth',       label: 'Founding Team Domain Depth',  dimension: 'M' },
  { key: 'key_talent_retention',      label: 'Key Talent Retention Rate',   dimension: 'M' },
  { key: 'org_learning_velocity',     label: 'Organizational Learning Velocity', dimension: 'M' },
  { key: 'talent_magnetism_index',    label: 'Talent Magnetism Index',      dimension: 'M' },
  { key: 'leadership_diversity',      label: 'Leadership Diversity Score',  dimension: 'M' },
  // Operations
  { key: 'revenue_scale_growth',      label: 'Revenue Scale & Growth',      dimension: 'O' },
  { key: 'supply_chain_control',      label: 'Supply Chain Control Index',  dimension: 'O' },
  { key: 'customer_stickiness',       label: 'Customer Stickiness',         dimension: 'O' },
  { key: 'value_chain_position',      label: 'Value Chain Position Score',  dimension: 'O' },
  { key: 'unit_economics_health',     label: 'Unit Economics Health',       dimension: 'O' },
  // Reach
  { key: 'overseas_revenue_ratio',    label: 'Overseas Revenue Ratio',      dimension: 'R' },
  { key: 'localization_depth',        label: 'Localization Depth Score',    dimension: 'R' },
  { key: 'market_coverage_breadth',   label: 'Market Coverage Breadth',     dimension: 'R' },
  { key: 'global_partnership_network',label: 'Global Partnership Network',  dimension: 'R' },
  { key: 'cross_cultural_capability', label: 'Cross-Cultural Team Capability', dimension: 'R' },
  // Affinity (F = fifth dimension)
  { key: 'esg_composite_rating',      label: 'ESG Composite Rating',        dimension: 'F' },
  { key: 'brand_compounding_index',   label: 'Brand Compounding Index',     dimension: 'F' },
  { key: 'long_term_capital_resilience', label: 'Long-Term Capital Resilience', dimension: 'F' },
  { key: 'social_impact_contribution',label: 'Social Impact Contribution',  dimension: 'F' },
  { key: 'regulatory_readiness',      label: 'Regulatory Readiness Score',  dimension: 'F' },
];

// GET /api/admin/scores?report_id=123
// Pass report_id=0 to fetch only the metrics definition (no DB query)
export async function GET(req: NextRequest) {
  const reportId = req.nextUrl.searchParams.get('report_id');
  if (!reportId) return NextResponse.json({ error: 'report_id required' }, { status: 400 });

  // report_id=0 → return metrics definition only (used to bootstrap the scoring UI)
  if (reportId === '0') {
    return NextResponse.json({ data: [], metrics: METRICS });
  }

  const { data, error } = await supabase
    .from('report_scores')
    .select('*')
    .eq('report_id', reportId)
    .order('dimension');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, metrics: METRICS });
}

// POST /api/admin/scores — upsert one or many scores
export async function POST(req: NextRequest) {
  const body = await req.json();
  // Accept single object or array
  const rows = Array.isArray(body) ? body : [body];

  const { data, error } = await supabase
    .from('report_scores')
    .upsert(
      rows.map((r: Record<string, unknown>) => ({
        ...r,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: 'report_id,metric_key' }
    )
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
