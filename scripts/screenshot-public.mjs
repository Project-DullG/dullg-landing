// Usage: node scripts/screenshot-public.mjs <label>
// Captures every public route at 1440/834/390 widths into .design-audit/public-refactor/<label>/
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { spawn } from "node:child_process";

const label = process.argv[2];
if (!label) { console.error("Usage: node scripts/screenshot-public.mjs <label>"); process.exit(1); }

export const PUBLIC_ROUTES = [
  "/", "/works", "/works/snake-carnival", "/academy", "/academy/curriculum", "/academy/sample",
  "/academy/pilot", "/episode", "/materials", "/materials/ulleung-high-living-lab", "/about",
  "/activity", "/activity/ulleung-high-living-lab", "/contact", "/privacy", "/sitemap",
];
export const WIDTHS = [1440, 834, 390];
const BASE = process.env.BASE_URL ?? "http://localhost:3000";

async function serverUp() {
  try { const r = await fetch(BASE, { redirect: "manual" }); return r.status < 500; } catch { return false; }
}

let devServer = null;
if (!(await serverUp())) {
  devServer = spawn("npm", ["run", "dev"], { stdio: "ignore", detached: true });
  for (let i = 0; i < 40 && !(await serverUp()); i++) await new Promise((r) => setTimeout(r, 1500));
}

const outDir = `.design-audit/public-refactor/${label}`;
mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
for (const width of WIDTHS) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const route of PUBLIC_ROUTES) {
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
    // settle fonts/images
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    const name = route === "/" ? "home" : route.slice(1).replaceAll("/", "__");
    await page.screenshot({ path: `${outDir}/${name}-${width}.png`, fullPage: true });
    console.log(`✓ ${name}-${width}`);
  }
  await page.close();
}
await browser.close();
if (devServer) process.kill(-devServer.pid);
