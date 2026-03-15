Set-StrictMode -Off
$ErrorActionPreference = "Stop"

$pat = "sbp_2d9e51cc04f38bb94e7b1394ed8c1d064126a8cc"
$projectRef = "jqppcuccqkxhhrvndsil"
$sqlFile = "c:\Users\51229\WorkBuddy\Claw\scripts\compliance-scan-rpc.sql"

Write-Host "Reading $sqlFile ..."
$sql = [System.IO.File]::ReadAllText($sqlFile, [System.Text.Encoding]::UTF8)
Write-Host "Read OK: $($sql.Length) bytes"

$bodyObj = New-Object -TypeName PSObject -Property @{ query = $sql }
$body = $bodyObj | ConvertTo-Json -Depth 5 -Compress
$bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($body)

Write-Host "Sending compliance-scan-rpc.sql to Management API (timeout 120s)..."
$req = [System.Net.HttpWebRequest]::Create("https://api.supabase.com/v1/projects/$projectRef/database/query")
$req.Method = "POST"
$req.ContentType = "application/json"
$req.Headers.Add("Authorization", "Bearer $pat")
$req.Timeout = 120000
$req.ContentLength = $bodyBytes.Length
$stream = $req.GetRequestStream()
$stream.Write($bodyBytes, 0, $bodyBytes.Length)
$stream.Close()

try {
    $resp = $req.GetResponse()
    $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
    $result = $reader.ReadToEnd()
    $resp.Close()
    Write-Host "Status: $([int]$resp.StatusCode)"
    if ($result.Length -gt 800) { $result = $result.Substring(0,800) + "..." }
    Write-Host "Result: $result"
    Write-Host "SUCCESS"
} catch [System.Net.WebException] {
    $webResp = $_.Exception.Response
    if ($webResp) {
        $errReader = New-Object System.IO.StreamReader($webResp.GetResponseStream())
        $errBody = $errReader.ReadToEnd()
        if ($errBody.Length -gt 800) { $errBody = $errBody.Substring(0,800) }
        Write-Host "HTTP Error $([int]$webResp.StatusCode): $errBody"
    } else {
        Write-Host "Network Error: $($_.Exception.Message)"
    }
    exit 1
}
