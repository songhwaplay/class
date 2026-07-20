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

    return {
        normalizeProgress,
        groupByLevel,
        summarizeWords,
        shuffleWords,
        stageClass,
    };
});
