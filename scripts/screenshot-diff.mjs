// Usage: node scripts/screenshot-diff.mjs <beforeLabel> <afterLabel>
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const [before, after] = process.argv.slice(2);
if (!before || !after) { console.error("Usage: node scripts/screenshot-diff.mjs <before> <after>"); process.exit(1); }
const root = ".design-audit/public-refactor";
const diffDir = `${root}/diff-${after}`;
mkdirSync(diffDir, { recursive: true });

const rows = [];
for (const file of readdirSync(`${root}/${before}`).filter((f) => f.endsWith(".png")).sort()) {
  const a = PNG.sync.read(readFileSync(`${root}/${before}/${file}`));
  const bPath = `${root}/${after}/${file}`;
  if (!existsSync(bPath)) { rows.push([file, "MISSING", ""]); continue; }
  const b = PNG.sync.read(readFileSync(bPath));
  const width = Math.max(a.width, b.width), height = Math.max(a.height, b.height);
  const pad = (img) => { const out = new PNG({ width, height }); PNG.bitblt(img, out, 0, 0, img.width, img.height, 0, 0); return out; };
  const pa = pad(a), pb = pad(b), diff = new PNG({ width, height });
  const changed = pixelmatch(pa.data, pb.data, diff.data, width, height, { threshold: 0.1 });
  const pct = ((changed / (width * height)) * 100).toFixed(2);
  if (changed > 0) writeFileSync(`${diffDir}/${file}`, PNG.sync.write(diff));
  rows.push([file, pct + "%", a.height === b.height ? "" : `height ${a.height}→${b.height}`]);
}
for (const [f, p, note] of rows) console.log(`${p.padStart(8)}  ${f}  ${note}`);
