$pat = "sbp_2d9e51cc04f38bb94e7b1394ed8c1d064126a8cc"
$ref = "jqppcuccqkxhhrvndsil"
$api = "https://api.supabase.com/v1/projects/$ref/database/query"

$sql = "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'companies' ORDER BY ordinal_position"
$jsonBody = "{""query"": ""$sql""}"
$body = [System.Text.Encoding]::UTF8.GetBytes($jsonBody)

try {
    $r = Invoke-WebRequest -Uri $api -Method POST -Headers @{
        "Authorization" = "Bearer $pat"
        "Content-Type" = "application/json"
        "Accept" = "application/json"
    } -Body $body -UseBasicParsing
    Write-Host "STATUS:" $r.StatusCode
    Write-Host $r.Content
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "HTTP ERROR:" $statusCode
    Write-Host $_.Exception.Message
}
