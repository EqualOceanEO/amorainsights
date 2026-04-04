import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Use service role key for server-side operations (bypasses RLS)
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Server-side Supabase client (never expose to browser)
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

// ─── Types ───────────────────────────────────────────────────────────────────

// Subscription tier — Franklyn confirmed 2026-03-15
// 'free' = default, 'pro' = paid subscriber, 'enterprise' = reserved
export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export interface User {
  id: number;
  email: string;
  password: string;
  name: string | null;
  created_at: string;
  is_admin: boolean;
  // Subscription billing (Franklyn schema, 2026-03-15)
  subscription_tier:       SubscriptionTier;       // NOT NULL DEFAULT 'free'
  subscription_expires_at: string | null;          // nullable TIMESTAMPTZ
  // Acquisition & conversion tracking (Cole/Celine — P1)
  acquisition_channel:   AcquisitionChannel | null;
  conversion_last_touch: AcquisitionChannel | null;
  last_content_slug:     string | null;
}

// ─── Acquisition channel enum ─────────────────────────────────────────────────
// Requested by Cole (CCO) + Celine (CMO) for content-attribution model

export type AcquisitionChannel =
  | 'seo'
  | 'content_share'
  | 'direct_sales'
  | 'paid_ads'
  | 'partner'
  | 'organic'
  | 'unknown';

export const ALL_ACQUISITION_CHANNELS: AcquisitionChannel[] = [
  'seo', 'content_share', 'direct_sales', 'paid_ads', 'partner', 'organic', 'unknown',
];

// ─── Compliance classification types (CLO Framework v0.9) ────────────────────
// Full v1.0 by 2026-03-31. All values are additive — no breaking changes.

/**
 * Primary classification — drives review workflow and publish permissions.
 * STANDARD     → T+1  standard review
 * SENSITIVE_TECH → T+3  elevated review (contains tech params / dual-use)
 * RESTRICTED   → T+5  dual-signature review (entity list / controlled country)
 */
export type ComplianceTier = 'STANDARD' | 'SENSITIVE_TECH' | 'RESTRICTED';

/**
 * Lifecycle state of a report through the compliance review pipeline.
 *
 * FLAGGED sub-states (CLO + CRO jointly confirmed 2026-03-14):
 *   FLAGGED_PENDING_REVIEW    : entity-list hit auto-detected, CLO+CRO notified,
 *                               not yet actioned — front-end blocks all users
 *   FLAGGED_CONFIRMED         : CLO+CRO dual-sign complete, processing underway
 *                               front-end shows compliance review notice
 *   FLAGGED_RESOLVED_PUBLISHED: dual-sign resolved to retain publication
 *                               (with attached compliance statement in compliance_overrides)
 *   FLAGGED_RESOLVED_REMOVED  : dual-sign resolved to unpublish
 *
 * Both RESOLVED terminal states require a compliance_overrides audit record
 * (7-year retention — see compliance_overrides table note).
 */
export type ComplianceStatus =
  | 'PENDING_REVIEW'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'FLAGGED_PENDING_REVIEW'       // auto-flagged, awaiting dual-sign
  | 'FLAGGED_CONFIRMED'            // dual-signed, in active remediation
  | 'FLAGGED_RESOLVED_PUBLISHED'   // resolved: retain with compliance statement
  | 'FLAGGED_RESOLVED_REMOVED';    // resolved: unpublished

/**
 * SensitivityTagType — high-level category of a sensitivity tag entry.
 * Used in SensitivityTagRecord.tag_type.
 *
 * CLO dimension labels are preserved as documentation; the JSONB structure
 * (SensitivityTagRecord) is the canonical representation per CRO spec v1.0.
 *
 * Legacy string-union type (CLO v0.9) is kept as SensitivityTagLabel below
 * for any places that still use the flat representation.
 */
export type SensitivityTagType = 'ENTITY' | 'TECHNOLOGY' | 'COUNTRY' | 'KEYWORD';

/**
 * SensitivityTagSourceList — source list type for entity-list comparison.
 * Used in SensitivityTagRecord.source_list.
 */
