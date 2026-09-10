import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { publicRoutes } from "../lib/routes.ts";
import { works } from "../lib/works.ts";
import { miniProjects } from "../lib/mini-projects.ts";
const origin = process.argv[2] || "http://localhost:3100";
const save = process.argv.includes("--save");
const routes = [
  ...publicRoutes.filter((r) => !r.noIndex).map((r) => r.path),
  "/login",
  "/demo",
  ...works.map((w) => `/works/${w.slug}`),
  ...miniProjects.map((p) => `/mini-projects/${p.slug}`),
];
const results = [];
for (let i = 0; i < routes.length; i += 4) {
  await Promise.all(
    routes.slice(i, i + 4).map(async (path) => {
      for (const locale of ["ko", "en"]) {
        const url = `${origin}${locale === "en" ? "/en" : ""}${path === "/" ? "" : path}`;
        const response = await fetch(url, { signal: AbortSignal.timeout(120000) });
        const html = await response.text();
        if (!response.ok || !html.includes(`<html lang="${locale}"`))
          throw new Error(
            `${locale} ${path}: status ${response.status}, document ${html.match(/<html[^>]*lang="([^"]+)"/)?.[1]}, header ${response.headers.get("content-language")}`,
          );
        const clean = html
          .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
        const text = clean
          .replace(/<[^>]+>/g, "\n")
          .split("\n")
          .map((t) => t.trim())
          .filter(Boolean);
        const untranslated =
          locale === "en"
            ? [...new Set(text.filter((t) => /[가-힣]/.test(t) && t !== "한국어"))]
            : [];
        const attributes =
          locale === "en"
            ? [...clean.matchAll(/(?:aria-label|alt|placeholder|content)="([^"]+)"/g)]
                .map((m) => m[1])
                .filter((t) => /[가-힣]/.test(t) && t !== "이 페이지를 한국어로 보기")
            : [];
        results.push({ path, locale, untranslated, attributes });
        if (save) {
          const relative =
            (locale === "en" ? "en/" : "") + (path === "/" ? "index" : path.slice(1));
          const file = join(".test-output/pages", relative + ".html");
          await mkdir(join(file, ".."), { recursive: true });
          await writeFile(file, html);
        }
      }
    }),
  );
  console.log(
    `Checked ${Math.min(i + 4, routes.length)}/${routes.length} routes in both languages`,
  );
}
await mkdir(".next", { recursive: true });
for (const prefix of ["", "/en"]) {
  const response = await fetch(`${origin}${prefix}/dashboard`, { redirect: "manual" });
  const destination = new URL(response.headers.get("location") || "/", origin).pathname;
  if (![307, 308].includes(response.status) || destination !== `${prefix}/login`)
    throw new Error(`Dashboard login redirect lost its locale: ${prefix || "ko"}`);
}
if (save) {
  for (const route of ["sitemap.xml", "robots.txt"]) {
    const response = await fetch(`${origin}/${route}`);
    if (!response.ok) throw new Error(`Unable to read ${route}: ${response.status}`);
    await writeFile(join(".test-output/pages", route + ".body"), await response.text());
  }
}
await writeFile(".next/translation-coverage.json", JSON.stringify(results, null, 2));
console.log(
  JSON.stringify(
    results.filter((r) => r.untranslated.length || r.attributes.length),
    null,
    2,
  ),
);
if (results.some((r) => r.untranslated.length || r.attributes.length)) process.exitCode = 1;
