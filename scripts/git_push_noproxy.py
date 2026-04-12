import subprocess, sys, os

os.chdir(r'C:\Users\51229\WorkBuddy\Claw')
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Unset proxy at git level
subprocess.run(['git', 'config', '--global', 'unset', 'http.proxy'], capture_output=True)
subprocess.run(['git', 'config', '--global', 'unset', 'https.proxy'], capture_output=True)

print('Proxy unset. Retrying push...')
result = subprocess.run(['git', 'push', 'origin', 'master'], capture_output=True)
stdout = result.stdout.decode('utf-8', errors='replace')
stderr = result.stderr.decode('utf-8', errors='replace')
print('RC:', result.returncode)
print('STDOUT:', stdout[:500])
print('STDERR:', stderr[:500])

# Restore proxy config
subprocess.run(['git', 'config', '--global', 'http.proxy', 'http://localhost:15236'], capture_output=True)
subprocess.run(['git', 'config', '--global', 'https.proxy', 'http://localhost:15236'], capture_output=True)
print('Proxy restored.')
