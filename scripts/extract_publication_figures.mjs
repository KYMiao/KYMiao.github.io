import { createWriteStream, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { get } from "node:https";
import { basename, extname, join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import sharp from "sharp";

const root = new URL("..", import.meta.url).pathname;
const publicationsDir = join(root, "src/content/publications");
const args = new Set(process.argv.slice(2));
const overwrite = args.has("--overwrite");
const dryRun = args.has("--dry-run");
const embeddedOnly = args.has("--embedded-only");
const minBytes = Number(process.argv.find((arg) => arg.startsWith("--min-bytes="))?.split("=")[1] || 20_000);
const knownPdfUrls = {
  "data-enabled-predictive-control-for-nonlinear-systems-based-on-a-koopman-bilinear-realization": "https://arxiv.org/pdf/2505.03346",
  "learning-koopman-representations-with-controllability-guarantees": "https://openreview.net/pdf?id=jITPFROpWN",
  "learning-neural-controllers-with-optimality-and-stability-guarantees-using-input-output-dissipativity": "https://arxiv.org/pdf/2506.06564",
  "nlbac-a-neural-ode-based-algorithm-for-state-wise-stable-and-safe-reinforcement-learning": "https://arxiv.org/pdf/2401.13148",
  "nlbac-a-neural-ordinary-differential-equations-based-framework-for-stable-and-safe-reinforcement-learning": "https://arxiv.org/pdf/2401.13148",
  "opt-odenet-a-neural-ode-framework-with-differentiable-qp-layers-for-safe-and-stable-control-design-longer-version": "https://arxiv.org/pdf/2504.17139",
};

function hasCommand(command) {
  return spawnSync("which", [command], { stdio: "ignore" }).status === 0;
}

function readText(path) {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function pdfUrlFor(bundle, slug) {
  if (knownPdfUrls[slug]) return knownPdfUrls[slug];

  const bib = readText(join(bundle, "cite.bib"));
  const md = readText(join(bundle, "index.md"));
  const combined = `${bib}\n${md}`;

  const pdfMatch = combined.match(/pdf\s*=\s*[{"'](https?:\/\/[^}"']+)[}"']/i);
  if (pdfMatch) return pdfMatch[1];

  const frontmatterPdf = combined.match(/(?:^|\n)pdf:\s*["']?(https?:\/\/[^\s"']+)["']?/i);
  if (frontmatterPdf) return frontmatterPdf[1];

  const arxivMatch = combined.match(/arxiv(?:\s*preprint)?[:\s/]+(\d{4}\.\d{4,5})/i);
  if (arxivMatch) return `https://arxiv.org/pdf/${arxivMatch[1]}`;

  const openReviewMatch = combined.match(/https:\/\/openreview\.net\/forum\?id=([A-Za-z0-9_-]+)/);
  if (openReviewMatch) return `https://openreview.net/pdf?id=${openReviewMatch[1]}`;

  return "";
}

function download(url, target) {
  return new Promise((resolve) => {
    const file = createWriteStream(target);
    get(url, { headers: { "User-Agent": "KYMiao.github.io figure extractor" } }, (response) => {
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        file.close();
        rmSync(target, { force: true });
        download(response.headers.location, target).then(resolve);
        return;
      }

      if (response.statusCode !== 200) {
        file.close();
        rmSync(target, { force: true });
        resolve(false);
        return;
      }

      response.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve(true);
      });
    }).on("error", () => {
      file.close();
      rmSync(target, { force: true });
      resolve(false);
    });
  });
}

function extractedCandidates(pdf, workDir) {
  spawnSync("pdfimages", ["-f", "1", "-l", "4", "-png", pdf, join(workDir, "figure")], {
    stdio: "ignore",
  });

  return readdirSync(workDir)
    .filter((file) => /^figure-.+\.png$/.test(file))
    .map((file) => join(workDir, file))
    .filter((file) => statSync(file).size > minBytes)
    .sort((a, b) => basename(a).localeCompare(basename(b), undefined, { numeric: true }));
}

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function parseBboxPages(html) {
  const pages = [];
  const pageRegex = /<page[^>]*width="([^"]+)"[^>]*height="([^"]+)"[^>]*>([\s\S]*?)<\/page>/g;
  let pageMatch;

  while ((pageMatch = pageRegex.exec(html))) {
    const words = [];
    const wordRegex = /<word[^>]*xMin="([^"]+)"[^>]*yMin="([^"]+)"[^>]*xMax="([^"]+)"[^>]*yMax="([^"]+)"[^>]*>([\s\S]*?)<\/word>/g;
    let wordMatch;

    while ((wordMatch = wordRegex.exec(pageMatch[3]))) {
      words.push({
        xMin: Number(wordMatch[1]),
        yMin: Number(wordMatch[2]),
        xMax: Number(wordMatch[3]),
        yMax: Number(wordMatch[4]),
        text: decodeEntities(wordMatch[5]).trim(),
      });
    }

    pages.push({
      width: Number(pageMatch[1]),
      height: Number(pageMatch[2]),
      words,
    });
  }

  return pages;
}

function firstFigureCaption(pdf, workDir) {
  const bbox = join(workDir, "bbox.html");
  const result = spawnSync("pdftotext", ["-f", "1", "-l", "6", "-bbox", pdf, bbox], {
    stdio: "ignore",
  });
  if (result.status !== 0 || !existsSync(bbox)) return null;

  const pages = parseBboxPages(readText(bbox));
  for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
    const page = pages[pageIndex];
    for (let i = 0; i < page.words.length - 1; i += 1) {
      const current = page.words[i].text.replace(/[.:]/g, "").toLowerCase();
      const next = page.words[i + 1].text.replace(/[.:]/g, "");
      if ((current === "figure" || current === "fig") && next === "1") {
        const y = page.words[i].yMin;
        const lineWords = page.words.filter((word) => Math.abs(word.yMin - y) < 4.5);
        const xMin = Math.min(...lineWords.map((word) => word.xMin));
        const xMax = Math.max(...lineWords.map((word) => word.xMax));
        return { pageNumber: pageIndex + 1, page, xMin, xMax, yMin: y };
      }
    }
  }

  return null;
}

