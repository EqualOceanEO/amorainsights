$PAT = "sbp_2d9e51cc04f38bb94e7b1394ed8c1d064126a8cc"
$PROJECT_REF = "jqppcuccqkxhhrvndsil"
$API_URL = "https://api.supabase.com/v1/projects/$PROJECT_REF/database/query"
$HEADERS = @{ "Authorization" = "Bearer $PAT"; "Content-Type" = "application/json" }

function Run-SQL($sql) {
  $body = [System.Text.Encoding]::UTF8.GetBytes(("{""query"":""$sql""}"))
  try {
    $r = Invoke-WebRequest -Uri $API_URL -Method POST -Headers $HEADERS -Body $body -ErrorAction Stop
    Write-Host "OK ($($r.StatusCode)): $sql"
  } catch {
    Write-Host "ERR: $($_.Exception.Message) | SQL: $sql"
  }
}

# 1. Add report_format column
Run-SQL "ALTER TABLE reports ADD COLUMN IF NOT EXISTS report_format TEXT NOT NULL DEFAULT 'markdown' CHECK (report_format IN ('markdown', 'html', 'h5_embed'));"

# 2. Add html_content column (TEXT, can be large — up to Supabase text limit)
Run-SQL "ALTER TABLE reports ADD COLUMN IF NOT EXISTS html_content TEXT;"

# 3. Add html_file_name column (original filename for display)
Run-SQL "ALTER TABLE reports ADD COLUMN IF NOT EXISTS html_file_name TEXT;"

# 4. Seed HRI 2026 as first H5 report (upsert by slug)
# Note: We store an embed reference — the actual HTML is served from /public/ folder
# For now, set report_format='h5_embed' and html_file_name='hri-report-2026.html'
Run-SQL "INSERT INTO reports (title, slug, summary, industry_slug, is_premium, author, tags, report_type, report_level, overall_grade, production_status, compliance_tier, report_format, html_file_name, word_count, data_cutoff_date, published_at) VALUES ('The Humanoid Robot Index 2026', 'humanoid-robot-index-2026', 'A quantitative benchmark of 9 humanoid robotics companies across 5 AMORA dimensions. China leads deployment at 80% of global units. The companies that will define this industry in 2030 are already in this index.', 'manufacturing', false, 'AmoraInsights Research', ARRAY['humanoid-robots','robotics','AMORA','deep-tech','china-tech','autonomous-systems'], 'flagship', 3, 'A', 'published', 'SENSITIVE_TECH', 'h5_embed', 'hri-report-2026.html', 12000, '2026-03-01', '2026-03-15T00:00:00Z') ON CONFLICT (slug) DO UPDATE SET report_format='h5_embed', html_file_name='hri-report-2026.html', production_status='published', published_at='2026-03-15T00:00:00Z', overall_grade='A', compliance_tier='SENSITIVE_TECH', updated_at=NOW();"

Write-Host "DB migration complete."
