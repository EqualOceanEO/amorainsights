$ref = "jqppcuccqkxhhrvndsil"
# 使用 POSTGRES_URL 中的凭据通过 Supabase REST API 执行 SQL
# 尝试通过 /pg 接口

$supaUrl = "https://jqppcuccqkxhhrvndsil.supabase.co"
$serviceKey = "NEED_SERVICE_KEY"

Write-Host "Trying to find service role key..."
# 检查 publishable key 是否是 service role key
$publishableKey = "sb_publishable_nBkFnQSYj73jIrNLnDGJZw_saXS192R"
Write-Host "Publishable key prefix: $($publishableKey.Substring(0, 20))..."

# anon key decode - check role
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDcxMDQsImV4cCI6MjA4ODcyMzEwNH0.twYdLldCw10hQADe5RximjkLTtrYE1zyvr1xMYVS3V8"
$parts = $anonKey.Split(".")
$payload = $parts[1]
# add padding
$mod = $payload.Length % 4
if ($mod -eq 2) { $payload += "==" }
elseif ($mod -eq 3) { $payload += "=" }
$decoded = [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($payload))
Write-Host "Anon key payload: $decoded"
