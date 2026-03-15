Set-StrictMode -Off
$ErrorActionPreference = "Stop"

$pat = "sbp_2d9e51cc04f38bb94e7b1394ed8c1d064126a8cc"
$projectRef = "jqppcuccqkxhhrvndsil"

function Invoke-SQL {
    param([string]$sql, [string]$label)
    Write-Host "`nExecuting: $label ..."
    $bodyObj = New-Object -TypeName PSObject -Property @{ query = $sql }
    $body = $bodyObj | ConvertTo-Json -Depth 5 -Compress
    $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($body)

    $req = [System.Net.HttpWebRequest]::Create("https://api.supabase.com/v1/projects/$projectRef/database/query")
    $req.Method = "POST"
    $req.ContentType = "application/json"
    $req.Headers.Add("Authorization", "Bearer $pat")
    $req.Timeout = 60000
    $req.ContentLength = $bodyBytes.Length
    $s = $req.GetRequestStream()
    $s.Write($bodyBytes, 0, $bodyBytes.Length)
    $s.Close()

    try {
        $resp = $req.GetResponse()
        $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
        $result = $reader.ReadToEnd()
        $resp.Close()
        $preview = if ($result.Length -gt 200) { $result.Substring(0,200) } else { $result }
        Write-Host "  ✅ $label → $preview"
        return $true
    } catch [System.Net.WebException] {
        $webResp = $_.Exception.Response
        if ($webResp) {
            $errReader = New-Object System.IO.StreamReader($webResp.GetResponseStream())
            $errBody = $errReader.ReadToEnd()
            Write-Host "  ❌ $label → $errBody"
        } else {
            Write-Host "  ❌ $label → $($_.Exception.Message)"
        }
        return $false
    }
}

# ─── Seed industries ───────────────────────────────────────────
$sql1 = @"
INSERT INTO industries (slug, name, name_cn, icon, sort_order) VALUES
  ('ai',                       'AI',                      '人工智能', '🤖', 1),
  ('life-sciences',            'Life Sciences',           '生命科学', '🧬', 2),
  ('green-tech',               'Green Tech',              '绿色科技', '⚡', 3),
  ('intelligent-manufacturing','Intelligent Manufacturing','智能制造', '🦾', 4),
  ('new-space',                'New Space',               '新太空',   '🚀', 5),
  ('advanced-materials',       'Advanced Materials',      '先进材料', '⚛️', 6)
ON CONFLICT (slug) DO NOTHING;
"@
Invoke-SQL $sql1 "Seed industries"

# ─── Seed reports ─────────────────────────────────────────────
$sql2 = @"
INSERT INTO reports (title, slug, summary, industry_slug, is_premium, author, tags, published_at,
  compliance_tier, compliance_status, geo_risk_tier, sensitivity_tags) VALUES
('2026 China AI Foundation Model Landscape', '2026-china-ai-foundation-model-landscape',
 'A comprehensive analysis of China''s top foundation model players.',
 'ai', false, 'AMORA Research', ARRAY['foundation-models','china-ai','llm','enterprise'], NOW() - INTERVAL '2 days',
 'STANDARD', 'APPROVED', 'G0', '[]'::JSONB),
('Agentic AI in Chinese Enterprise: 2026 Adoption Report', '2026-agentic-ai-chinese-enterprise',
 'How China''s manufacturing and financial sectors are deploying AI agents.',
 'ai', true, 'AMORA Research', ARRAY['ai-agents','enterprise','automation','china'], NOW() - INTERVAL '5 days',
 'STANDARD', 'APPROVED', 'G0', '[]'::JSONB),
('CRISPR Therapeutics Pipeline: China vs Global Race', 'crispr-therapeutics-pipeline-china-2026',
 'Mapping the competitive landscape of Chinese biotech firms in CRISPR gene editing.',
 'life-sciences', false, 'AMORA Research', ARRAY['crispr','gene-editing','biotech'], NOW() - INTERVAL '7 days',
 'SENSITIVE_TECH', 'APPROVED', 'G1',
 '[{"tag_type":"TECHNOLOGY","value":"CRISPR dual-use","value_normalized":"CRISPR DUAL USE","source_list":"INTERNAL","geo_risk_contribution":"G1","flagged_at":null,"flagged_by_list_update":null}]'::JSONB),
