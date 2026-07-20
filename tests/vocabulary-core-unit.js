"use strict";

const assert = require("node:assert");
const core = require("../vocabulary/vocabulary-core.js");

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

console.log("vocabulary core unit tests: ok");
