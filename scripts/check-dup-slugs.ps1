# Find duplicate slugs in news_items table
$query = @"
SELECT slug, COUNT(*) as cnt 
FROM news_items 
WHERE slug IS NOT NULL AND slug != ''
GROUP BY slug 
HAVING COUNT(*) > 1 
ORDER BY cnt DESC 
LIMIT 20;
"@
$body = @{ sql_text = $query } | ConvertTo-Json -Compress
$headers = @{
    "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc"
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc"
    "Content-Type" = "application/json"
}
try {
    $r = Invoke-RestMethod -Uri "https://jqppcuccqkxhhrvndsil.supabase.co/rest/v1/rpc/run_migration" -Method POST -Headers $headers -Body $body
    $r | ConvertTo-Json -Depth 10
} catch {
    $_.Exception.Message
}