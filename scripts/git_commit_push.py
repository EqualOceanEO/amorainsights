#!/usr/bin/env python3
import subprocess, sys, os, io

os.chdir(r'C:\Users\51229\WorkBuddy\Claw')
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

for name, cmd in [
    ('git add', ['git', 'add', '-A']),
    ('git commit', ['git', 'commit', '--file=commitmsg.txt']),
    ('git push', ['git', 'push', 'origin', 'master']),
]:
    result = subprocess.run(cmd, capture_output=True)
    stdout = result.stdout.decode('utf-8', errors='replace')[:300]
    stderr = result.stderr.decode('utf-8', errors='replace')[:300]
    print(f'{name}: rc={result.returncode}')
    if stdout: print('STDOUT:', stdout)
    if stderr: print('STDERR:', stderr)
