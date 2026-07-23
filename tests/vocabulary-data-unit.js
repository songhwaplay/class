"use strict";

const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const vocabularyAssets = path.join(__dirname, "..", "learning", "basics", "vocabulary", "assets");
const dataPath = path.join(vocabularyAssets, "data", "english-vocabulary-3000-v2.json");
const payload = JSON.parse(fs.readFileSync(dataPath, "utf8"));

assert.strictEqual(payload.version, "v2");
assert.strictEqual(payload.totalWords, 3000);
assert.strictEqual(payload.words.length, 3000);
assert.strictEqual(payload.meaningOverrides.count, 24);

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
function exampleLimits(level) {
    if (level <= 4) return { words: 10, characters: 72, commas: 1 };
    if (level <= 10) return { words: 12, characters: 86, commas: 1 };
    return { words: 14, characters: 100, commas: 1 };
}
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
        const limits = exampleLimits(word.globalLevel);
        const englishWordCount = (word.example.en.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) || []).length;
        assert.ok(englishWordCount <= limits.words, `${word.word}: example is too long`);
        assert.ok(word.example.en.length <= limits.characters, `${word.word}: example has too many characters`);
        assert.ok((word.example.en.match(/,/g) || []).length <= limits.commas, `${word.word}: example has too many clauses`);
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
assert.ok(naturalExampleCount >= 2100);
assert.ok(missingExampleCount <= 900);
assert.ok(relatedWordCount >= 2400);

const ignore = payload.words.find((word) => word.word === "ignore");
assert.ok(ignore.example.en.includes("ignored"));
assert.strictEqual(ignore.example.ko, "그는 경고를 무시하고 계속 걸었다.");
assert.ok(!ignore.relatedWords.some((related) => ["cut", "snub"].includes(related.word)));

const to = payload.words.find((word) => word.word === "to");
assert.strictEqual(to.example.en, "She walked to school with her brother.");
assert.strictEqual(to.example.ko, "그녀는 남동생과 함께 학교에 걸어갔다.");

const imageManifestPath = path.join(vocabularyAssets, "data", "vocabulary-word-images-v1.json");
const imageManifest = JSON.parse(fs.readFileSync(imageManifestPath, "utf8"));
const imageEntries = Object.entries(imageManifest.images);
assert.strictEqual(imageManifest.version, 1);
assert.strictEqual(imageManifest.totalImages, 214);
assert.strictEqual(imageEntries.length, imageManifest.totalImages);
imageEntries.forEach(([id, image]) => {
    const word = payload.words.find((entry) => String(entry.id) === id);
    assert.ok(word, `image id ${id} must match a vocabulary word`);
    assert.strictEqual(word.word, image.word);
    assert.strictEqual(word.stageCode, "elementary");
    assert.match(image.file, /^[a-z0-9-]+\.webp$/);
    const imagePath = path.join(vocabularyAssets, "images", image.file);
    assert.ok(fs.existsSync(imagePath), `${image.word}: image file is missing`);
    assert.ok(fs.statSync(imagePath).size < 100_000, `${image.word}: image file is too large`);
});

const spellingGamePath = path.join(vocabularyAssets, "data", "vocabulary-spelling-game-v1.json");
const spellingGame = JSON.parse(fs.readFileSync(spellingGamePath, "utf8"));
const spellingIds = new Set(spellingGame.wordIds.map(String));
assert.strictEqual(spellingGame.version, 1);
assert.strictEqual(spellingGame.totalWords, 100);
assert.strictEqual(spellingGame.wordIds.length, spellingGame.totalWords);
assert.strictEqual(spellingIds.size, spellingGame.totalWords);
spellingIds.forEach((id) => {
    const word = payload.words.find((entry) => String(entry.id) === id);
    assert.ok(word, `spelling id ${id} must match a vocabulary word`);
    assert.ok(imageManifest.images[id], `${word.word}: spelling word must have an image`);
    assert.strictEqual(word.stageCode, "elementary");
    assert.ok(word.globalLevel >= 1 && word.globalLevel <= 4);
    assert.match(word.word, /^[a-z]{2,10}$/);
    assert.ok(word.pos.includes("명사"));
});
const ambiguousSpellingWords = new Set([
    "parent", "home", "house", "place", "city", "town", "street", "road",
    "meat", "beef", "steak", "biscuit", "doughnut", "man", "woman", "boy", "girl", "child",
]);
payload.words.forEach((word) => {
    if (spellingIds.has(String(word.id))) assert.ok(!ambiguousSpellingWords.has(word.word));
});

const imageCandidatesPath = path.join(vocabularyAssets, "data", "vocabulary-image-candidates-v1.json");
const imageCandidates = JSON.parse(fs.readFileSync(imageCandidatesPath, "utf8"));
assert.strictEqual(imageCandidates.elementaryWords, 800);
assert.strictEqual(imageCandidates.targetImages, 214);
assert.strictEqual(imageCandidates.existingImages, 214);
assert.strictEqual(imageCandidates.pendingImages, 0);
assert.strictEqual(imageCandidates.meaningReviewCount, 0);
assert.strictEqual(imageCandidates.potentialImagesAfterMeaningReview, 214);
assert.strictEqual(imageCandidates.candidates.length, imageCandidates.targetImages);
assert.strictEqual(imageCandidates.meaningReview.length, imageCandidates.meaningReviewCount);

const candidateIds = new Set(imageCandidates.candidates.map((candidate) => String(candidate.id)));
assert.strictEqual(candidateIds.size, imageCandidates.candidates.length);
imageEntries.forEach(([id]) => assert.ok(candidateIds.has(id), `existing image ${id} must remain selected`));
imageCandidates.candidates.forEach((candidate) => {
    const word = payload.words.find((entry) => entry.id === candidate.id);
    assert.ok(word);
    assert.strictEqual(word.word, candidate.word);
    assert.strictEqual(word.stageCode, "elementary");
    assert.ok(candidate.category);
    assert.ok(candidate.categoryLabel);
    assert.ok(candidate.meaning);
});

const reviewIds = new Set(imageCandidates.meaningReview.map((candidate) => String(candidate.id)));
assert.strictEqual(reviewIds.size, imageCandidates.meaningReview.length);
reviewIds.forEach((id) => assert.ok(!candidateIds.has(id), `review item ${id} must not be image-ready`));
assert.ok(!imageCandidates.candidates.some((candidate) => ["chance", "death", "luck", "power"].includes(candidate.word)));

const meaningOverridesPath = path.join(vocabularyAssets, "data", "vocabulary-meaning-overrides.json");
const meaningOverrides = JSON.parse(fs.readFileSync(meaningOverridesPath, "utf8"));
assert.strictEqual(Object.keys(meaningOverrides).length, 24);
Object.entries(meaningOverrides).forEach(([wordText, override]) => {
    const word = payload.words.find((entry) => entry.word === wordText);
    assert.ok(word, `${wordText}: overridden word must exist`);
    assert.deepStrictEqual(word.pos, override.pos);
    assert.deepStrictEqual(word.meanings, override.meanings);
    assert.strictEqual(word.example.source, "curated_override");
    assert.strictEqual(word.example.translationType, "translation");
    assert.ok(candidateIds.has(String(word.id)), `${wordText}: corrected word must be image-ready`);
});
assert.deepStrictEqual(payload.words.find((word) => word.word === "tree").meanings, ["나무."]);
assert.strictEqual(payload.words.find((word) => word.word === "bag").example.en, "My books are in my bag.");

console.log("vocabulary data unit tests: ok");
