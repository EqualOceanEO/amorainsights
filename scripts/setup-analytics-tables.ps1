$pat = "sbp_2d9e51cc04f38bb94e7b1394ed8c1d064126a8cc"
$projectRef = "jqppcuccqkxhhrvndsil"
$apiUrl = "https://api.supabase.com/v1/projects/$projectRef/database/query"
$headers = @{ "Authorization" = "Bearer $pat"; "Content-Type" = "application/json" }

function Exec-SQL {
  param([string]$sql, [string]$label)
  $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes("{""query"":""$sql""}")
  try {
    $r = Invoke-WebRequest -Uri $apiUrl -Method POST -Headers $headers -Body $bodyBytes -UseBasicParsing
    if ($r.StatusCode -eq 201) { Write-Host "OK: $label" }
    else { Write-Host "WARN $($r.StatusCode): $label" }
  } catch {
    Write-Host "ERR: $label => $($_.Exception.Message)"
  }
}

# --- page_views table ---
Exec-SQL "CREATE TABLE IF NOT EXISTS page_views (id BIGSERIAL PRIMARY KEY, user_id INT REFERENCES users(id) ON DELETE SET NULL, session_id TEXT, path TEXT NOT NULL, referrer TEXT, utm_source TEXT, utm_medium TEXT, utm_campaign TEXT, country TEXT, device_type TEXT, browser TEXT, ip_hash TEXT, duration_sec INT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())" "create page_views"

Exec-SQL "CREATE INDEX IF NOT EXISTS idx_page_views_user_id ON page_views(user_id)" "idx page_views user_id"
Exec-SQL "CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(path)" "idx page_views path"
Exec-SQL "CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at)" "idx page_views created_at"
Exec-SQL "CREATE INDEX IF NOT EXISTS idx_page_views_session ON page_views(session_id)" "idx page_views session"

# --- user_events table ---
Exec-SQL "CREATE TABLE IF NOT EXISTS user_events (id BIGSERIAL PRIMARY KEY, user_id INT REFERENCES users(id) ON DELETE SET NULL, session_id TEXT, event_name TEXT NOT NULL, event_category TEXT, properties JSONB DEFAULT '{}', path TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())" "create user_events"

Exec-SQL "CREATE INDEX IF NOT EXISTS idx_user_events_user_id ON user_events(user_id)" "idx user_events user_id"
Exec-SQL "CREATE INDEX IF NOT EXISTS idx_user_events_name ON user_events(event_name)" "idx user_events event_name"
Exec-SQL "CREATE INDEX IF NOT EXISTS idx_user_events_created_at ON user_events(created_at)" "idx user_events created_at"

Write-Host "Analytics tables setup complete."
