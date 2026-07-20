(() => {
    "use strict";

    function shuffle(items, random) {
        const copy = [...items];
        for (let index = copy.length - 1; index > 0; index -= 1) {
            const randomIndex = Math.floor(random() * (index + 1));
            [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
        }
        return copy;
    }

    function take({ questions, size, storageKey, storage, random = Math.random }) {
        const ids = Array.isArray(questions) ? questions.map((question) => question.id) : [];
        const validIds = new Set(ids);
        const takeSize = Math.max(1, Number(size) || 1);
        if (validIds.size < takeSize) return [];

        let deck = [];
        try {
            const stored = JSON.parse(storage?.getItem(storageKey) || "[]");
            if (Array.isArray(stored)) {
                const seen = new Set();
                deck = stored.filter((id) => {
                    if (!validIds.has(id) || seen.has(id)) return false;
                    seen.add(id);
                    return true;
                });
            }
        } catch (error) {
            deck = [];
        }

        if (deck.length < takeSize) {
            const carried = new Set(deck);
            deck.push(...shuffle(ids, random).filter((id) => !carried.has(id)));
        }

        const selected = deck.splice(0, takeSize);
        try {
            storage?.setItem(storageKey, JSON.stringify(deck));
        } catch (error) {
            // Storage is optional; the current round can still continue.
        }
        return selected;
    }

    window.SpellingQuestionDeck = Object.freeze({ take });
})();
