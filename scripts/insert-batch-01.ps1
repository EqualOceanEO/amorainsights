$supabaseUrl = "https://jqppcuccqkxhhrvndsil.supabase.co"
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDcxMDQsImV4cCI6MjA4ODcyMzEwNH0.twYdLldCw10hQADe5RximjkLTtrYE1zyvr1xMYVS3V8"
$postHeaders = @{ "apikey" = $anonKey; "Authorization" = "Bearer $anonKey"; "Content-Type" = "application/json"; "Prefer" = "return=minimal" }

function Insert($jsonArr) {
    $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($jsonArr)
    try {
        $r = Invoke-WebRequest -Uri "$supabaseUrl/rest/v1/companies" -Method POST -Headers $postHeaders -Body $bodyBytes -UseBasicParsing
        return "OK " + $r.StatusCode
    } catch {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        return "ERR: " + $reader.ReadToEnd()
    }
}

# Batch 1: AI Foundation Models (ids 1-10)
Write-Host "=== Batch 1: AI Foundation Models ==="
$b1 = @'
[
{"id":1,"name":"OpenAI","name_cn":"OpenAI","industry_slug":"ai","sub_sector":"Foundation Models","description":"Creator of GPT-4 and ChatGPT. World's most advanced AI research lab and commercialization platform. Over 300M weekly active users. Valued at $157B in 2025.","country":"US","hq_city":"San Francisco","hq_province":"California","website":"https://openai.com","ticker":null,"exchange":null,"employee_count":3000,"is_tracked":true,"is_public":false,"tags":["gpt","chatgpt","llm","generative-ai"],"founded_year":2015},
{"id":2,"name":"Anthropic","name_cn":"Anthropic","industry_slug":"ai","sub_sector":"Foundation Models","description":"Safety-focused AI lab and creator of the Claude model family. Raised $7.3B+ from Google and Amazon. Leading in enterprise AI deployment with Claude 3.5 and 3.7.","country":"US","hq_city":"San Francisco","hq_province":"California","website":"https://anthropic.com","ticker":null,"exchange":null,"employee_count":1500,"is_tracked":true,"is_public":false,"tags":["claude","safety","llm","enterprise-ai"],"founded_year":2021},
{"id":3,"name":"Google DeepMind","name_cn":"Google DeepMind","industry_slug":"ai","sub_sector":"Foundation Models","description":"Alphabet's consolidated AI research arm. Creator of Gemini model family. Leads in multimodal AI, AlphaFold protein folding, and reinforcement learning research.","country":"US","hq_city":"Mountain View","hq_province":"California","website":"https://deepmind.google","ticker":"GOOGL","exchange":"NASDAQ","employee_count":5000,"is_tracked":true,"is_public":true,"tags":["gemini","deepmind","multimodal","alphafold"],"founded_year":2023},
{"id":4,"name":"Meta AI","name_cn":"Meta AI","industry_slug":"ai","sub_sector":"Foundation Models","description":"Meta's open-source AI division. Creator of the Llama model family. Leading open-weights strategy with 400M+ Llama downloads. Integrating AI across Facebook, Instagram, WhatsApp.","country":"US","hq_city":"Menlo Park","hq_province":"California","website":"https://ai.meta.com","ticker":"META","exchange":"NASDAQ","employee_count":10000,"is_tracked":true,"is_public":true,"tags":["llama","open-source","multimodal","social-ai"],"founded_year":2023},
{"id":5,"name":"MiniMax","name_cn":"稀宇科技","industry_slug":"ai","sub_sector":"Foundation Models","description":"Chinese AI lab developing MiniMax-Text and MiniMax-Video models. Creator of the Hailuo AI video platform. Listed on HKEX in 2025 under ticker 00100.","country":"CN","hq_city":"Shanghai","hq_province":"Shanghai","website":"https://minimaxi.com","ticker":"00100","exchange":"HKEX","employee_count":1200,"is_tracked":true,"is_public":true,"tags":["video-ai","multimodal","hailuo","llm"],"founded_year":2021},
{"id":6,"name":"Doubao","name_cn":"豆包（字节跳动）","industry_slug":"ai","sub_sector":"Foundation Models","description":"ByteDance's flagship AI assistant powered by its proprietary Doubao large language model. China's #1 AI app with 50M+ MAU. Integrated across Douyin and TikTok ecosystems.","country":"CN","hq_city":"Beijing","hq_province":"Beijing","website":"https://doubao.com","ticker":null,"exchange":null,"employee_count":5000,"is_tracked":true,"is_public":false,"tags":["doubao","bytedance","consumer-ai","llm"],"founded_year":2023},
{"id":7,"name":"Qwen","name_cn":"通义千问（阿里巴巴）","industry_slug":"ai","sub_sector":"Foundation Models","description":"Alibaba's Qwen (Tongyi Qianwen) foundation model series. Leading open-source model in China with Qwen2.5 reaching top benchmark performance. Powers Alibaba Cloud AI ecosystem.","country":"CN","hq_city":"Hangzhou","hq_province":"Zhejiang","website":"https://qwenlm.github.io","ticker":"BABA","exchange":"NYSE","employee_count":8000,"is_tracked":true,"is_public":true,"tags":["qwen","alibaba","open-source","enterprise-ai"],"founded_year":2022},
{"id":8,"name":"xAI","name_cn":"xAI","industry_slug":"ai","sub_sector":"Foundation Models","description":"Elon Musk's AI company developing the Grok model series. Integrated with X (Twitter) platform. Raised $6B Series B in 2024, valued at $50B. Focused on understanding the universe.","country":"US","hq_city":"San Francisco","hq_province":"California","website":"https://x.ai","ticker":null,"exchange":null,"employee_count":800,"is_tracked":true,"is_public":false,"tags":["grok","elon-musk","x-twitter","llm"],"founded_year":2023},
{"id":9,"name":"Baidu ERNIE","name_cn":"百度文心","industry_slug":"ai","sub_sector":"Foundation Models","description":"Baidu's ERNIE (Enhanced Representation through Knowledge Integration) large language model platform. China's first commercially deployed LLM. Powers Baidu Search, Maps, and Cloud AI.","country":"CN","hq_city":"Beijing","hq_province":"Beijing","website":"https://yiyan.baidu.com","ticker":"BIDU","exchange":"NASDAQ","employee_count":12000,"is_tracked":true,"is_public":true,"tags":["ernie","baidu","search-ai","enterprise"],"founded_year":2019},
{"id":10,"name":"Zhipu AI","name_cn":"智谱AI","industry_slug":"ai","sub_sector":"Foundation Models","description":"Developer of the GLM series of large language models spun out from Tsinghua University. Raised $400M+ with $3B valuation. Key enterprise AI platform with 300K+ API developers.","country":"CN","hq_city":"Beijing","hq_province":"Beijing","website":"https://zhipuai.cn","ticker":null,"exchange":null,"employee_count":1500,"is_tracked":true,"is_public":false,"tags":["glm","tsinghua","enterprise-ai","llm"],"founded_year":2019}
]
'@
Write-Host (Insert $b1)
