// One-off: split app/globals.css into styles/ modules by section header, preserving order.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const src = readFileSync("app/globals.css", "utf8").split("\n");
const headerRe = /^\/\* =+$/;
// [startLine(1-based), targetFile]
const sections = [];
for (let i = 0; i < src.length; i++) {
  if (headerRe.test(src[i]) && src[i + 1]) sections.push({ start: i, title: src[i + 1].trim() });
}
const target = (title) => {
  if (/TOKENS/.test(title)) return "styles/legacy/00-tokens.css";
  if (/DASHBOARD|LOGIN/.test(title)) return "styles/dashboard.css";
  return `styles/legacy/${String(sections.findIndex((s) => s.title === title)).padStart(2, "0")}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}.css`;
};
mkdirSync("styles/legacy", { recursive: true });
const files = new Map();
sections.forEach((s, idx) => {
  const end = idx + 1 < sections.length ? sections[idx + 1].start : src.length;
  const chunk = src.slice(s.start, end).join("\n");
  const file = target(s.title);
  files.set(file, (files.get(file) ?? "") + chunk + "\n");
});
// lines before the first header (should be only the @import/font comment lines) go to tokens
const preamble = src.slice(0, sections[0].start).join("\n");
files.set("styles/legacy/00-tokens.css", preamble + "\n" + files.get("styles/legacy/00-tokens.css"));
for (const [file, content] of files) writeFileSync(file, content);
const imports = [...files.keys()].map((f) => `@import "../${f}";`).join("\n") + "\n";
writeFileSync("app/globals.css", imports);
console.log([...files.keys()].join("\n"));
