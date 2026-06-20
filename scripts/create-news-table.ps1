[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$PAT = "sbp_2d9e51cc04f38bb94e7b1394ed8c1d064126a8cc"
$projectRef = "jqppcuccqkxhhrvndsil"
$apiUrl = "https://api.supabase.com/v1/projects/$projectRef/database/query"

$headers = @{
    "Authorization" = "Bearer $PAT"
    "Content-Type"  = "application/json"
}

function Run-SQL {
    param([string]$sql)
    $body = [System.Text.Encoding]::UTF8.GetBytes("{`"query`": `"$($sql -replace '"','\"' -replace "`n",' ')`"}")
    try {
        $resp = Invoke-WebRequest -Uri $apiUrl -Method POST -Headers $headers -Body $body -UseBasicParsing
        Write-Host "OK ($($resp.StatusCode)): $sql"
        return $true
    } catch {
        Write-Host "ERR: $($_.Exception.Message)"
        return $false
    }
}

Write-Host "=== Creating news table ==="

$sql1 = @"
CREATE TABLE IF NOT EXISTS news (
  id              BIGSERIAL PRIMARY KEY,
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  summary         TEXT,
  content         TEXT,
  source_url      TEXT,
  source_name     TEXT,
  author          TEXT,
  cover_image_url TEXT,
  industry_slug   TEXT NOT NULL DEFAULT 'ai',
  company_id      BIGINT REFERENCES companies(id) ON DELETE SET NULL,
  company_ids     BIGINT[] DEFAULT '{}',
  tags            TEXT[] DEFAULT '{}',
  is_premium      BOOLEAN NOT NULL DEFAULT FALSE,
  is_published    BOOLEAN NOT NULL DEFAULT FALSE,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
)
"@

$sql2 = "CREATE INDEX IF NOT EXISTS idx_news_industry_slug ON news(industry_slug)"
$sql3 = "CREATE INDEX IF NOT EXISTS idx_news_company_id ON news(company_id)"
$sql4 = "CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at DESC)"
$sql5 = "CREATE INDEX IF NOT EXISTS idx_news_is_published ON news(is_published)"

foreach ($s in @($sql1, $sql2, $sql3, $sql4, $sql5)) {
    Run-SQL $s
}

Write-Host "=== Done ==="
