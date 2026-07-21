"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const context = { window: {} };
vm.createContext(context);
for (const file of ["questions.js", "questions-extra.js", "question-deck.js"]) {
    const filePath = path.join(root, "learning", "basics", "spelling", file);
    vm.runInContext(fs.readFileSync(filePath, "utf8"), context, { filename: filePath });
}

const questions = context.window.SPELLING_QUESTIONS;
const deck = context.window.SpellingQuestionDeck;
const stored = new Map();
const storage = {
    getItem(key) { return stored.get(key) || null; },
    setItem(key, value) { stored.set(key, String(value)); }
};
let seed = 123456789;
function random() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
}

const firstCycle = [];
for (let round = 0; round < 16; round += 1) {
    const selected = deck.take({ questions, size: 10, storageKey: "unit-deck", storage, random });
    assert.equal(selected.length, 10, `Round ${round + 1} should have 10 questions.`);
    assert.equal(new Set(selected).size, 10, `Round ${round + 1} should not repeat within the round.`);
    firstCycle.push(...selected);
}

assert.equal(firstCycle.length, 160);
assert.equal(new Set(firstCycle).size, 160, "All 160 questions must appear before any question repeats.");
assert.deepEqual(
    [...new Set(firstCycle)].sort(),
    Array.from(questions, (question) => question.id).sort(),
    "The first cycle should cover the complete question bank."
);

const nextRound = deck.take({ questions, size: 10, storageKey: "unit-deck", storage, random });
assert.equal(nextRound.length, 10);
assert.ok(nextRound.every((id) => firstCycle.includes(id)), "Repeats are allowed only after the full cycle is exhausted.");

stored.set("corrupt-deck", JSON.stringify([questions[0].id, questions[0].id, "missing-question"]));
const recovered = deck.take({ questions, size: 10, storageKey: "corrupt-deck", storage, random });
assert.equal(recovered.length, 10);
assert.equal(new Set(recovered).size, 10, "A corrupted saved deck should recover without duplicates.");

console.log("spelling-question-deck-unit: 160 unique questions before repeat, storage recovery ok");
