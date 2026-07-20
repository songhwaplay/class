"use strict";

const assert = require("node:assert");
const core = require("../idioms/idioms-core.js");
const data = require("../idioms/idioms-data.js");

assert.ok(data.length >= 30, "대표 사자성어가 30개 이상이어야 합니다.");
assert.strictEqual(new Set(data.map((item) => item.id)).size, data.length, "id는 중복될 수 없습니다.");
data.forEach((item) => {
    ["word", "hanja", "meaning", "story", "lesson", "source", "reference", "verification"].forEach((field) => {
        assert.ok(item[field], `${item.id}.${field} 값이 필요합니다.`);
    });
    assert.strictEqual([...item.word].length, 4, `${item.word}은 네 글자여야 합니다.`);
    assert.strictEqual([...item.hanja].length, 4, `${item.hanja}은 한자 네 글자여야 합니다.`);
    assert.match(item.reference, /^https:\/\//, `${item.word}의 근거 링크는 HTTPS여야 합니다.`);
});

const normalized = core.normalizeProgress({
    sujudaeto: { status: "known", updatedAt: "today" },
    gakjuguggeom: { status: "review" },
    invalid: { status: "known" },
    josammosa: { status: "wrong" }
}, data.map((item) => item.id));

assert.deepStrictEqual(Object.keys(normalized).sort(), ["gakjuguggeom", "sujudaeto"]);
const summary = core.summarize(data, normalized);
assert.strictEqual(summary.known, 1);
assert.strictEqual(summary.review, 1);
assert.strictEqual(summary.unseen, data.length - 2);

const quiz = core.buildQuiz(data, 10, "meaning", () => 0.42);
assert.strictEqual(quiz.length, 10);
quiz.forEach((question) => {
    assert.strictEqual(question.options.length, 4);
    assert.strictEqual(new Set(question.options.map((option) => option.id)).size, 4);
    assert.ok(question.options.some((option) => option.id === question.answerId));
});

console.log(`idioms core unit tests: ok (${data.length} entries)`);