export type SensitivityTagSourceList =
  | 'BIS_ENTITY_LIST'
  | 'OFAC_SDN'
  | 'BIS_UVL'
  | 'CN_DUAL_USE'
  | 'INTERNAL';

/**
 * SensitivityTagRecord — structured JSONB object stored in reports.sensitivity_tags.
 *
 * Per CRO Field Specification v1.0 (2026-03-14).
 * The array of these objects replaces the previous TEXT[] approach.
 *
 * Entity-list comparison uses value_normalized for fuzzy-safe matching
 * (uppercase, no punctuation/special chars).
 *
 * geo_risk_contribution drives the auto-calculation of reports.geo_risk_tier
 * via computeReportGeoRiskTier() — the report-level tier is the MAX of all tags.
 */
export interface SensitivityTagRecord {
  tag_type: SensitivityTagType;
  value: string;                         // raw display value
  value_normalized: string;             // UPPERCASE, no special chars — used for list comparison
  source_list?: SensitivityTagSourceList;
  geo_risk_contribution: GeoRiskTier;   // this tag's contribution to report geo_risk_tier
  flagged_at?: string | null;           // ISO 8601 — set when list comparison hits this tag
  flagged_by_list_update?: string | null; // list version that triggered the flag
}

/**
 * Legacy flat string union (CLO v0.9).
 * Retained for backwards compatibility and as a human-readable taxonomy reference.
 * The canonical DB representation is SensitivityTagRecord[] (JSONB).
 */
export type SensitivityTagLabel =
  // Export control
  | 'EAR_CCL' | 'ITAR' | 'DUAL_USE'
  // Entity lists
  | 'ENTITY_LIST' | 'SDN_LIST' | 'RESTRICTED_COUNTRY'
  // Data compliance
  | 'GDPR_SUBJECT' | 'PIPL_SUBJECT' | 'DATA_LOCALIZATION'
  // Content risk (CRO layer)
  | 'GEOPOLITICAL' | 'TECH_PARAMS';

/**
 * ECCN-aligned technology domain. Orthogonal to industry_slug.
 * industry_slug = market sector (e.g. 'advanced-materials')
 * tech_domain   = export control lens (e.g. 'SEMICONDUCTOR')
 * NULL = not applicable (STANDARD tier, no ECCN relevance)
 */
export type TechDomain =
  | 'SEMICONDUCTOR'    // ECCN 3B001/3B002/3C/3E001/3E002
  | 'AI_COMPUTE'       // ECCN 3A090/4A090
  | 'QUANTUM'          // ECCN 3E001/4E001/5E002
  | 'BIOTECH'          // ECCN 1C351-1C360
  | 'AEROSPACE'        // ECCN 9E001/9E002/9A012
  | 'CYBERSECURITY'    // ECCN 5D002/5E002
  | 'MATERIALS'        // ECCN 1C/1E series
  | 'OTHER_CONTROLLED'
  | 'NON_CONTROLLED';

/**
 * CRO geopolitical risk tier (CRO Framework v0.1, 2026-03-14).
 * Orthogonal to CLO's compliance_tier — both feed into effective_tier.
 *
 * G0 → maps to STANDARD
 * G1 → maps to SENSITIVE_TECH  (indirect association with at-risk region)
 * G2 → maps to SENSITIVE_TECH  (direct dual-use / sanctioned entity affiliate)
 * G3 → maps to RESTRICTED      (direct OFAC SDN / BIS Entity List / T1 gov project)
 */
export type GeoRiskTier = 'G0' | 'G1' | 'G2' | 'G3';

export const GEO_RISK_META: Record<GeoRiskTier, {
  label: string; mapsTo: ComplianceTier; description: string;
}> = {
  G0: { label: 'G0 — None',       mapsTo: 'STANDARD',    description: 'No geopolitical risk' },
  G1: { label: 'G1 — Low',        mapsTo: 'SENSITIVE_TECH', description: 'Indirect association with at-risk region' },
  G2: { label: 'G2 — Elevated',   mapsTo: 'RESTRICTED',  description: 'Direct dual-use / sanctioned entity affiliate — dual-sign required' },
  G3: { label: 'G3 — Restricted', mapsTo: 'RESTRICTED',  description: 'OFAC SDN / BIS Entity List / T1 gov project — + KYB Intent Screening' },
};

