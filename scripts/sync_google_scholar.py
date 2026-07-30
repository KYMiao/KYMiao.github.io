#!/usr/bin/env python3
"""Sync Google Scholar publications into Astro content.

Google Scholar does not provide a stable public API and may return 403 or
captcha pages. This script is intentionally cache-first: when a fetch succeeds
it writes a JSON cache and Astro publication bundles; when Scholar blocks the
request it exits with a clear message instead of breaking the site build.
"""

from __future__ import annotations

import argparse
import html
import json
import re
import sys
import time
from pathlib import Path
from urllib.parse import urlencode, urljoin
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_USER = "HxFJ_DQAAAAJ"
DEFAULT_CACHE = ROOT / "data" / "google_scholar_publications.json"
DEFAULT_OUT = ROOT / "src" / "content" / "publications"


def slugify(value: str) -> str:
    value = value.lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-") or "publication"


def strip_tags(value: str) -> str:
    value = re.sub(r"<[^>]+>", "", value)
    return html.unescape(value).strip()


def fetch_scholar_table(user: str, pagesize: int) -> str:
    query = urlencode({"user": user, "hl": "en", "cstart": 0, "pagesize": pagesize})
    url = f"https://scholar.google.com/citations?{query}"
    request = Request(
        url,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
            ),
            "Accept-Language": "en-US,en;q=0.9",
        },
    )
    with urlopen(request, timeout=20) as response:
        return response.read().decode("utf-8", errors="replace")


def parse_publications(page: str) -> list[dict[str, str]]:
    rows = re.findall(r"<tr class=\"gsc_a_tr\">(.*?)</tr>", page, flags=re.S)
    publications = []
    for row in rows:
        title_match = re.search(r"<a([^>]+)class=\"gsc_a_at\"([^>]*)>(.*?)</a>", row, flags=re.S)
        if not title_match:
            continue
        title_attrs = title_match.group(1) + title_match.group(2)
        href_match = re.search(r"href=\"([^\"]+)\"", title_attrs)
        scholar_url = urljoin("https://scholar.google.com", html.unescape(href_match.group(1))) if href_match else ""
        title = strip_tags(title_match.group(3))
        detail_blocks = re.findall(r"<div class=\"gs_gray\">(.*?)</div>", row, flags=re.S)
        authors = strip_tags(detail_blocks[0]) if len(detail_blocks) > 0 else ""
        venue = strip_tags(detail_blocks[1]) if len(detail_blocks) > 1 else ""
        year_match = re.search(r"<span class=\"gsc_a_h gsc_a_hc gs_ibl\">(.*?)</span>", row, flags=re.S)
        year = strip_tags(year_match.group(1)) if year_match else ""
        cites_match = re.search(r"<a[^>]+class=\"gsc_a_ac[^>]*>(.*?)</a>", row, flags=re.S)
        citations = strip_tags(cites_match.group(1)) if cites_match else ""
        publications.append(
            {
                "title": title,
                "authors": authors,
                "publication": venue,
                "year": year,
                "citations": citations,
                "scholar_url": scholar_url,
                "source": "Google Scholar",
                "synced_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            }
        )
    return publications


def write_cache(publications: list[dict[str, str]], cache_path: Path) -> None:
    cache_path.parent.mkdir(parents=True, exist_ok=True)
    cache_path.write_text(json.dumps(publications, indent=2, ensure_ascii=False) + "\n")


def quote_yaml(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def write_astro_entries(publications: list[dict[str, str]], out_dir: Path, overwrite: bool) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    used: set[str] = set()
    for pub in publications:
        base_slug = slugify(pub["title"])
        slug = base_slug
        index = 2
        while slug in used:
            slug = f"{base_slug}-{index}"
            index += 1
        used.add(slug)

        bundle = out_dir / slug
        md_path = bundle / "index.md"
        if md_path.exists() and not overwrite:
            continue

        authors = [a.strip() for a in pub.get("authors", "").split(",") if a.strip()]
        year = pub.get("year") or "1900"
        bundle.mkdir(parents=True, exist_ok=True)
        md_path.write_text(
            "---\n"
            f"title: {quote_yaml(pub['title'])}\n"
            "authors:\n"
            + "".join(f"  - {quote_yaml(author)}\n" for author in authors)
            + f"date: {quote_yaml(f'{year}-01-01T00:00:00Z')}\n"
            f"publication: {quote_yaml(pub.get('publication', ''))}\n"
            f"summary: {quote_yaml(pub.get('publication', ''))}\n"
            f"citations: {quote_yaml(pub.get('citations', ''))}\n"
            "tags: []\n"
            "links:\n"
            "  - name: Google Scholar\n"
            f"    url: {quote_yaml('https://scholar.google.com/citations?user=' + DEFAULT_USER + '&hl=en')}\n"
            "source: Google Scholar\n"
            "---\n\n"
            f"{pub.get('publication', '')}\n",
            encoding="utf-8",
        )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--user", default=DEFAULT_USER, help="Google Scholar user id")
    parser.add_argument("--pagesize", type=int, default=100)
    parser.add_argument("--cache", type=Path, default=DEFAULT_CACHE)
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--from-cache", action="store_true", help="Regenerate Astro entries from cached JSON")
    parser.add_argument("--overwrite", action="store_true", help="Overwrite existing Astro publication bundles")
    args = parser.parse_args()

    if args.from_cache:
        publications = json.loads(args.cache.read_text(encoding="utf-8"))
    else:
        try:
            page = fetch_scholar_table(args.user, args.pagesize)
        except (HTTPError, URLError) as exc:
            print(
                "Google Scholar blocked or failed the request. "
                "Try again later, use --from-cache, or export BibTeX manually.",
                file=sys.stderr,
            )
            print(exc, file=sys.stderr)
            return 2
        publications = parse_publications(page)
        if not publications:
            print("No Scholar publications parsed; Google may have returned a captcha page.", file=sys.stderr)
            return 3
        write_cache(publications, args.cache)

    write_astro_entries(publications, args.out, args.overwrite)
    print(f"Synced {len(publications)} Google Scholar publications.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
