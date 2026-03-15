$pat = "sbp_2d9e51cc04f38bb94e7b1394ed8c1d064126a8cc"
$projectRef = "jqppcuccqkxhhrvndsil"

$sql = @"
-- Subscribers table for Weekly newsletter
CREATE TABLE IF NOT EXISTS subscribers (
  id            BIGSERIAL PRIMARY KEY,
  email         TEXT NOT NULL,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source        TEXT NOT NULL DEFAULT 'website',
  confirmed     BOOLEAN NOT NULL DEFAULT FALSE,
  confirmed_at  TIMESTAMPTZ,
  unsubscribed  BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT subscribers_email_unique UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers (email);
CREATE INDEX IF NOT EXISTS idx_subscribers_subscribed_at ON subscribers (subscribed_at DESC);

COMMENT ON TABLE subscribers IS 'Email subscribers for AMORA Weekly newsletter';
COMMENT ON COLUMN subscribers.source IS 'Where the signup came from: homepage, article, subscribe_page, share, etc.';
"@

$body = @{ query = $sql } | ConvertTo-Json -Compress
$req = [System.Net.HttpWebRequest]::Create("https://api.supabase.com/v1/projects/$projectRef/database/query")
$req.Method = "POST"
$req.ContentType = "application/json"
$req.Headers.Add("Authorization", "Bearer $pat")
$bytes = [System.Text.Encoding]::UTF8.GetBytes($body)
$req.ContentLength = $bytes.Length
$stream = $req.GetRequestStream()
$stream.Write($bytes, 0, $bytes.Length)
$stream.Close()

try {
  $res = $req.GetResponse()
  $reader = New-Object System.IO.StreamReader($res.GetResponseStream())
  Write-Host "OK:" $reader.ReadToEnd()
} catch {
  $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
  Write-Host "ERR:" $reader.ReadToEnd()
}