('Synthetic Biology Hubs: Shenzhen and Beijing Deep Dive', 'synthetic-biology-hubs-shenzhen-beijing-2026',
 'Investment intelligence on China''s two leading synthetic biology clusters.',
 'life-sciences', true, 'AMORA Research', ARRAY['synthetic-biology','shenzhen','beijing'], NOW() - INTERVAL '10 days',
 'SENSITIVE_TECH', 'APPROVED', 'G1',
 '[{"tag_type":"TECHNOLOGY","value":"Synthetic biology dual-use","value_normalized":"SYNTHETIC BIOLOGY DUAL USE","source_list":"INTERNAL","geo_risk_contribution":"G1","flagged_at":null,"flagged_by_list_update":null}]'::JSONB),
('China EV Battery Supply Chain: 2026 Disruption Map', 'china-ev-battery-supply-chain-2026',
 'Analyzing the full battery value chain from lithium extraction to recycling.',
 'green-tech', false, 'AMORA Research', ARRAY['ev-battery','catl','byd','supply-chain'], NOW() - INTERVAL '3 days',
 'STANDARD', 'APPROVED', 'G0', '[]'::JSONB),
('Green Hydrogen: China''s Electrolyzer Manufacturers Go Global', 'green-hydrogen-china-electrolyzer-global-2026',
 'China now produces 60% of global electrolyzers.',
 'green-tech', true, 'AMORA Research', ARRAY['green-hydrogen','electrolyzer','clean-energy'], NOW() - INTERVAL '8 days',
 'STANDARD', 'APPROVED', 'G0', '[]'::JSONB),
('Humanoid Robots: China''s Manufacturing Bet', 'humanoid-robots-china-manufacturing-2026',
 'From Unitree to UBTECH — China''s humanoid robot ecosystem.',
 'intelligent-manufacturing', false, 'AMORA Research', ARRAY['humanoid-robots','unitree','robotics'], NOW() - INTERVAL '4 days',
 'STANDARD', 'APPROVED', 'G0', '[]'::JSONB),
('Industrial IoT Platform Wars: Siemens vs Chinese Champions', 'industrial-iot-platform-wars-2026',
 'Comparing Siemens MindSphere against Huawei FusionPlant and others.',
 'intelligent-manufacturing', true, 'AMORA Research', ARRAY['iiot','smart-factory','siemens','huawei'], NOW() - INTERVAL '12 days',
 'SENSITIVE_TECH', 'APPROVED', 'G1',
 '[{"tag_type":"ENTITY","value":"Huawei Technologies Co.","value_normalized":"HUAWEI TECHNOLOGIES CO","source_list":"BIS_ENTITY_LIST","geo_risk_contribution":"G1","flagged_at":null,"flagged_by_list_update":null}]'::JSONB),
('China Commercial Space: 2026 Launch Vehicle Showdown', 'china-commercial-space-launch-vehicle-2026',
 'LandSpace Zhuque-3, CAS Space — the new generation of Chinese reusable rockets.',
 'new-space', false, 'AMORA Research', ARRAY['launch-vehicle','reusable-rockets','landspace'], NOW() - INTERVAL '6 days',
 'SENSITIVE_TECH', 'APPROVED', 'G1',
 '[{"tag_type":"TECHNOLOGY","value":"9E001","value_normalized":"9E001","source_list":"INTERNAL","geo_risk_contribution":"G1","flagged_at":null,"flagged_by_list_update":null}]'::JSONB),
('Low Earth Orbit Satcom: China''s Guowang vs StarLink', 'china-leo-satcom-guowang-starlink-2026',
 'China''s 13,000-satellite Guowang constellation is entering launch phase.',
 'new-space', true, 'AMORA Research', ARRAY['leo-satcom','guowang','starlink'], NOW() - INTERVAL '14 days',
 'SENSITIVE_TECH', 'APPROVED', 'G1',
 '[{"tag_type":"TECHNOLOGY","value":"9A012","value_normalized":"9A012","source_list":"INTERNAL","geo_risk_contribution":"G1","flagged_at":null,"flagged_by_list_update":null}]'::JSONB),
