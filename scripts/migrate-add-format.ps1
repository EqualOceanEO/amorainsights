$PAT = "sbp_2d9e51cc04f38bb94e7b1394ed8c1d064126a8cc"
$URL = "https://api.supabase.com/v1/projects/jqppcuccqkxhhrvndsil/database/query"
$H = @{ "Authorization" = "Bearer $PAT"; "Content-Type" = "application/json" }

function Exec-SQL($sql) {
    $b = [System.Text.Encoding]::UTF8.GetBytes('{"query":"' + $sql.Replace('"','\"') + '"}')
    try {
        $r = Invoke-WebRequest -Uri $URL -Method POST -Headers $H -Body $b -TimeoutSec 20
        Write-Host "OK ($($r.StatusCode)): $sql"
    } catch {
        Write-Host "ERR: $($_.Exception.Message) | SQL: $sql"
    }
}

Exec-SQL "ALTER TABLE reports ADD COLUMN IF NOT EXISTS report_format TEXT NOT NULL DEFAULT 'markdown';"
Exec-SQL "ALTER TABLE reports ADD COLUMN IF NOT EXISTS html_content TEXT;"
Exec-SQL "COMMENT ON COLUMN reports.report_format IS 'markdown | html | h5_embed';"
Write-Host "Migration complete."
