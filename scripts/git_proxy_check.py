import subprocess, sys, os

os.chdir(r'C:\Users\51229\WorkBuddy\Claw')
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Check git proxy config
r = subprocess.run(['git', 'config', '--global', '--list'], capture_output=True, text=True)
print('Git global config:')
print(r.stdout[:500])

# Check if there's a netrc file with credentials
home = os.path.expanduser('~')
print('\nChecking:', os.path.join(home, '.netrc'))
if os.path.exists(os.path.join(home, '.netrc')):
    print('EXISTS')
else:
    print('Not found')
