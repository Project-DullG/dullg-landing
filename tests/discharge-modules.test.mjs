import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { runInNewContext } from "node:vm";

const source = "games/discharge-day/src/";
function load(name, context = {}) {
  runInNewContext(readFileSync(source + name, "utf8"), context);
  return context;
}

test("Discharge presentation refers to existing scenes, choices and local art", () => {
  const data = JSON.parse(readFileSync(source + "game_data.json", "utf8"));
  const { DischargePresentation: p } = load("presentation.js");
  for (const [scene, [art]] of Object.entries(p.SCENE)) {
    assert.ok(data.scenes[scene], scene);
    assert.ok(existsSync(`archive/retired-games/discharge-day/art/${art}.webp`), art);
  }
  for (const [scene, spots] of Object.entries(p.SPOTS)) {
    for (const [choice, [x, y, label]] of Object.entries(spots)) {
      assert.ok(data.scenes[scene].choices.some((item) => item.id === choice), `${scene}/${choice}`);
      assert.ok(x >= 0 && x <= 100 && y >= 0 && y <= 100);
      assert.ok(label.length > 0);
    }
  }
  for (const clue of Object.keys(p.DETAIL)) assert.ok(data.clues[clue], clue);
});

test("Discharge audio does not require an available audio device", () => {
  const { createDischargeAudio } = load("audio.js", { window: {} });
  const audio = createDischargeAudio({ getPrefs: () => ({ sound: true }), getMode: () => "title" });
  assert.doesNotThrow(() => { audio.init(); audio.sync(); audio.click(); audio.scene("outside"); });
  assert.equal(audio.ctx, null);
});

test("Discharge audio reads current preferences and respects page visibility", () => {
  const { createDischargeAudio } = load("audio.js", { window: {} });
  let prefs = { sound: true, volume: 0.32 };
  const audio = createDischargeAudio({ getPrefs: () => prefs, getMode: () => "play" });
  const levels = [];
  audio.ctx = { currentTime: 0, resume: () => Promise.resolve() };
  audio.master = { gain: { setTargetAtTime: (value) => levels.push(value) } };
  audio.sync();
  prefs = { sound: true, volume: 0.1 };
  audio.sync();
  audio.visible = false;
  audio.sync();
  audio.visible = true;
  prefs.sound = false;
  audio.sync();
  assert.deepEqual(levels, [0.32, 0.1, 0, 0]);
});

test("Discharge publishes the source modules before its entry point", () => {
  const base = "archive/retired-games/discharge-day/";
  const html = readFileSync(base + "index.html", "utf8");
  for (const file of ["audio.js", "presentation.js", "app.js", "logic.js"]) {
    assert.equal(readFileSync(base + file, "utf8"), readFileSync(source + file, "utf8"));
    if (file !== "app.js") assert.ok(html.indexOf(`src="./${file}"`) < html.indexOf('src="./app.js"'));
  }
});
