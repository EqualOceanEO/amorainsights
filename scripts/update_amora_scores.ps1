$headers = @{
    "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc"
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc"
    "Content-Type" = "application/json"
    "Prefer" = "return=representation"
}

$BASE = "https://jqppcuccqkxhhrvndsil.supabase.co/rest/v1"

# AMORA score data
$data = @(
    @{ name="Unitree"; total=8.04; adv=8.2; mast=7.5; ops=9.5; reach=8.0; affin=7.0 },
    @{ name="Unitree Robotics"; total=8.04; adv=8.2; mast=7.5; ops=9.5; reach=8.0; affin=7.0 },
    @{ name="UBTECH"; total=7.06; adv=7.5; mast=7.0; ops=8.0; reach=6.0; affin=6.8 },
    @{ name="UBTECH Robotics"; total=7.06; adv=7.5; mast=7.0; ops=8.0; reach=6.0; affin=6.8 },
    @{ name="AgiBot"; total=7.30; adv=8.0; mast=8.5; ops=7.5; reach=5.5; affin=7.0 },
    @{ name="智元机器人"; total=7.30; adv=8.0; mast=8.5; ops=7.5; reach=5.5; affin=7.0 },
    @{ name="Agibot"; total=7.30; adv=8.0; mast=8.5; ops=7.5; reach=5.5; affin=7.0 },
    @{ name="Fourier Intelligence"; total=6.96; adv=7.8; mast=7.5; ops=6.5; reach=6.0; affin=7.0 },
    @{ name="Leju Robotics"; total=6.80; adv=7.0; mast=7.5; ops=7.0; reach=5.5; affin=7.0 },
    @{ name="达闼科技"; total=6.50; adv=7.0; mast=7.0; ops=6.5; reach=6.0; affin=6.0 },
    @{ name="Tesla Optimus"; total=6.20; adv=7.0; mast=7.0; ops=4.0; reach=8.5; affin=7.0 },
    @{ name="Figure AI"; total=7.10; adv=8.5; mast=9.5; ops=4.5; reach=7.0; affin=6.0 },
    @{ name="Boston Dynamics"; total=8.52; adv=8.8; mast=9.0; ops=7.0; reach=9.0; affin=8.8 },
    @{ name="Agility Robotics"; total=7.86; adv=7.8; mast=8.0; ops=7.5; reach=8.5; affin=7.5 },
    @{ name="1X Technologies"; total=7.14; adv=8.0; mast=9.2; ops=4.0; reach=7.5; affin=7.0 },
    @{ name="Apptronik"; total=6.90; adv=7.5; mast=8.0; ops=5.5; reach=6.0; affin=7.5 },
    @{ name="Sanctuary AI"; total=6.50; adv=7.5; mast=7.5; ops=4.5; reach=7.0; affin=7.0 },
    @{ name="Robotera"; total=6.30; adv=6.5; mast=7.0; ops=6.5; reach=6.0; affin=5.5 },
    @{ name="LimX Dynamics"; total=6.20; adv=7.0; mast=8.0; ops=4.0; reach=5.5; affin=7.0 },
    @{ name="GalaxyBot"; total=5.80; adv=6.5; mast=7.5; ops=3.5; reach=6.0; affin=6.0 },
    @{ name="Zhipu AI"; total=6.20; adv=7.0; mast=7.0; ops=4.5; reach=7.0; affin=6.5 }
)

$now = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ")

$updated = 0
$errors = @()

foreach ($item in $data) {
    $body = @{
        amora_total_score = $item.total
        amora_advancement_score = $item.adv
        amora_mastery_score = $item.mast
        amora_operations_score = $item.ops
        amora_reach_score = $item.reach
        amora_affinity_score = $item.affin
        amora_score_updated_at = $now
    } | ConvertTo-Json -Compress

    # URL-encode the company name for the filter
    $encoded = [System.Uri]::EscapeDataString($item.name)
    $url = "$BASE/companies?name=eq.$encoded"
    try {
        $resp = Invoke-RestMethod -Uri $url -Headers $headers -Method PATCH -Body $body
        $count = $resp.Count
        Write-Host "[OK] $($item.name) -> $($item.total) ($count rows)"
        $updated = $updated + $count
    } catch {
        $errMsg = $_.Exception.Message
        Write-Host "[ERR] $($item.name) - $errMsg"
        $errors += $item.name
    }
}

Write-Host ""
Write-Host "Done. Total rows updated: $updated"
if ($errors.Count -gt 0) {
    Write-Host "Failed companies: $($errors -join ', ')"
}
