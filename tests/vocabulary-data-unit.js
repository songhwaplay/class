"use strict";

const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const dataPath = path.join(__dirname, "..", "assets", "data", "english-vocabulary-3000-v2.json");
const payload = JSON.parse(fs.readFileSync(dataPath, "utf8"));

assert.strictEqual(payload.version, "v2");
assert.strictEqual(payload.totalWords, 3000);
assert.strictEqual(payload.words.length, 3000);

const levelCounts = new Map();
const stageCounts = new Map();
const uniqueWords = new Set();
const bannedExamplePhrases = [
    "is useful in this sentence",
    "we learned the word",
    "context helps us understand",
    "describes the situation",
    "speaker uses",
];
let naturalExampleCount = 0;
let missingExampleCount = 0;
let relatedWordCount = 0;
payload.words.forEach((word) => {
    levelCounts.set(word.globalLevel, (levelCounts.get(word.globalLevel) || 0) + 1);
    stageCounts.set(word.stageCode, (stageCounts.get(word.stageCode) || 0) + 1);
    uniqueWords.add(word.word.toLowerCase());
    assert.ok(word.word);
    assert.ok(word.pos.length);
    assert.ok(word.meanings.length);
    if (word.example) {
        assert.ok(word.example.en);
        assert.ok(word.example.ko);
        assert.ok(["translation", "meaning_hint"].includes(word.example.translationType));
        assert.notStrictEqual(word.example.source, "generated_learning_prompt");
        bannedExamplePhrases.forEach((phrase) => {
            assert.ok(!word.example.en.toLowerCase().includes(phrase));
        });
        naturalExampleCount += 1;
    } else {
        missingExampleCount += 1;
    }
    assert.ok(Array.isArray(word.relatedWords));
    assert.ok(word.relatedWords.length <= 4);
    word.relatedWords.forEach((related) => {
        assert.ok(related.word);
        assert.ok(related.type);
        assert.notStrictEqual(related.word.toLowerCase(), word.word.toLowerCase());
    });
    if (word.relatedWords.length) relatedWordCount += 1;
});

assert.strictEqual(levelCounts.size, 15);
levelCounts.forEach((count) => assert.strictEqual(count, 200));
assert.strictEqual(stageCounts.get("elementary"), 800);
assert.strictEqual(stageCounts.get("middle_common"), 1200);
assert.strictEqual(stageCounts.get("advanced"), 1000);
assert.strictEqual(uniqueWords.size, 3000);
assert.ok(naturalExampleCount >= 2300);
assert.ok(missingExampleCount <= 650);
assert.ok(relatedWordCount >= 2400);

const ignore = payload.words.find((word) => word.word === "ignore");
assert.ok(ignore.example.en.includes("ignored"));
assert.strictEqual(ignore.example.ko, "그는 경고를 무시하고 계속 걸었다.");
assert.ok(!ignore.relatedWords.some((related) => ["cut", "snub"].includes(related.word)));

console.log("vocabulary data unit tests: ok");