/**
 * Compute the effective tier from CLO compliance_tier + CRO geo_risk_tier.
 *
 * PURE FUNCTION — effective_tier is NEVER written directly to the DB.
 * DB column maintained by trigger (schema.sql). App mirrors for pre-save validation.
 *
 * Rank mapping (CRO confirmed 2026-03-14):
 *   compliance : STANDARD=0  SENSITIVE_TECH=1  RESTRICTED=2
 *   geo_risk   : G0=0  G1=1  G2=2  G3=2
 *
 * KEY CHANGE: G2 → rank 2 (RESTRICTED), not rank 1.
 * G2 = direct sanctioned-entity affiliate / dual-use → same CLO+CRO dual-sign
 * as RESTRICTED. G2 vs G3 semantic difference preserved in geo_risk_tier itself;
 * G3 additionally triggers KYB Intent Screening at Enterprise tier.
 */
export function computeEffectiveTier(
  complianceTier: ComplianceTier,
  geoRiskTier: GeoRiskTier,
): ComplianceTier {
  const compRank: Record<ComplianceTier, number> = {
    STANDARD: 0, SENSITIVE_TECH: 1, RESTRICTED: 2,
  };
  const geoRank: Record<GeoRiskTier, number> = {
    G0: 0, G1: 1, G2: 2, G3: 2,   // G2 → RESTRICTED per CRO 2026-03-14
  };
  const maxRank = Math.max(compRank[complianceTier], geoRank[geoRiskTier]);
  if (maxRank >= 2) return 'RESTRICTED';
  if (maxRank === 1) return 'SENSITIVE_TECH';
  return 'STANDARD';
}

/**
 * Compute report-level geo_risk_tier from its sensitivity_tags array.
 *
 * Per CRO Spec v1.0 (2026-03-14): report's geo_risk_tier = MAX of all
 * individual SensitivityTagRecord.geo_risk_contribution values.
 * Written by application layer on report save — no manual input required.
 * This reduces operator error and keeps geo_risk_tier in sync with tags.
 */
export function computeReportGeoRiskTier(tags: SensitivityTagRecord[]): GeoRiskTier {
  const rankMap: Record<GeoRiskTier, number> = { G0: 0, G1: 1, G2: 2, G3: 3 };
  const reverseMap: GeoRiskTier[] = ['G0', 'G1', 'G2', 'G3'];
  const maxRank = tags.reduce(
    (max, tag) => Math.max(max, rankMap[tag.geo_risk_contribution]),
    0,
  );
  return reverseMap[maxRank];
}

export const COMPLIANCE_TIER_META: Record<ComplianceTier, {
  label: string; description: string; reviewDays: number; color: string;
}> = {
  STANDARD:       { label: 'Standard',        description: 'Standard review',              reviewDays: 1, color: 'green'  },
  SENSITIVE_TECH: { label: 'Sensitive Tech',   description: 'Elevated review — dual-use',  reviewDays: 3, color: 'amber'  },
  RESTRICTED:     { label: 'Restricted',       description: 'Dual-signature required',      reviewDays: 5, color: 'red'    },
};

export const COMPLIANCE_STATUS_META: Record<ComplianceStatus, {
  label: string; color: string; frontendVisible: boolean; blockContent: boolean;
}> = {
  PENDING_REVIEW:             { label: 'Pending Review',             color: 'gray',   frontendVisible: false, blockContent: true  },
  IN_REVIEW:                  { label: 'In Review',                  color: 'blue',   frontendVisible: false, blockContent: true  },
  APPROVED:                   { label: 'Approved',                   color: 'green',  frontendVisible: false, blockContent: false },
  REJECTED:                   { label: 'Rejected',                   color: 'red',    frontendVisible: false, blockContent: true  },
  FLAGGED_PENDING_REVIEW:     { label: 'Flagged — Pending Review',   color: 'amber',  frontendVisible: true,  blockContent: true  },
  FLAGGED_CONFIRMED:          { label: 'Flagged — In Remediation',   color: 'orange', frontendVisible: true,  blockContent: false },
  FLAGGED_RESOLVED_PUBLISHED: { label: 'Flagged — Resolved (Live)',  color: 'teal',   frontendVisible: false, blockContent: false },
  FLAGGED_RESOLVED_REMOVED:   { label: 'Flagged — Resolved (Down)',  color: 'red',    frontendVisible: false, blockContent: true  },
};