async function cropFirstFigure(pdf, workDir) {
  const caption = firstFigureCaption(pdf, workDir);
  if (!caption) return "";

  const prefix = join(workDir, "figure-page");
  const result = spawnSync("pdftoppm", [
    "-f",
    String(caption.pageNumber),
    "-l",
    String(caption.pageNumber),
    "-png",
    "-r",
    "220",
    pdf,
    prefix,
  ], { stdio: "ignore" });
  if (result.status !== 0) return "";

  const rendered = readdirSync(workDir)
    .filter((file) => /^figure-page-.+\.png$/.test(file))
    .map((file) => join(workDir, file))
    .sort((a, b) => statSync(b).size - statSync(a).size)[0];
  if (!rendered) return "";

  const metadata = await sharp(rendered).metadata();
  if (!metadata.width || !metadata.height) return "";

  const scaleX = metadata.width / caption.page.width;
  const scaleY = metadata.height / caption.page.height;
  const captionTop = caption.yMin * scaleY;
  const captionWidth = (caption.xMax - caption.xMin) / caption.page.width;
  const captionCenter = ((caption.xMin + caption.xMax) / 2) / caption.page.width;

  let left = Math.round(metadata.width * 0.06);
  let width = Math.round(metadata.width * 0.88);
  if (captionWidth < 0.42) {
    const gutter = metadata.width * 0.035;
    if (captionCenter < 0.5) {
      left = Math.round(metadata.width * 0.06);
      width = Math.round(metadata.width * 0.44 - gutter);
    } else {
      left = Math.round(metadata.width * 0.5 + gutter);
      width = Math.round(metadata.width * 0.44 - gutter);
    }
  }

  left = Math.round(Math.max(0, Math.min(left, metadata.width - 2)));
  width = Math.round(Math.max(1, Math.min(width, metadata.width - left)));

  const bottom = Math.max(1, Math.min(metadata.height, Math.round(captionTop - metadata.height * 0.018)));
  const top = Math.max(0, Math.min(bottom - 1, Math.max(Math.round(metadata.height * 0.055), Math.round(bottom - metadata.height * 0.34))));
  const height = Math.round(Math.max(1, Math.min(bottom - top, metadata.height - top)));
  if (height < metadata.height * 0.08) return "";

  const target = join(workDir, "figure-1-crop.png");
  try {
    await sharp(rendered)
      .extract({ left, top, width, height })
      .png()
      .toFile(target);
  } catch (error) {
    console.warn(
      `Crop failed for page ${caption.pageNumber}: image=${metadata.width}x${metadata.height}, crop=${left},${top},${width}x${height}`
    );
    return "";
  }

  return target;
}

function copyFile(source, target) {
  const bytes = readFileSync(source);
  writeFileSync(target, bytes);
}

function ensureFrontmatterImage(mdPath) {
  const text = readText(mdPath);
  if (!text.startsWith("---") || /(^|\n)image:\n\s+filename:\s+"featured\.png"/.test(text)) return;
  const end = text.indexOf("\n---", 3);
  if (end < 0) return;
  const next = `${text.slice(0, end)}\nimage:\n  filename: "featured.png"${text.slice(end)}`;
  writeFileSync(mdPath, next);
}

async function main() {
  if (!hasCommand("pdfimages") || (!embeddedOnly && (!hasCommand("pdftotext") || !hasCommand("pdftoppm")))) {
    console.error("This script needs poppler tools: pdfimages, pdftotext, and pdftoppm.");
    process.exit(2);
  }

  const bundles = readdirSync(publicationsDir)
    .map((slug) => join(publicationsDir, slug))
    .filter((path) => statSync(path).isDirectory());

  let updated = 0;
  let skipped = 0;

  for (const bundle of bundles) {
    const slug = basename(bundle);
    const target = join(bundle, "featured.png");
    if (existsSync(target) && !overwrite) {
      skipped += 1;
      continue;
    }

    const url = pdfUrlFor(bundle, slug);
    if (!url) {
      console.warn(`No PDF URL found for ${slug}`);
      skipped += 1;
      continue;
    }

    const workDir = join(tmpdir(), `km-figures-${slug}-${Date.now()}`);
    mkdirSync(workDir, { recursive: true });
    const pdf = join(workDir, "paper.pdf");
    const ok = await download(url, pdf);
    if (!ok) {
      console.warn(`Could not download PDF for ${slug}`);
      rmSync(workDir, { recursive: true, force: true });
      skipped += 1;
      continue;
    }

    const candidates = extractedCandidates(pdf, workDir);
    const source = candidates[0] || (!embeddedOnly ? await cropFirstFigure(pdf, workDir) : "");
    if (!source) {
      console.warn(`Could not extract Figure 1 for ${slug}`);
      rmSync(workDir, { recursive: true, force: true });
      skipped += 1;
      continue;
    }

    if (!dryRun) {
      copyFile(source, target);
      ensureFrontmatterImage(join(bundle, "index.md"));
    }
    console.log(`${dryRun ? "Would update" : "Updated"} ${slug} from ${url}`);
    rmSync(workDir, { recursive: true, force: true });
    updated += 1;
  }

  console.log(`${dryRun ? "Would update" : "Updated"} ${updated}; skipped ${skipped}.`);
}

main();
