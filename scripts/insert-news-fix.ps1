$supabaseUrl = "https://jqppcuccqkxhhrvndsil.supabase.co"
$anonKey     = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDcxMDQsImV4cCI6MjA4ODcyMzEwNH0.twYdLldCw10hQADe5RximjkLTtrYE1zyvr1xMYVS3V8"
$endpoint    = "$supabaseUrl/rest/v1/news_items"
$headers = @{
  "apikey"        = $anonKey
  "Authorization" = "Bearer $anonKey"
  "Content-Type"  = "application/json"
  "Prefer"        = "return=representation"
}

$articles = @(
  @{
    title         = "NVIDIA Blackwell Ultra GB300 Enters Mass Production, H100 Prices Tumble 39%"
    summary       = "NVIDIA's GB300 Blackwell Ultra GPU has entered full mass production at TSMC. H100 spot prices have fallen from `$28K to `$17K year-to-date as next-gen supply ramps."
    industry_slug = "ai-semiconductors"
    source_name   = "SemiAnalysis"
    source_url    = "https://semianalysis.com/nvidia-gb300-production"
    is_featured   = $true
    published_at  = (Get-Date).AddDays(-1).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  },
  @{
    title         = "TSMC Arizona Fab Achieves First 2nm Wafer Yield, Full Production on Track for Q4 2026"
    summary       = "TSMC confirmed its Arizona Fab 21 successfully produced first 2nm test wafers at commercial yield rates, a milestone potentially enabling Apple A20 domestic manufacturing."
    industry_slug = "semiconductors-materials"
    source_name   = "Nikkei Asia"
    source_url    = "https://nikkei.com/tsmc-arizona-2nm-2026"
    is_featured   = $false
    published_at  = (Get-Date).AddDays(-6).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  },
  @{
    title         = "EU AI Act Compliance Triggers Wave of Financial Sector Audits Worth EUR 2.3B"
    summary       = "With EU AI Act high-risk system requirements taking effect in August 2026, European banks are scrambling to audit AI models, creating a EUR 2.3B compliance services market."
    industry_slug = "ai"
    source_name   = "Reuters"
    source_url    = "https://reuters.com/eu-ai-act-finance-2026"
    is_featured   = $true
    published_at  = (Get-Date).AddDays(-3).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  }
)

$ok = 0; $err = 0
foreach ($article in $articles) {
  $json = $article | ConvertTo-Json -Depth 5
  $body = [System.Text.Encoding]::UTF8.GetBytes($json)
  try {
    $resp = Invoke-WebRequest -Uri $endpoint -Method POST -Headers $headers -Body $body -UseBasicParsing -TimeoutSec 20
    Write-Host "OK: $($article.title.Substring(0,60))..." -ForegroundColor Green
    $ok++
  } catch {
    $msg = $_.Exception.Message
    try { $msg = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream()).ReadToEnd() } catch {}
    Write-Host "ERR: $msg" -ForegroundColor Red
    $err++
  }
}
Write-Host "Done: $ok ok, $err err" -ForegroundColor Cyan
