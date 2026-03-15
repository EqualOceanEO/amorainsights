$pat = "sbp_2d9e51cc04f38bb94e7b1394ed8c1d064126a8cc"
$uri = "https://api.supabase.com/v1/projects/jqppcuccqkxhhrvndsil/database/query"

function Q($label, $q) {
    Write-Host ">> $label"
    $bytes = [System.Text.Encoding]::UTF8.GetBytes(([PSCustomObject]@{query=$q}|ConvertTo-Json -Depth 10 -Compress))
    $r = Invoke-WebRequest -Uri $uri -Method POST -Headers @{"Authorization"="Bearer $pat";"Content-Type"="application/json"} -Body $bytes -UseBasicParsing -TimeoutSec 60
    Write-Host "   $($r.StatusCode) $($r.Content.Substring(0,[Math]::Min(200,$r.Content.Length)))"
}

# Check current state
Q "CHECK: intelligent-manufacturing row" "SELECT id, slug, name FROM industries WHERE slug IN ('intelligent-manufacturing','manufacturing');"

# Strategy: ALTER FK constraints to DEFERRABLE, do all updates in one shot, then restore
# Simpler: just UPDATE the slug directly without FK constraint active
# Supabase doesn't support SET session_replication_role, but we can drop+recreate FK

Q "DROP FK on reports"   "ALTER TABLE reports    DROP CONSTRAINT IF EXISTS reports_industry_slug_fkey;"
Q "DROP FK on news"      "ALTER TABLE news_items DROP CONSTRAINT IF EXISTS news_items_industry_slug_fkey;"
Q "DROP FK on companies" "ALTER TABLE companies  DROP CONSTRAINT IF EXISTS companies_industry_slug_fkey;"

Q "UPDATE reports"   "UPDATE reports    SET industry_slug='manufacturing' WHERE industry_slug='intelligent-manufacturing';"
Q "UPDATE news"      "UPDATE news_items SET industry_slug='manufacturing' WHERE industry_slug='intelligent-manufacturing';"
Q "UPDATE companies" "UPDATE companies  SET industry_slug='manufacturing' WHERE industry_slug='intelligent-manufacturing';"

$raw = [System.IO.File]::ReadAllText("c:\Users\51229\WorkBuddy\Claw\scripts\migrate-industries-v2.sql", [System.Text.Encoding]::UTF8)
$m2b = [regex]::Match($raw, '(?s)-- 2b\. Now rename.*?(?=-- 2c)')
$q2b = ($m2b.Value -replace '--[^\r\n]*','').Trim()
Q "RENAME slug intel-mfg -> manufacturing" $q2b

Q "RESTORE FK on reports"   "ALTER TABLE reports    ADD CONSTRAINT reports_industry_slug_fkey    FOREIGN KEY (industry_slug) REFERENCES industries(slug);"
Q "RESTORE FK on news"      "ALTER TABLE news_items ADD CONSTRAINT news_items_industry_slug_fkey FOREIGN KEY (industry_slug) REFERENCES industries(slug);"
Q "RESTORE FK on companies" "ALTER TABLE companies  ADD CONSTRAINT companies_industry_slug_fkey  FOREIGN KEY (industry_slug) REFERENCES industries(slug);"

Q "FINAL VERIFY" "SELECT level, COUNT(*) AS cnt FROM industries GROUP BY level ORDER BY level; SELECT industry_slug, COUNT(*) FROM reports GROUP BY industry_slug ORDER BY 1; SELECT industry_slug, COUNT(*) FROM companies GROUP BY industry_slug ORDER BY 1;"
Write-Host "DONE"
