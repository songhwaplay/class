"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");

const html = fs.readFileSync("learning/training/music-studio/index.html", "utf8");
const app = fs.readFileSync("learning/training/music-studio/app.js", "utf8");
const css = fs.readFileSync("learning/training/music-studio/styles.css", "utf8");
const hub = fs.readFileSync("index.html", "utf8");

[
    "harmonyLab", "rhythmLab", "progressionSlots", "chordBank", "piano",
    "minorVariantControl", "minorVariantSelect", "rhythmGrid", "tapButton", "startChallengeButton", "scorePanel"
].forEach((id) => assert.match(html, new RegExp(`id=["']${id}["']`)));

assert.match(html, /music-core\.js/);
assert.match(html, /app\.js/);
assert.match(html, /aria-selected=/);
assert.match(app, /scoreRhythm/);
assert.match(app, /AudioContext/);
assert.match(app, /createConvolver/);
assert.match(app, /createDynamicsCompressor/);
assert.match(app, /playPianoTone/);
assert.match(app, /getLeftHandCompingMidi/);
assert.match(app, /midi <= 72/);
assert.match(app, /음역 C3–C5/);
assert.match(app, /playNoiseTransient/);
assert.match(app, /data-mode/);
assert.match(app, /minorVariant/);
assert.match(app, /event\.code !== "Space"/);
assert.match(css, /@media \(max-width: 640px\)/);
assert.match(css, /prefers-reduced-motion/);
assert.match(hub, /learning\/training\/music-studio\/index\.html/);
assert.doesNotMatch(hub, /learning\/basics\/music-studio\/index\.html/);

console.log("music-studio-contract: ok");
