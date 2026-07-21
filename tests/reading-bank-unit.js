"use strict";

const assert = require("node:assert/strict");
const readingBank = require("../game-hub-server/reading-bank");

assert.deepEqual(
  Array.from({ length: 8 }, (_, index) => readingBank.expectedChoiceCount(index + 1)),
  [3, 3, 4, 4, 5, 5, 5, 5],
  "Choice count must follow the agreed developmental levels."
);

assert.equal(readingBank.wordCount("Sleep helps Tom's brain re-organize old memories."), 7);

const validK1 = readingBank.runAutoChecks({
  track: "ko",
  targetLevel: 1,
  passageText: "서준이는 낮에 새 낱말을 배웠습니다. 밤에는 잠을 잤습니다.",
  promptText: "서준이가 밤에 한 일은 무엇입니까?",
  choices: ["잠을 잤습니다.", "밖에서 놀았습니다.", "책을 버렸습니다."],
  correctIndex: 0,
  answerEvidence: "둘째 문장에 직접 제시되어 있다.",
  explanation: "서준이는 밤에 잠을 잤다.",
  distractorReasons: ["", "지문에 없다.", "지문에 없다."]
});
assert.equal(validK1.passed, true);
assert.equal(validK1.metrics.choiceCount, 3);

const wrongChoiceCount = readingBank.runAutoChecks({
  ...validK1.value,
  track: "ko",
  targetLevel: 4,
  choices: validK1.value.choices,
  distractorReasons: validK1.value.distractorReasons
});
assert.equal(wrongChoiceCount.passed, false);
assert.ok(wrongChoiceCount.errors.some((error) => error.code === "CHOICE_COUNT"));

const duplicateChoices = readingBank.runAutoChecks({
  ...validK1.value,
  track: "ko",
  targetLevel: 1,
  choices: ["같은 답", " 같은   답 ", "다른 답"],
  distractorReasons: ["", "중복", "오답"]
});
assert.equal(duplicateChoices.passed, false);
assert.ok(duplicateChoices.errors.some((error) => error.code === "DUPLICATE_CHOICES"));

const invalidAnswer = readingBank.runAutoChecks({
  ...validK1.value,
  track: "ko",
  targetLevel: 1,
  correctIndex: 4
});
assert.equal(invalidAnswer.passed, false);
assert.ok(invalidAnswer.errors.some((error) => error.code === "INVALID_ANSWER"));

const missingReason = readingBank.runAutoChecks({
  ...validK1.value,
  track: "ko",
  targetLevel: 1,
  distractorReasons: ["", "", "지문에 없다."]
});
assert.equal(missingReason.passed, false);
assert.ok(missingReason.errors.some((error) => error.code === "MISSING_DISTRACTOR_REASON"));

const shortEnglish = readingBank.runAutoChecks({
  track: "en",
  targetLevel: 8,
  passageText: "Sleep helps memory.",
  promptText: "What is the main idea?",
  choices: ["A", "B", "C", "D", "E"],
  correctIndex: 0,
  answerEvidence: "The sentence says so.",
  explanation: "A is correct.",
  distractorReasons: ["", "Wrong", "Wrong", "Wrong", "Wrong"]
});
assert.equal(shortEnglish.passed, true, "Word-range guidance is a warning, not a blocking error.");
assert.ok(shortEnglish.warnings.some((warning) => warning.code === "ENGLISH_WORD_RANGE"));

const topic = readingBank.validateTopicInput({
  topicKey: " sci-sleep-001 ",
  title: "수면과 기억",
  primaryDomain: "science",
  relatedDomains: ["health_life", "science", "health_life"],
  coreQuestion: "잠은 기억에 어떤 역할을 하는가?",
  coreFacts: ["수면은 기억 공고화와 관련된다."],
  status: "draft"
});
assert.deepEqual(topic.errors, []);
assert.equal(topic.value.topicKey, "SCI-SLEEP-001");
assert.deepEqual(topic.value.relatedDomains, ["health_life"]);

const unsafeSource = readingBank.validateSourceInput({
  title: "Bad",
  publisher: "Unknown",
  sourceUrl: "javascript:alert(1)",
  sourceKind: "official"
});
assert.ok(unsafeSource.errors.length > 0);

const safeSource = readingBank.validateSourceInput({
  title: "Official reference",
  publisher: "Example Institute",
  sourceUrl: "https://example.org/reference",
  sourceKind: "official",
  publishedOn: "2026-07-21"
});
assert.deepEqual(safeSource.errors, []);

const perfectRubric = Object.fromEntries(readingBank.REVIEW_RUBRIC_KEYS.map((key) => [key, 2]));
const validReview = readingBank.validateReviewInput({
  reviewerAnswerIndex: 1,
  rubric: perfectRubric,
  decision: "pass",
  comment: ""
}, 4);
assert.deepEqual(validReview.errors, []);
assert.equal(validReview.value.totalScore, 20);
assert.deepEqual(readingBank.evaluateReview(validReview.value, 1), {
  answerMatches: true,
  criticalScoresPassed: true,
  scorePassed: true,
  passCriteriaMet: true,
  effectiveDecision: "pass"
});

const wrongIndependentAnswer = readingBank.evaluateReview(validReview.value, 2);
assert.equal(wrongIndependentAnswer.effectiveDecision, "changes_requested",
  "A pass vote must not count when the reviewer's independent answer differs from the stored answer.");

const missingChangeReason = readingBank.validateReviewInput({
  reviewerAnswerIndex: 0,
  rubric: perfectRubric,
  decision: "changes_requested",
  comment: ""
}, 3);
assert.ok(missingChangeReason.errors.length > 0);

const invalidRubric = readingBank.validateReviewInput({
  reviewerAnswerIndex: 0,
  rubric: { ...perfectRubric, safety: 3 },
  decision: "pass"
}, 3);
assert.ok(invalidRubric.errors.length > 0);

console.log("Reading bank unit: OK");
