# Keyan Miao Academic Website

This repository contains the source for `https://kymiao.github.io`, rebuilt with HugoBlox Academic CV.

The site uses real multi-page navigation for Home, Research, Publications, Projects, Blog, Photography, and CV. Existing useful assets from the previous Jekyll site have been preserved, with Hugo-facing copies placed in `static/uploads/`.

## Local Preview

Install Hugo Extended. The template version is pinned in `hugoblox.yaml`.

```bash
hugo version
hugo server --disableFastRender
```

Then open `http://localhost:1313`.

If you prefer npm scripts:

```bash
npm run dev
```

## Adding a New Publication

1. Add a BibTeX entry to `assets/publications/publications.bib`.
2. Optionally add polish in `data/publication_overrides.json`: `venue`, `summary`, `tags`, `links`, `image`, or `featured`.
3. Regenerate publication pages:

```bash
python3 scripts/update_publications.py
```

Generated pages appear in `content/publications/<paper-slug>/` with an `index.md` and `cite.bib`.

## Updating Publications from BibTeX, DOI, ORCID, or Crossref

The stable default pipeline is BibTeX plus manual overrides:

```bash
python3 scripts/update_publications.py --bib assets/publications/publications.bib
```

For DOI metadata, add `doi = {...}` to a BibTeX entry and run:

```bash
python3 scripts/update_publications.py --enrich-doi
```

This performs best-effort Crossref lookup. The generated pages still remain editable through the JSON override file.

For ORCID, export BibTeX from ORCID or use an ORCID-to-BibTeX tool, save it into `assets/publications/publications.bib`, then run the same script. This keeps ORCID as an input source without making the website build depend on live ORCID availability.

Google Scholar import is not the default because direct scraping is fragile and can be blocked or break without notice. If you later add a Scholar importer, keep it optional, cache its output as BibTeX or JSON, and commit the cached source file.

## Adding a Blog Post

Create a new bundle:

```bash
hugo new blog/my-note/index.md
```

Use front matter like:

```yaml
---
title: "My Note"
date: 2026-05-11
summary: "A short description."
tags: ["research notes"]
draft: false
---
```

Blog posts live under `content/blog/` and are listed at `/blog/`.

## Adding a Photography Series

Create a new series:

```bash
hugo new photography/my-series/index.md
```

Each series supports `cover`, `title`, `place`, `series_date`, `caption`, `camera`, `film`, and `gallery`.

Put images in `static/uploads/photography/<series>/`, then reference them as `/uploads/photography/<series>/image.jpg`.

Example gallery front matter:

```yaml
gallery:
  - src: "/uploads/photography/oxford/morning.jpg"
    alt: "Morning light in Oxford"
```

Gallery images open directly in a new tab, which gives a simple no-JavaScript lightbox fallback. A richer lightbox can be added later by replacing `layouts/_default/photography.html`.

## Deployment to GitHub Pages

Deployment is handled by `.github/workflows/deploy.yml`.

1. Keep the custom domain in `CNAME` as `kymiao.github.io`.
2. In GitHub repository settings, set Pages source to GitHub Actions.
3. Merge changes into `main`.
4. The workflow builds Hugo and deploys `public/` to GitHub Pages.

## Branch and Pull Request Workflow

Do not push directly to `main`.

```bash
git switch -c rebuild-hugoblox-academic-cv
git add .
git commit -m "Rebuild site with HugoBlox Academic CV"
git push -u origin rebuild-hugoblox-academic-cv
gh pr create --base main --head rebuild-hugoblox-academic-cv --title "Rebuild site with HugoBlox Academic CV" --body "Rebuilds the academic personal website with HugoBlox, multi-page navigation, publication generation, photography series, blog, and GitHub Pages deployment."
```
