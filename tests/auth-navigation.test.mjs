import assert from "node:assert/strict";
import { test } from "node:test";
import {
  dashboardPathAllowedForRole,
  loginPath,
  normalizeDashboardReturnPath,
  postLoginPath,
} from "../lib/auth-navigation.ts";

test("student registration path and query survive the login round trip", () => {
  const requested = "/dashboard/students?new=1&class=morning%20class";
  const login = new URL(loginPath(requested), "https://site.example");
  assert.equal(login.pathname, "/login");
  assert.equal(login.searchParams.get("next"), requested);
  assert.equal(postLoginPath("owner", login.searchParams.get("next")), requested);
});

test("English dashboard targets normalize once and keep their query", () => {
  assert.equal(
    normalizeDashboardReturnPath("/en/dashboard/students?new=1"),
    "/dashboard/students?new=1",
  );
  assert.equal(postLoginPath("owner", "/en/dashboard?view=recent"), "/dashboard?view=recent");
  assert.equal(normalizeDashboardReturnPath("/en/en/dashboard/students?new=1"), null);
});

test("reject external redirects, non-dashboard targets, and ambiguous encodings", () => {
  const rejected = [
    undefined,
    null,
    ["/dashboard/students?new=1"],
    "https://evil.example/dashboard",
    "//evil.example/dashboard",
    "/\\evil.example/dashboard",
    "/login?next=/dashboard",
    "/dashboard-evil",
    "/en/dashboard-evil",
    "/dashboard/../../login",
    "/dashboard/./students",
    "/dashboard//students",
    "/dashboard/%2e%2e/login",
    "/dashboard/%252e%252e/login",
    "/dashboard%2fstudents?new=1",
    "/en%2fdashboard/students?new=1",
    "/%2f%2fevil.example/dashboard",
    "/dashboard/%5c%5cevil.example",
    "/dashboard/students#//evil.example",
    "/dashboard/students\n",
    "/dashboard/students?new=1\r\nLocation:https://evil.example",
  ];
  for (const target of rejected) {
    assert.equal(normalizeDashboardReturnPath(target), null, String(target));
    assert.equal(loginPath(target), "/login", String(target));
    assert.equal(postLoginPath("owner", target), "/dashboard", String(target));
  }
});

test("a return URL cannot take a student or unassigned account to owner routes", () => {
  const target = "/dashboard/students?new=1";
  assert.equal(postLoginPath("owner", target), target);
  assert.equal(postLoginPath("student", target), "/dashboard/notebook");
  for (const role of [undefined, null, "teacher", "none", "admin"]) {
    assert.equal(postLoginPath(role, target), "/dashboard/notebook");
  }
  assert.equal(
    postLoginPath("student", "/en/dashboard/my?report=latest"),
    "/dashboard/my?report=latest",
  );
  assert.equal(
    postLoginPath(undefined, "/dashboard/link?academy=example"),
    "/dashboard/link?academy=example",
  );
});

test("new students return to personal registration with the QR academy code", () => {
  const target = "/dashboard/register?academy=school-code";
  const login = new URL(loginPath(target), "https://site.example");
  assert.equal(login.searchParams.get("next"), target);
  assert.equal(postLoginPath(undefined, login.searchParams.get("next")), target);
  assert.equal(postLoginPath(undefined, null), "/dashboard/notebook");
  assert.equal(postLoginPath("student", target), target);
  // Privileged accounts see the page's switch-account explanation; the action denies registration.
  assert.equal(postLoginPath("owner", target), target);
  assert.equal(dashboardPathAllowedForRole("/dashboard/register-admin", undefined), false);
});

test("Google signup can go straight to private notes without contact or academy verification", () => {
  const target = "/dashboard/notebook";
  for (const role of [undefined, "student", "owner"]) {
    assert.equal(postLoginPath(role, target), target);
    assert.equal(dashboardPathAllowedForRole(target, role), true);
  }
  assert.equal(postLoginPath(undefined, null), target);
  assert.equal(dashboardPathAllowedForRole("/dashboard/notebook-admin", undefined), false);
  assert.equal(dashboardPathAllowedForRole("/dashboard/my", undefined), true);
});

test("role route checks use segment boundaries", () => {
  assert.equal(dashboardPathAllowedForRole("/dashboard/my/report", "student"), true);
  assert.equal(dashboardPathAllowedForRole("/dashboard/link", "student"), true);
  assert.equal(dashboardPathAllowedForRole("/dashboard/my-students", "student"), false);
  assert.equal(dashboardPathAllowedForRole("/dashboard/link-admin", undefined), false);
  assert.equal(dashboardPathAllowedForRole("/dashboard", "student"), false);
  assert.equal(dashboardPathAllowedForRole("/dashboard/students", "owner"), true);
  assert.equal(dashboardPathAllowedForRole("//evil.example/dashboard", "owner"), false);
});