// Front-end compliance notice copy (shown to end-users when frontendVisible=true)
// Does NOT reveal sanctions-related reason per CLO + CRO requirement.
export const COMPLIANCE_NOTICE_COPY =
  '该报告内容正在进行合规复核，如有需要请联系平台。';

// ─── ComplianceOverride record type ──────────────────────────────────────────
// Mirrors compliance_overrides table. 7-year retention — no physical deletes.

export type ComplianceOverrideType =
  | 'DOWNGRADE_EFFECTIVE_TIER'
  | 'FLAGGED_RESOLVED_PUBLISHED'
  | 'FLAGGED_RESOLVED_REMOVED';

export interface ComplianceOverride {
  id: number;
  report_id: number;
  override_type: ComplianceOverrideType;
  from_tier: ComplianceTier;
  to_tier: ComplianceTier;
  authorized_by_clo: string;   // CLO user ID — mandatory
  authorized_by_cro: string;   // CRO user ID — mandatory
  authorization_doc: string;   // S3 URL or doc system ID — NOT NULL, validated at API
  override_reason: string;
  compliance_notes: string | null;
  archived_at: string | null;  // soft-delete only — never hard-delete
  created_at: string;
}
export type IndustrySlug =
  | 'ai'
  | 'life-sciences'
  | 'green-tech'
  | 'manufacturing'
  | 'new-space'
  | 'advanced-materials';

/** @deprecated Use IndustrySlug — kept temporarily for migration compatibility */
export type Industry = IndustrySlug;

export interface Industry_Record {
  id: number;
  slug: IndustrySlug;
  name: string;
  name_cn: string | null;
  icon: string | null;
  sort_order: number;
  created_at: string;
}

export const INDUSTRY_META: Record<IndustrySlug, { name: string; name_cn: string; icon: string }> = {
  'ai':                        { name: 'AI',                       name_cn: '人工智能', icon: '🤖' },
  'life-sciences':             { name: 'Life Sciences',            name_cn: '生命科学', icon: '🧬' },
  'green-tech':                { name: 'Green Tech',               name_cn: '绿色科技', icon: '⚡' },
  'manufacturing': { name: 'Manufacturing', name_cn: '未来制造', icon: '🦾' },
  'new-space':                 { name: 'New Space',                name_cn: '新太空',   icon: '🚀' },
  'advanced-materials':        { name: 'Advanced Materials',       name_cn: '先进材料', icon: '⚛️' },
};

export const ALL_INDUSTRY_SLUGS: IndustrySlug[] = [
  'ai',
  'life-sciences',
  'green-tech',
  'manufacturing',
  'new-space',
  'advanced-materials',
];

/**
 * Report format type.
 *  markdown   — default, content stored in `content` column
 *  html       — full HTML stored in `html_content` column, rendered via sandboxed iframe
 *  h5_embed   — alias for html (legacy, same rendering path)
 */
export type ReportFormat = 'markdown' | 'html' | 'h5_embed';

export interface Report {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string | null;
  cover_image_url: string | null;
  industry_slug: IndustrySlug;
  is_premium: boolean;
  author: string | null;
  tags: string[];
  view_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;

  // ── H5 / HTML Report Format (George, 2026-03-15) ─────────────────────────
  // report_format = 'html' | 'h5_embed' → render html_content in sandboxed iframe
  // report_format = 'markdown'           → render content as markdown (default)
  report_format:  ReportFormat;    // NOT NULL DEFAULT 'markdown'
  html_content:   string | null;   // full HTML string for h5/html format reports

  // ── CLO Compliance Classification (v0.2, 2026-03-14) ────────────────────
  compliance_tier:        ComplianceTier;       // CLO legal compliance rating
  compliance_status:      ComplianceStatus;     // review lifecycle state
  sensitivity_tags:       SensitivityTagRecord[]; // JSONB array — CRO spec v1.0
  tech_domain:            TechDomain | null;    // ECCN dimension, required for B/C tier

