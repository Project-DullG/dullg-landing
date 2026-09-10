import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import { setTimeout as delay } from "node:timers/promises";
import { readdir } from "node:fs/promises";

async function run(args) {
  const child = spawn(process.execPath, args, { stdio: "inherit" });
  const [code] = await once(child, "exit");
  if (code !== 0) throw new Error(`Command failed (${code}): node ${args.join(" ")}`);
}

const probe = createServer();
probe.listen(0, "127.0.0.1");
await once(probe, "listening");
const port = probe.address().port;
await new Promise((resolve) => probe.close(resolve));
const origin = `http://localhost:${port}`;
const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "--hostname", "localhost", "--port", String(port)],
  { stdio: "inherit" },
);
try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    if (server.exitCode !== null) throw new Error("The test server stopped before becoming ready.");
    try {
      const response = await fetch(`${origin}/robots.txt`, { signal: AbortSignal.timeout(1000) });
      if (response.ok) {
        ready = true;
        break;
      }
    } catch {
      /* The server is still starting. */
    }
    await delay(500);
  }
  if (!ready) throw new Error("The test server did not become ready.");
  await run(["--experimental-strip-types", "scripts/check-localized-pages.mjs", origin, "--save"]);
  const files = (await readdir("tests"))
    .filter((file) => file.endsWith(".test.mjs"))
    .map((file) => `tests/${file}`);
  await run(["--experimental-strip-types", "--test", ...files]);
} finally {
  server.kill("SIGTERM");
  await Promise.race([once(server, "exit"), delay(5000)]);
  if (server.exitCode === null) server.kill("SIGKILL");
}
