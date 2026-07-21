const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const sfxPath = path.join(root, "assets", "sound", "game-sfx.js");
const musicControlPath = path.join(root, "assets", "sound", "music-control.js");
const hubPath = path.join(root, "index.html");
const fruitBellPath = path.join(root, "games", "fruitbell", "fruitbell.html");

for (const filePath of [sfxPath, musicControlPath, hubPath, fruitBellPath]) {
    assert.ok(fs.existsSync(filePath), `Missing sound effect file: ${filePath}`);
}

const sfxSource = fs.readFileSync(sfxPath, "utf8");
new vm.Script(sfxSource, { filename: sfxPath });
for (const soundName of ["click", "bell", "card", "stone", "success", "error", "tick"]) {
    assert.ok(sfxSource.includes(`${soundName}:`), `Missing synthesized ${soundName} sound.`);
}
assert.ok(sfxSource.includes('latencyHint: "interactive"'), "Sound effects should request an interactive low-latency audio context.");
assert.ok(sfxSource.includes('document.addEventListener("pointerdown"'), "Pointer feedback should begin on pointerdown.");
assert.ok(!sfxSource.includes("data:audio"), "Shared effects should be synthesized instead of decoding embedded audio.");

const musicControlSource = fs.readFileSync(musicControlPath, "utf8");
new vm.Script(musicControlSource, { filename: musicControlPath });
assert.ok(musicControlSource.includes('new URL("game-sfx.js", currentScript.src)'), "Music-enabled games should load the shared effect module.");
assert.ok(musicControlSource.includes("classmusicchange"), "Music controls should publish the shared mute and volume state.");

const hub = fs.readFileSync(hubPath, "utf8");
const gameLinks = [...hub.matchAll(/href="(games\/[^"]+\.html)"/g)].map((match) => match[1]);
assert.ok(gameLinks.length >= 15, "Expected the local game catalog in the hub.");
for (const relativePath of gameLinks) {
    const gameHtml = fs.readFileSync(path.join(root, ...relativePath.split("/")), "utf8");
    const hasSharedEffects = gameHtml.includes("assets/sound/game-sfx.js") || gameHtml.includes("assets/sound/music-control.js");
    assert.ok(hasSharedEffects, `${relativePath} does not load shared button effects.`);
}

const fruitBell = fs.readFileSync(fruitBellPath, "utf8");
assert.ok(fruitBell.includes('id="bellBtn" class="bell" type="button" data-sfx="none"'), "The bell should not also play a generic click.");
assert.ok(fruitBell.includes('id="flipBtn" class="flip" data-sfx="card"'), "Card flips should use the card effect.");
assert.ok(fruitBell.includes('window.ClassGameSfx.play("bell")'), "The bell should use the shared low-latency metallic effect.");
assert.ok(!/queueMicrotask\(playBrightBell\)/.test(fruitBell), "The bell effect should not be deferred to a microtask.");

console.log(`game-sfx-unit: ${gameLinks.length} local games share synthesized click effects; Fruit Bell uses instant bell/card sounds`);
