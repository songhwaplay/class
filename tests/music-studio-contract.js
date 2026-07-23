"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");

const html = fs.readFileSync("learning/training/music-studio/index.html", "utf8");
const app = fs.readFileSync("learning/training/music-studio/app.js", "utf8");
const css = fs.readFileSync("learning/training/music-studio/styles.css", "utf8");
const hub = fs.readFileSync("index.html", "utf8");

[
    "harmonyLab", "rhythmLab", "progressionSlots", "chordBank", "piano",
    "minorVariantControl", "minorVariantSelect", "rhythmGrid", "tapButton", "startChallengeButton", "scorePanel",
    "dictationPanel", "performancePanel", "dictationGrid", "dictationListenButton", "checkDictationButton", "newDictationButton",
    "voicingQuizPrompt", "voicingQuizListenButton", "voicingQuizChoices", "voicingQuizFeedback", "newVoicingQuizButton"
].forEach((id) => assert.match(html, new RegExp(`id=["']${id}["']`)));

assert.match(html, /music-core\.js/);
assert.match(html, /app\.js/);
assert.match(html, /aria-selected=/);
assert.match(app, /scoreRhythm/);
assert.match(app, /scoreRhythmNotation/);
assert.match(app, /buildRhythmNotation/);
assert.match(app, /notationToEvents/);
assert.match(app, /RHYTHM_DICTATION_BANK/);
assert.match(app, /data-rhythm-mode/);
assert.match(html, /data-dictation-symbol="note"/);
assert.match(html, /data-dictation-symbol="rest"/);
assert.match(html, /data-dictation-symbol="tie"/);
assert.match(html, /왕초보 코스/);
assert.match(html, /data-basic-offset="0"/);
assert.match(html, /data-basic-chord-offsets="0,4,7"/);
assert.match(html, /C로 고정된 음이 아니라 지금 음악의 출발점/);
assert.match(html, /id="changeBasicTonicButton"/);
assert.match(app, /chooseBasicTonic/);
assert.match(app, /state\.basicTonicMidi \+ Number\(button\.dataset\.basicOffset\)/);
assert.match(html, /장3화음과 단3화음의 정서가 항상 정해지는 것은 아니에요/);
assert.doesNotMatch(html, /밝은 화음|어두운 화음|밝은 느낌|어두운 느낌/);
assert.match(html, /id="basicPulseButton"/);
assert.match(html, /id="harmonyPractice" class="advanced-practice hidden"/);
assert.match(html, /id="rhythmPractice" class="advanced-practice hidden"/);
assert.match(html, /class="active"[^>]+data-rhythm-mode="performance"/);
assert.match(app, /rhythmMode: "performance"/);
assert.match(app, /dictationLevel: "basic"/);
assert.match(app, /data-practice-gate/);
assert.match(css, /foundation-course/);
assert.match(app, /AudioContext/);
assert.match(app, /createConvolver/);
assert.match(app, /createDynamicsCompressor/);
assert.match(app, /playPianoTone/);
assert.match(app, /getLeftHandCompingMidi/);
assert.match(app, /buildVoiceLedProgression/);
assert.match(app, /data-inversion-mode/);
assert.match(app, /makeVoicingQuiz/);
assert.match(app, /midi <= 72/);
assert.match(html, /C3부터 C5까지/);
assert.match(app, /playNoiseTransient/);
assert.match(app, /data-mode/);
assert.match(app, /minorVariant/);
assert.match(app, /event\.code !== "Space"/);
assert.match(css, /@media \(max-width: 640px\)/);
assert.match(css, /prefers-reduced-motion/);
assert.match(css, /dictation-grid/);
assert.match(css, /answer-step\.wrong/);
assert.match(css, /white-key\.active\.common/);
assert.match(css, /white-key\.active\.moved/);
assert.match(hub, /learning\/training\/music-studio\/index\.html/);
assert.doesNotMatch(hub, /learning\/basics\/music-studio\/index\.html/);
assert.doesNotMatch(html, /실용/);
assert.doesNotMatch(hub, /실용화성학/);

console.log("music-studio-contract: ok");
