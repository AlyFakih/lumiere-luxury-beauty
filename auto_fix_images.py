#!/usr/bin/env python3
"""
auto_fix_images.py
Fully automated: searches Unsplash's public search endpoint for each dead
image, downloads a real replacement, saves it locally under images/, and
rewrites every HTML/CSS reference in the project to point at the local
file instead of the dead remote URL.

Usage:
    python auto_fix_images.py            # dry run
    python auto_fix_images.py --apply    # downloads files + rewrites project
"""
import re
import sys
import time
from pathlib import Path
import requests

ROOT = Path(".")
IMAGES_DIR = ROOT / "images"
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

# dead_id : (search query, result index to pick, local filename)
TASKS = [
    ("photo-1527633412658-432956110e1d", "beauty lifestyle flatlay", 0, "instagram-post-1.jpg"),
    ("photo-1534528741775-53994a69be78", "professional woman portrait", 0, "founder-portrait.jpg"),
    ("photo-1544717278-ca5e3f4abd8c", "woman portrait studio", 0, "team-portrait.jpg"),
    ("photo-1549298222-1c31e8914cb3", "luxury cosmetics flatlay wide", 0, "hero-background.jpg"),
    ("photo-1571469869901-f2c34d3e8c24", "woman portrait studio", 0, "team-portrait-small.jpg"),
    ("photo-1579058318694-e5ca0d4def4a", "highlighter makeup product", 0, "glow-highlighter.jpg"),
    ("photo-1583241475880-083f84369e53", "eyeshadow palette", 0, "eyeshadow-palette.jpg"),
    ("photo-1588733103099-cd943da4e7b8", "beauty lifestyle flatlay", 1, "instagram-post-2.jpg"),
    ("photo-1594348566385-514195a39ca3", "perfume bottle luxury", 0, "rose-oud-parfum.jpg"),
    ("photo-1595348852953-5f9f6ce8da9b", "beauty boutique interior", 0, "retail-experience.jpg"),
    ("photo-1596704017234-0e1211a6dda7", "beauty lifestyle flatlay", 2, "instagram-post-3.jpg"),
    ("photo-1596704017391-a2891c065b52", "skincare glow face", 0, "radiant-skin-tutorial.jpg"),
    ("photo-1607602132700-cfe5a8cfb7a9", "luxury serum bottle", 0, "radiance-serum-box.jpg"),
    ("photo-1611296841694-d2726e8c1be7", "lipstick macro", 0, "velvet-lipstick.jpg"),
    ("photo-1631730359585-5e3aeb0de988", "luxury serum bottle", 0, "radiance-serum-main.jpg"),
]

URL_PATTERN = re.compile(r'https://(?:images|plus)\.unsplash\.com/[^\s"\'\)]+', re.IGNORECASE)
FILE_TYPES = (".html", ".css", ".js")

def search_unsplash(query, timeout=10):
    url = "https://unsplash.com/napi/search/photos"
    params = {"query": query, "per_page": 5}
    r = requests.get(url, params=params, headers=HEADERS, timeout=timeout)
    r.raise_for_status()
    return r.json().get("results", [])

def pick_download_url(result):
    # "regular" is ~1080px wide, good enough for a hero/product shot
    return result.get("urls", {}).get("regular") or result.get("urls", {}).get("full")

def download_image(url, dest_path, timeout=15):
    r = requests.get(url, headers=HEADERS, timeout=timeout)
    r.raise_for_status()
    if len(r.content) < 5000:  # sanity check: real photos are never this small
        raise ValueError("downloaded file suspiciously small, likely not a real image")
    dest_path.write_bytes(r.content)

def find_files_using(dead_id):
    hits = []
    for path in ROOT.rglob("*"):
        if path.suffix.lower() not in FILE_TYPES:
            continue
        if path.name == "auto_fix_images.py":
            continue
        try:
            text = path.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        if dead_id in text:
            hits.append(path)
    return hits

def relative_prefix(path):
    depth = len(path.relative_to(ROOT).parts) - 1  # subfolders between root and the file
    return "../" * depth

def main():
    apply_changes = "--apply" in sys.argv

    if apply_changes:
        IMAGES_DIR.mkdir(exist_ok=True)

    plan = []  # (dead_id, local_relpath_to_root, files_affected)

    for dead_id, query, idx, filename in TASKS:
        print(f"Searching: '{query}' (result #{idx}) for {dead_id} ...")
        try:
            results = search_unsplash(query)
            if idx >= len(results):
                idx = 0
            chosen = results[idx]
            img_url = pick_download_url(chosen)
            if not img_url:
                raise ValueError("no usable URL in result")
        except Exception as e:
            print(f"  FAILED to search/pick image: {e}")
            print(f"  -> skipping {dead_id}, you'll need to fill this one in manually")
            continue

        local_path = IMAGES_DIR / filename
        alt = chosen.get("alt_description") or "(no description)"
        print(f"  Found: {alt}  -> images/{filename}")

        if apply_changes:
            try:
                download_image(img_url, local_path)
                print(f"  Downloaded to {local_path}")
            except Exception as e:
                print(f"  FAILED to download: {e}")
                continue

        files = find_files_using(dead_id)
        if not files:
            print(f"  (not referenced anywhere in the project, skipping rewrite)")
        plan.append((dead_id, filename, files))
        time.sleep(0.5)  # be polite to the API

    print(f"\n{'='*70}\nRewriting file references...\n{'='*70}\n")

    total_files_changed = 0
    for dead_id, filename, files in plan:
        for f in files:
            text = f.read_text(encoding="utf-8")
            prefix = relative_prefix(f)
            local_ref = f"{prefix}images/{filename}"

            # replace every full unsplash URL containing this dead_id with the local path
            def repl(m):
                return local_ref if dead_id in m.group(0) else m.group(0)

            new_text = URL_PATTERN.sub(repl, text)
            if new_text != text:
                print(f"  {f}: -> {local_ref}" + ("" if apply_changes else "  [dry run]"))
                total_files_changed += 1
                if apply_changes:
                    f.write_text(new_text, encoding="utf-8")

    print(f"\nTotal file edits: {total_files_changed}")
    if not apply_changes:
        print("\nThis was a DRY RUN — nothing downloaded or written.")
        print("Re-run with --apply to actually download images and rewrite the project.")
    else:
        print("\nDone. Now run:")
        print("  git add -A")
        print('  git commit -m "fix: download and localize all dead Unsplash images"')

if __name__ == "__main__":
    main()
