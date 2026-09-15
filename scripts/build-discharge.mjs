import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
const source = new URL("../games/discharge-day/src/", import.meta.url);
const output = new URL("../public/assets/discharge-day/", import.meta.url);
await mkdir(output, { recursive: true });
const read = (name) => readFile(new URL(name, source), "utf8");
const assets = Object.fromEntries(
  (await readdir(new URL("art/", output)))
    .filter((name) => name.endsWith(".webp"))
    .map((name) => [name.slice(0, -5), `./art/${name}`]),
);
let html = await read("index.template.html");
html = html
  .replace(
    /<style>[\s\S]*?<\/style>/,
    '<link rel="stylesheet" href="./style.css"><link rel="stylesheet" href="./layout.css">',
  )
  .replace(/<script>[\s\S]*?<\/script>/g, "")
  .replace(
    "</body>",
    '<script src="./data.js"></script><script src="./logic.js"></script><script src="./presentation.js"></script><script src="./audio.js"></script><script src="./app.js"></script></body>',
  )
  .replace("<head>", '<head><meta name="robots" content="noindex,follow">')
  .replace(
    '<div id="app">',
    '<a class="site-return" href="/games/discharge-day" style="position:relative;z-index:40;display:block;padding:12px 18px;color:#cbdacb;min-height:44px">← 게임 소개</a><div id="app">',
  );
await writeFile(new URL("index.html", output), html.replace(/[\t ]+$/gm, ""));
for (const name of ["style.css", "layout.css", "app.js", "logic.js", "audio.js", "presentation.js"])
  await writeFile(new URL(name, output), await read(name));
await writeFile(
  new URL("data.js", output),
  `window.GAME_DATA=${JSON.stringify(JSON.parse(await read("game_data.json")))};window.GAME_ASSETS=${JSON.stringify(assets)};`,
);
console.log("Built discharge-day web runtime with local, separately cached assets.");
