import { chromium } from "playwright";
const url = process.argv[2] || "http://localhost:3000/about";
const out = process.argv[3] || "/tmp/diag.json";
const sels = [
  ".about-hero h1", ".about-hero-copy h1", ".about-hero-copy h1 em", ".about-hero-copy p",
  ".about-scope-head h2", ".about-scope-head h2 em", ".about-scope-head > p",
  ".about-scope-grid h3", ".about-scope-grid p", ".about-scope-grid span",
  ".about-brand h2", ".about-brand > div > p", ".about-brand dt", ".about-brand dd",
  ".about-beliefs-head h2", ".about-beliefs-head h2 em",
  ".belief-item strong", ".belief-item p",
  ".about-now-copy h2", ".about-now-copy p", ".about-now-copy p em",
  ".about-now-badge b", ".about-now-badge span",
];
const props = ["font-size","line-height","letter-spacing","font-family","font-weight","margin","padding","color","max-width"];
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 900 } });
await p.goto(url, { waitUntil: "networkidle" });
const data = {};
for (const sel of sels) {
  const el = await p.$(sel);
  if (!el) { data[sel] = "MISSING"; continue; }
  data[sel] = await el.evaluate((node, props) => {
    const cs = getComputedStyle(node);
    const o = {};
    for (const pr of props) o[pr] = cs.getPropertyValue(pr);
    return o;
  }, props);
}
data.__bodyHeight = await p.evaluate(() => document.body.scrollHeight);
await b.close();
const fs = await import("node:fs");
fs.writeFileSync(out, JSON.stringify(data, null, 2));
console.log("wrote", out);
