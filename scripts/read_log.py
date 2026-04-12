#!/usr/bin/env python3
import sys

with open('c:/Users/51229/WorkBuddy/Claw/.workbuddy/dev.log', 'r', encoding='utf-8', errors='replace') as f:
    content = f.read()

idx = content.find('Parsing ecmascript')
if idx > 0:
    print(repr(content[max(0,idx-500):idx+300]))
else:
    # Find the 500 error line
    for line in content.split('\n'):
        if '500' in line and 'humanoid' in line.lower():
            print(repr(line))
            break
    # show last 800 chars
    print(repr(content[-800:]))
