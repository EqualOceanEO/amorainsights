#!/usr/bin/env python3
import subprocess, sys, os

os.chdir(r'C:\Users\51229\WorkBuddy\Claw')

# git add -A
result = subprocess.run(['git', 'add', '-A'], capture_output=True, text=True)
print('git add:', result.returncode, result.stderr[:200] if result.stderr else 'OK')

# git commit
with open('commitmsg.txt', 'r', encoding='utf-8') as f:
    msg = f.read().strip()

result = subprocess.run(['git', 'commit', f'--file=commitmsg.txt'], capture_output=True, text=True)
print('git commit:', result.returncode)
if result.stdout: print('STDOUT:', result.stdout[:300])
if result.stderr: print('STDERR:', result.stderr[:300])

# git push
result = subprocess.run(['git', 'push', 'origin', 'master'], capture_output=True, text=True)
print('git push:', result.returncode)
if result.stdout: print('STDOUT:', result.stdout[:300])
if result.stderr: print('STDERR:', result.stderr[:300])
