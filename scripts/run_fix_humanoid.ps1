# 执行数据库修复 SQL - 通过 GET /api/admin/migrate?sql=...
$baseUrl = "http://localhost:3000/api/admin/migrate?secret=run-migration-now&sql="

$statements = @(
    "DELETE FROM companies WHERE id = 185",
    "DELETE FROM companies WHERE id = 186",
    "UPDATE companies SET amora_total_score = 8.9, amora_advancement_score = 8.8, amora_mastery_score = 7.8, amora_operations_score = 9.5, amora_reach_score = 8.5, amora_affinity_score = 8.2 WHERE id = 361",
    "UPDATE companies SET amora_total_score = 7.8, amora_advancement_score = 9.2, amora_mastery_score = 8.8, amora_operations_score = 4.5, amora_reach_score = 8.5, amora_affinity_score = 8.0 WHERE id = 182",
    "INSERT INTO companies (name, name_cn, country, industry_slug, sub_sector, description, founded_year, employee_count, is_public, is_tracked, amora_total_score, amora_advancement_score, amora_mastery_score, amora_operations_score, amora_reach_score, amora_affinity_score, slug) VALUES ('Sanctuary AI', 'Sanctuary AI', 'CA', 'manufacturing', 'Humanoid Robots', 'Canadian humanoid robot company developing Phoenix, a general-purpose humanoid robot with advanced cognitive AI capabilities.', 2018, 200, false, true, 6.8, 8.0, 8.5, 4.0, 5.5, 6.0, 'sanctuary-ai') ON CONFLICT (slug) DO UPDATE SET amora_total_score = EXCLUDED.amora_total_score, amora_advancement_score = EXCLUDED.amora_advancement_score, amora_mastery_score = EXCLUDED.amora_mastery_score, amora_operations_score = EXCLUDED.amora_operations_score, amora_reach_score = EXCLUDED.amora_reach_score, amora_affinity_score = EXCLUDED.amora_affinity_score"
)

$client = New-Object System.Net.Http.HttpClient
$client.Timeout = [TimeSpan]::FromSeconds(30)

$allOk = $true
foreach ($sql in $statements) {
    $url = $baseUrl + [Uri]::EscapeDataString($sql)
    Write-Host "Executing: $($sql.Substring(0, [Math]::Min(60, $sql.Length)))..."
    try {
        $response = $client.GetAsync($url).Result
        $content = $response.Content.ReadAsStringAsync().Result
        $json = $content | ConvertFrom-Json
        if ($json.ok -eq $true) {
            Write-Host "  ✅ OK: $($json.result)"
        } else {
            Write-Host "  ❌ Error: $($json.error)"
            $allOk = $false
        }
    } catch {
        Write-Host "  ❌ Exception: $($_.Exception.Message)"
        $allOk = $false
    }
}

Write-Host ""
if ($allOk) {
    Write-Host "✅ All SQL statements executed successfully!"
} else {
    Write-Host "⚠️ Some statements failed, check above."
}
