"use strict";

const assert = require("assert");
const { createSelfStudyItems } = require("../game-hub-server/data/reading-self-study-v2");

const items = createSelfStudyItems();
assert.equal(items.length, 128);
assert.equal(new Set(items.map((item) => item.id)).size, items.length);

for (const track of ["ko", "en"]) {
  for (let level = 1; level <= 8; level += 1) {
    const set = items.filter((item) => item.track === track && item.targetLevel === level);
    assert.equal(set.length, 8, `${track}${level} should have 8 new items`);
  }
}

for (const item of items) {
  const expectedChoices = item.targetLevel <= 2 ? 3 : item.targetLevel <= 4 ? 4 : 5;
  assert.equal(item.choices.length, expectedChoices);
  assert(Number.isInteger(item.correctIndex));
  assert(item.correctIndex >= 0 && item.correctIndex < item.choices.length);
  assert(item.passageText.includes(item.choices[item.correctIndex]));
  assert(item.explanation.length > 0);
}

console.log("Reading self-study unit: OK");
