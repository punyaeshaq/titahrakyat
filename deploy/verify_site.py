#!/usr/bin/env python3
"""Verify VPS site is serving assets correctly."""
import urllib.request
import ssl

ctx = ssl.create_default_context()

# 1. Check index.html to see what JS file it references
print("=== Fetching index.html ===")
req = urllib.request.Request("https://menarapublik.news/", headers={"User-Agent": "Mozilla/5.0"})
resp = urllib.request.urlopen(req, context=ctx)
html = resp.read().decode()
print(f"Status: {resp.status}")
# Find the JS reference
import re
js_match = re.search(r'src="(/assets/index-[^"]+\.js)"', html)
if js_match:
    js_path = js_match.group(1)
    print(f"JS Bundle: {js_path}")
    
    # 2. Check the JS file
    print(f"\n=== Fetching {js_path} ===")
    req2 = urllib.request.Request(f"https://menarapublik.news{js_path}", headers={"User-Agent": "Mozilla/5.0"})
    resp2 = urllib.request.urlopen(req2, context=ctx)
    print(f"Status: {resp2.status}")
    print(f"Content-Type: {resp2.headers.get('Content-Type')}")
    first_bytes = resp2.read(100).decode(errors='replace')
    is_js = not first_bytes.strip().startswith('<')
    print(f"First 100 chars: {first_bytes[:100]}")
    print(f"Is valid JS (not HTML): {is_js}")
else:
    print("ERROR: No JS bundle found in index.html!")
    print(html[:500])
