import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { basename, extname, join } from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));
const publicationSource = join(root, "src/content/publications");
const publicationTarget = join(root, "public/publications");
const copyExtensions = new Set([".bib", ".jpg", ".jpeg", ".png", ".webp", ".pdf"]);

function copyPublicationAssets() {
  if (!existsSync(publicationSource)) return;
  rmSync(publicationTarget, { recursive: true, force: true });
  mkdirSync(publicationTarget, { recursive: true });

  for (const slug of readdirSync(publicationSource)) {
    const sourceDir = join(publicationSource, slug);
    if (!statSync(sourceDir).isDirectory()) continue;

    const files = readdirSync(sourceDir).filter((file) => copyExtensions.has(extname(file).toLowerCase()));
    if (!files.length) continue;

    const targetDir = join(publicationTarget, basename(slug));
    mkdirSync(targetDir, { recursive: true });
    for (const file of files) {
      copyFileSync(join(sourceDir, file), join(targetDir, file));
    }
  }
}

copyPublicationAssets();
