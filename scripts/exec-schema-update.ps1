# 执行 companies 表结构更新
$body = Get-Content -Raw -Path "c:\Users\51229\WorkBuddy\Claw\scripts\update-companies-schema.sql" -Encoding UTF8 | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/admin/migrate?secret=run-migration-now" -Method POST -Headers $headers -Body $body
