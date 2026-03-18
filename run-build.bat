@echo off
cd /d c:\Users\51229\WorkBuddy\Claw
npm run build > build-error.txt 2>&1
type build-error.txt
