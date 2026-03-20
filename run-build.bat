@echo off
cd /d c:\Users\51229\WorkBuddy\Claw
npm run build > build-result.txt 2>&1
type build-result.txt
