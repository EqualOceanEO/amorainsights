$uri = "http://localhost:3000/api/news?page=1&pageSize=5"
Write-Host "Testing: $uri"
try {
    $resp = Invoke-WebRequest -Uri $uri -Method GET -TimeoutSec 30 -UseBasicParsing
    Write-Host "Status: $($resp.StatusCode)"
    $json = $resp.Content | ConvertFrom-Json
    Write-Host "Total: $($json.total), Pages: $($json.totalPages)"
    if ($json.data -and $json.data.Count -gt 0) {
        Write-Host "First item keys: $(($json.data[0] | Get-Member -MemberType NoteProperty | Select-Object -ExpandProperty Name) -join ', ')"
        Write-Host "First item title: $($json.data[0].title)"
        Write-Host "First item slug: $($json.data[0].slug)"
        Write-Host "First item industry_id: $($json.data[0].industry_id)"
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}
