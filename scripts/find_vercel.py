import subprocess, os, sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Find vercel
for cmd in ['vercel.cmd', 'vercel', 'C:\\Program Files\\nodejs\\vercel.cmd', 'C:\\Users\\51229\\AppData\\Roaming\\npm\\vercel.cmd']:
    r = subprocess.run([cmd, '--version'] if not cmd.endswith('.cmd') or os.path.exists(cmd) else None,
                      capture_output=True, text=True)
    if r.returncode == 0:
        print(f'Found: {cmd} = {r.stdout.strip()}')
        break
    print(f'Not found: {cmd}')

# Check npm global
r = subprocess.run(['npm.cmd', 'list', '-g', '--depth=0'], capture_output=True, text=True)
print('npm global:', r.stdout[:300])
