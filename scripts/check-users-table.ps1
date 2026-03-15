$pat = "sbp_2d9e51cc04f38bb94e7b1394ed8c1d064126a8cc"
$ref = "jqppcuccqkxhhrvndsil"
$api = "https://api.supabase.com/v1/projects/$ref/database/query"
$headers = @{ "Authorization" = "Bearer $pat"; "Content-Type" = "application/json" }

$sql = "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position"
$body = [System.Text.Encoding]::UTF8.GetBytes("{""query"":""$sql""}")
$r = Invoke-WebRequest -Uri $api -Method POST -Headers $headers -Body $body -UseBasicParsing
Write-Host "USERS COLUMNS:" $r.Content

$sql2 = "SELECT id, email, is_admin, created_at FROM users ORDER BY id"
$body2 = [System.Text.Encoding]::UTF8.GetBytes("{""query"":""$sql2""}")
$r2 = Invoke-WebRequest -Uri $api -Method POST -Headers $headers -Body $body2 -UseBasicParsing
Write-Host "USERS DATA:" $r2.Content
