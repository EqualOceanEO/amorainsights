# Delete duplicate news_items keeping the oldest one
$query = @"
DELETE FROM news_items a
USING news_items b
WHERE a.id > b.id
  AND a.slug = b.slug
  AND a.slug IS NOT NULL
  AND a.slug != '';
"@
$body = @{ sql_text = $query } | ConvertTo-Json -Compress
$headers = @{
    "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc"
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc"
    "Content-Type" = "application/json"
}
try {
    $r = Invoke-RestMethod -Uri "https://jqppcuccqkxhhrvndsil.supabase.co/rest/v1/rpc/run_migration" -Method POST -Headers $headers -Body $body
    "Delete result: $r"
} catch {
    "Error: $($_.Exception.Message)"
}