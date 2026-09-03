// One-off (Task 5): split styles/legacy/*.css into semantic files by selector,
// preserving cascade order. Comments are dropped (cosmetic only); each output
// file gets a single banner comment instead. Run once, then `git rm -r styles/legacy`.
import postcss from "postcss";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const LEGACY = "styles/legacy";
// Cascade order as currently imported in app/globals.css (dashboard.css and
// zz-* excluded/handled separately; 00-tokens.css handled separately too).
const fileOrder = [
  "01-12-product-site-system-2026-redesign.css",
  "02-18-ux-unification-calmer-type-rhythm-navigation.css",
  "03-19-editorial-pass-less-template-more-product.css",
  "04-16-business-manual-content.css",
  "05-15-activity-public-proof.css",
  "06-2-layout-nav.css",
  "07-3-home-hero.css",
  "08-4-feature-typography.css",
  "09-5-final-cta-footer.css",
  "10-6-academy-pages-shared.css",
  "11-8-sample-page.css",
  "12-9-curriculum-page.css",
  "13-7-landing-page.css",
  "15-landing-additions-form-states-hero-note-apply-benefits.css",
  "17-about-page-redesigned.css",
  "18-episode-page-redesigned.css",
  "19-contact-page.css",
  "20-14-typography-comfort-pass.css",
  "21-21-quiet-editorial-system-2026-09.css",
  "22-22-site-wide-editorial-remodel.css",
  "zz-activity-extra.css",
  "zz-work-detail.css",
  "zz-responsive.css",
];

const KEYFRAME_DEST = { spin: "academy", processCell: "home" };
// Bare classes that are dead (unreferenced in current JSX) or otherwise
// don't fit a listed prefix; assigned by grep of app/ + judgment.
const MANUAL = {
  footer: "site", // dead, superseded by .site-footer
  "hero-actions": "home", // dead, superseded by .brand-hero-actions
  "btn-spinner": "academy", // components/form-section.tsx (academy/pilot)
  consent: "academy",
  "field-required": "academy",
  "case-stamp": "academy", // dead, superseded by .ep-case-stamp
  "library-hero": "materials", // app/materials/page.tsx
};

function classify(sel) {
  const s = sel.trim();
  if (!s.includes(".")) return "base"; // html, body, *, a, h1-h6, p, :focus-visible, etc.
  // Exact class match only: `\b` treats "-" as a boundary too, so `.brand\b`
  // would wrongly match `.brand-hero`. Require the next char (if any) to not
  // continue a kebab-case identifier.
  const tok = (name) => new RegExp(`\\.${name}(?![a-zA-Z0-9_-])`).test(s);
  const pre = (prefix) => new RegExp(`\\.${prefix}[a-zA-Z0-9_-]*\\b`).test(s);

  if (tok("skip-link")) return "base";

  if (tok("site-header")) return "site";
  if (tok("nav") || tok("nav-links") || tok("nav-cta") || tok("nav-menu-button")) return "site";
  if (tok("brand") || tok("brand-mark") || tok("brand-name")) return "site";
  if (pre("mobile-navigation")) return "site";
  if (tok("shell")) return "site";
  if (pre("button")) return "site";
  if (tok("section-kicker")) return "site";
  if (pre("site-footer")) return "site";
  if (pre("text-link")) return "site";
  if (tok("inner-hero")) return "site";
  if (tok("footer")) return MANUAL.footer;

  if (pre("brand-")) return "home";
  if (tok("process-grid") || tok("process-cell")) return "home";
  if (tok("hero-actions")) return MANUAL["hero-actions"];

  if (pre("works-")) return "works";
  if (pre("live-")) return "works";
  if (pre("work-")) return "works";
  if (pre("portfolio-")) return "works";
  if (pre("funding-archive")) return "works";

  if (pre("academy-")) return "academy";
  if (pre("sample-")) return "academy";
  if (pre("gallery-")) return "academy";
  if (pre("curriculum-")) return "academy";
  if (pre("detail-")) return "academy";
  if (tok("output-pill")) return "academy";
  if (tok("mini-label")) return "academy";
  if (tok("note-section")) return "academy";
  if (pre("pilot-")) return "academy";
  if (pre("apply-form")) return "academy";
  if (pre("form-")) return "academy";
  if (pre("ep-")) return "academy";
  if (tok("btn-spinner")) return MANUAL["btn-spinner"];
  if (tok("consent")) return MANUAL.consent;
  if (tok("field-required")) return MANUAL["field-required"];
  if (tok("case-stamp")) return MANUAL["case-stamp"];

  if (pre("about-")) return "about";
  if (pre("belief-")) return "about";

  if (pre("activity-")) return "activity";

  if (pre("course-")) return "materials";
  if (pre("presentation-")) return "materials";
  if (pre("materials-")) return "materials";
  if (tok("library-hero")) return MANUAL["library-hero"];

  if (pre("contact-")) return "misc";
  if (pre("privacy-")) return "misc";
  if (pre("sitemap-")) return "misc";
  if (pre("not-found")) return "misc";

  throw new Error(`Unclassified selector: ${s}`);
}