('Carbon Fiber in Aerospace: China Breaks Western Monopoly', 'carbon-fiber-aerospace-china-2026',
 'Zhongjian Carbon Fiber and Guangwei Composites achieved T800/T1000 grade certification.',
 'advanced-materials', false, 'AMORA Research', ARRAY['carbon-fiber','aerospace','composites'], NOW() - INTERVAL '9 days',
 'SENSITIVE_TECH', 'APPROVED', 'G1',
 '[{"tag_type":"TECHNOLOGY","value":"1C010","value_normalized":"1C010","source_list":"INTERNAL","geo_risk_contribution":"G1","flagged_at":null,"flagged_by_list_update":null}]'::JSONB),
('Perovskite Solar Cells: China''s Next Clean Tech Dominance Play', 'perovskite-solar-cells-china-2026',
 'China leads in perovskite solar commercialization.',
 'advanced-materials', true, 'AMORA Research', ARRAY['perovskite','solar-cells','clean-tech'], NOW() - INTERVAL '11 days',
 'STANDARD', 'APPROVED', 'G0', '[]'::JSONB)
ON CONFLICT (slug) DO NOTHING;
"@
Invoke-SQL $sql2 "Seed reports (12)"

# ─── Seed news_items ──────────────────────────────────────────
$sql3 = @"
INSERT INTO news_items (title, summary, industry_slug, source_name, is_featured, published_at) VALUES
('Baidu releases ERNIE 5.0 with multimodal reasoning breakthrough',
 'Baidu''s latest foundation model achieves state-of-the-art on Chinese legal and medical benchmarks.',
 'ai', 'TechCrunch China', true, NOW() - INTERVAL '4 hours'),
('DeepSeek R2 tops global coding benchmarks in March 2026 evaluation',
 'DeepSeek''s newest reasoning model outperforms competitors on HumanEval+ and SWE-bench.',
 'ai', 'MIT Technology Review', true, NOW() - INTERVAL '8 hours'),
('BYD launches solid-state battery pilot production line in Shenzhen',
 'BYD confirms 20GWh solid-state battery pilot facility operational.',
 'green-tech', 'Reuters', true, NOW() - INTERVAL '6 hours'),
('Unitree G1 humanoid robot enters automotive factory trials at SAIC',
 'SAIC Motor has deployed 50 Unitree G1 units for assembly line testing.',
 'intelligent-manufacturing', 'South China Morning Post', false, NOW() - INTERVAL '12 hours'),
('China''s Guowang constellation launches first 100 satellites',
 'The first batch of Guowang LEO satellites successfully deployed.',
 'new-space', 'Space News', false, NOW() - INTERVAL '1 day'),
('Zhongjian Carbon Fiber receives COMAC certification for C919 supply',
 'China''s leading carbon fiber manufacturer achieves full qualification for domestic narrow-body aircraft.',
 'advanced-materials', 'Aviation Week', false, NOW() - INTERVAL '2 days'),
('EdiGene receives IND approval for CRISPR blood disorder therapy',
 'China''s EdiGene becomes second Chinese biotech to receive clinical trial approval for ex vivo CRISPR therapy.',
 'life-sciences', 'Nature Biotechnology', true, NOW() - INTERVAL '3 hours'),
('LandSpace Zhuque-3 completes first reusable flight demonstration',
 'China''s first methane-fueled reusable launch vehicle successfully recovered its booster stage.',
 'new-space', 'Xinhua', true, NOW() - INTERVAL '2 hours');
"@
Invoke-SQL $sql3 "Seed news_items (8)"

