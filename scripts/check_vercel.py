import subprocess, sys, os

os.chdir(r'C:\Users\51229\WorkBuddy\Claw')
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Check if vercel is installed
r = subprocess.run(['vercel', '--version'], capture_output=True, text=True)
print('vercel version:', r.stdout.strip() if r.stdout else r.stderr.strip())

# Deploy with vercel
print('Starting Vercel deploy...')
r = subprocess.run(
    ['vercel', '--prod', '--yes'],
    capture_output=True,
    text=True,
    cwd=r'C:\Users\51229\WorkBuddy\Claw'
)
print('RC:', r.returncode)
if r.stdout: print('STDOUT:', r.stdout[:500])
if r.stderr: print('STDERR:', r.stderr[:500])
