import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";

// Import a user-supplied standalone build without executing its scripts.
const input = process.argv[2];
if (!input) throw new Error("Provide the standalone HTML path.");
const out = new URL("../public/assets/last-screening/", import.meta.url);
await mkdir(new URL("media/", out), { recursive: true });
let html = await readFile(input, "utf8");
const hash = createHash("sha256").update(html).digest("hex");
const match = html.match(/window\.ASSETS = (.*?);\s*<\/script>/s);
if (!match) throw new Error("Missing asset manifest");
const assets = JSON.parse(match[1]);
const extensions = { "image/webp": "webp", "audio/ogg": "ogg", "audio/mpeg": "mp3", "audio/wav": "wav" };
for (const [name, uri] of Object.entries(assets)) {
  if (!/^[a-z0-9_]+$/.test(name)) throw new Error("Unsafe asset name");
  const data = uri.match(/^data:([^;]+);base64,([A-Za-z0-9+/=]+)$/);
  if (!data || !extensions[data[1]]) throw new Error("Unsupported asset: " + name);
  const path = `media/${name}.${extensions[data[1]]}`;
  await writeFile(new URL(path, out), Buffer.from(data[2], "base64"));
  assets[name] = "./" + path;
}
html = html.replace(match[1], JSON.stringify(assets));
const modules = ["assets", "story", "story-expansion", "case-rules", "editorial", "narrative-data", "narrative-patch", "observations", "model", "guide", "deduction", "opening", "clock", "reactions-data", "reactions", "comfort", "echo-data", "echo", "abilities", "content-data", "content", "progression", "short-cases-data", "short-cases", "storage", "bgm-policy", "music-mixer", "sound", "portrait-bounds", "presentation-cues", "presentation", "cinematic", "conversation-view", "content-view", "growth-view", "short-cases-view", "echo-view", "series-patch", "joseon", "continuity", "app", "academy-intake", "academy", "meta", "meta-view"];
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)];
if (scripts.length !== modules.length) throw new Error("Unexpected script order");
for (const [i, script] of scripts.entries()) {
  const name = modules[i] + ".js";
  await writeFile(new URL(name, out), script[1].trim() + "\n");
  html = html.replace(script[0], `<script src="./${name}"></script>`);
}
const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)];
await writeFile(new URL("game.css", out), styles.map((s) => s[1]).join("\n"));
html = html.replace(styles[0][0], '<link rel="stylesheet" href="./game.css"><link rel="stylesheet" href="./site.css">');
for (const style of styles.slice(1)) html = html.replace(style[0], "");
html = html.replace("<head>", '<head><meta name="robots" content="noindex,follow">');
html = html.replace("</body>", '<a class="studio-return" href="/games/last-screening">← 게임 소개</a></body>');
await writeFile(new URL("index.html", out), html);
await sharp(new URL("media/echo_title.webp", out).pathname).resize({ width: 1440, withoutEnlargement: true }).webp({ quality: 84 }).toFile(new URL("cover.webp", out).pathname);
await writeFile(new URL("provenance.json", out), JSON.stringify({ version: "0.79.0", sourceSha256: hash, modules, assetCount: Object.keys(assets).length }, null, 2));
console.log(`Imported ${modules.length} modules and ${Object.keys(assets).length} assets`);