# ─── Seed companies ───────────────────────────────────────────
$sql4 = @"
INSERT INTO companies (name, name_cn, industry_slug, sub_sector, description, country, hq_city, hq_province, founded_year, is_public, is_tracked, tags) VALUES
('Zhipu AI', '智谱AI', 'ai', 'Foundation Models', 'Developer of the GLM series of large language models.', 'CN', 'Beijing', 'Beijing', 2019, false, true, ARRAY['llm','foundation-model','enterprise-ai']),
('Moonshot AI', '月之暗面', 'ai', 'Foundation Models', 'Creator of the Kimi long-context AI model.', 'CN', 'Beijing', 'Beijing', 2023, false, true, ARRAY['llm','long-context','consumer-ai']),
('Manus AI', '万象AI', 'ai', 'AI Agents', 'Developer of autonomous AI agents for complex task completion.', 'CN', 'Beijing', 'Beijing', 2024, false, true, ARRAY['ai-agents','autonomous-ai']),
('EdiGene', '博雅辑因', 'life-sciences', 'Gene Editing', 'Clinical-stage gene editing company focused on CRISPR therapies.', 'CN', 'Beijing', 'Beijing', 2015, false, true, ARRAY['crispr','gene-therapy','clinical-stage']),
('Qi Biodesign', '齐禾生科', 'life-sciences', 'Synthetic Biology', 'Synthetic biology platform company.', 'CN', 'Shenzhen', 'Guangdong', 2020, false, true, ARRAY['synthetic-biology','industrial-biotech','enzyme']),
('CATL', '宁德时代', 'green-tech', 'EV Batteries', 'World''s largest EV battery manufacturer by volume.', 'CN', 'Ningde', 'Fujian', 2011, true, true, ARRAY['ev-battery','catl','solid-state','lfp']),
('Sungrow Power', '阳光电源', 'green-tech', 'Green Hydrogen', 'Leading inverter and energy storage company.', 'CN', 'Hefei', 'Anhui', 1997, true, true, ARRAY['inverter','energy-storage','green-hydrogen','electrolyzer']),
('Unitree Robotics', '宇树科技', 'intelligent-manufacturing', 'Humanoid Robots', 'China''s leading quadruped and humanoid robot company.', 'CN', 'Hangzhou', 'Zhejiang', 2016, false, true, ARRAY['humanoid-robot','quadruped','factory-automation']),
('UBTECH Robotics', '优必选', 'intelligent-manufacturing', 'Humanoid Robots', 'Pioneer in humanoid robotics, listed on HKEX.', 'CN', 'Shenzhen', 'Guangdong', 2012, true, true, ARRAY['humanoid-robot','hkex-listed','automotive']),
('LandSpace', '蓝箭航天', 'new-space', 'Launch Vehicles', 'Developer of China''s first methane-fueled orbital rocket Zhuque-2.', 'CN', 'Beijing', 'Beijing', 2015, false, true, ARRAY['launch-vehicle','reusable','methane-rocket']),
('CAS Space', '中科宇航', 'new-space', 'Launch Vehicles', 'Spin-off from Chinese Academy of Sciences.', 'CN', 'Beijing', 'Beijing', 2018, false, true, ARRAY['launch-vehicle','small-sat','cas-spinoff']),
('Zhongjian Carbon Fiber', '中简科技', 'advanced-materials', 'Carbon Fiber', 'China''s first company to achieve T800-grade carbon fiber production at scale.', 'CN', 'Changzhou', 'Jiangsu', 2008, true, true, ARRAY['carbon-fiber','aerospace','t800','comac']),
('Microquanta Semiconductor', '纤纳光电', 'advanced-materials', 'Perovskite Solar', 'World leader in perovskite solar module efficiency.', 'CN', 'Hangzhou', 'Zhejiang', 2015, false, true, ARRAY['perovskite','solar','clean-tech','efficiency-record']);
"@
Invoke-SQL $sql4 "Seed companies (13)"

# ─── Verify ───────────────────────────────────────────────────
$sqlV = "SELECT (SELECT COUNT(*) FROM industries) AS industries, (SELECT COUNT(*) FROM reports) AS reports, (SELECT COUNT(*) FROM news_items) AS news_items, (SELECT COUNT(*) FROM companies) AS companies;"
Invoke-SQL $sqlV "Verification count"

Write-Host "`n=== All seed data done ==="
