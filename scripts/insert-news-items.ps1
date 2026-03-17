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
    title         = "NVIDIA Blackwell Ultra GB300 Enters Mass Production, H100 Prices Tumble"
    summary       = "NVIDIA's GB300 Blackwell Ultra GPU has entered full mass production. H100 spot prices have fallen 39% year-to-date as next-gen supply ramps at TSMC."
    industry_slug = "semiconductor"
    source_name   = "SemiAnalysis"
    source_url    = "https://semianalysis.com/nvidia-gb300-production"
    is_featured   = $true
    published_at  = (Get-Date).AddDays(-1).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  },
  @{
    title         = "Anthropic Secures `$4B Series E at `$61B Valuation Amid Surging Claude Enterprise Demand"
    summary       = "Anthropic has closed a `$4 billion Series E funding round led by Google, valuing the company at `$61 billion. Claude enterprise API revenue reportedly grew 300% year-over-year."
    industry_slug = "ai"
    source_name   = "Wall Street Journal"
    source_url    = "https://www.wsj.com/tech/anthropic-funding-2026"
    is_featured   = $true
    published_at  = (Get-Date).AddHours(-5).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  },
  @{
    title         = "ByteDance Doubao AI Surpasses 100M Daily Active Users in China"
    summary       = "ByteDance's Doubao AI assistant has crossed 100 million daily active users, making it the first domestic AI product to reach this milestone in China."
    industry_slug = "ai"
    source_name   = "Financial Times"
    source_url    = "https://ft.com/bytedance-doubao-milestone"
    is_featured   = $false
    published_at  = (Get-Date).AddDays(-2).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  },
  @{
    title         = "EU AI Act Compliance Triggers Wave of Financial Sector Audits Worth EUR 2.3B"
    summary       = "With the EU AI Act's high-risk system requirements taking effect in August 2026, European banks are scrambling to audit AI models and creating a new compliance services market."
    industry_slug = "fintech"
    source_name   = "Reuters"
    source_url    = "https://reuters.com/eu-ai-act-finance-2026"
    is_featured   = $true
    published_at  = (Get-Date).AddDays(-3).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  },
  @{
    title         = "Waymo Expands Robotaxi to 10 New US Cities, Backed by `$5.6B Round and Magna Partnership"
    summary       = "Alphabet's Waymo announces commercial robotaxi launches in 10 additional US cities by Q3 2026, with a new Magna manufacturing agreement reducing hardware costs by 35%."
    industry_slug = "autonomous-vehicles"
    source_name   = "Bloomberg"
    source_url    = "https://bloomberg.com/waymo-expansion-2026"
    is_featured   = $false
    published_at  = (Get-Date).AddDays(-4).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  },
  @{
    title         = "OpenAI Operator Agents Process `$2B in Enterprise Transactions in First 60 Days"
    summary       = "OpenAI's Operator product has processed over `$2 billion in enterprise transactions since its February 2026 launch, surpassing initial projections by 3x across procurement, travel, and HR workflows."
    industry_slug = "ai"
    source_name   = "The Information"
    source_url    = "https://theinformation.com/openai-operator-2b"
    is_featured   = $true
    published_at  = (Get-Date).AddDays(-5).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  },
  @{
    title         = "TSMC Arizona Fab Achieves First 2nm Wafer Yield, Full Production on Track for Q4 2026"
    summary       = "TSMC confirmed its Arizona Fab 21 successfully produced first 2nm test wafers at commercial yield rates, a milestone that could enable Apple A20 domestic manufacturing."
    industry_slug = "semiconductor"
    source_name   = "Nikkei Asia"
    source_url    = "https://nikkei.com/tsmc-arizona-2nm-2026"
    is_featured   = $false
    published_at  = (Get-Date).AddDays(-6).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  },
  @{
    title         = "CRISPR Therapeutics Reports 95% Transfusion Independence in Sickle Cell Trial"
    summary       = "CRISPR Therapeutics and Vertex announced 95% of patients in their sickle cell gene therapy trial achieved transfusion independence at 24 months, the highest efficacy yet reported."
    industry_slug = "life-sciences"
    source_name   = "STAT News"
    source_url    = "https://statnews.com/crispr-sickle-cell-2026"
    is_featured   = $false
    published_at  = (Get-Date).AddDays(-7).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  },
  @{
    title         = "Northvolt Emerges from Bankruptcy with `$2.75B Restructuring Plan and New US Factory"
    summary       = "Swedish battery maker Northvolt has emerged from Chapter 11 bankruptcy protection with a `$2.75 billion restructuring plan, including a new US manufacturing facility in Michigan."
    industry_slug = "green-tech"
    source_name   = "Bloomberg"
    source_url    = "https://bloomberg.com/northvolt-restructuring-2026"
    is_featured   = $false
    published_at  = (Get-Date).AddDays(-8).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  },
  @{
    title         = "SpaceX Starship Flight 8 Achieves First Complete Reuse Cycle, Booster Catches Tower"
    summary       = "SpaceX successfully completed the eighth Starship integrated flight test, with the Super Heavy booster captured by the launch tower's mechanical arms for the second time."
    industry_slug = "new-space"
    source_name   = "Ars Technica"
    source_url    = "https://arstechnica.com/starship-flight-8-2026"
    is_featured   = $true
    published_at  = (Get-Date).AddDays(-9).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  }
)

$ok  = 0
$err = 0

foreach ($article in $articles) {
  $json = $article | ConvertTo-Json -Depth 5
  $body = [System.Text.Encoding]::UTF8.GetBytes($json)
  try {
    $resp = Invoke-WebRequest -Uri $endpoint -Method POST `
      -Headers $headers -Body $body -UseBasicParsing -TimeoutSec 20
    Write-Host "OK ($($resp.StatusCode)): $($article.title.Substring(0, [Math]::Min(60, $article.title.Length)))..." -ForegroundColor Green
    $ok++
  } catch {
    $msg = $_.Exception.Message
    try { $msg = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream()).ReadToEnd() } catch {}
    Write-Host "ERR: $($article.title.Substring(0, 40))... -> $msg" -ForegroundColor Red
    $err++
  }
}

Write-Host ""
Write-Host "=== Done: $ok inserted, $err errors ===" -ForegroundColor Cyan
