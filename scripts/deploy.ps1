Set-Location "c:\Users\51229\WorkBuddy\Claw"
$content = "refactor: redesign IndustryFilterBar with smooth transitions, no page jump"
$content | Out-File -FilePath "commitmsg.txt" -Encoding ascii
git add -A
git commit --file=commitmsg.txt
git push origin master