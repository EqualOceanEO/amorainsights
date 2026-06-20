#!/usr/bin/env python3
"""
Smart English spacing fixer for HTML reports.
Fixes word concatenation (camelCase) in visible text only.
Does NOT modify script/style content or HTML tags.
"""
import re
import sys

def fix_visible_text(html: str) -> str:
    """Add spaces between concatenated English words in visible text only."""
    
    # Process the HTML by extracting and fixing text segments
    # Strategy: find text between '>' and '<' (tag content)
    
    def fix_text_segment(text: str) -> str:
        """Add spaces where English words are concatenated."""
        # 1. Insert space between lowercase letter followed by uppercase letter
        #    e.g., "technologyRoadmap" -> "technology Roadmap"
        text = re.sub(r'(?<=[a-z])(?=[A-Z])', ' ', text)
        
        # 2. Insert space between digit followed by uppercase letter
        #    e.g., "36reports" -> "36 reports" or "2026Year" -> "2026 Year"
        text = re.sub(r'(?<=[0-9])(?=[A-Z])', ' ', text)
        
        # 3. Insert space between lowercase letter followed by digit
        #    e.g., "unit3" -> "unit 3"
        text = re.sub(r'(?<=[a-z])(?=[0-9])', ' ', text)
        
        # 4. Clean up multiple spaces
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r' ,', ',', text)
        text = re.sub(r' \.', '.', text)
        text = re.sub(r' :', ':', text)
        text = re.sub(r' ;', ';', text)
        
        return text.strip()
    
    # Process HTML by segments
    result = []
    i = 0
    in_script = 0
    in_style = 0
    current_text = []
    
    while i < len(html):
        # Detect script/style tags (case insensitive)
        lower_html = html[i:i+8].lower()
        
        if lower_html.startswith('<script'):
            # Flush any accumulated text
            if current_text:
                result.append(fix_text_segment(''.join(current_text)))
                current_text = []
            # Find end of script tag
            end_tag = html.find('</script>', i)
            if end_tag == -1:
                end_tag = len(html)
            result.append(html[i:end_tag + 9])
            i = end_tag + 9
            continue
        
        if lower_html.startswith('<style'):
            if current_text:
                result.append(fix_text_segment(''.join(current_text)))
                current_text = []
            end_tag = html.find('</style>', i)
            if end_tag == -1:
                end_tag = len(html)
            result.append(html[i:end_tag + 8])
            i = end_tag + 8
            continue
        
        if html[i] == '<':
            # Flush accumulated text before processing tag
            if current_text:
                result.append(fix_text_segment(''.join(current_text)))
                current_text = []
            # Find end of tag
            end_tag = html.find('>', i)
            if end_tag == -1:
                end_tag = len(html)
            result.append(html[i:end_tag + 1])
            i = end_tag + 1
            continue
        
        # Regular character - accumulate
        current_text.append(html[i])
        i += 1
    
    # Flush remaining text
    if current_text:
        result.append(fix_text_segment(''.join(current_text)))
    
    return ''.join(result)


def process_file(input_path: str, label: str):
    with open(input_path, 'r', encoding='utf-8') as f:
        html = f.read()
    
    print(f"Processing {label}... ({len(html):,} bytes)")
    
    fixed = fix_visible_text(html)
    
    # Count fixes
    original_words = len(re.findall(r'\b[a-zA-Z]+\b', html))
    fixed_words = len(re.findall(r'\b[a-zA-Z]+\b', fixed))
    
    print(f"  Before: ~{original_words} words | After: ~{fixed_words} words")
    print(f"  Words added: ~{fixed_words - original_words}")
    
    with open(input_path, 'w', encoding='utf-8') as f:
        f.write(fixed)
    
    print(f"  Saved: {input_path}")


if __name__ == '__main__':
    process_file(
        'C:/Users/51229/WorkBuddy/Claw/public/HRI-2026-Free-Preview-v2.0-en.html',
        'FREE PREVIEW'
    )
    process_file(
        'C:/Users/51229/WorkBuddy/Claw/public/HRI-2026-AMORA-Report-v5.0-en.html',
        'PRO REPORT'
    )
    print("\nDone!")
