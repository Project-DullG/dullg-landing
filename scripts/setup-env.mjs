// Usage: node scripts/setup-env.mjs <service-account.json> [--web <sdkconfig.json>]
//
// Fills FIREBASE_ADMIN_* (and optionally NEXT_PUBLIC_FIREBASE_*) in .env.local
// from a downloaded service-account key and/or `firebase apps:sdkconfig web --json` output.
// Existing lines are replaced in place; other lines are left untouched.

import { readFileSync, writeFileSync, existsSync } from "fs";

const ENV_PATH = ".env.local";
const args = process.argv.slice(2);
const saPath = args.find((a) => !a.startsWith("--") && args[args.indexOf(a) - 1] !== "--web");
const webIdx = args.indexOf("--web");
const webPath = webIdx >= 0 ? args[webIdx + 1] : null;

if (!saPath && !webPath) {
  console.error("Usage: node scripts/setup-env.mjs <service-account.json> [--web <sdkconfig.json>]");
  process.exit(1);
}

const updates = {};

if (saPath) {
  const sa = JSON.parse(readFileSync(saPath, "utf-8"));
  updates.FIREBASE_ADMIN_PROJECT_ID = sa.project_id;
  updates.FIREBASE_ADMIN_CLIENT_EMAIL = sa.client_email;
  // Store the PEM on one line; admin.ts restores real newlines with .replace(/\\n/g, "\n").
  updates.FIREBASE_ADMIN_PRIVATE_KEY = `"${sa.private_key.replace(/\n/g, "\\n")}"`;
}

if (webPath) {
  const raw = JSON.parse(readFileSync(webPath, "utf-8"));
  // `firebase apps:sdkconfig web --json` wraps the config as a JSON string in result.fileContents.
  const inner = raw.result?.fileContents ?? raw.fileContents;
  const cfg = inner ? JSON.parse(inner) : (raw.result?.sdkConfig ?? raw.sdkConfig ?? raw);
  updates.NEXT_PUBLIC_FIREBASE_API_KEY = cfg.apiKey;
  updates.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = cfg.authDomain;
  updates.NEXT_PUBLIC_FIREBASE_PROJECT_ID = cfg.projectId;
  updates.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = cfg.storageBucket;
  updates.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = cfg.messagingSenderId;
  updates.NEXT_PUBLIC_FIREBASE_APP_ID = cfg.appId;
}

const base = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, "utf-8") : readFileSync(".env.local.example", "utf-8");
const lines = base.split("\n");
const seen = new Set();

const out = lines.map((line) => {
  const m = line.match(/^([A-Z0-9_]+)=/);
  if (m && m[1] in updates) {
    seen.add(m[1]);
    return `${m[1]}=${updates[m[1]]}`;
  }
  return line;
});

for (const [k, v] of Object.entries(updates)) {
  if (!seen.has(k)) out.push(`${k}=${v}`);
}

writeFileSync(ENV_PATH, out.join("\n"));
console.log(`✓ Updated ${ENV_PATH}: ${Object.keys(updates).join(", ")}`);