function splitSelectorList(selectorText) {
  // No parenthesised commas exist in this codebase (verified), so a plain
  // top-level split is safe.
  return selectorText.split(",").map((s) => s.trim());
}

const dest = {
  base: [],
  site: [],
  home: [],
  works: [],
  academy: [],
  about: [],
  activity: [],
  materials: [],
  misc: [],
};

// order-preserving append with adjacent-@media merge
function push(destKey, mediaParams, ruleOrAtRule) {
  const list = dest[destKey];
  const last = list[list.length - 1];
  if (mediaParams && last && last.type === "atrule" && last.name === "media" && last.params === mediaParams) {
    last.append(ruleOrAtRule);
    return;
  }
  if (mediaParams) {
    const wrapper = postcss.atRule({ name: "media", params: mediaParams });
    wrapper.append(ruleOrAtRule);
    list.push(wrapper);
  } else {
    list.push(ruleOrAtRule);
  }
}

function handleRule(rule, mediaParams) {
  const selectors = splitSelectorList(rule.selector);
  const byDest = new Map();
  for (const sel of selectors) {
    const d = classify(sel);
    if (!byDest.has(d)) byDest.set(d, []);
    byDest.get(d).push(sel);
  }
  for (const [d, sels] of byDest) {
    const clone = rule.clone({ selector: sels.join(",\n") });
    clone.raws.before = "\n";
    push(d, mediaParams, clone);
  }
}

for (const fname of fileOrder) {
  const css = readFileSync(`${LEGACY}/${fname}`, "utf8");
  const root = postcss.parse(css, { from: fname });
  root.each((node) => {
    if (node.type === "comment") return; // dropped, cosmetic only
    if (node.type === "rule") {
      handleRule(node, null);
    } else if (node.type === "atrule" && node.name === "media") {
      node.each((child) => {
        if (child.type === "comment") return;
        if (child.type === "rule") {
          handleRule(child, node.params);
        } else {
          throw new Error(`Unexpected node in @media in ${fname}: ${child.type} ${child.selector ?? child.name}`);
        }
      });
    } else if (node.type === "atrule" && node.name === "keyframes") {
      const name = node.params.trim();
      const d = KEYFRAME_DEST[name];
      if (!d) throw new Error(`Unclassified @keyframes ${name} in ${fname}`);
      const clone = node.clone();
      clone.raws.before = "\n";
      dest[d].push(clone);
    } else {
      throw new Error(`Unexpected top-level node in ${fname}: ${node.type} ${node.name ?? ""}`);
    }
  });
}

const banners = {
  base: "RESET & BASE TYPOGRAPHY",
  site: "SITE CHROME — header, nav, shell, buttons, footer",
  home: "HOME PAGE",
  works: "WORKS / PORTFOLIO PAGES",
  academy: "ACADEMY PAGES (sample, curriculum, pilot, episode)",
  about: "ABOUT PAGE",
  activity: "ACTIVITY PAGE",
  materials: "MATERIALS PAGE",
  misc: "MISC PAGES — contact, privacy, sitemap",
};

mkdirSync("styles/pages", { recursive: true });
const fileFor = {
  base: "styles/base.css",
  site: "styles/site.css",
  home: "styles/pages/home.css",
  works: "styles/pages/works.css",
  academy: "styles/pages/academy.css",
  about: "styles/pages/about.css",
  activity: "styles/pages/activity.css",
  materials: "styles/pages/materials.css",
  misc: "styles/pages/misc.css",
};

for (const key of Object.keys(dest)) {
  const root = postcss.root();
  const banner = postcss.comment({ text: ` ${banners[key]} ` });
  root.append(banner);
  for (const node of dest[key]) root.append(node);
  let out = root.toString();
  if (key === "base") out = `@import "tailwindcss";\n\n${out}`;
  writeFileSync(fileFor[key], out.trimStart() + "\n");
}

console.log("Wrote:", Object.values(fileFor).join(", "));