  // ── CRO Geopolitical Risk Classification (v0.1, 2026-03-14) ─────────────
  geo_risk_tier:          GeoRiskTier;          // CRO geopolitical risk rating (G0-G3)

  // ── Effective Tier (read-only, DB-computed) ──────────────────────────────
  // = MAX(compliance_tier, geo_risk_tier mapped value)
  // Drives publish permissions. Never written directly — DB trigger maintains.
  // Application layer: use computeEffectiveTier() for pre-save validation.
  effective_tier:         ComplianceTier;

  // ── Compliance Audit Trail ───────────────────────────────────────────────
  compliance_reviewer_id:  string | null;
  compliance_reviewed_at:  string | null;
  compliance_dual_sign_id: string | null;  // C-tier / RESTRICTED second signatory
  entity_list_checked_at:  string | null;  // last entity-list comparison timestamp
  entity_list_version:     string | null;  // BIS/OFAC list version used
  compliance_notes:        string | null;  // grey-area commentary

  // ── Downgrade Audit Trail (CLO v0.2) ────────────────────────────────────
  // Populated only when effective_tier is manually overridden downward.
  // Requires CLO + CRO dual authorization. DB constraint enforces this.
  downgrade_authorized_by: string[];    // must contain both CLO and CRO user IDs
  downgrade_reason:        string | null;

  // ── Entity-list scan flagging (CRO compliance-scan, 2026-03-15) ──────────
  // Set automatically by /api/internal/compliance-scan when a name-list hit
  // is detected. Cleared (set null) when compliance_status resolves.
  flagged_at:                string | null;  // ISO 8601 timestamp of auto-flag
  flagged_by_list_update:    string | null;  // list_version that triggered the flag (e.g. "2026-03-14")
}

export interface NewsItem {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  content: string | null;
  industry_slug: IndustrySlug;
  source_url: string | null;
  source_name: string | null;
  author: string | null;
  cover_image_url: string | null;
  tags: string[];
  is_premium: boolean;
  is_featured: boolean;
  is_published: boolean;
  published_at: string;
  created_at: string;
}

export interface Company {
  id: number;
  name: string;
  name_cn: string | null;
  industry_slug: IndustrySlug;
  sub_sector: string | null;
  description: string | null;
  description_cn: string | null;
  founded_year: number | null;
  country: string;
  hq_city: string | null;
  hq_province: string | null;
  website: string | null;
  ticker: string | null;
  exchange: string | null;
  employee_count: number | null;
  is_tracked: boolean;
  is_public: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
  // Funding & valuation
  funding_stage: string | null;
  funding_total_usd: number | null;
  funding_total_cny: number | null;
  valuation_usd: number | null;
  valuation_date: string | null;
  lead_investors: string | null;
  all_investors: string | null;
  // Team
  ceo_name: string | null;
  founders: string | null;
  team_background: string | null;
  // Products & tech
  core_products: string | null;
  tech_route: string | null;
  product_status: string | null;
  unit_shipment: number | null;
  patent_count: number | null;
  // Supply chain
  supply_chain_tier: string | null;
  ecosystem_position: string | null;
  key_components: string | null;
  key_partners: string | null;
  // Customers
  primary_use_cases: string | null;
  customer_breakdown: string | null;
  // AMORA scores
  amora_total_score: number | null;
  amora_advancement_score: number | null;
  amora_mastery_score: number | null;
  amora_operations_score: number | null;
  amora_reach_score: number | null;
  amora_affinity_score: number | null;
  // Additional
  last_funding_type: string | null;
  logo_url: string | null;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── User operations ─────────────────────────────────────────────────────────

export async function createUser(
  email: string,
  hashedPassword: string,
  name?: string | null
): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .insert({ email, password: hashedPassword, name: name ?? null })
    .select()
    .single();

  if (error) throw new Error(`createUser failed: ${error.message}`);
  if (!data) throw new Error('createUser: no data returned');
  return data as User;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) throw new Error(`getUserByEmail failed: ${error.message}`);
  return (data as User) ?? null;
}

