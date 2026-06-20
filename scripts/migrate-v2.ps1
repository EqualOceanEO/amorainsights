$pat = "sbp_2d9e51cc04f38bb94e7b1394ed8c1d064126a8cc"
$uri = "https://api.supabase.com/v1/projects/jqppcuccqkxhhrvndsil/database/query"

Write-Host "Step 1: ADD COLUMNS"
$q = "ALTER TABLE industries ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES industries(id), ADD COLUMN IF NOT EXISTS level SMALLINT NOT NULL DEFAULT 1;"
$resp = Invoke-WebRequest -Uri $uri -Method POST -Headers @{"Authorization"="Bearer $pat";"Content-Type"="application/json"} -Body ([System.Text.Encoding]::UTF8.GetBytes(([PSCustomObject]@{query=$q}|ConvertTo-Json -Compress))) -UseBasicParsing -TimeoutSec 60
Write-Host $resp.StatusCode $resp.Content.Substring(0,[Math]::Min(100,$resp.Content.Length))

Write-Host "Step 2a-reports"
$q = "UPDATE reports SET industry_slug='manufacturing' WHERE industry_slug='intelligent-manufacturing';"
$resp = Invoke-WebRequest -Uri $uri -Method POST -Headers @{"Authorization"="Bearer $pat";"Content-Type"="application/json"} -Body ([System.Text.Encoding]::UTF8.GetBytes(([PSCustomObject]@{query=$q}|ConvertTo-Json -Compress))) -UseBasicParsing -TimeoutSec 60
Write-Host $resp.StatusCode $resp.Content.Substring(0,[Math]::Min(100,$resp.Content.Length))

Write-Host "Step 2a-news"
$q = "UPDATE news_items SET industry_slug='manufacturing' WHERE industry_slug='intelligent-manufacturing';"
$resp = Invoke-WebRequest -Uri $uri -Method POST -Headers @{"Authorization"="Bearer $pat";"Content-Type"="application/json"} -Body ([System.Text.Encoding]::UTF8.GetBytes(([PSCustomObject]@{query=$q}|ConvertTo-Json -Compress))) -UseBasicParsing -TimeoutSec 60
Write-Host $resp.StatusCode $resp.Content.Substring(0,[Math]::Min(100,$resp.Content.Length))

Write-Host "Step 2a-companies"
$q = "UPDATE companies SET industry_slug='manufacturing' WHERE industry_slug='intelligent-manufacturing';"
$resp = Invoke-WebRequest -Uri $uri -Method POST -Headers @{"Authorization"="Bearer $pat";"Content-Type"="application/json"} -Body ([System.Text.Encoding]::UTF8.GetBytes(([PSCustomObject]@{query=$q}|ConvertTo-Json -Compress))) -UseBasicParsing -TimeoutSec 60
Write-Host $resp.StatusCode $resp.Content.Substring(0,[Math]::Min(100,$resp.Content.Length))

Write-Host "Steps 2b+2c+3: reading from SQL file"
$raw = [System.IO.File]::ReadAllText("c:\Users\51229\WorkBuddy\Claw\scripts\migrate-industries-v2.sql", [System.Text.Encoding]::UTF8)

$m2b = [regex]::Match($raw, '(?s)-- 2b\. Now rename.*?(?=-- 2c)')
$q = ($m2b.Value -replace '--[^\r\n]*','').Trim()
Write-Host "Step 2b: rename slug"
$resp = Invoke-WebRequest -Uri $uri -Method POST -Headers @{"Authorization"="Bearer $pat";"Content-Type"="application/json"} -Body ([System.Text.Encoding]::UTF8.GetBytes(([PSCustomObject]@{query=$q}|ConvertTo-Json -Compress))) -UseBasicParsing -TimeoutSec 60
Write-Host $resp.StatusCode $resp.Content.Substring(0,[Math]::Min(100,$resp.Content.Length))

$m2c = [regex]::Match($raw, '(?s)-- 2c\. Fix other.*?(?=-- ---)')
$q = ($m2c.Value -replace '--[^\r\n]*','').Trim()
Write-Host "Step 2c: fix name_cn"
$resp = Invoke-WebRequest -Uri $uri -Method POST -Headers @{"Authorization"="Bearer $pat";"Content-Type"="application/json"} -Body ([System.Text.Encoding]::UTF8.GetBytes(([PSCustomObject]@{query=$q}|ConvertTo-Json -Compress))) -UseBasicParsing -TimeoutSec 60
Write-Host $resp.StatusCode $resp.Content.Substring(0,[Math]::Min(100,$resp.Content.Length))

$m3 = [regex]::Match($raw, '(?s)INSERT INTO industries \(slug, name.*?ON CONFLICT \(slug\) DO NOTHING;')
$q = $m3.Value
Write-Host "Step 3: INSERT 36 sub-sectors"
$resp = Invoke-WebRequest -Uri $uri -Method POST -Headers @{"Authorization"="Bearer $pat";"Content-Type"="application/json"} -Body ([System.Text.Encoding]::UTF8.GetBytes(([PSCustomObject]@{query=$q}|ConvertTo-Json -Compress))) -UseBasicParsing -TimeoutSec 60
Write-Host $resp.StatusCode $resp.Content.Substring(0,[Math]::Min(100,$resp.Content.Length))

Write-Host "Step 4: VERIFY"
$q = "SELECT level, COUNT(*) AS count FROM industries GROUP BY level ORDER BY level;"
$resp = Invoke-WebRequest -Uri $uri -Method POST -Headers @{"Authorization"="Bearer $pat";"Content-Type"="application/json"} -Body ([System.Text.Encoding]::UTF8.GetBytes(([PSCustomObject]@{query=$q}|ConvertTo-Json -Compress))) -UseBasicParsing -TimeoutSec 60
Write-Host $resp.StatusCode $resp.Content

Write-Host "DONE"
