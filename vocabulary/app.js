(function vocabularyStudyApp() {
    "use strict";

    const DATA_URL = "../assets/data/english-vocabulary-3000-v2.json";
    const IMAGE_MANIFEST_URL = "../assets/data/vocabulary-word-images-v1.json";
    const IMAGE_BASE_URL = "../assets/images/vocabulary/";
    const PROGRESS_KEY = "englishVocabulary3000ProgressV1";
    const IMAGE_PREFERENCE_KEY = "englishVocabularyImagesVisibleV1";
    const STAGES = [
        { code: "elementary", name: "초급", range: "초등학교 권장", description: "800개 · LEVEL 01-04", levels: [1, 2, 3, 4] },
        { code: "middle_common", name: "중급", range: "중학교·고등학교 공통과목 권장", description: "1,200개 · LEVEL 05-10", levels: [5, 6, 7, 8, 9, 10] },
        { code: "advanced", name: "고급", range: "그 외 과목 권장", description: "1,000개 · LEVEL 11-15", levels: [11, 12, 13, 14, 15] },
    ];

    const core = window.VocabularyCore;
    const elements = Object.fromEntries([
        "levelScreen", "studyScreen", "stageGroups", "loadingState", "toast", "playerGreeting",
        "totalKnown", "overallPercent", "overallBar", "totalStudied", "totalUnknown", "backToLevels",
        "shuffleButton", "imageToggleButton", "studyStage", "studyTitle", "cardPosition", "levelStatus", "sessionBar",
        "flashcard", "cardBadge", "wordText", "posText", "meaningText", "exampleBlock", "exampleLabel", "exampleText",
        "exampleKo", "relatedBlock", "relatedWords", "answerLayout", "wordImageBlock", "wordImage",
        "previousButton", "speakButton", "exampleSpeakButton",
        "nextButton", "unknownButton", "knownButton", "reviewUnknownButton", "studyMessage",
    ].map((id) => [id, document.getElementById(id)]));

    const state = {
        data: null,
        imageMap: new Map(),
        levels: new Map(),
        progress: loadProgress(),
        currentLevel: null,
        currentWords: [],
        currentIndex: 0,
        revealed: false,
        unknownOnly: false,
        showImages: localStorage.getItem(IMAGE_PREFERENCE_KEY) !== "false",
    };

    function loadProgress() {
        try {
            return core.normalizeProgress(JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}"));
        } catch {
            return {};
        }
    }

    function saveProgress() {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(state.progress));
    }

    function showToast(message) {
        elements.toast.textContent = message;
        elements.toast.classList.add("show");
        clearTimeout(showToast.timer);
        showToast.timer = setTimeout(() => elements.toast.classList.remove("show"), 1800);
    }

    function renderOverallProgress() {
        if (!state.data) return;
        const summary = core.summarizeWords(state.data.words, state.progress);
        const studied = summary.known + summary.unknown;
        const percent = Math.round((summary.known / state.data.totalWords) * 100);
        elements.totalKnown.textContent = summary.known.toLocaleString("ko-KR");
        elements.totalStudied.textContent = studied.toLocaleString("ko-KR");
        elements.totalUnknown.textContent = summary.unknown.toLocaleString("ko-KR");
        elements.overallPercent.textContent = `${percent}%`;
        elements.overallBar.style.width = `${percent}%`;
    }

    function createLevelButton(level, words) {
        const summary = core.summarizeWords(words, state.progress);
        const percent = Math.round((summary.known / words.length) * 100);
        const button = document.createElement("button");
        button.type = "button";
        button.className = `level-button ${core.stageClass(words[0].stageCode)}`;
        button.setAttribute("aria-label", `${words[0].levelLabel}, ${summary.known}개 외움`);
        button.innerHTML = `
            <span class="level-number">LEVEL ${String(level).padStart(2, "0")}</span>
            <strong class="level-name">${words[0].levelLabel}</strong>
            <span class="level-progress" aria-hidden="true"><span style="width:${percent}%"></span></span>
            <span class="level-count">외움 ${summary.known} · 모름 ${summary.unknown}</span>
        `;
        button.addEventListener("click", () => openLevel(level));
        return button;
    }

    function renderLevelGroups() {
        elements.stageGroups.replaceChildren();
        STAGES.forEach((stage) => {
            const section = document.createElement("section");
            section.className = "stage-group";
            section.innerHTML = `
                <div class="stage-heading">
                    <span>${stage.range}</span>
                    <h2>${stage.name}</h2>
                    <p>${stage.description}</p>
                </div>
            `;
            const grid = document.createElement("div");
            grid.className = "level-grid";
            stage.levels.forEach((level) => grid.appendChild(createLevelButton(level, state.levels.get(level))));
            section.appendChild(grid);
            elements.stageGroups.appendChild(section);
        });
    }

    function openLevel(level, options = {}) {
        const baseWords = state.levels.get(level) || [];
        const unknownOnly = Boolean(options.unknownOnly);
        const unknownWords = baseWords.filter((word) => state.progress[String(word.id)]?.status === "unknown");
        if (unknownOnly && !unknownWords.length) {
            showToast("이 레벨에는 모르는 단어가 아직 없어요.");
            return;
        }
        state.currentLevel = level;
        state.unknownOnly = unknownOnly;
        state.currentWords = unknownOnly ? unknownWords : [...baseWords];
        state.currentIndex = 0;
        state.revealed = false;
        elements.levelScreen.hidden = true;
        elements.studyScreen.hidden = false;
        window.scrollTo({ top: 0, behavior: "smooth" });
        renderStudyCard();
    }

    function currentWord() {
        return state.currentWords[state.currentIndex] || null;
    }

    function updateRevealState() {
        const word = currentWord();
        if (!word) return;
        elements.flashcard.classList.toggle("revealed", state.revealed);
        elements.flashcard.setAttribute("aria-pressed", String(state.revealed));
        elements.flashcard.setAttribute(
            "aria-label",
            state.revealed ? `${word.word}, 뜻과 예문이 표시됨` : `${word.word}, 눌러서 뜻과 예문 보기`,
        );
        elements.meaningText.setAttribute("aria-hidden", String(!state.revealed));
        elements.exampleBlock.setAttribute("aria-hidden", String(!state.revealed));
        elements.relatedBlock.setAttribute("aria-hidden", String(!state.revealed || elements.relatedBlock.hidden));
        elements.wordImageBlock.setAttribute("aria-hidden", String(!state.revealed || elements.wordImageBlock.hidden));
        elements.exampleSpeakButton.disabled = !state.revealed || !word.example?.en;
    }

    function updateImagePreference() {
        elements.imageToggleButton.textContent = state.showImages ? "그림 켜짐" : "그림 꺼짐";
        elements.imageToggleButton.setAttribute("aria-pressed", String(state.showImages));
    }

    function renderWordImage(word) {
        const image = state.showImages ? state.imageMap.get(String(word.id)) : null;
        elements.wordImageBlock.hidden = !image;
        elements.answerLayout.classList.toggle("has-image", Boolean(image));
        if (!image) {
            elements.wordImage.removeAttribute("src");
            return;
        }
        elements.wordImage.src = `${IMAGE_BASE_URL}${image.file}`;
    }

    function renderStudyCard() {
        const word = currentWord();
        if (!word) return;
        const status = state.progress[String(word.id)]?.status || "unseen";
        const baseWords = state.levels.get(state.currentLevel) || [];
        const summary = core.summarizeWords(baseWords, state.progress);
        const completion = Math.round(((state.currentIndex + 1) / state.currentWords.length) * 100);

        elements.studyStage.textContent = word.stage;
        elements.studyTitle.textContent = state.unknownOnly ? `${word.levelLabel} · 모르는 단어` : word.levelLabel;
        elements.cardPosition.textContent = `${state.currentIndex + 1} / ${state.currentWords.length}`;
        elements.levelStatus.textContent = `외움 ${summary.known} · 모름 ${summary.unknown}`;
        elements.sessionBar.style.width = `${completion}%`;
        elements.wordText.textContent = word.word;
        elements.posText.textContent = word.pos.join(" · ");
        elements.meaningText.textContent = word.meanings.join(" · ");
        renderWordImage(word);
        elements.exampleBlock.hidden = !word.example;
        elements.exampleLabel.textContent = "Example";
        elements.exampleText.textContent = word.example?.en || "";
        elements.exampleKo.textContent = word.example?.ko || "";
        const related = word.relatedWords || [
            ...word.alternate.map((relatedWord) => ({ word: relatedWord, type: "다른 표기" })),
            ...word.relatedForms.map((relatedWord) => ({ word: relatedWord, type: "변화형" })),
        ];
        elements.relatedWords.replaceChildren(...related.map((relatedWord) => {
            const chip = document.createElement("span");
            chip.className = "related-word";
            const label = document.createElement("span");
            label.textContent = relatedWord.word;
            const type = document.createElement("small");
            type.textContent = relatedWord.type;
            chip.append(label, type);
            return chip;
        }));
        elements.relatedBlock.hidden = related.length === 0;
        elements.cardBadge.textContent = status === "known" ? "외운 단어" : status === "unknown" ? "다시 보기" : "새 단어";
        elements.cardBadge.className = `card-badge ${status === "unseen" ? "" : status}`.trim();
        updateRevealState();
        elements.previousButton.disabled = state.currentIndex === 0;
        elements.nextButton.disabled = state.currentIndex === state.currentWords.length - 1;
        elements.studyMessage.textContent = state.unknownOnly ? "모른다고 표시한 단어만 복습 중입니다." : "카드를 누르거나 Space 키로 뜻·예문·연관 단어를 확인하세요.";
    }

    function toggleMeaning() {
        state.revealed = !state.revealed;
        updateRevealState();
    }

    function moveCard(direction) {
        const nextIndex = Math.max(0, Math.min(state.currentWords.length - 1, state.currentIndex + direction));
        if (nextIndex === state.currentIndex) return;
        state.currentIndex = nextIndex;
        state.revealed = false;
        renderStudyCard();
    }

    function markWord(status) {
        const word = currentWord();
        if (!word) return;
        state.progress[String(word.id)] = { status, updatedAt: new Date().toISOString() };
        saveProgress();
        renderOverallProgress();
        if (state.currentIndex < state.currentWords.length - 1) {
            moveCard(1);
        } else {
            renderStudyCard();
            showToast(status === "known" ? "마지막 단어까지 외웠어요!" : "마지막 단어까지 확인했어요.");
        }
    }

    function speakText(text, rate = 0.85) {
        if (!text || !("speechSynthesis" in window)) {
            showToast("이 브라우저에서는 발음 듣기를 지원하지 않아요.");
            return;
        }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        utterance.rate = rate;
        window.speechSynthesis.speak(utterance);
    }

    function speakCurrentWord() {
        speakText(currentWord()?.word);
    }

    function speakCurrentExample() {
        speakText(currentWord()?.example?.en, 0.78);
    }

    function shuffleCurrentLevel() {
        state.currentWords = core.shuffleWords(state.currentWords);
        state.currentIndex = 0;
        state.revealed = false;
        renderStudyCard();
        showToast("단어 순서를 섞었어요.");
    }

    function backToLevels() {
        elements.studyScreen.hidden = true;
        elements.levelScreen.hidden = false;
        renderLevelGroups();
        renderOverallProgress();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function bindEvents() {
        elements.flashcard.addEventListener("click", toggleMeaning);
        elements.previousButton.addEventListener("click", () => moveCard(-1));
        elements.nextButton.addEventListener("click", () => moveCard(1));
        elements.unknownButton.addEventListener("click", () => markWord("unknown"));
        elements.knownButton.addEventListener("click", () => markWord("known"));
        elements.speakButton.addEventListener("click", speakCurrentWord);
        elements.exampleSpeakButton.addEventListener("click", speakCurrentExample);
        elements.shuffleButton.addEventListener("click", shuffleCurrentLevel);
        elements.imageToggleButton.addEventListener("click", () => {
            state.showImages = !state.showImages;
            localStorage.setItem(IMAGE_PREFERENCE_KEY, String(state.showImages));
            updateImagePreference();
            renderStudyCard();
        });
        elements.wordImage.addEventListener("error", () => {
            elements.wordImageBlock.hidden = true;
            elements.answerLayout.classList.remove("has-image");
        });
        elements.backToLevels.addEventListener("click", backToLevels);
        elements.reviewUnknownButton.addEventListener("click", () => openLevel(state.currentLevel, { unknownOnly: true }));
        window.addEventListener("keydown", (event) => {
            if (elements.studyScreen.hidden || event.altKey || event.ctrlKey || event.metaKey) return;
            if (event.code === "Space") { event.preventDefault(); toggleMeaning(); }
            else if (event.key === "ArrowLeft") moveCard(-1);
            else if (event.key === "ArrowRight") moveCard(1);
            else if (event.key === "1") markWord("unknown");
            else if (event.key === "2") markWord("known");
        });
    }

    async function initialize() {
        try {
            const [response, imageResponse] = await Promise.all([
                fetch(DATA_URL),
                fetch(IMAGE_MANIFEST_URL).catch(() => null),
            ]);
            if (!response.ok) throw new Error(`Vocabulary data request failed: ${response.status}`);
            state.data = await response.json();
            if (imageResponse?.ok) {
                const manifest = await imageResponse.json();
                const imageEntries = Object.entries(manifest.images || {}).filter(([id, image]) => (
                    /^\d+$/.test(id)
                    && image?.word
                    && /^[a-z0-9-]+\.webp$/.test(image?.file || "")
                ));
                state.imageMap = new Map(imageEntries);
            }
            if (state.data.totalWords !== 3000 || !Array.isArray(state.data.words)) throw new Error("Invalid vocabulary data");
            if (!state.data.words.every((word) => (
                (word.example === null || (
                    word.example?.en
                    && word.example?.ko
                    && word.example?.source !== "generated_learning_prompt"
                ))
                && Array.isArray(word.relatedWords)
            ))) {
                throw new Error("Vocabulary learning data is incomplete");
            }
            state.levels = core.groupByLevel(state.data.words);
            if (state.levels.size !== 15) throw new Error("Invalid vocabulary levels");
            elements.imageToggleButton.hidden = state.imageMap.size === 0;
            updateImagePreference();
            const playerName = localStorage.getItem("classPlayerName");
            if (playerName) elements.playerGreeting.textContent = `${playerName} 님의 15레벨 단어 학습`;
            renderOverallProgress();
            renderLevelGroups();
            bindEvents();
            elements.loadingState.hidden = true;
        } catch (error) {
            console.error(error);
            elements.loadingState.querySelector("p").textContent = "단어 자료를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.";
        }
    }

    initialize();
})();
