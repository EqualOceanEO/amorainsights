#!/usr/bin/env python3
import subprocess, sys, os

os.chdir(r'C:\Users\51229\WorkBuddy\Claw')
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

for attempt in range(3):
    result = subprocess.run(['git', 'push', 'origin', 'master'], capture_output=True)
    stdout = result.stdout.decode('utf-8', errors='replace')
    stderr = result.stderr.decode('utf-8', errors='replace')
    if result.returncode == 0:
        print(f'Push OK (attempt {attempt+1}):', stdout[:300])
        break
    print(f'Push failed (attempt {attempt+1}):', stderr[:200])
