// Usage: node scripts/set-owner-claim.mjs <user-uid>
// Requires: FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY in .env.local

import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { readFileSync } from "fs";

// Parse .env.local
const envFile = readFileSync(".env.local", "utf-8");
const env = Object.fromEntries(
  envFile.split("\n").filter((l) => l && !l.startsWith("#")).map((l) => l.split("=").map((s) => s.trim()))
);

const app = initializeApp({
  credential: cert({
    projectId: env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});

const uid = process.argv[2];
if (!uid) {
  console.error("Usage: node scripts/set-owner-claim.mjs <user-uid>");
  process.exit(1);
}

await getAuth(app).setCustomUserClaims(uid, { role: "owner" });
console.log(`✓ Set role=owner for UID: ${uid}`);
console.log("  User must log out and log back in for claims to take effect.");
