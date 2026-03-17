$supabaseUrl = "https://jqppcuccqkxhhrvndsil.supabase.co"
$serviceKey  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDcxMDQsImV4cCI6MjA4ODcyMzEwNH0.twYdLldCw10hQADe5RximjkLTtrYE1zyvr1xMYVS3V8"
$endpoint    = "$supabaseUrl/rest/v1/news"

$articles = @(
  @{
    title           = "DeepSeek R2 Set to Challenge OpenAI o3 with 10x Cost Efficiency"
    slug            = "deepseek-r2-challenge-openai-o3-cost-efficiency"
    summary         = "DeepSeek is preparing its R2 model release, which achieves performance parity with OpenAI o3 at one-tenth the inference cost, potentially reshaping enterprise AI adoption economics."
    content         = "DeepSeek has quietly completed internal benchmarking of its upcoming R2 model, and the results are turning heads across the AI industry. According to sources familiar with the matter, R2 demonstrates reasoning capabilities on par with OpenAI o3 on standard benchmarks including MMLU, MATH-500, and HumanEval, while operating at approximately one-tenth the inference cost.`n`nThe cost efficiency stems from DeepSeek's mixture-of-experts architecture, which activates only a subset of parameters for any given query. This approach dramatically reduces compute requirements without sacrificing output quality.`n`nFor enterprises evaluating AI infrastructure costs, this development is significant. Many Fortune 500 companies have been holding back large-scale AI deployments due to per-query costs at scale. A model offering comparable quality at 10x lower cost could accelerate adoption timelines considerably.`n`nOpenAI has not commented on the benchmarks, but the company is expected to release o4 before DeepSeek R2 reaches general availability. The competitive dynamic between US and Chinese AI labs continues to intensify."
    source_url      = "https://techcrunch.com/2026/03/deepseek-r2"
    source_name     = "TechCrunch"
    author          = "Sarah Chen"
    cover_image_url = "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&q=80"
    industry_slug   = "ai"
    tags            = @("LLM","Cost Efficiency","Enterprise AI","DeepSeek")
    is_premium      = $false
    is_published    = $true
    published_at    = (Get-Date).AddHours(-2).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  },
  @{
    title           = "Anthropic Secures `$4B Series E at `$61B Valuation Amid Surging Claude Enterprise Demand"
    slug            = "anthropic-series-e-61b-valuation-claude-enterprise"
    summary         = "Anthropic has closed a `$4 billion Series E funding round led by Google, valuing the AI safety company at `$61 billion. Claude enterprise API revenue reportedly grew 300% year-over-year."
    content         = "Anthropic has officially closed its `$4 billion Series E funding round, cementing its position as one of the most valuable private AI companies in the world. The round was led by Google, with participation from Salesforce Ventures, Spark Capital, and several sovereign wealth funds.`n`nThe `$61 billion valuation represents a significant step up from the company's previous `$40 billion mark set in late 2024. The jump reflects explosive growth in Claude's enterprise adoption, with multiple sources indicating API revenue grew over 300% in 2025.`n`nKey drivers of this growth include Claude's strong performance on coding tasks, its 200K context window that competitors have struggled to match at production quality, and Anthropic's safety-first reputation that resonates with regulated industries like finance and healthcare.`n`nThe company plans to use the proceeds to expand its model training infrastructure and accelerate its Constitutional AI research program."
    source_url      = "https://www.wsj.com/tech/anthropic-funding-2026"
    source_name     = "Wall Street Journal"
    author          = "Michael Torres"
    cover_image_url = "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&q=80"
    industry_slug   = "ai"
    tags            = @("Funding","Anthropic","Claude","Enterprise AI","Valuation")
    is_premium      = $true
    is_published    = $true
    published_at    = (Get-Date).AddHours(-5).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  },
  @{
    title           = "NVIDIA Blackwell Ultra GB300 Enters Mass Production, H100 Price Drop Accelerates"
    slug            = "nvidia-blackwell-ultra-gb300-mass-production"
    summary         = "NVIDIA has begun mass production of its GB300 Blackwell Ultra chips. Meanwhile H100 spot prices have fallen 40% year-to-date as next-gen supply ramps."
    content         = "NVIDIA's next-generation GB300 Blackwell Ultra GPU has entered full mass production at TSMC's advanced packaging facilities in Arizona and Taiwan, marking a major milestone for the AI infrastructure build-out cycle.`n`nThe GB300 offers a 3x improvement in FP8 training throughput compared to the H100 and a 2.5x improvement in inference performance. The chip also features HBM3e memory with 288GB capacity per GPU, addressing one of the key bottlenecks in large model training.`n`nAs GB300 supply ramps, H100 prices on the secondary market have declined sharply. Spot prices have fallen from approximately `$28,000 per unit in January to `$17,000 in mid-March, a 39% decline.`n`nMeta, Microsoft, Google, and Amazon have all reportedly placed GB300 orders totaling over 2 million units through 2026. The supply constraints that characterized the H100 era appear to be easing."
    source_url      = "https://semianalysis.com/nvidia-gb300-production"
    source_name     = "SemiAnalysis"
    author          = "Dylan Patel"
    cover_image_url = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80"
    industry_slug   = "semiconductor"
    tags            = @("NVIDIA","Blackwell","GPU","AI Infrastructure","TSMC")
    is_premium      = $false
    is_published    = $true
    published_at    = (Get-Date).AddDays(-1).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  },
  @{
    title           = "ByteDance Doubao Model Surpasses 100M Daily Active Users in China"
    slug            = "bytedance-doubao-100m-dau-china-ai"
    summary         = "ByteDance's Doubao AI assistant has crossed 100 million daily active users in China, making it the first domestic AI product to reach this milestone."
    content         = "ByteDance's AI assistant Doubao has achieved 100 million daily active users in China as of March 2026, becoming the first homegrown AI product to reach this scale and signaling a major shift in the Chinese AI consumer landscape.`n`nDoubao's growth has been propelled by deep integration with Douyin, ByteDance's content recommendation algorithms, and aggressive pricing—the service remains free for most consumer use cases. The platform supports text, image, video, and code generation through a unified interface.`n`nThe milestone puts pressure on Baidu's Ernie Bot, which had approximately 60 million DAU as of Q4 2025. Alibaba's Tongyi Qianwen and Tencent's Hunyuan are also competing but trail significantly.`n`nAnalysts note that ByteDance's distribution advantage through its existing super-apps gives Doubao a structural moat that pure-play AI companies cannot easily replicate."
    source_url      = "https://ft.com/bytedance-doubao-milestone"
    source_name     = "Financial Times"
    author          = "Teng Jing Xuan"
    cover_image_url = "https://images.unsplash.com/photo-1611262588024-d12430b98920?w=1200&q=80"
    industry_slug   = "ai"
    tags            = @("ByteDance","Doubao","China AI","Consumer AI","DAU")
    is_premium      = $false
    is_published    = $true
    published_at    = (Get-Date).AddDays(-2).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  },
  @{
    title           = "EU AI Act Compliance Deadline Triggers Wave of Model Audits Across Financial Sector"
    slug            = "eu-ai-act-compliance-financial-sector-audits"
    summary         = "With the EU AI Act's high-risk system requirements taking effect in August 2026, European banks are scrambling to audit AI models, creating a compliance services market estimated at 2.3 billion euros."
    content         = "The European Union's AI Act is creating a new compliance services industry as financial institutions race to meet the August 2026 deadline for high-risk AI system requirements.`n`nUnder the Act, AI systems used for credit scoring, fraud detection, insurance underwriting, and investment recommendations are classified as high-risk and must undergo conformity assessments, maintain comprehensive documentation, and implement human oversight mechanisms.`n`nMajor European banks including Deutsche Bank, BNP Paribas, and ING have disclosed AI Act compliance programs running into hundreds of millions of euros. Consulting firms McKinsey, Accenture, and Deloitte have all launched dedicated AI Act practices.`n`nFor AI governance software vendors, the Act has been a windfall. Companies like Credo AI, Fiddler AI, and Arthur AI have seen European customer inquiries surge over 400% since the Act's provisions were finalized."
    source_url      = "https://reuters.com/eu-ai-act-finance-2026"
    source_name     = "Reuters"
    author          = "Anna Kowalski"
    cover_image_url = "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80"
    industry_slug   = "fintech"
    tags            = @("EU AI Act","Regulation","Compliance","Financial Services","Risk Management")
    is_premium      = $true
    is_published    = $true
    published_at    = (Get-Date).AddDays(-3).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  },
  @{
    title           = "Waymo Expands Robotaxi Operations to 10 New US Cities by Q3 2026"
    slug            = "waymo-robotaxi-expansion-10-cities-2026"
    summary         = "Alphabet's Waymo has announced plans to launch commercial robotaxi services in 10 additional US cities by Q3 2026, backed by a `$5.6B funding round and a new manufacturing agreement with Magna International."
    content         = "Alphabet subsidiary Waymo has announced an ambitious expansion plan that will bring its commercial robotaxi service to 10 new US cities by the end of Q3 2026. The announcement is supported by a new `$5.6 billion funding round and a manufacturing scale-up agreement with auto supplier Magna International.`n`nThe new cities include Atlanta, Denver, Seattle, Miami, Boston, Chicago, Philadelphia, Houston, Phoenix, and Nashville. Waymo currently operates in San Francisco, Los Angeles, Phoenix, and Austin.`n`nThe Magna agreement is particularly significant. Under the deal, Magna will manufacture the Waymo Driver hardware suite at its Michigan facilities, reducing Waymo's per-vehicle hardware cost by an estimated 35%.`n`nWaymo reported 150,000 paid rides per week across its current markets as of February 2026, up from 50,000 in mid-2024."
    source_url      = "https://bloomberg.com/waymo-expansion-2026"
    source_name     = "Bloomberg"
    author          = "Keith Naughton"
    cover_image_url = "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&q=80"
    industry_slug   = "autonomous-vehicles"
    tags            = @("Waymo","Robotaxi","Autonomous Vehicles","Alphabet","Expansion")
    is_premium      = $false
    is_published    = $true
    published_at    = (Get-Date).AddDays(-4).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  },
  @{
    title           = "OpenAI Operator Agents Process `$2B in Enterprise Transactions in First 60 Days"
    slug            = "openai-operator-agents-2b-enterprise-transactions"
    summary         = "OpenAI's Operator product has processed over `$2 billion in enterprise transactions since its February 2026 launch, surpassing initial projections by 3x and sparking a race among competitors."
    content         = "OpenAI's Operator product has dramatically exceeded internal projections in its first 60 days of commercial availability, processing over `$2 billion in enterprise transactions across procurement, travel booking, software purchasing, and HR workflows.`n`nOperator allows businesses to deploy AI agents that can autonomously navigate websites, fill forms, execute purchases, and complete multi-step business processes without human intervention. The `$2 billion figure represents the aggregate value of transactions where Operator served as the execution layer.`n`nFinancial services has emerged as the largest vertical, with banks using Operator for vendor payment processing, compliance document collection, and regulatory filing workflows.`n`nCompetitors have taken notice. Microsoft has accelerated its Copilot Actions development, and Google's Project Jarvis team has reportedly doubled in size since Operator's launch."
    source_url      = "https://theinformation.com/openai-operator-2b"
    source_name     = "The Information"
    author          = "Amir Efrati"
    cover_image_url = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80"
    industry_slug   = "ai"
    tags            = @("OpenAI","Operator","AI Agents","Enterprise","Automation")
    is_premium      = $true
    is_published    = $true
    published_at    = (Get-Date).AddDays(-5).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  },
  @{
    title           = "TSMC Arizona Fab Achieves First 2nm Wafer Yield, On Track for 2026 Production"
    slug            = "tsmc-arizona-fab-2nm-wafer-yield"
    summary         = "TSMC has confirmed its Arizona fab successfully produced its first 2nm test wafers with acceptable yield rates, positioning the facility for full N2 production by Q4 2026."
    content         = "TSMC has achieved a critical manufacturing milestone at its Arizona Fab 21 facility, successfully producing the first 2nm (N2) process test wafers with yield rates that meet commercial production thresholds.`n`nThe achievement demonstrates that TSMC's most advanced manufacturing process can be successfully transferred to US soil. Apple is expected to be the anchor customer for Arizona N2 production, with the A20 chip for iPhone 18 potentially manufactured domestically.`n`nThe CHIPS Act provided TSMC's US operations with approximately `$6.6 billion in grants and `$5 billion in loans. Commerce Secretary nominee has indicated additional incentive packages may be available as production scales.`n`nGeopolitical implications are significant. US-manufactured leading-edge chips would reduce dependence on Taiwan-produced silicon for defense and critical infrastructure applications."
    source_url      = "https://nikkei.com/tsmc-arizona-2nm-2026"
    source_name     = "Nikkei Asia"
    author          = "Cheng Ting-Fang"
    cover_image_url = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&q=80"
    industry_slug   = "semiconductor"
    tags            = @("TSMC","Semiconductor","2nm","Arizona","CHIPS Act")
    is_premium      = $false
    is_published    = $true
    published_at    = (Get-Date).AddDays(-6).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  }
)

$headers = @{
  "apikey"        = $serviceKey
  "Authorization" = "Bearer $serviceKey"
  "Content-Type"  = "application/json"
  "Prefer"        = "resolution=merge-duplicates"
}

$ok  = 0
$err = 0

foreach ($article in $articles) {
  $json = $article | ConvertTo-Json -Depth 5
  $body = [System.Text.Encoding]::UTF8.GetBytes($json)
  try {
    $resp = Invoke-WebRequest -Uri $endpoint -Method POST `
      -Headers $headers -Body $body -UseBasicParsing -TimeoutSec 20
    Write-Host "OK ($($resp.StatusCode)): $($article.slug)" -ForegroundColor Green
    $ok++
  } catch {
    $msg = $_.Exception.Message
    try { $msg = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream()).ReadToEnd() } catch {}
    Write-Host "ERR: $($article.slug) -> $msg" -ForegroundColor Red
    $err++
  }
}

Write-Host ""
Write-Host "=== Done: $ok ok, $err errors ===" -ForegroundColor Cyan
