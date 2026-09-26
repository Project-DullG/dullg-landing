import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { checkDeployReady } from "../scripts/check-deploy-ready.mjs";

const cliPath = fileURLToPath(new URL("../scripts/check-deploy-ready.mjs", import.meta.url));

function git(cwd, ...args) {
  const result = spawnSync("git", args, {
    cwd,
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_CONFIG_NOSYSTEM: "1",
      GIT_CONFIG_GLOBAL: "/dev/null",
      GIT_TERMINAL_PROMPT: "0",
    },
  });
  assert.equal(result.status, 0, `git ${args.join(" ")}: ${result.stderr}`);
  return result.stdout.trim();
}

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "deploy-readiness-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const repo = join(root, "checkout");
  const remote = join(root, "origin.git");
  mkdirSync(repo);
  git(root, "init", "--bare", "--initial-branch=main", remote);
  git(repo, "init", "--initial-branch=main");
  git(repo, "config", "user.name", "Deployment test");
  git(repo, "config", "user.email", "deployment-test@example.invalid");
  git(repo, "config", "commit.gpgsign", "false");
  writeFileSync(join(repo, "page.txt"), "Initial page\n");
  writeFileSync(join(repo, ".gitignore"), ".env*\n.next/\n");
  git(repo, "add", ".");
  git(repo, "commit", "-m", "Initial page");
  git(repo, "remote", "add", "origin", remote);
  git(repo, "push", "origin", "main");
  return { root, repo, remote, initial: git(repo, "rev-parse", "HEAD") };
}

function commitPage(repo, content) {
  writeFileSync(join(repo, "page.txt"), content);
  git(repo, "add", "page.txt");
  git(repo, "commit", "-m", content.trim());
  return git(repo, "rev-parse", "HEAD");
}

function assertBlocked(repo, code) {
  const result = checkDeployReady({ cwd: repo });
  assert.equal(result.ok, false);
  assert.ok(
    result.issues.some((issue) => issue.code === code),
    JSON.stringify(result),
  );
  return result;
}

test("a clean checkout matching remote main passes without changing Git files", (t) => {
  const { repo, initial } = fixture(t);
  const indexBefore = readFileSync(join(repo, ".git", "index"));
  const remoteRefBefore = readFileSync(join(repo, ".git", "refs", "remotes", "origin", "main"));
  assert.deepEqual(checkDeployReady({ cwd: repo }), {
    ok: true,
    head: initial,
    remoteHead: initial,
    issues: [],
  });
  assert.deepEqual(readFileSync(join(repo, ".git", "index")), indexBefore);
  assert.deepEqual(
    readFileSync(join(repo, ".git", "refs", "remotes", "origin", "main")),
    remoteRefBefore,
  );
});

test("a checkout behind remote main is blocked", (t) => {
  const { repo, initial } = fixture(t);
  commitPage(repo, "Remote update\n");
  git(repo, "push", "origin", "main");
  git(repo, "checkout", "--detach", initial);
  assertBlocked(repo, "behind_remote");
});

test("an unpushed commit ahead of remote main is blocked", (t) => {
  const { repo } = fixture(t);
  commitPage(repo, "Local update\n");
  assertBlocked(repo, "ahead_of_remote");
});

test("a checkout diverged from remote main is blocked", (t) => {
  const { repo, initial } = fixture(t);
  commitPage(repo, "Remote update\n");
  git(repo, "push", "origin", "main");
  git(repo, "checkout", "-b", "old-feature", initial);
  commitPage(repo, "Local feature update\n");
  assertBlocked(repo, "diverged");
});

test("a stale origin/main ref cannot hide a newer remote commit", (t) => {
  const { root, repo, remote, initial } = fixture(t);
  const publisher = join(root, "publisher");
  git(root, "clone", remote, publisher);
  git(publisher, "config", "user.name", "Deployment test");
  git(publisher, "config", "user.email", "deployment-test@example.invalid");
  git(publisher, "config", "commit.gpgsign", "false");
  const remoteHead = commitPage(publisher, "Published elsewhere\n");
  git(publisher, "push", "origin", "main");
  assert.equal(git(repo, "rev-parse", "origin/main"), initial);
  const result = assertBlocked(repo, "remote_mismatch");
  assert.equal(result.remoteHead, remoteHead);
  assert.equal(git(repo, "rev-parse", "origin/main"), initial);
});

test("unstaged tracked changes are blocked", (t) => {
  const { repo } = fixture(t);
  writeFileSync(join(repo, "page.txt"), "Uncommitted change\n");
  assertBlocked(repo, "tracked_changes");
});

test("staged tracked changes are blocked", (t) => {
  const { repo } = fixture(t);
  writeFileSync(join(repo, "page.txt"), "Staged change\n");
  git(repo, "add", "page.txt");
  assertBlocked(repo, "tracked_changes");
});

test("staged renames with unusual filenames are handled as one change", (t) => {
  const { repo } = fixture(t);
  git(repo, "mv", "page.txt", "new\npage.txt");
  const result = assertBlocked(repo, "tracked_changes");
  assert.match(result.issues[0].message, /파일 1개/);
  assert.ok(result.issues[0].message.includes('"new\\npage.txt"'));
  assert.equal(result.issues[0].message.includes("\n"), false);
});

test("untracked files are blocked, including nested files", (t) => {
  const { repo } = fixture(t);
  mkdirSync(join(repo, "public"));
  writeFileSync(join(repo, "public", "uncommitted.html"), "Untracked page");
  const result = assertBlocked(repo, "untracked_files");
  assert.match(result.issues[0].message, /public\/uncommitted\.html/);
});

test("ignored environment and build files do not block the check", (t) => {
  const { repo } = fixture(t);
  writeFileSync(join(repo, ".env.local"), "SECRET=never-print-this\n");
  mkdirSync(join(repo, ".next"));
  writeFileSync(join(repo, ".next", "build.txt"), "Build output\n");
  assert.equal(checkDeployReady({ cwd: repo }).ok, true);
});

test("an unavailable remote blocks the check without leaking its URL", (t) => {
  const { repo, root } = fixture(t);
  git(repo, "remote", "set-url", "origin", join(root, "private-token-unavailable.git"));
  const result = assertBlocked(repo, "remote_unavailable");
  assert.equal(JSON.stringify(result).includes("private-token"), false);
});

test("a remote without main blocks the check", (t) => {
  const { repo, remote } = fixture(t);
  git(remote, "update-ref", "-d", "refs/heads/main");
  assertBlocked(repo, "remote_main_missing");
});

test("running outside a Git working tree blocks the check", (t) => {
  const { root } = fixture(t);
  assertBlocked(root, "not_repository");
});

test("CLI exits zero only for a clean checkout matching remote main", (t) => {
  const { repo } = fixture(t);
  const passed = spawnSync(process.execPath, [cliPath], { cwd: repo, encoding: "utf8" });
  assert.equal(passed.status, 0);
  assert.match(passed.stdout, /배포 전 검사 통과/);
  writeFileSync(join(repo, "untracked.txt"), "Untracked\n");
  const blocked = spawnSync(process.execPath, [cliPath], { cwd: repo, encoding: "utf8" });
  assert.equal(blocked.status, 1);
  assert.match(blocked.stderr, /배포 중단/);
  const unsupported = spawnSync(process.execPath, [cliPath, "--force"], {
    cwd: repo,
    encoding: "utf8",
  });
  assert.equal(unsupported.status, 1);
  assert.match(unsupported.stderr, /옵션 없음/);
});
