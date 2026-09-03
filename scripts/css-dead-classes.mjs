// Usage: node scripts/css-dead-classes.mjs [css files...]  (default: app/globals.css styles/**/*.css)
// Lists CSS class names never referenced in app/ or components/ .tsx files.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const DYNAMIC_OK = [/^is-(green|amber|red)$/, /^detail-art-\d$/];

function walk(dir, ext) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p, ext));
    else if (p.endsWith(ext)) out.push(p);
  }
  return out;
}

export function findDeadClasses(cssFiles, tsxRoots) {
  const css = cssFiles.map((f) => readFileSync(f, "utf8")).join("\n").replace(/\/\*[\s\S]*?\*\//g, "");
  const classes = new Set([...css.matchAll(/\.([a-zA-Z_][\w-]*)/g)].map((m) => m[1]));
  const tsx = tsxRoots.flatMap((r) => walk(r, ".tsx")).map((f) => readFileSync(f, "utf8")).join("\n");
  return [...classes].filter((c) => !DYNAMIC_OK.some((re) => re.test(c)) && !tsx.includes(c)).sort();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const cssFiles = args.length ? args : ["app/globals.css", ...(statSync("styles", { throwIfNoEntry: false }) ? walk("styles", ".css") : [])];
  const dead = findDeadClasses(cssFiles, ["app", "components"]);
  console.log(dead.join("\n"));
  console.error(`${dead.length} dead classes`);
}
