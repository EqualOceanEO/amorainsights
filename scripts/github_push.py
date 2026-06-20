import subprocess, sys, os

os.chdir(r'C:\Users\51229\WorkBuddy\Claw')
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Try direct git push (no proxy)
env = os.environ.copy()
env.pop('http_proxy', None)
env.pop('https_proxy', None)
env.pop('HTTP_PROXY', None)
env.pop('HTTPS_PROXY', None)

result = subprocess.run(
    ['git', 'push', 'origin', 'master'],
    capture_output=True,
    env=env
)
stdout = result.stdout.decode('utf-8', errors='replace')
stderr = result.stderr.decode('utf-8', errors='replace')
print('RC:', result.returncode)
print('STDOUT:', stdout[:500])
print('STDERR:', stderr[:500])
