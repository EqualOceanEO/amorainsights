$pat = 'sbp_2d9e51cc04f38bb94e7b1394ed8c1d064126a8cc'
$projectRef = 'jqppcuccqkxhhrvndsil'
$url = "https://api.supabase.com/v1/projects/$projectRef/database/query"

$sql = 'ALTER TABLE news_items ADD COLUMN IF NOT EXISTS content TEXT;'

$bodyBytes = [System.Text.Encoding]::UTF8.GetBytes("{`"query`":`"$sql`"}")
$req = [System.Net.WebRequest]::Create($url)
$req.Method = 'POST'
$req.ContentType = 'application/json'
$req.Headers.Add('Authorization', "Bearer $pat")
$req.ContentLength = $bodyBytes.Length
$stream = $req.GetRequestStream()
$stream.Write($bodyBytes, 0, $bodyBytes.Length)
$stream.Close()

try {
    $resp = $req.GetResponse()
    $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
    $result = $reader.ReadToEnd()
    Write-Output "Status: $($resp.StatusCode)"
    Write-Output "Result: $result"
} catch {
    $errResp = $_.Exception.Response
    if ($errResp) {
        $reader = New-Object System.IO.StreamReader($errResp.GetResponseStream())
        Write-Output "Error: $($reader.ReadToEnd())"
    } else {
        Write-Output "Error: $($_.Exception.Message)"
    }
}
