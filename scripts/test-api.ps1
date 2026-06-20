$query = @"
SELECT id, title, slug, industry_slug, sub_sector_id, company_id, 
       source_name, source_url, author, cover_image_url, tags, 
       is_premium, is_featured, is_published, published_at, created_at, 
       summary, content, related
FROM news_items 
WHERE slug = 'humanoid-robot-1004' 
LIMIT 1;
"@
$result = Invoke-WebRequest -Uri "https://jqppcuccqkxhhrvndsil.supabase.co/rest/v1/rpc/run_migration" -Method POST `
  -Headers @{ 
    "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc"; 
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc"
    "Content-Type" = "application/json"
  } `
  -Body (@{ sql_text = $query } | ConvertTo-Json) 2>&1
$result