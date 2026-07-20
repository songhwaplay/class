(function vocabularyStudyApp() {
    "use strict";

    const DATA_URL = "../assets/data/english-vocabulary-3000-v1.json";
    const PROGRESS_KEY = "englishVocabulary3000ProgressV1";
    const STAGES = [
        { code: "elementary", name: "초급", range: "초등학교 권장", description: "생활에서 자주 쓰는 기본 어휘", levels: [1, 2, 3, 4] },
        { code: "middle_common", name: "중급", range: "중·고교 공통 권장", description: "학교 학습과 일상 표현을 넓히는 어휘", levels: [5, 6, 7, 8, 9, 10] },
        { code: "advanced", name: "고급", range: "심화 과목 권장", description: "읽기와 사고력을 확장하는 심화 어휘", levels: [11, 12, 13, 14, 15] },
    ];

    const core = window.VocabularyCore;
    const elements = Object.fromEntries([
        "levelScreen", "studyScreen", "stageGroups", "loadingState", "toast", "playerGreeting",
        "totalKnown", "overallPercent", "overallBar", "totalStudied", "totalUnknown", "backToLevels",
        "shuffleButton", "studyStage", "studyTitle", "cardPosition", "levelStatus", "sessionBar",
        "flashcard", "cardBadge", "wordText", "posText", "meaningText", "relatedText", "previousButton",
        "speakButton", "nextButton", "unknownButton", "knownButton", "reviewUnknownButton", "studyMessage",
    ].map((id) => [id, document.getElementById(id)]));

    const state = {
        data: null,
        levels: new Map(),
        progress: loadProgress(),
        currentLevel: null,
        currentWords: [],
        currentIndex: 0,
        revealed: false,
        unknownOnly: false,
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
        const related = [...word.alternate, ...word.relatedForms];
        elements.relatedText.textContent = related.length ? `관련 표현: ${related.join(", ")}` : "";
        elements.cardBadge.textContent = status === "known" ? "외운 단어" : status === "unknown" ? "다시 보기" : "새 단어";
        elements.cardBadge.className = `card-badge ${status === "unseen" ? "" : status}`.trim();
        elements.flashcard.classList.toggle("revealed", state.revealed);
        elements.flashcard.setAttribute("aria-pressed", String(state.revealed));
        elements.flashcard.setAttribute("aria-label", state.revealed ? `${word.word}, 뜻이 표시됨` : `${word.word}, 눌러서 뜻 보기`);
        elements.meaningText.setAttribute("aria-hidden", String(!state.revealed));
        elements.previousButton.disabled = state.currentIndex === 0;
        elements.nextButton.disabled = state.currentIndex === state.currentWords.length - 1;
        elements.studyMessage.textContent = state.unknownOnly ? "모른다고 표시한 단어만 복습 중입니다." : "카드를 누르거나 Space 키로 뜻을 확인하세요.";
    }

    function toggleMeaning() {
        state.revealed = !state.revealed;
        elements.flashcard.classList.toggle("revealed", state.revealed);
        elements.flashcard.setAttribute("aria-pressed", String(state.revealed));
        elements.meaningText.setAttribute("aria-hidden", String(!state.revealed));
        elements.flashcard.setAttribute(
            "aria-label",
            state.revealed ? `${currentWord().word}, 뜻이 표시됨` : `${currentWord().word}, 눌러서 뜻 보기`,
        );
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

    function speakCurrentWord() {
        const word = currentWord();
        if (!word || !("speechSynthesis" in window)) {
            showToast("이 브라우저에서는 발음 듣기를 지원하지 않아요.");
            return;
        }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(word.word);
        utterance.lang = "en-US";
        utterance.rate = 0.85;
        window.speechSynthesis.speak(utterance);
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
        elements.shuffleButton.addEventListener("click", shuffleCurrentLevel);
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
            const response = await fetch(DATA_URL);
            if (!response.ok) throw new Error(`Vocabulary data request failed: ${response.status}`);
            state.data = await response.json();
            if (state.data.totalWords !== 3000 || !Array.isArray(state.data.words)) throw new Error("Invalid vocabulary data");
            state.levels = core.groupByLevel(state.data.words);
            if (state.levels.size !== 15) throw new Error("Invalid vocabulary levels");
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
