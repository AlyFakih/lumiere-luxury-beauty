#!/usr/bin/env python3
import sys
from pathlib import Path
import requests
from replacements import REPLACEMENTS

ROOT = Path(".")
FILE_TYPES = (".html", ".css", ".js")

def verify(photo_id, timeout=8):
    url = f"https://images.unsplash.com/{photo_id}?w=400&q=80"
    try:
        r = requests.head(url, timeout=timeout, allow_redirects=True)
        return r.status_code == 200
    except Exception:
        return False

def main():
    apply_changes = "--apply" in sys.argv

    active = {k: v for k, v in REPLACEMENTS.items() if v.strip()}
    skipped = [k for k, v in REPLACEMENTS.items() if not v.strip()]

    if skipped:
        print("Skipping (no replacement filled in yet):")
        for k in skipped:
            print(f"  - {k}")
        print()

    if not active:
        print("Nothing to do -- fill in replacements.py first.")
        return

    print("Verifying replacement images are actually reachable...\n")
    bad = []
    for old_id, new_id in active.items():
        ok = verify(new_id)
        status = "OK" if ok else "FAILED (not reachable, skipping this one)"
        print(f"  {new_id:45s} {status}")
        if not ok:
            bad.append(old_id)
    for b in bad:
        del active[b]

    if not active:
        print("\nNone of the replacements verified. Nothing to change.")
        return

    print(f"\n{len(active)} verified replacements will be applied.\n")

    total_changes = 0
    for path in ROOT.rglob("*"):
        if path.suffix.lower() not in FILE_TYPES:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except Exception:
            continue

        original = text
        file_changes = 0
        for old_id, new_id in active.items():
            count = text.count(old_id)
            if count:
                text = text.replace(old_id, new_id)
                file_changes += count

        if file_changes:
            print(f"  {path}: {file_changes} occurrence(s)" +
                  ("" if apply_changes else "  [dry run, not written]"))
            total_changes += file_changes
            if apply_changes:
                path.write_text(text, encoding="utf-8")

    print(f"\nTotal: {total_changes} URL occurrences across the project.")
    if not apply_changes:
        print("This was a DRY RUN. Re-run with --apply to actually write the files.")
    else:
        print("Files updated. Now run: git add -A && git commit -m \"fix: replace dead image URLs\"")

if __name__ == "__main__":
    main()
