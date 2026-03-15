$pat = 'sbp_2d9e51cc04f38bb94e7b1394ed8c1d064126a8cc'
$ref = 'jqppcuccqkxhhrvndsil'
$uri = "https://api.supabase.com/v1/projects/$ref/database/query"

function Q($label, $sql) {
    Write-Host ">> $label"
    $obj = [PSCustomObject]@{ query = $sql }
    $json = $obj | ConvertTo-Json -Depth 20 -Compress
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
    $headers = @{ 'Authorization' = "Bearer $pat"; 'Content-Type' = 'application/json' }
    try {
        $r = Invoke-WebRequest -Uri $uri -Method POST -Headers $headers -Body $bytes -UseBasicParsing -TimeoutSec 120
        Write-Host "   $($r.StatusCode) $($r.Content.Substring(0, [Math]::Min(120, $r.Content.Length)))"
    } catch {
        Write-Host "   ERROR: $($_.Exception.Message)"
    }
}

# ── STEP 1: ALTER reports ─────────────────────────────────────────────────────

Q "1a report_type" "ALTER TABLE reports ADD COLUMN IF NOT EXISTS report_type VARCHAR(20) NOT NULL DEFAULT 'standard' CHECK (report_type IN ('flagship','standard','brief'));"

Q "1b report_level" "ALTER TABLE reports ADD COLUMN IF NOT EXISTS report_level SMALLINT NOT NULL DEFAULT 2 CHECK (report_level IN (1,2,3));"

Q "1c overall_grade" "ALTER TABLE reports ADD COLUMN IF NOT EXISTS overall_grade VARCHAR(1) CHECK (overall_grade IN ('A','B','C','D'));"

Q "1d word_count" "ALTER TABLE reports ADD COLUMN IF NOT EXISTS word_count INTEGER;"

Q "1e production_status" "ALTER TABLE reports ADD COLUMN IF NOT EXISTS production_status VARCHAR(30) NOT NULL DEFAULT 'draft' CHECK (production_status IN ('draft','data_collected','review_1','review_2','review_3','published'));"

Q "1f data_cutoff_date" "ALTER TABLE reports ADD COLUMN IF NOT EXISTS data_cutoff_date DATE;"

Q "1g scoring_frozen" "ALTER TABLE reports ADD COLUMN IF NOT EXISTS scoring_frozen BOOLEAN NOT NULL DEFAULT false;"

Q "1h idx production_status" "CREATE INDEX IF NOT EXISTS idx_reports_production_status ON reports(production_status);"

Q "1i idx report_type" "CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(report_type);"

# ── STEP 2: report_scores ─────────────────────────────────────────────────────

Q "2a create report_scores" "CREATE TABLE IF NOT EXISTS report_scores (
  id                BIGSERIAL    PRIMARY KEY,
  report_id         BIGINT       NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  dimension         VARCHAR(1)   NOT NULL CHECK (dimension IN ('A','M','O','R','F')),
  metric_key        VARCHAR(60)  NOT NULL,
  score             NUMERIC(3,1) CHECK (score >= 1.0 AND score <= 10.0),
  industry_avg_snapshot NUMERIC(3,1),
  benchmark_version VARCHAR(20),
  yoy_direction     VARCHAR(4)   CHECK (yoy_direction IN ('UP','DOWN','FLAT')),
  qualitative_note  TEXT,
  data_source_tier  VARCHAR(4)   NOT NULL DEFAULT 'MED' CHECK (data_source_tier IN ('HIGH','MED','LOW')),
  is_data_missing   BOOLEAN      NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (report_id, metric_key)
);"

Q "2b idx report_scores_report" "CREATE INDEX IF NOT EXISTS idx_scores_report ON report_scores(report_id);"
Q "2c idx report_scores_metric" "CREATE INDEX IF NOT EXISTS idx_scores_metric ON report_scores(metric_key);"
Q "2d idx report_scores_dimension" "CREATE INDEX IF NOT EXISTS idx_scores_dimension ON report_scores(dimension);"

# ── STEP 3: report_companies ──────────────────────────────────────────────────

Q "3a create report_companies" "CREATE TABLE IF NOT EXISTS report_companies (
  id            BIGSERIAL   PRIMARY KEY,
  report_id     BIGINT      NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  company_id    BIGINT      NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  role          VARCHAR(20) NOT NULL DEFAULT 'LEADER' CHECK (role IN ('LEADER','CHALLENGER','NICHE','CASE_STUDY')),
  x_axis_score  NUMERIC(4,2),
  y_axis_score  NUMERIC(4,2),
  bubble_size   BIGINT,
  display_note  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (report_id, company_id)
);"

Q "3b idx report_companies_report" "CREATE INDEX IF NOT EXISTS idx_rco_report ON report_companies(report_id);"
Q "3c idx report_companies_company" "CREATE INDEX IF NOT EXISTS idx_rco_company ON report_companies(company_id);"

# ── STEP 4: industry_metric_benchmarks ───────────────────────────────────────

Q "4a create industry_metric_benchmarks" "CREATE TABLE IF NOT EXISTS industry_metric_benchmarks (
  id               BIGSERIAL    PRIMARY KEY,
  industry_slug    VARCHAR(50)  NOT NULL REFERENCES industries(slug) ON DELETE CASCADE,
  metric_key       VARCHAR(60)  NOT NULL,
  dimension        VARCHAR(1)   NOT NULL CHECK (dimension IN ('A','M','O','R','F')),
  avg_score        NUMERIC(3,1) NOT NULL,
  sample_size      INTEGER      NOT NULL DEFAULT 0,
  benchmark_version VARCHAR(20) NOT NULL,
  snapshot_date    DATE         NOT NULL DEFAULT CURRENT_DATE,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (industry_slug, metric_key, benchmark_version)
);"

Q "4b idx benchmarks_industry" "CREATE INDEX IF NOT EXISTS idx_imb_industry ON industry_metric_benchmarks(industry_slug);"
Q "4c idx benchmarks_version" "CREATE INDEX IF NOT EXISTS idx_imb_version ON industry_metric_benchmarks(benchmark_version);"
Q "4d idx benchmarks_metric" "CREATE INDEX IF NOT EXISTS idx_imb_metric ON industry_metric_benchmarks(metric_key);"

# ── STEP 5: VERIFY ────────────────────────────────────────────────────────────

Q "5 VERIFY tables" "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('report_scores','report_companies','industry_metric_benchmarks') ORDER BY table_name;"

Q "5b VERIFY reports new cols" "SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name='reports' AND column_name IN ('report_type','report_level','overall_grade','production_status','data_cutoff_date','scoring_frozen','word_count') ORDER BY column_name;"

Write-Host "Done."
