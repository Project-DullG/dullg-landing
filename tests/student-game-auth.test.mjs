import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import {
  dashboardPathAllowedForRole,
  loginPath,
  normalizeDashboardReturnPath,
  normalizeStudentGameReturnPath,
  postLoginPath,
} from "../lib/auth-navigation.ts";

const publicPages = [
  "/student-games/index.html",
  "/student-games/island-snap/index.html",
  "/student-games/missing-log/index.html",
  "/student-games/island-market/index.html",
];
const roles = [undefined, "student", "owner"];
const query = "?participate=1&pick=island-snap";
const rejected = [
  undefined, null, ["/student-games/index.html"],
  "https://evil.example/student-games/index.html",
  "//evil.example/student-games/index.html",
  "/\\evil.example/student-games/index.html",
  "/student-games", "/student-games/", "/student-games/index.htm",
  "/student-games-evil/index.html", "/student-games/index.html-evil",
  "/student-games/index.html/extra", "/student-games/index.html.evil",
  "/student-games/other/index.html", "/student-games/island-snap/table.html",
  "/student-games/island-snap/print.html", "/student-games/island-snap/index.html/extra",
  "/student-games//index.html", "/student-games/../dashboard",
  "/student-games/./index.html", "/student-games/%69ndex.html",
  "/student-games/%2e%2e/dashboard", "/student-games/%252e%252e/dashboard",
  "/student-games%2findex.html", "/student-games/%5cindex.html",
  "/en/student-games/index.html", "/en/en/student-games/index.html",
  "/student-games/index.html#vote", "/student-games/index.html?participate=1#vote",
  "/student-games/index.html\n",
  "/student-games/index.html?participate=1\r\nLocation:https://evil.example",
];

function loadModule(path, mocks) {
  const { outputText } = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    fileName: path,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  });
  const exports = {};
  vm.runInNewContext(outputText, {
    exports, URL, Request, Response,
    require: name => {
      assert.ok(Object.hasOwn(mocks, name), "Unexpected dependency: " + name);
      return mocks[name];
    },
  });
  return exports;
}

test("all four exact game pages and queries survive login for unassigned, student and owner accounts", () => {
  for (const page of publicPages) {
    for (const requested of [page, page + query]) {
      assert.equal(normalizeDashboardReturnPath(requested), requested);
      assert.equal(normalizeStudentGameReturnPath(requested), requested);
      const login = new URL(loginPath(requested), "https://site.example");
      assert.equal(login.pathname, "/login");
      assert.equal(login.searchParams.get("next"), requested);
      for (const role of roles) {
        assert.equal(dashboardPathAllowedForRole(requested, role), true);
        assert.equal(postLoginPath(role, login.searchParams.get("next")), requested);
      }
    }
  }
});

test("game returns reject nearby, encoded, hash, external and role-only targets", () => {
  for (const target of rejected) {
    assert.equal(normalizeStudentGameReturnPath(target), null, String(target));
    assert.equal(normalizeDashboardReturnPath(target), null, String(target));
    assert.equal(loginPath(target), "/login", String(target));
  }
  for (const target of ["/dashboard", "/dashboard/students?new=1", "/english", "/english/community"]) {
    assert.equal(normalizeStudentGameReturnPath(target), null, target);
  }
  assert.equal(dashboardPathAllowedForRole("/dashboard/students", undefined), false);
  assert.equal(dashboardPathAllowedForRole("/dashboard/students", "student"), false);
});

test("logout clears the cookie before redirecting only to an allowed public game page", async () => {
  const calls = [];
  const route = loadModule("../app/logout/route.ts", {
    "next/server": {
      NextResponse: {
        redirect(url) {
          calls.push("redirect");
          return new Response(null, { status: 307, headers: { Location: String(url) } });
        },
      },
    },
    "@/lib/firebase/auth": { clearSession: async () => { calls.push("clear"); } },
    "@/lib/auth-navigation": { normalizeStudentGameReturnPath },
  });
  for (const target of [
    null, ...publicPages, ...publicPages.map(page => page + query),
    ...rejected.filter(value => typeof value === "string"),
    "/dashboard", "/dashboard/students", "/english/community",
  ]) {
    calls.length = 0;
    const url = new URL("https://site.example/logout");
    if (target !== null) url.searchParams.set("next", target);
    const response = await route.GET(new Request(url));
    const expected = normalizeStudentGameReturnPath(target) ?? "/login";
    assert.equal(response.headers.get("location"), new URL(expected, url).href, String(target));
    assert.equal(response.status, 307);
    assert.match(response.headers.get("cache-control"), /private, no-store/);
    assert.deepEqual(calls, ["clear", "redirect"]);
  }
});

test("an already signed-in account returns from the login page to the requested game, regardless of role", async () => {
  let session;
  const page = loadModule("../app/login/page.tsx", {
    "react/jsx-runtime": { jsx: (component, props) => ({ component, props }) },
    "@/lib/firebase/auth": { verifySession: async () => session },
    "@/lib/auth-navigation": { normalizeDashboardReturnPath, normalizeStudentGameReturnPath, postLoginPath },
    "@/lib/i18n/server": { localizedRedirect: async path => ({ destination: path }) },
    "./login-form": { default: function LoginForm() {} },
  }).default;
  for (const role of roles) {
    session = { uid: "existing-user", role };
    for (const target of publicPages.map(path => path + query)) {
      const result = await page({ searchParams: Promise.resolve({ next: target }) });
      assert.equal(result.destination, target);
    }
  }
  session = null;
  const guest = await page({ searchParams: Promise.resolve({ next: publicPages[0] + query }) });
  assert.equal(guest.props.nextPath, publicPages[0] + query);
  const unsafe = await page({ searchParams: Promise.resolve({ next: "https://evil.example/" }) });
  assert.equal(unsafe.props.nextPath, null);
});

test("anonymous gallery sessions reach Google sign-in without changing English or dashboard redirects", async () => {
  let session = { uid: "anonymous-user", firebase: { sign_in_provider: "anonymous" } };
  const page = loadModule("../app/login/page.tsx", {
    "react/jsx-runtime": { jsx: (component, props) => ({ component, props }) },
    "@/lib/firebase/auth": { verifySession: async () => session },
    "@/lib/auth-navigation": { normalizeDashboardReturnPath, normalizeStudentGameReturnPath, postLoginPath },
    "@/lib/i18n/server": { localizedRedirect: async path => ({ destination: path }) },
    "./login-form": { default: function LoginForm() {} },
  }).default;
  for (const target of publicPages.map(path => path + query)) {
    const result = await page({ searchParams: Promise.resolve({ next: target }) });
    assert.equal(result.destination, undefined);
    assert.equal(result.props.nextPath, target);
  }
  for (const target of ["/english", "/english/community", "/dashboard/notebook"]) {
    const result = await page({ searchParams: Promise.resolve({ next: target }) });
    assert.equal(result.destination, target);
  }
  const defaultReturn = await page({ searchParams: Promise.resolve({}) });
  assert.equal(defaultReturn.destination, "/dashboard/notebook");
  for (const provider of ["google.com", "password", "custom"]) {
    session = { uid: "registered-user", firebase: { sign_in_provider: provider } };
    const result = await page({ searchParams: Promise.resolve({ next: publicPages[0] + query }) });
    assert.equal(result.destination, publicPages[0] + query);
  }
});
