(function (root, factory) {
    const api = factory();
    if (typeof module === "object" && module.exports) module.exports = api;
    root.IdiomCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
    "use strict";

    function shuffle(items, random = Math.random) {
        const result = [...items];
        for (let index = result.length - 1; index > 0; index -= 1) {
            const swapIndex = Math.floor(random() * (index + 1));
            [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
        }
        return result;
    }

    function normalizeProgress(raw, validIds) {
        const result = {};
        const allowed = new Set(validIds || []);
        if (!raw || typeof raw !== "object") return result;

        Object.entries(raw).forEach(([id, entry]) => {
            if (!allowed.has(id) || !entry || !["known", "review"].includes(entry.status)) return;
            result[id] = {
                status: entry.status,
                updatedAt: typeof entry.updatedAt === "string" ? entry.updatedAt : ""
            };
        });
        return result;
    }

    function summarize(data, progress) {
        const summary = { known: 0, review: 0, unseen: 0, total: data.length };
        data.forEach((idiom) => {
            const status = progress[idiom.id]?.status;
            if (status === "known") summary.known += 1;
            else if (status === "review") summary.review += 1;
            else summary.unseen += 1;
        });
        summary.percent = summary.total ? Math.round((summary.known / summary.total) * 100) : 0;
        return summary;
    }

    function filterDeck(data, filter, theme, level) {
        return data.filter((idiom) => {
            const themeMatches = !theme || theme === "전체" || idiom.theme === theme;
            const levelMatches = !level || level === "전체" || idiom.level === level;
            const status = filter?.progress?.[idiom.id]?.status;
            const statusMatches = filter?.status === "review" ? status === "review" : true;
            return themeMatches && levelMatches && statusMatches;
        });
    }

    function textSimilarity(left, right) {
        const toBigrams = (value) => {
            const normalized = String(value || "").replace(/[^가-힣A-Za-z0-9]/g, "");
            const grams = new Set();
            for (let index = 0; index < normalized.length - 1; index += 1) {
                grams.add(normalized.slice(index, index + 2));
            }
            return grams;
        };
        const leftGrams = toBigrams(left);
        const rightGrams = toBigrams(right);
        if (!leftGrams.size || !rightGrams.size) return 0;
        let common = 0;
        leftGrams.forEach((gram) => {
            if (rightGrams.has(gram)) common += 1;
        });
        return common / Math.max(leftGrams.size, rightGrams.size);
    }

    function selectDistractors(idiom, data, type, random = Math.random) {
        const ranked = shuffle(data.filter((item) => item.id !== idiom.id), random)
            .map((candidate) => {
                let score = 0;
                if (candidate.level === idiom.level) score += 6;
                if (candidate.theme === idiom.theme) score += 12;
                score += textSimilarity(idiom.meaning, candidate.meaning) * 5;
                score += textSimilarity(idiom.story, candidate.story) * (type === "story" || type === "image" ? 3 : 1);
                score += Math.max(0, 1 - Math.abs(idiom.word.length - candidate.word.length) / 4);
                return { candidate, score };
            })
            .sort((left, right) => right.score - left.score);
        return ranked.slice(0, 3).map((item) => item.candidate);
    }

    function createQuestion(idiom, data, type, random = Math.random) {
        const promptType = type === "mixed"
            ? (random() < 0.5 ? "meaning" : "story")
            : type;
        const wrong = selectDistractors(idiom, data, promptType, random);
        const options = shuffle([idiom, ...wrong], random).map((item) => ({
            id: item.id,
            label: `${item.word} · ${item.hanja}`
        }));

        return {
            id: idiom.id,
            type: promptType,
            prompt: promptType === "image"
                ? "이 삽화에 해당하는 고사성어는?"
                : (promptType === "story" ? idiom.story : idiom.meaning),
            answerId: idiom.id,
            answerLabel: `${idiom.word} · ${idiom.hanja}`,
            source: idiom.source,
            options
        };
    }

    function buildQuiz(data, count = 10, type = "mixed", random = Math.random) {
        const normalizedType = ["meaning", "story", "image", "mixed"].includes(type) ? type : "mixed";
        return shuffle(data, random)
            .slice(0, Math.min(Math.max(1, count), data.length))
            .map((idiom) => createQuestion(idiom, data, normalizedType, random));
    }

    return { shuffle, normalizeProgress, summarize, filterDeck, selectDistractors, createQuestion, buildQuiz };
});
