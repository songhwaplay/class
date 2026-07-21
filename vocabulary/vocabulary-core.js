(function attachVocabularyCore(root, factory) {
    const api = factory();
    if (typeof module === "object" && module.exports) module.exports = api;
    if (root) root.VocabularyCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createVocabularyCore() {
    "use strict";

    const VALID_STATUS = new Set(["known", "unknown"]);

    function normalizeProgress(value) {
        if (!value || typeof value !== "object" || Array.isArray(value)) return {};
        const normalized = {};
        Object.entries(value).forEach(([id, entry]) => {
            if (!entry || !VALID_STATUS.has(entry.status)) return;
            normalized[String(id)] = {
                status: entry.status,
                updatedAt: typeof entry.updatedAt === "string" ? entry.updatedAt : "",
            };
        });
        return normalized;
    }

    function groupByLevel(words) {
        const levels = new Map();
        (Array.isArray(words) ? words : []).forEach((word) => {
            const level = Number(word.globalLevel);
            if (!Number.isInteger(level) || level < 1) return;
            if (!levels.has(level)) levels.set(level, []);
            levels.get(level).push(word);
        });
        levels.forEach((levelWords) => {
            levelWords.sort((a, b) => Number(a.order) - Number(b.order));
        });
        return levels;
    }

    function summarizeWords(words, progress) {
        const safeProgress = normalizeProgress(progress);
        return (Array.isArray(words) ? words : []).reduce((summary, word) => {
            const status = safeProgress[String(word.id)]?.status;
            if (status === "known") summary.known += 1;
            else if (status === "unknown") summary.unknown += 1;
            else summary.unseen += 1;
            return summary;
        }, { known: 0, unknown: 0, unseen: 0 });
    }

    function shuffleWords(words, random = Math.random) {
        const result = [...(Array.isArray(words) ? words : [])];
        for (let index = result.length - 1; index > 0; index -= 1) {
            const swapIndex = Math.floor(random() * (index + 1));
            [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
        }
        return result;
    }

    function stageClass(stageCode) {
        if (stageCode === "elementary") return "elementary";
        if (stageCode === "middle_common") return "middle";
        return "advanced";
    }

    function pictureGamePool(words, imageIds, level = 0) {
        const validIds = imageIds instanceof Set
            ? imageIds
            : new Set(Array.isArray(imageIds) ? imageIds.map(String) : []);
        const selectedLevel = Number(level);
        return (Array.isArray(words) ? words : []).filter((word) => (
            validIds.has(String(word.id))
            && word.stageCode === "elementary"
            && (selectedLevel === 0 || Number(word.globalLevel) === selectedLevel)
        ));
    }

    function createPictureQuestion(pool, previousId = null, random = Math.random, targetPool = pool) {
        const safePool = Array.isArray(pool) ? pool : [];
        if (safePool.length < 4) return null;
        const validIds = new Set(safePool.map((word) => String(word.id)));
        const safeTargetPool = (Array.isArray(targetPool) ? targetPool : safePool)
            .filter((word) => validIds.has(String(word.id)));
        if (!safeTargetPool.length) return null;
        const freshTargets = safeTargetPool.filter((word) => String(word.id) !== String(previousId));
        const candidates = freshTargets.length ? freshTargets : safeTargetPool;
        const target = candidates[Math.floor(random() * candidates.length)];
        const distractors = shuffleWords(
            safePool.filter((word) => String(word.id) !== String(target.id)),
            random,
        ).slice(0, 3);
        return {
            target,
            choices: shuffleWords([target, ...distractors], random),
        };
    }

    function normalizeSpellingAnswer(value) {
        return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
    }

    function spellingHint(word, revealFirst = true) {
        return normalizeSpellingAnswer(word)
            .split("")
            .map((letter, index) => (
                (revealFirst && index === 0) || letter === " " || letter === "-" ? letter : "_"
            ))
            .join(" ");
    }

    return {
        normalizeProgress,
        groupByLevel,
        summarizeWords,
        shuffleWords,
        stageClass,
        pictureGamePool,
        createPictureQuestion,
        normalizeSpellingAnswer,
        spellingHint,
    };
});
