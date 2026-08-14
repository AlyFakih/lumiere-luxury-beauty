#!/usr/bin/env python3
import re
import sys
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

try:
    import requests
except ImportError:
    print("Missing dependency. Run:  pip install requests")
    sys.exit(1)

ROOT = Path(".")
URL_PATTERN = re.compile(
    r'https://(?:images|plus)\.unsplash\.com/[^\s"\'\)]+', re.IGNORECASE
)

def find_urls():
    hits = {}
    for path in ROOT.rglob("*"):
        if path.suffix.lower() not in (".html", ".css", ".js"):
            continue
        try:
            text = path.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        for i, line in enumerate(text.splitlines(), start=1):
            for m in URL_PATTERN.finditer(line):
                url = m.group(0).rstrip(").,;")
                hits.setdefault(url, []).append((str(path), i))
    return hits

def check_url(url, timeout=8):
    try:
        r = requests.head(url, timeout=timeout, allow_redirects=True)
        if r.status_code == 405:
            r = requests.get(url, timeout=timeout, stream=True)
        return url, r.status_code
    except Exception as e:
        return url, f"ERROR: {e}"

def main():
    urls = find_urls()
    if not urls:
        print("No Unsplash URLs found. Are you running this from the project root?")
        return

    print(f"Found {len(urls)} unique image URLs across the project. Checking...\n")

    dead = []
    alive = []
    with ThreadPoolExecutor(max_workers=10) as pool:
        futures = {pool.submit(check_url, u): u for u in urls}
        for fut in as_completed(futures):
            url, status = fut.result()
            ok = status == 200
            (alive if ok else dead).append((url, status))

    print(f"{'='*70}\nALIVE: {len(alive)}   DEAD: {len(dead)}\n{'='*70}\n")

    if dead:
        print("DEAD IMAGE URLS (need replacement):\n")
        for url, status in sorted(dead):
            print(f"  [{status}] {url}")
            for f, ln in urls[url]:
                print(f"       used in: {f}:{ln}")
            print()

    out = ROOT / "dead_images.txt"
    with out.open("w", encoding="utf-8") as f:
        for url, status in sorted(dead):
            f.write(url + "\n")
    print(f"Wrote {len(dead)} dead URLs to {out.resolve()}")
    print("Next: fill in replacements.py, then run replace_images.py")

if __name__ == "__main__":
    main()
