import subprocess, sys, os

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Get ALL git config
r = subprocess.run(['git', 'config', '--list', '--show-origin'], capture_output=True, text=True)
stdout = r.stdout.decode('utf-8', errors='replace')
print(stdout[:1000])
