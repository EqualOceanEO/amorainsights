
$pat        = "sbp_2d9e51cc04f38bb94e7b1394ed8c1d064126a8cc"
$projectRef = "jqppcuccqkxhhrvndsil"
$api        = "https://api.supabase.com/v1/projects/$projectRef/database/query"

$headers = @{
    "Authorization" = "Bearer $pat"
    "Content-Type"  = "application/json"
}

function Run-SQL {
    param([string]$file, [string]$label)
    Write-Host ""
    Write-Host "=========================================="
    Write-Host "▶  $label"
    Write-Host "   File: $file"

    $sql  = Get-Content $file -Raw -Encoding UTF8
    Write-Host "   Size: $($sql.Length) bytes"

    $body = [System.Text.Encoding]::UTF8.GetBytes(
        ([PSCustomObject]@{ query = $sql } | ConvertTo-Json -Depth 10 -Compress)
    )

    try {
        $resp = Invoke-WebRequest `
            -Uri        $api `
            -Method     POST `
            -Headers    $headers `
            -Body       $body `
            -UseBasicParsing `
            -TimeoutSec 120

        $c = $resp.Content
        if ($c.Length -gt 600) { $c = $c.Substring(0, 600) + "..." }
        Write-Host "   HTTP $($resp.StatusCode)"
        Write-Host "   $c"
        Write-Host "✅  SUCCESS: $label"
    } catch {
        Write-Host "❌  FAILED: $($_.Exception.Message)"
        try {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $err    = $reader.ReadToEnd()
            if ($err.Length -gt 600) { $err = $err.Substring(0, 600) }
            Write-Host "   Detail: $err"
        } catch {}
    }
}

Set-Location "c:\Users\51229\WorkBuddy\Claw"

Run-SQL "scripts\full-schema-seed.sql"      "1/3  full-schema-seed"
Run-SQL "scripts\compliance-scan-rpc.sql"   "2/3  compliance-scan-rpc"

# 3. subscription_tier ALTER TABLE (inline)
$subSql = @"
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS subscription_tier        VARCHAR(20) NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_expires_at  TIMESTAMPTZ;
"@

Write-Host ""
Write-Host "=========================================="
Write-Host "▶  3/3  subscription_tier ALTER TABLE"

$body3 = [System.Text.Encoding]::UTF8.GetBytes(
    ([PSCustomObject]@{ query = $subSql } | ConvertTo-Json -Depth 10 -Compress)
)

try {
    $resp3 = Invoke-WebRequest `
        -Uri        $api `
        -Method     POST `
        -Headers    $headers `
        -Body       $body3 `
        -UseBasicParsing `
        -TimeoutSec 60

    Write-Host "   HTTP $($resp3.StatusCode)"
    Write-Host "   $($resp3.Content.Substring(0, [Math]::Min(600,$resp3.Content.Length)))"
    Write-Host "✅  SUCCESS: subscription_tier ALTER TABLE"
} catch {
    Write-Host "❌  FAILED: $($_.Exception.Message)"
    try {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        Write-Host "   Detail: $($reader.ReadToEnd().Substring(0,600))"
    } catch {}
}

Write-Host ""
Write-Host "=========================================="
Write-Host "All done."
