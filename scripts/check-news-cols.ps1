$pat = "sbp_2d9e51cc04f38bb94e7b1394ed8c1d064126a8cc"
$ref = "jqppcuccqkxhhrvndsil"
$url = "https://api.supabase.com/v1/projects/$ref/database/query"

$sql = "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'news_items' ORDER BY ordinal_position;"

$body = [System.Text.Encoding]::UTF8.GetBytes("{`"query`":`"$sql`"}")

try {
    $response = Invoke-WebRequest -Uri $url -Method POST `
        -Headers @{ "Authorization" = "Bearer $pat"; "Content-Type" = "application/json" } `
        -Body $body -UseBasicParsing
    Write-Host "Status: $($response.StatusCode)"
    Write-Host $response.Content
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host $reader.ReadToEnd()
    }
}
