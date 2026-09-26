import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const commitPattern = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/;

function git(cwd, args) {
  return spawnSync("git", args, {
    cwd,
    encoding: "utf8",
    timeout: 20_000,
    maxBuffer: 16 * 1024 * 1024,
    env: { ...process.env, GIT_OPTIONAL_LOCKS: "0", GIT_TERMINAL_PROMPT: "0" },
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function blocked(code, message, details = {}) {
  return { ok: false, issues: [{ code, message }], ...details };
}

function workingTreeIssues(cwd) {
  const status = git(cwd, [
    "status",
    "--porcelain=v1",
    "-z",
    "--untracked-files=all",
    "--ignore-submodules=none",
  ]);
  if (status.status !== 0) {
    return [
      { code: "status_unavailable", message: "작업 파일의 변경 여부를 확인하지 못했습니다." },
    ];
  }

  const tracked = [];
  const untracked = [];
  const entries = status.stdout.split("\0");
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    if (!entry) continue;
    const state = entry.slice(0, 2);
    (state === "??" ? untracked : tracked).push(entry.slice(3));
    // Porcelain -z emits a second pathname for a renamed or copied file.
    if (/[RC]/.test(state)) index += 1;
  }

  const issues = [];
  const listPaths = (paths) => {
    const listed = paths
      .slice(0, 10)
      .map((path) => JSON.stringify(path))
      .join(", ");
    return paths.length > 10 ? `${listed} 외 ${paths.length - 10}개` : listed;
  };
  if (tracked.length) {
    issues.push({
      code: "tracked_changes",
      message: `추적 중인 파일 ${tracked.length}개에 커밋하지 않은 변경이 있습니다: ${listPaths(tracked)}. 변경을 검토하고 커밋한 뒤 다시 검사하세요.`,
    });
  }
  if (untracked.length) {
    issues.push({
      code: "untracked_files",
      message: `Git에 추가하지 않은 파일 ${untracked.length}개가 있습니다: ${listPaths(untracked)}. 배포할 파일은 커밋하고, 배포하지 않을 파일은 저장소 밖으로 옮기거나 무시 규칙에 추가하세요.`,
    });
  }
  return issues;
}

function mismatch(cwd, head, remoteHead) {
  const details = { head, remoteHead };
  const hashes = `현재 HEAD ${head.slice(0, 12)}, 원격 main ${remoteHead.slice(0, 12)}`;
  // ls-remote does not download objects. Classify ancestry only when already available.
  if (git(cwd, ["cat-file", "-e", `${remoteHead}^{commit}`]).status === 0) {
    if (git(cwd, ["merge-base", "--is-ancestor", head, remoteHead]).status === 0) {
      return blocked(
        "behind_remote",
        `현재 커밋이 원격 main보다 뒤처져 있습니다 (${hashes}). 최신 main을 반영한 뒤 다시 검사하세요.`,
        details,
      );
    }
    if (git(cwd, ["merge-base", "--is-ancestor", remoteHead, head]).status === 0) {
      return blocked(
        "ahead_of_remote",
        `현재 커밋이 원격 main에 반영되지 않았습니다 (${hashes}). 변경을 main에 반영하고 푸시한 뒤 다시 검사하세요.`,
        details,
      );
    }
    return blocked(
      "diverged",
      `현재 커밋과 원격 main의 이력이 갈라졌습니다 (${hashes}). 두 이력을 검토해 main에 변경을 반영한 뒤 다시 검사하세요.`,
      details,
    );
  }
  return blocked(
    "remote_mismatch",
    `현재 커밋이 원격 main과 다릅니다 (${hashes}). 원격 커밋이 로컬에 없어 선후 관계는 확인하지 못했습니다. 최신 main을 가져와 확인한 뒤 다시 검사하세요.`,
    details,
  );
}

export function checkDeployReady({ cwd = process.cwd() } = {}) {
  const repository = git(cwd, ["rev-parse", "--is-inside-work-tree"]);
  if (repository.status !== 0 || repository.stdout.trim() !== "true") {
    return blocked("not_repository", "Git 작업 저장소 안에서 검사를 실행하세요.");
  }
  const initialHead = git(cwd, ["rev-parse", "--verify", "HEAD"]);
  const head = initialHead.stdout?.trim();
  if (initialHead.status !== 0 || !commitPattern.test(head ?? "")) {
    return blocked(
      "head_unavailable",
      "현재 커밋을 확인하지 못했습니다. 커밋이 있는 저장소인지 확인하세요.",
    );
  }
  const issues = workingTreeIssues(cwd);
  if (issues.length) return { ok: false, head, issues };

  // Read the server's branch tip directly; a stale origin/main ref must not pass.
  const remote = git(cwd, ["ls-remote", "--exit-code", "origin", "refs/heads/main"]);
  if (remote.status === 2) {
    return blocked(
      "remote_main_missing",
      "origin에 main 브랜치가 없습니다. 배포 대상 저장소와 브랜치를 확인하세요.",
      { head },
    );
  }
  if (remote.status !== 0) {
    // Do not print Git stderr: remote URLs or authentication data may be present.
    return blocked(
      "remote_unavailable",
      "origin의 최신 main을 확인하지 못했습니다. 네트워크 연결과 Git 접근 권한을 확인하세요. 원격 확인 없이 배포 검사를 통과할 수 없습니다.",
      { head },
    );
  }
  const refs = remote.stdout
    .trim()
    .split("\n")
    .map((line) => line.split(/\s+/));
  const remoteHead = refs[0]?.[0];
  if (
    refs.length !== 1 ||
    refs[0]?.[1] !== "refs/heads/main" ||
    !commitPattern.test(remoteHead ?? "")
  ) {
    return blocked(
      "remote_invalid",
      "origin에서 main의 커밋 정보를 올바르게 받지 못했습니다. 배포를 중단합니다.",
      { head },
    );
  }
  if (head !== remoteHead) return mismatch(cwd, head, remoteHead);

  const finalHead = git(cwd, ["rev-parse", "--verify", "HEAD"]);
  if (finalHead.status !== 0 || finalHead.stdout.trim() !== head) {
    return blocked(
      "head_changed",
      "검사 중 현재 커밋이 바뀌었습니다. 파일 작업이 끝난 뒤 다시 검사하세요.",
      { head, remoteHead },
    );
  }
  const finalIssues = workingTreeIssues(cwd);
  return { ok: finalIssues.length === 0, head, remoteHead, issues: finalIssues };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.length > 2) {
    console.error("사용법: node scripts/check-deploy-ready.mjs (옵션 없음)");
    process.exitCode = 1;
  } else {
    const result = checkDeployReady();
    if (result.ok) {
      console.log(
        `배포 전 검사 통과: HEAD ${result.head}가 원격 main과 같고, 커밋하지 않은 변경이나 미추적 파일이 없습니다.`,
      );
    } else {
      for (const issue of result.issues) console.error(`배포 중단: ${issue.message}`);
      process.exitCode = 1;
    }
  }
}
