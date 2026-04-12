import re, sys
sys.stdout.reconfigure(encoding='utf-8')

files = [
    'c:/Users/51229/WorkBuddy/Claw/public/hri-report-part-m-mapping-v3.html',
    'c:/Users/51229/WorkBuddy/Claw/public/hri-report-part-a-advancement-v1.html',
    'c:/Users/51229/WorkBuddy/Claw/public/hri-report-part-o-operations-v1.html',
    'c:/Users/51229/WorkBuddy/Claw/public/hri-report-part-r-reach-v1.html',
    'c:/Users/51229/WorkBuddy/Claw/public/hri-report-part-a2-assets-v1.html',
]
for f in files:
    try:
        with open(f, encoding='utf-8', errors='replace') as fh:
            content = fh.read()
        lang = re.search(r'lang="([^"]+)"', content[:200])
        title = re.search(r'<title>([^<]+)</title>', content)
        zh_chars = re.findall(r'[\u4e00-\u9fff]', content[:5000])
        en_words = re.findall(r'[A-Za-z]{4,}', content[:5000])
        print(f"{f.split('/')[-1]}: lang={lang.group(1) if lang else '?'}, zh_count={len(zh_chars)}, en_count={len(en_words)}")
        print(f"  sample_zh: {''.join(zh_chars[:20])}")
        print(f"  sample_en: {' '.join(en_words[:15])}")
    except Exception as e:
        print(f"ERROR {f}: {e}")
    print()
