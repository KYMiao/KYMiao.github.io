#!/usr/bin/env python3
"""Generate HugoBlox publication pages from BibTeX plus JSON overrides.

The default source of truth is assets/publications/publications.bib. Optional
DOI enrichment uses Crossref and is intentionally best-effort so local builds
remain stable.
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BIB_PATH = ROOT / "assets" / "publications" / "publications.bib"
OVERRIDES_PATH = ROOT / "data" / "publication_overrides.json"
OUT_DIR = ROOT / "content" / "publications"


def slugify(value: str) -> str:
    value = value.lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-") or "publication"


def clean(value: str) -> str:
    value = value.replace("\r", " ").replace("\n", " ")
    value = re.sub(r"\s+", " ", value).strip()
    return value.replace("{", "").replace("}", "")


def parse_bibtex(text: str) -> list[dict]:
    entries = []
    for match in re.finditer(r"@(\w+)\s*\{\s*([^,]+),", text):
        kind, key = match.group(1).lower(), match.group(2).strip()
        start = match.end()
        depth = 1
        i = start
        while i < len(text) and depth:
            if text[i] == "{":
                depth += 1
            elif text[i] == "}":
                depth -= 1
            i += 1
        body = text[start : i - 1]
        fields = {}
        for field in re.finditer(r"(\w+)\s*=\s*(\{(?:[^{}]|\{[^{}]*\})*\}|\"[^\"]*\"|[^,\n]+)\s*,?", body, re.S):
            name = field.group(1).lower()
            raw = field.group(2).strip().strip(",")
            if raw.startswith("{") and raw.endswith("}"):
                raw = raw[1:-1]
            if raw.startswith('"') and raw.endswith('"'):
                raw = raw[1:-1]
            fields[name] = clean(raw)
        entries.append({"kind": kind, "key": key, "fields": fields})
    return entries


def crossref_by_doi(doi: str) -> dict:
    url = f"https://api.crossref.org/works/{doi}"
    req = urllib.request.Request(url, headers={"User-Agent": "KYMiao.github.io publication updater"})
    with urllib.request.urlopen(req, timeout=20) as response:
        payload = json.loads(response.read().decode("utf-8"))
    item = payload.get("message", {})
    return {
        "title": (item.get("title") or [""])[0],
        "container-title": (item.get("container-title") or [""])[0],
        "year": ((item.get("published-print") or item.get("published-online") or {}).get("date-parts") or [[""]])[0][0],
        "url": item.get("URL", ""),
    }


def publication_type(kind: str) -> str:
    if kind in {"article"}:
        return "article-journal"
    if kind in {"inproceedings", "conference"}:
        return "paper-conference"
    return "article"


def yaml_scalar(value: str) -> str:
    return json.dumps(str(value), ensure_ascii=False)


def render(entry: dict, override: dict, image_filename: str = "") -> str:
    fields = entry["fields"]
    title = override.get("title") or fields.get("title") or entry["key"]
    year = str(override.get("year") or fields.get("year") or "")
    venue = override.get("venue") or fields.get("booktitle") or fields.get("journal") or fields.get("series") or ""
    date = f"{year}-01-01T00:00:00Z" if year else "2000-01-01T00:00:00Z"
    authors = [clean(a) for a in re.split(r"\s+and\s+", fields.get("author", "")) if a.strip()]
    links = override.get("links", {})
    if fields.get("pdf"):
        links.setdefault("PDF", fields["pdf"])
    if fields.get("url"):
        links.setdefault("Link", fields["url"])
    if fields.get("doi"):
        links.setdefault("DOI", f"https://doi.org/{fields['doi']}")

    lines = [
        "---",
        f"title: {yaml_scalar(title)}",
        "authors:",
    ]
    lines.extend(f"  - {yaml_scalar(author)}" for author in authors)
    lines.extend(
        [
            f"date: {yaml_scalar(date)}",
            f"publishDate: {yaml_scalar(date)}",
            f"publication_types: [{yaml_scalar(publication_type(entry['kind']))}]",
            f"publication: {yaml_scalar(venue)}",
            f"publication_short: {yaml_scalar(venue)}",
            f"featured: {str(bool(override.get('featured', False))).lower()}",
        ]
    )
    if image_filename:
        lines.append("image:")
        lines.append(f"  filename: {yaml_scalar(image_filename)}")
        lines.append("  focal_point: Smart")
    tags = override.get("tags", [])
    if tags:
        lines.append("tags:")
        lines.extend(f"  - {yaml_scalar(tag)}" for tag in tags)
    if links:
        lines.append("links:")
        for name, url in links.items():
            lines.append(f"  - name: {yaml_scalar(name)}")
            lines.append(f"    url: {yaml_scalar(url)}")
    lines.append("---")
    summary = override.get("summary", "")
    body = summary or f"{title}. {venue}."
    lines.append("")
    lines.append(body)
    lines.append("")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--bib", default=str(BIB_PATH), help="Path to a BibTeX file")
    parser.add_argument("--enrich-doi", action="store_true", help="Best-effort Crossref DOI enrichment")
    args = parser.parse_args()

    bib_path = Path(args.bib)
    overrides = json.loads(OVERRIDES_PATH.read_text()) if OVERRIDES_PATH.exists() else {}
    entries = parse_bibtex(bib_path.read_text())
    if not entries:
        print(f"No BibTeX entries found in {bib_path}", file=sys.stderr)
        return 1

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for entry in entries:
        fields = entry["fields"]
        override = dict(overrides.get(entry["key"], {}))
        if args.enrich_doi and fields.get("doi"):
            try:
                doi_data = crossref_by_doi(fields["doi"])
                fields.setdefault("title", doi_data.get("title", ""))
                fields.setdefault("journal", doi_data.get("container-title", ""))
                fields.setdefault("year", str(doi_data.get("year", "")))
                fields.setdefault("url", doi_data.get("url", ""))
            except Exception as exc:
                print(f"Crossref lookup failed for {entry['key']}: {exc}", file=sys.stderr)

        slug = slugify(override.get("slug") or fields.get("title") or entry["key"])
        page_dir = OUT_DIR / slug
        page_dir.mkdir(parents=True, exist_ok=True)
        image_filename = ""
        image = override.get("image", "")
        if image.startswith("/uploads/"):
            source = ROOT / "static" / image.lstrip("/")
            if source.exists():
                image_filename = f"featured{source.suffix}"
                shutil.copyfile(source, page_dir / image_filename)
            else:
                print(f"Image not found for {entry['key']}: {source}", file=sys.stderr)
        (page_dir / "index.md").write_text(render(entry, override, image_filename), encoding="utf-8")
        cite = f"@{entry['kind']}{{{entry['key']},\n"
        for name, value in fields.items():
            cite += f"  {name} = {{{value}}},\n"
        cite += "}\n"
        (page_dir / "cite.bib").write_text(cite, encoding="utf-8")

    print(f"Generated {len(entries)} publication pages in {OUT_DIR.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
