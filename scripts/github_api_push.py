#!/usr/bin/env python3
"""Push current commit to GitHub using REST API (bypasses git:// which needs proxy)"""
import urllib.request, urllib.error, json, base64, subprocess, sys, os, hashlib, time

os.chdir(r'C:\Users\51229\WorkBuddy\Claw')
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

GITHUB_TOKEN = os.environ.get('GITHUB_TOKEN', '')
REPO = 'EqualOceanEO/amorainsights'
BRANCH = 'master'

# Get current commit SHA
r = subprocess.run(['git', 'rev-parse', 'HEAD'], capture_output=True, text=True)
head_sha = r.stdout.strip()
print('HEAD:', head_sha)

# Get current branch name
r = subprocess.run(['git', 'rev-parse', '--abbrev-ref', 'HEAD'], capture_output=True, text=True)
branch = r.stdout.strip()
print('Branch:', branch)

# Get the diff to create a new commit tree
r = subprocess.run(['git', 'diff', '--staged'], capture_output=True, text=True)
staged = r.stdout
print('Staged diff length:', len(staged))

r = subprocess.run(['git', 'status', '--porcelain'], capture_output=True, text=True)
status = r.stdout.strip()
print('Status:', status[:200])

# Check if there are uncommitted changes
if staged or status:
    print("WARNING: There are uncommitted changes. Committing them first...")

    # Stage all
    subprocess.run(['git', 'add', '-A'], capture_output=True)

    # Get commit message
    with open('commitmsg.txt', 'r', encoding='utf-8') as f:
        msg = f.read().strip()
    msg_lines = msg.split('\n')
    commit_msg = msg_lines[0]
    commit_body = '\n'.join(msg_lines[1:]).strip()

    # Get tree SHA of HEAD
    url = f'https://api.github.com/repos/{REPO}/git/commits/{head_sha}'
    req = urllib.request.Request(url)
    req.add_header('Authorization', f'token {GITHUB_TOKEN}')
    req.add_header('Accept', 'application/vnd.github.v3+json')
    try:
        resp = urllib.request.urlopen(req, timeout=10)
        head_commit = json.loads(resp.read())
        tree_sha = head_commit['tree']['sha']
        parent_sha = head_sha
        print(f'Tree: {tree_sha[:8]}, Parent: {parent_sha[:8]}')
    except Exception as e:
        print(f'Error fetching HEAD commit: {e}')
        sys.exit(1)

    # Create blob for each changed file
    files_to_commit = []

    # Get list of changed files
    r = subprocess.run(['git', 'diff', '--staged', '--name-only'], capture_output=True, text=True)
    staged_files = [f for f in r.stdout.strip().split('\n') if f]
    print(f'Files to commit: {staged_files}')

    # For each staged file, create a blob and track it
    tree_items = []
    for filepath in staged_files:
        filepath = filepath.strip()
        if not filepath:
            continue
        # Skip .git files
        if filepath.startswith('.git/') or filepath == '.git':
            continue

        # Read file content
        full_path = os.path.join(r'C:\Users\51229\WorkBuddy\Claw', filepath)
        if os.path.exists(full_path) and os.path.isfile(full_path):
            with open(full_path, 'rb') as f:
                content = f.read()
            # Check if binary
            if b'\x00' in content[:100]:
                mode = '100755'
                content_b64 = base64.b64encode(content).decode()
            else:
                mode = '100644'
                content_b64 = base64.b64encode(content).decode()

            # Create blob
            blob_url = f'https://api.github.com/repos/{REPO}/git/blobs'
            blob_data = json.dumps({
                'content': content_b64,
                'encoding': 'base64'
            }).encode()

            blob_req = urllib.request.Request(blob_url, data=blob_data, headers={
                'Authorization': f'token {GITHUB_TOKEN}',
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            })
            try:
                blob_resp = urllib.request.urlopen(blob_req, timeout=15)
                blob = json.loads(blob_resp.read())
                blob_sha = blob['sha']
                tree_items.append({
                    'path': filepath,
                    'mode': mode,
                    'type': 'blob',
                    'sha': blob_sha
                })
                print(f'  Blob: {filepath[:40]} -> {blob_sha[:8]}')
            except Exception as e:
                print(f'  ERROR creating blob for {filepath}: {e}')

    if not tree_items:
        print("No files to commit via API. Try git push directly.")
        sys.exit(1)

    # Create tree
    tree_url = f'https://api.github.com/repos/{REPO}/git/trees'
    tree_data = json.dumps({
        'base_tree': tree_sha,
        'tree': tree_items
    }).encode()

    tree_req = urllib.request.Request(tree_url, data=tree_data, headers={
        'Authorization': f'token {GITHUB_TOKEN}',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
    })
    try:
        tree_resp = urllib.request.urlopen(tree_req, timeout=15)
        new_tree = json.loads(tree_resp.read())
        new_tree_sha = new_tree['sha']
        print(f'New tree: {new_tree_sha[:8]}')
    except Exception as e:
        print(f'Error creating tree: {e}')
        sys.exit(1)

    # Create commit
    commit_data = json.dumps({
        'message': commit_msg + ('\n\n' + commit_body if commit_body else ''),
        'tree': new_tree_sha,
        'parents': [parent_sha]
    }).encode()

    commit_req = urllib.request.Request(
        f'https://api.github.com/repos/{REPO}/git/commits',
        data=commit_data,
        headers={
            'Authorization': f'token {GITHUB_TOKEN}',
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        }
    )
    try:
        commit_resp = urllib.request.urlopen(commit_req, timeout=15)
        new_commit = json.loads(commit_resp.read())
        new_commit_sha = new_commit['sha']
        print(f'New commit: {new_commit_sha[:8]}')
    except Exception as e:
        print(f'Error creating commit: {e}')
        sys.exit(1)

    # Update branch ref
    ref_url = f'https://api.github.com/repos/{REPO}/git/refs/heads/{BRANCH}'
    ref_data = json.dumps({'sha': new_commit_sha}).encode()

    ref_req = urllib.request.Request(ref_url, data=ref_data, method='PATCH', headers={
        'Authorization': f'token {GITHUB_TOKEN}',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
    })
    try:
        ref_resp = urllib.request.urlopen(ref_req, timeout=15)
        result = json.loads(ref_resp.read())
        print(f'SUCCESS! Branch {BRANCH} updated to {new_commit_sha[:8]}')
        print(f'URL: https://github.com/{REPO}/commit/{new_commit_sha[:8]}')
    except Exception as e:
        print(f'Error updating ref: {e}')
        sys.exit(1)
else:
    print("Nothing to commit.")
    # Just verify current HEAD
    print(f"Current HEAD: {head_sha[:8]}")
