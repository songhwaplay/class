"use strict";

const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const dataPath = path.join(__dirname, "..", "assets", "data", "english-vocabulary-3000-v1.json");
const payload = JSON.parse(fs.readFileSync(dataPath, "utf8"));

assert.strictEqual(payload.version, "v1");
assert.strictEqual(payload.totalWords, 3000);
assert.strictEqual(payload.words.length, 3000);

const levelCounts = new Map();
const stageCounts = new Map();
const uniqueWords = new Set();
payload.words.forEach((word) => {
    levelCounts.set(word.globalLevel, (levelCounts.get(word.globalLevel) || 0) + 1);
    stageCounts.set(word.stageCode, (stageCounts.get(word.stageCode) || 0) + 1);
    uniqueWords.add(word.word.toLowerCase());
    assert.ok(word.word);
    assert.ok(word.pos.length);
    assert.ok(word.meanings.length);
});

assert.strictEqual(levelCounts.size, 15);
levelCounts.forEach((count) => assert.strictEqual(count, 200));
assert.strictEqual(stageCounts.get("elementary"), 800);
assert.strictEqual(stageCounts.get("middle_common"), 1200);
assert.strictEqual(stageCounts.get("advanced"), 1000);
assert.strictEqual(uniqueWords.size, 3000);

console.log("vocabulary data unit tests: ok");
