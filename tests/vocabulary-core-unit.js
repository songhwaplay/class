"use strict";

const assert = require("node:assert");
const core = require("../learning/basics/vocabulary/vocabulary-core.js");

const words = [
    { id: 1, globalLevel: 1, order: 2, stageCode: "elementary" },
    { id: 2, globalLevel: 1, order: 1, stageCode: "elementary" },
    { id: 3, globalLevel: 5, order: 1, stageCode: "middle_common" },
];

const levels = core.groupByLevel(words);
assert.deepStrictEqual(levels.get(1).map((word) => word.id), [2, 1]);
assert.strictEqual(levels.get(5).length, 1);

const progress = core.normalizeProgress({
    1: { status: "known", updatedAt: "today" },
    2: { status: "unknown" },
    3: { status: "invalid" },
    4: null,
});
assert.deepStrictEqual(core.summarizeWords(words, progress), { known: 1, unknown: 1, unseen: 1 });
assert.strictEqual(core.stageClass("middle_common"), "middle");
assert.strictEqual(core.stageClass("advanced"), "advanced");

const shuffled = core.shuffleWords([1, 2, 3], () => 0);
assert.deepStrictEqual(shuffled, [2, 3, 1]);

const pictureWords = [
    { id: 10, globalLevel: 1, stageCode: "elementary" },
    { id: 11, globalLevel: 1, stageCode: "elementary" },
    { id: 12, globalLevel: 1, stageCode: "elementary" },
    { id: 13, globalLevel: 1, stageCode: "elementary" },
    { id: 14, globalLevel: 2, stageCode: "elementary" },
    { id: 15, globalLevel: 1, stageCode: "middle_common" },
];
const picturePool = core.pictureGamePool(pictureWords, new Set(["10", "11", "12", "13", "14", "15"]), 1);
assert.deepStrictEqual(picturePool.map((word) => word.id), [10, 11, 12, 13]);
const pictureQuestion = core.createPictureQuestion(picturePool, 10, () => 0);
assert.strictEqual(pictureQuestion.target.id, 11);
assert.strictEqual(pictureQuestion.choices.length, 4);
assert.strictEqual(new Set(pictureQuestion.choices.map((word) => word.id)).size, 4);
assert.ok(pictureQuestion.choices.some((word) => word.id === pictureQuestion.target.id));
const retryQuestion = core.createPictureQuestion(picturePool, null, () => 0, [picturePool[2]]);
assert.strictEqual(retryQuestion.target.id, picturePool[2].id);
assert.strictEqual(retryQuestion.choices.length, 4);
assert.strictEqual(core.createPictureQuestion(picturePool.slice(0, 3)), null);

assert.strictEqual(core.normalizeSpellingAnswer("  Apple  "), "apple");
assert.strictEqual(core.normalizeSpellingAnswer("ice   cream"), "ice cream");
assert.strictEqual(core.spellingHint("apple"), "a _ _ _ _");
assert.strictEqual(core.spellingHint("apple", false), "_ _ _ _ _");

console.log("vocabulary core unit tests: ok");
