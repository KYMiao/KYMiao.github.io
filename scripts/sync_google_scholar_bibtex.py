#!/usr/bin/env python3
"""Fetch BibTeX files from Google Scholar citation pages.

This script uses the Scholar profile cache produced by sync_google_scholar.py.
It only writes cite.bib when Scholar returns an actual BibTeX entry. It does not
synthesize fallback citations.
"""

from __future__ import annotations

import argparse
import html
import json
import re
import sys
import time
from difflib import SequenceMatcher
from pathlib import Path
from urllib.parse import urljoin
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CACHE = ROOT / "data" / "google_scholar_publications.json"
DEFAULT_OUT = ROOT / "src" / "content" / "publications"
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}


def slugify(value: str) -> str:
    value = value.lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-") or "publication"


def fetch(url: str) -> str:
    request = Request(url, headers=HEADERS)
    with urlopen(request, timeout=20) as response:
        return response.read().decode("utf-8", errors="replace")


def normalize_title(value: str) -> str:
    value = html.unescape(value).lower()
    value = re.sub(r"[^a-z0-9]+", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def bib_title(bib: str) -> str:
    match = re.search(r'title\s*=\s*[{}"](.+?)[}"]\s*,', bib, flags=re.I | re.S)
    return re.sub(r"\s+", " ", match.group(1)).strip() if match else ""


def score_title(expected: str, actual: str) -> float:
    left = normalize_title(expected)
    right = normalize_title(actual)
    if not left or not right:
        return 0.0
    if left == right:
        return 1.0
    if left in right or right in left:
        return 0.93
    return SequenceMatcher(None, left, right).ratio()


def info_ids_from_detail(detail_html: str) -> list[str]:
    text = html.unescape(detail_html)
    ids: list[str] = []
    for match in re.finditer(r"q=related:([^:&]+):scholar\.google\.com", text):
        info_id = match.group(1)
        if info_id not in ids:
            ids.append(info_id)
    return ids


def bibtex_for_info_id(info_id: str) -> str:
    cite_url = f"https://scholar.google.com/scholar?q=info:{info_id}:scholar.google.com/&output=cite&scirp=0&hl=en"
    cite_html = fetch(cite_url)
    match = re.search(r'<a[^>]+href="([^"]+)"[^>]*>\s*BibTeX\s*</a>', cite_html, flags=re.I)
    if not match:
        return ""
    bib_url = urljoin("https://scholar.google.com", html.unescape(match.group(1)))
    return fetch(bib_url).strip() + "\n"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--cache", type=Path, default=DEFAULT_CACHE)
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--min-score", type=float, default=0.88)
    args = parser.parse_args()

    publications = json.loads(args.cache.read_text(encoding="utf-8"))
    written: list[str] = []
    skipped: list[str] = []

    for pub in publications:
        title = pub.get("title", "")
        scholar_url = pub.get("scholar_url", "")
        slug = slugify(title)
        if not title or not scholar_url:
            skipped.append(f"{title} :: missing scholar_url")
            continue

        try:
            detail_html = fetch(scholar_url)
            candidates = []
            for info_id in info_ids_from_detail(detail_html):
                bib = bibtex_for_info_id(info_id)
                if not bib:
                    continue
                candidates.append((score_title(title, bib_title(bib)), bib))
                time.sleep(0.35)
        except (HTTPError, URLError, TimeoutError) as exc:
            skipped.append(f"{title} :: {exc}")
            continue

        if not candidates:
            skipped.append(f"{title} :: no Scholar BibTeX candidate found")
            continue

        score, bib = max(candidates, key=lambda item: item[0])
        if score < args.min_score:
            skipped.append(f"{title} :: best title match too low ({score:.2f})")
            continue

        bundle = args.out / slug
        bundle.mkdir(parents=True, exist_ok=True)
        (bundle / "cite.bib").write_text(bib, encoding="utf-8")
        written.append(f"{title} ({score:.2f})")
        time.sleep(0.45)

    print(f"Wrote {len(written)} Scholar BibTeX files.")
    for item in written:
        print("  +", item)
    if skipped:
        print(f"Skipped {len(skipped)} entries:", file=sys.stderr)
        for item in skipped:
            print("  -", item, file=sys.stderr)
    return 0 if written else 1


if __name__ == "__main__":
    raise SystemExit(main())
