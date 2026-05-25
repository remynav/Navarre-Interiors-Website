/**
 * Compress marketing images to WebP and remove originals.
 * Run: npm run optimize-images
 */
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

const ASSETS_DIR = path.resolve("src/assets");
const PUBLIC_DIR = path.resolve("public");

/** @type {Record<string, { maxWidth: number; quality: number }>} */
const RULES = {
  "hero-living-room": { maxWidth: 2560, quality: 82 },
  "og-image": { maxWidth: 1200, quality: 80 },
  "palisades-map": { maxWidth: 1400, quality: 82 },
  "portfolio-amalfi": { maxWidth: 1200, quality: 82 },
  default: { maxWidth: 1920, quality: 80 },
};

const SKIP_PATTERN = /^(logo-monogram|navarre-logo|navarre-hero-logo|navarre-full-logo|footer-logo|navarre-monogram)/i;
const INPUT_EXT = /\.(jpe?g|png)$/i;

function ruleFor(basename) {
  for (const [key, rule] of Object.entries(RULES)) {
    if (key !== "default" && basename.includes(key)) return rule;
  }
  return RULES.default;
}

async function optimizeFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!INPUT_EXT.test(ext)) return null;

  const basename = path.basename(filePath, ext);
  if (SKIP_PATTERN.test(basename)) return null;

  const { maxWidth, quality } = ruleFor(basename);
  const outPath = path.join(path.dirname(filePath), `${basename}.webp`);

  const image = sharp(filePath);
  const meta = await image.metadata();

  await image
    .resize(meta.width && meta.width > maxWidth ? { width: maxWidth, withoutEnlargement: true } : undefined)
    .webp({ quality, effort: 4 })
    .toFile(outPath);

  const [beforeStat, afterStat] = await Promise.all([fs.stat(filePath), fs.stat(outPath)]);
  await fs.unlink(filePath);

  return {
    from: path.basename(filePath),
    to: path.basename(outPath),
    before: beforeStat.size,
    after: afterStat.size,
  };
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

async function main() {
  const targets = [...(await walk(ASSETS_DIR))];
  const og = path.join(PUBLIC_DIR, "og-image.jpg");
  try {
    await fs.access(og);
    targets.push(og);
  } catch {
    /* no og */
  }

  const results = [];
  for (const file of targets) {
    const result = await optimizeFile(file);
    if (result) results.push(result);
  }

  let saved = 0;
  for (const r of results) {
    saved += r.before - r.after;
    const pct = ((1 - r.after / r.before) * 100).toFixed(0);
    console.log(`${r.from} → ${r.to} (${(r.before / 1024).toFixed(0)}KB → ${(r.after / 1024).toFixed(0)}KB, -${pct}%)`);
  }
  console.log(`\nOptimized ${results.length} files, saved ${(saved / 1024 / 1024).toFixed(1)} MB total`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