export async function getUserById(id: number): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(`getUserById failed: ${error.message}`);
  return (data as User) ?? null;
}

// ─── Reports operations ───────────────────────────────────────────────────────

export async function getReports(options?: {
  page?: number;
  pageSize?: number;
  industrySlug?: IndustrySlug;
  isPremium?: boolean;
}): Promise<PaginatedResult<Report>> {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('reports')
    .select('*', { count: 'exact' })
    .order('published_at', { ascending: false, nullsFirst: false });

  if (options?.industrySlug) query = query.eq('industry_slug', options.industrySlug);
  if (options?.isPremium !== undefined) query = query.eq('is_premium', options.isPremium);

  const { data, error, count } = await query.range(from, to);
  if (error) throw new Error(`getReports failed: ${error.message}`);

  const total = count ?? 0;
  return {
    data: (data ?? []) as Report[],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getReportBySlug(slug: string): Promise<Report | null> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw new Error(`getReportBySlug failed: ${error.message}`);
  return (data as Report) ?? null;
}

export async function getReportCountByIndustry(): Promise<Record<IndustrySlug, number>> {
  const { data, error } = await supabase
    .from('reports')
    .select('industry_slug');

  if (error) throw new Error(`getReportCountByIndustry failed: ${error.message}`);

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.industry_slug] = (counts[row.industry_slug] ?? 0) + 1;
  }
  return counts as Record<IndustrySlug, number>;
}

// ─── NewsItems operations ─────────────────────────────────────────────────────

export async function getNewsItems(options?: {
  page?: number;
  pageSize?: number;
  industrySlug?: IndustrySlug;
  isFeatured?: boolean;
}): Promise<PaginatedResult<NewsItem>> {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('news_items')
    .select('*', { count: 'exact' })
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  if (options?.industrySlug) query = query.eq('industry_slug', options.industrySlug);
  if (options?.isFeatured !== undefined) query = query.eq('is_featured', options.isFeatured);

  const { data, error, count } = await query.range(from, to);
  if (error) throw new Error(`getNewsItems failed: ${error.message}`);

  const total = count ?? 0;
  return {
    data: (data ?? []) as NewsItem[],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getRecentNewsItems(limit = 5): Promise<NewsItem[]> {
  const { data, error } = await supabase
    .from('news_items')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`getRecentNewsItems failed: ${error.message}`);
  return (data ?? []) as NewsItem[];
}

// ─── Companies operations ─────────────────────────────────────────────────────

export async function getCompanies(options?: {
  page?: number;
  pageSize?: number;
  industrySlug?: IndustrySlug;
  isPublic?: boolean;
  hqProvince?: string;
  country?: string;
}): Promise<PaginatedResult<Company>> {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('companies')
    .select('*', { count: 'exact' })
    .eq('is_tracked', true)
    .order('name', { ascending: true });

  if (options?.industrySlug) query = query.eq('industry_slug', options.industrySlug);
  if (options?.isPublic !== undefined) query = query.eq('is_public', options.isPublic);
  if (options?.hqProvince) query = query.eq('hq_province', options.hqProvince);
  if (options?.country) query = query.eq('country', options.country);

  const { data, error, count } = await query.range(from, to);
  if (error) throw new Error(`getCompanies failed: ${error.message}`);

  const total = count ?? 0;
  return {
    data: (data ?? []) as Company[],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getCompanyById(id: number): Promise<Company | null> {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(`getCompanyById failed: ${error.message}`);
  return (data as Company) ?? null;
}

// ─── Dashboard aggregates ─────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<{
  reportsCount: number;
  companiesCount: number;
  newsTodayCount: number;
}> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [reportsRes, companiesRes, newsRes] = await Promise.all([
    supabase.from('reports').select('id', { count: 'exact', head: true }),
    supabase.from('companies').select('id', { count: 'exact', head: true }).eq('is_tracked', true),
    supabase
      .from('news_items')
      .select('id', { count: 'exact', head: true })
      .eq('is_published', true)
      .gte('published_at', today.toISOString()),
  ]);

  return {
    reportsCount: reportsRes.count ?? 0,
    companiesCount: companiesRes.count ?? 0,
    newsTodayCount: newsRes.count ?? 0,
  };
}
