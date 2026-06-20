import xml.etree.ElementTree as ET, os

UNPACKED = r'C:\Users\51229\WorkBuddy\Claw\unpacked_pptx'
fpath = os.path.join(UNPACKED, 'ppt', 'slides', 'slide23.xml')
with open(fpath, encoding='utf-8') as f:
    content = f.read()

# Print the entire content with visible markers at key positions
print('Length:', len(content))
print()
# Show a wide range around column 871
start = max(0, 700)
end = min(len(content), 1200)
print('--- Content from char %d to %d ---' % (start, end))
print(repr(content[start:end]))
print()

# Check for common XML issues
import re
# Find all tags
open_tags = re.findall(r'<(\w+:?\w+)(?![/>])', content)
close_tags = re.findall(r'</(\w+:?\w+)>', content)
self_closing = re.findall(r'<(\w+:?\w+)[^>]*/>', content)

open_set = set(open_tags)
close_set = set(close_tags)
sc_set = set(self_closing)

# Check for mismatches
all_tags = open_set | close_set | sc_set
print('All tag types found:', sorted(all_tags))
print()

# Count opening vs closing
print('Open tag counts:')
for t in sorted(open_set):
    print('  %s: %d' % (t, open_tags.count(t)))
print()
print('Close tag counts:')
for t in sorted(close_set):
    print('  %s: %d' % (t, close_tags.count(t)))
print()
print('Self-closing tag counts:')
for t in sorted(sc_set):
    print('  %s: %d' % (t, self_closing.count(t)))
