# Keyan Miao Academic Website

This repository contains the source for `https://kymiao.github.io`, now migrated to Astro.

The site keeps a clean academic structure for Home, Research, Publications, Blog, Photography, News, and CV, with polished page transitions, an animated menu, scroll reveals, local photo likes/comments, and editorial typography. The active site lives in `src/`.

For the current tree and update instructions, see [`docs/SITE_STRUCTURE.md`](docs/SITE_STRUCTURE.md).

## Local Preview

Install Node.js, then install dependencies:

```bash
npm install
```

Start the Astro dev server:

```bash
npm run dev
```

Then open the local URL Astro prints, usually `http://localhost:4321`.

## Build

```bash
npm run build
npm run preview
```

Astro writes the generated site to `dist/`. The `public/` directory is now only for static assets such as uploads, publication images, PDFs, CSS, JavaScript, and `CNAME`.

## Content

Primary content lives in Astro collections:

- `src/content/publications/`
- `src/content/blog/`
- `src/content/photography/`

Each entry can use a folder with `index.md` and optional colocated files such as `featured.jpg` or `cite.bib`.

## Publications

To sync from Google Scholar:

```bash
npm run sync:scholar
```

Google Scholar does not provide a stable public API and may block automated requests with a captcha or 403. When syncing succeeds, the script writes `data/google_scholar_publications.json` and Astro bundles under `src/content/publications/`. If Scholar blocks the request, rerun later or regenerate from the last cache:

```bash
python3 scripts/sync_google_scholar.py --from-cache
```

For precise metadata, abstracts, links, and figures, edit the Markdown bundles directly under `src/content/publications/`.

## Static Assets

Use `public/uploads/` for CVs, portraits, and photography assets. Publication entries keep their card images next to their Markdown source:

```text
src/content/publications/<paper-slug>/featured.png
```

## Deployment

For GitHub Pages, build with Astro and deploy `dist/`. Keep the custom domain in `public/CNAME`.
