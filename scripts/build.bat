cd /d c:\Users\51229\WorkBuddy\Claw
npx next build > build-output.txt 2>&1
echo EXIT_CODE=%ERRORLEVEL% >> build-output.txt
