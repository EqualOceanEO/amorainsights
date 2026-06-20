# Check all tables in Supabase
$apiUrl = "https://api.supabase.com/v1/projects/jqppcuccqkxhhrvndsil/database/tables"

$headers = @{
  "Authorization" = "Bearer sbp_2d9e51cc04f38bb94e7b1394ed8c1d064126a8cc"
  "apikey" = "sbp_2d9e51cc04f38bb94e7b1394ed8c1d064126a8cc"
}

try {
  $response = Invoke-RestMethod -Uri $apiUrl -Method GET -Headers $headers
  Write-Host "=== Tables in Supabase ==="
  $response | ForEach-Object {
    Write-Host $table
  }
} catch {
  Write-Host "Error: $_"
}
