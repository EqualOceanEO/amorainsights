import subprocess
import os

os.chdir(r'C:\Users\51229\WorkBuddy\Claw')

log_file = open(r'C:\Users\51229\WorkBuddy\Claw\.workbuddy\dev.log', 'w')

proc = subprocess.Popen(
    [r'C:\Windows\System32\cmd.exe', '/c', 'npm run dev'],
    stdout=log_file,
    stderr=subprocess.STDOUT,
    cwd=r'C:\Users\51229\WorkBuddy\Claw',
    creationflags=0x08000000  # CREATE_NO_WINDOW
)

print(f'Started npm dev, PID={proc.pid}')
