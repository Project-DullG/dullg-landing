import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { findDeadClasses } from "../scripts/css-dead-classes.mjs";

function walk(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith(".css") ? [p] : [];
  });
}
const cssFiles = walk("styles");
const css = cssFiles.map((f) => readFileSync(f, "utf8")).join("\n");

test("no dead CSS classes", () => {
  const dead = findDeadClasses(cssFiles, ["app", "components"]);
  assert.deepEqual(dead, [], `dead classes:\n${dead.join("\n")}`);
});

test("no !important outside reduced-motion", () => {
  const stripped = css.replace(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\n\}/g, "");
  assert.equal((stripped.match(/!important/g) || []).length, 0);
});

test(":root is declared exactly once", () => {
  assert.equal((css.match(/^:root\s*\{/gm) || []).length, 1);
});

test("no line longer than 100 chars", () => {
  const long = css.split("\n").filter((l) => l.length > 100);
  assert.equal(long.length, 0, long.slice(0, 5).join("\n"));
});
