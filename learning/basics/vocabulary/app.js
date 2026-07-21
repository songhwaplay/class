(function vocabularyStudyApp() {
    "use strict";

    const DATA_URL = "../../../assets/data/english-vocabulary-3000-v2.json";
    const IMAGE_MANIFEST_URL = "../../../assets/data/vocabulary-word-images-v1.json";
    const SPELLING_GAME_URL = "../../../assets/data/vocabulary-spelling-game-v1.json";
    const IMAGE_BASE_URL = "../../../assets/images/vocabulary/";
    const PROGRESS_KEY = "englishVocabulary3000ProgressV1";
    const IMAGE_PREFERENCE_KEY = "englishVocabularyImagesVisibleV1";
    const SPELLING_WRONG_KEY = "englishVocabularySpellingWrongV1";
    const GAME_TIME_LIMIT = 15;
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
        "gameStartButton", "gameWordCount", "gameScreen", "backFromGame", "gameLevelButtons",
        "gameQuestionNumber", "gameScore", "gameStreak", "gameTimer", "gameTimerBar",
        "gameWord", "gameSpeakButton", "gameChoices", "gameFeedback", "gameNextButton", "gameResetButton",
        "gameQuestionPanel", "gameResultPanel", "gameResultScore", "gameResultAccuracy",
        "gameResultBestStreak", "gameWrongList", "gameRetryWrongButton", "gamePlayAgainButton",
        "spellingGameStartButton", "spellingWordCount", "spellingScreen", "backFromSpelling",
        "spellingResetButton", "spellingLevelButtons", "spellingQuestionNumber", "spellingScore",
        "spellingStreak", "spellingQuestionPanel", "spellingImage", "spellingHint", "spellingInput",
        "spellingHintButton", "spellingSpeakButton", "spellingCheckButton", "spellingFeedback",
        "spellingNextButton", "spellingResultPanel", "spellingResultScore", "spellingResultAccuracy",
        "spellingResultBestStreak", "spellingWrongList", "spellingRetryWrongButton", "spellingPlayAgainButton",
        "spellingReviewButton", "spellingStoredWrongCount", "spellingModeLabel", "spellingTitle",
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
        gameLevel: 0,
        gamePool: [],
        gameTargetPool: [],
        gameTarget: null,
        gameChoices: [],
        gamePreviousId: null,
        gameRoundLength: 10,
        gameAskedIds: new Set(),
        gameWrongWords: [],
        gameQuestionNumber: 0,
        gameScore: 0,
        gameStreak: 0,
        gameBestStreak: 0,
        gameTimeLeft: GAME_TIME_LIMIT,
        gameAnswered: false,
        gameTimerId: null,
        spellingIds: new Set(),
        spellingLevel: 0,
        spellingPool: [],
        spellingTargetPool: [],
        spellingTarget: null,
        spellingRoundLength: 10,
        spellingAskedIds: new Set(),
        spellingWrongEntries: [],
        spellingQuestionNumber: 0,
        spellingScore: 0,
        spellingStreak: 0,
        spellingBestStreak: 0,
        spellingAnswered: false,
        spellingWrongProgress: loadSpellingWrongProgress(),
        spellingReviewMode: false,
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

    function loadSpellingWrongProgress() {
        try {
            const stored = JSON.parse(localStorage.getItem(SPELLING_WRONG_KEY) || "{}");
            if (!stored || typeof stored !== "object" || Array.isArray(stored)) return {};
            const normalized = {};
            Object.entries(stored).forEach(([id, entry]) => {
                if (!/^\d+$/.test(id) || !entry || typeof entry !== "object") return;
                normalized[id] = {
                    count: Math.max(1, Number(entry.count) || 1),
                    lastAnswer: typeof entry.lastAnswer === "string" ? entry.lastAnswer : "",
                    updatedAt: typeof entry.updatedAt === "string" ? entry.updatedAt : "",
                };
            });
            return normalized;
        } catch {
            return {};
        }
    }

    function saveSpellingWrongProgress() {
        localStorage.setItem(SPELLING_WRONG_KEY, JSON.stringify(state.spellingWrongProgress));
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

    function clearGameTimer() {
        if (state.gameTimerId) clearInterval(state.gameTimerId);
        state.gameTimerId = null;
    }

    function updateGameStats() {
        elements.gameQuestionNumber.textContent = String(Math.max(1, state.gameQuestionNumber));
        elements.gameScore.textContent = String(state.gameScore);
        elements.gameStreak.textContent = String(state.gameStreak);
        elements.gameTimer.textContent = String(state.gameTimeLeft);
        elements.gameTimerBar.style.width = `${Math.max(0, (state.gameTimeLeft / GAME_TIME_LIMIT) * 100)}%`;
        elements.gameTimerBar.classList.toggle("urgent", state.gameTimeLeft <= 5);
    }

    function answerGame(selectedId, timedOut = false) {
        if (state.gameAnswered || !state.gameTarget) return;
        state.gameAnswered = true;
        clearGameTimer();
        const targetId = String(state.gameTarget.id);
        const isCorrect = String(selectedId) === targetId;
        if (isCorrect) {
            state.gameScore += 1;
            state.gameStreak += 1;
            state.gameBestStreak = Math.max(state.gameBestStreak, state.gameStreak);
        } else {
            state.gameStreak = 0;
            state.gameWrongWords.push(state.gameTarget);
        }
        elements.gameChoices.querySelectorAll(".game-choice").forEach((button) => {
            const choiceId = button.dataset.wordId;
            button.disabled = true;
            if (choiceId === targetId) button.classList.add("correct");
            else if (String(selectedId) === choiceId) button.classList.add("incorrect");
        });
        const meaning = state.gameTarget.meanings[0] || "";
        if (timedOut) {
            elements.gameFeedback.textContent = `시간 끝 · 정답은 ${state.gameTarget.word} — ${meaning}`;
            elements.gameFeedback.className = "game-feedback incorrect";
        } else if (isCorrect) {
            elements.gameFeedback.textContent = `정답 · ${state.gameTarget.word} — ${meaning}`;
            elements.gameFeedback.className = "game-feedback correct";
        } else {
            elements.gameFeedback.textContent = `오답 · 정답은 ${state.gameTarget.word} — ${meaning}`;
            elements.gameFeedback.className = "game-feedback incorrect";
        }
        elements.gameNextButton.disabled = false;
        elements.gameNextButton.textContent = state.gameQuestionNumber >= state.gameRoundLength
            ? "결과 보기"
            : "다음 문제";
        updateGameStats();
    }

    function startGameTimer() {
        clearGameTimer();
        state.gameTimeLeft = GAME_TIME_LIMIT;
        updateGameStats();
        state.gameTimerId = setInterval(() => {
            state.gameTimeLeft -= 1;
            updateGameStats();
            if (state.gameTimeLeft <= 0) answerGame(null, true);
        }, 1000);
    }

    function renderGameQuestion() {
        elements.gameWord.textContent = state.gameTarget.word;
        elements.gameFeedback.textContent = "1~4번 그림을 선택하세요.";
        elements.gameFeedback.className = "game-feedback";
        elements.gameNextButton.disabled = true;
        elements.gameNextButton.textContent = "다음 문제";
        elements.gameChoices.replaceChildren(...state.gameChoices.map((word, index) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "game-choice";
            button.dataset.wordId = String(word.id);
            button.setAttribute("aria-label", `${index + 1}번 그림`);
            const image = document.createElement("img");
            image.src = `${IMAGE_BASE_URL}${state.imageMap.get(String(word.id)).file}`;
            image.alt = "";
            image.width = 420;
            image.height = 420;
            const number = document.createElement("span");
            number.className = "game-choice-number";
            number.textContent = String(index + 1);
            button.append(image, number);
            button.addEventListener("click", () => answerGame(word.id));
            return button;
        }));
        updateGameStats();
        startGameTimer();
    }

    function nextGameQuestion() {
        const availableTargets = state.gameTargetPool.filter(
            (word) => !state.gameAskedIds.has(String(word.id)),
        );
        const question = core.createPictureQuestion(
            state.gamePool,
            state.gamePreviousId,
            Math.random,
            availableTargets,
        );
        if (!question) {
            if (state.gameQuestionNumber > 0) showGameResult();
            return;
        }
        state.gamePreviousId = question.target.id;
        state.gameAskedIds.add(String(question.target.id));
        state.gameTarget = question.target;
        state.gameChoices = question.choices;
        state.gameQuestionNumber += 1;
        state.gameAnswered = false;
        renderGameQuestion();
    }

    function showGameResult() {
        clearGameTimer();
        state.gameTimeLeft = 0;
        updateGameStats();
        elements.gameQuestionPanel.hidden = true;
        elements.gameResultPanel.hidden = false;
        const accuracy = Math.round((state.gameScore / state.gameRoundLength) * 100);
        elements.gameResultScore.textContent = `${state.gameScore} / ${state.gameRoundLength}`;
        elements.gameResultAccuracy.textContent = `${accuracy}%`;
        elements.gameResultBestStreak.textContent = String(state.gameBestStreak);
        if (state.gameWrongWords.length) {
            elements.gameWrongList.replaceChildren(...state.gameWrongWords.map((word) => {
                const chip = document.createElement("span");
                chip.className = "game-wrong-word";
                chip.textContent = `${word.word} · ${word.meanings[0] || ""}`;
                return chip;
            }));
        } else {
            const message = document.createElement("span");
            message.textContent = "틀린 단어가 없습니다.";
            elements.gameWrongList.replaceChildren(message);
        }
        elements.gameRetryWrongButton.hidden = state.gameWrongWords.length === 0;
    }

    function startGameRound(targetPool = state.gamePool) {
        clearGameTimer();
        state.gameTargetPool = [...targetPool];
        state.gameRoundLength = Math.min(10, state.gameTargetPool.length);
        state.gameTarget = null;
        state.gamePreviousId = null;
        state.gameAskedIds = new Set();
        state.gameWrongWords = [];
        state.gameQuestionNumber = 0;
        state.gameScore = 0;
        state.gameStreak = 0;
        state.gameBestStreak = 0;
        elements.gameQuestionPanel.hidden = false;
        elements.gameResultPanel.hidden = true;
        nextGameQuestion();
    }

    function continueGame() {
        if (!state.gameAnswered) return;
        if (state.gameQuestionNumber >= state.gameRoundLength) showGameResult();
        else nextGameQuestion();
    }

    function selectGameLevel(level) {
        state.gameLevel = Number(level);
        state.gamePool = core.pictureGamePool(
            state.data.words,
            new Set(state.imageMap.keys()),
            state.gameLevel,
        );
        elements.gameLevelButtons.querySelectorAll("[data-level]").forEach((button) => {
            button.setAttribute("aria-pressed", String(Number(button.dataset.level) === state.gameLevel));
        });
        startGameRound(state.gamePool);
    }

    function openGame() {
        elements.levelScreen.hidden = true;
        elements.studyScreen.hidden = true;
        elements.gameScreen.hidden = false;
        selectGameLevel(state.gameLevel);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function backFromGame() {
        clearGameTimer();
        elements.gameScreen.hidden = true;
        elements.levelScreen.hidden = false;
        renderLevelGroups();
        renderOverallProgress();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function storedSpellingWrongWords() {
        if (!state.data) return [];
        const wordsById = new Map(state.data.words.map((word) => [String(word.id), word]));
        return Object.keys(state.spellingWrongProgress)
            .filter((id) => state.spellingIds.has(id) && wordsById.has(id))
            .map((id) => wordsById.get(id));
    }

    function renderStoredSpellingWrong() {
        const validIds = new Set(storedSpellingWrongWords().map((word) => String(word.id)));
        Object.keys(state.spellingWrongProgress).forEach((id) => {
            if (!validIds.has(id)) delete state.spellingWrongProgress[id];
        });
        const count = validIds.size;
        elements.spellingStoredWrongCount.textContent = count.toLocaleString("ko-KR");
        elements.spellingReviewButton.hidden = count === 0;
        saveSpellingWrongProgress();
    }

    function setSpellingReviewMode(isReview) {
        state.spellingReviewMode = isReview;
        elements.spellingModeLabel.textContent = isReview ? "저장된 철자 오답" : "초급 철자 게임";
        elements.spellingTitle.textContent = isReview ? "누적 오답 다시 풀기" : "그림 보고 철자 쓰기";
        if (isReview) {
            elements.spellingLevelButtons.querySelectorAll("[data-level]").forEach((button) => {
                button.setAttribute("aria-pressed", "false");
            });
        }
    }

    function updateSpellingStats() {
        elements.spellingQuestionNumber.textContent = String(Math.max(1, state.spellingQuestionNumber));
        elements.spellingScore.textContent = String(state.spellingScore);
        elements.spellingStreak.textContent = String(state.spellingStreak);
    }

    function renderSpellingQuestion() {
        const image = state.imageMap.get(String(state.spellingTarget.id));
        elements.spellingImage.src = `${IMAGE_BASE_URL}${image.file}`;
        elements.spellingInput.value = "";
        elements.spellingInput.disabled = false;
        elements.spellingInput.className = "spelling-input";
        elements.spellingHint.textContent = core.spellingHint(state.spellingTarget.word, false);
        elements.spellingFeedback.textContent = "철자를 입력하세요.";
        elements.spellingFeedback.className = "game-feedback";
        elements.spellingHintButton.disabled = false;
        elements.spellingCheckButton.disabled = false;
        elements.spellingNextButton.disabled = true;
        elements.spellingNextButton.textContent = "다음 문제";
        updateSpellingStats();
        requestAnimationFrame(() => elements.spellingInput.focus());
    }

    function nextSpellingQuestion() {
        const availableTargets = state.spellingTargetPool.filter(
            (word) => !state.spellingAskedIds.has(String(word.id)),
        );
        if (!availableTargets.length) {
            if (state.spellingQuestionNumber > 0) showSpellingResult();
            return;
        }
        const target = core.shuffleWords(availableTargets)[0];
        state.spellingTarget = target;
        state.spellingAskedIds.add(String(target.id));
        state.spellingQuestionNumber += 1;
        state.spellingAnswered = false;
        renderSpellingQuestion();
    }

    function checkSpellingAnswer() {
        if (state.spellingAnswered || !state.spellingTarget) return;
        const answer = core.normalizeSpellingAnswer(elements.spellingInput.value);
        if (!answer) {
            elements.spellingFeedback.textContent = "철자를 먼저 입력하세요.";
            elements.spellingFeedback.className = "game-feedback incorrect";
            elements.spellingInput.focus();
            return;
        }
        state.spellingAnswered = true;
        const targetId = String(state.spellingTarget.id);
        const correctAnswer = core.normalizeSpellingAnswer(state.spellingTarget.word);
        const isCorrect = answer === correctAnswer;
        if (isCorrect) {
            state.spellingScore += 1;
            state.spellingStreak += 1;
            state.spellingBestStreak = Math.max(state.spellingBestStreak, state.spellingStreak);
            delete state.spellingWrongProgress[targetId];
        } else {
            state.spellingStreak = 0;
            state.spellingWrongEntries.push({ word: state.spellingTarget, answer });
            const previous = state.spellingWrongProgress[targetId];
            state.spellingWrongProgress[targetId] = {
                count: (previous?.count || 0) + 1,
                lastAnswer: answer,
                updatedAt: new Date().toISOString(),
            };
        }
        renderStoredSpellingWrong();
        elements.spellingInput.disabled = true;
        elements.spellingInput.classList.add(isCorrect ? "correct" : "incorrect");
        elements.spellingHintButton.disabled = true;
        elements.spellingCheckButton.disabled = true;
        elements.spellingFeedback.textContent = isCorrect
            ? `정답 · ${state.spellingTarget.word}`
            : `오답 · 정답은 ${state.spellingTarget.word}`;
        elements.spellingFeedback.className = `game-feedback ${isCorrect ? "correct" : "incorrect"}`;
        elements.spellingNextButton.disabled = false;
        elements.spellingNextButton.textContent = state.spellingQuestionNumber >= state.spellingRoundLength
            ? "결과 보기"
            : "다음 문제";
        updateSpellingStats();
    }

    function showSpellingHint() {
        if (!state.spellingTarget || state.spellingAnswered) return;
        elements.spellingHint.textContent = core.spellingHint(state.spellingTarget.word);
        elements.spellingInput.focus();
    }

    function showSpellingResult() {
        elements.spellingQuestionPanel.hidden = true;
        elements.spellingResultPanel.hidden = false;
        const accuracy = state.spellingRoundLength
            ? Math.round((state.spellingScore / state.spellingRoundLength) * 100)
            : 0;
        elements.spellingResultScore.textContent = `${state.spellingScore} / ${state.spellingRoundLength}`;
        elements.spellingResultAccuracy.textContent = `${accuracy}%`;
        elements.spellingResultBestStreak.textContent = String(state.spellingBestStreak);
        if (state.spellingWrongEntries.length) {
            elements.spellingWrongList.replaceChildren(...state.spellingWrongEntries.map((entry) => {
                const chip = document.createElement("span");
                chip.className = "game-wrong-word";
                chip.textContent = `${entry.word.word} · 입력: ${entry.answer}`;
                return chip;
            }));
        } else {
            const message = document.createElement("span");
            message.textContent = "틀린 단어가 없습니다.";
            elements.spellingWrongList.replaceChildren(message);
        }
        elements.spellingRetryWrongButton.hidden = state.spellingWrongEntries.length === 0;
        const remainingStored = storedSpellingWrongWords().length;
        elements.spellingPlayAgainButton.textContent = state.spellingReviewMode && remainingStored
            ? `남은 오답 ${remainingStored}개`
            : "새 10문제";
    }

    function startSpellingRound(targetPool = state.spellingPool) {
        state.spellingTargetPool = [...targetPool];
        state.spellingRoundLength = Math.min(10, state.spellingTargetPool.length);
        state.spellingTarget = null;
        state.spellingAskedIds = new Set();
        state.spellingWrongEntries = [];
        state.spellingQuestionNumber = 0;
        state.spellingScore = 0;
        state.spellingStreak = 0;
        state.spellingBestStreak = 0;
        state.spellingAnswered = false;
        elements.spellingQuestionPanel.hidden = false;
        elements.spellingResultPanel.hidden = true;
        nextSpellingQuestion();
    }

    function continueSpelling() {
        if (!state.spellingAnswered) return;
        if (state.spellingQuestionNumber >= state.spellingRoundLength) showSpellingResult();
        else nextSpellingQuestion();
    }

    function restartSpellingMode() {
        if (state.spellingReviewMode) {
            const storedWords = storedSpellingWrongWords();
            if (storedWords.length) {
                startSpellingRound(storedWords);
                return;
            }
            setSpellingReviewMode(false);
        }
        selectSpellingLevel(state.spellingLevel);
    }

    function selectSpellingLevel(level) {
        setSpellingReviewMode(false);
        state.spellingLevel = Number(level);
        state.spellingPool = core.pictureGamePool(
            state.data.words,
            state.spellingIds,
            state.spellingLevel,
        );
        elements.spellingLevelButtons.querySelectorAll("[data-level]").forEach((button) => {
            button.setAttribute("aria-pressed", String(Number(button.dataset.level) === state.spellingLevel));
        });
        startSpellingRound(state.spellingPool);
    }

    function openSpellingGame() {
        clearGameTimer();
        elements.levelScreen.hidden = true;
        elements.studyScreen.hidden = true;
        elements.gameScreen.hidden = true;
        elements.spellingScreen.hidden = false;
        selectSpellingLevel(state.spellingLevel);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function openSpellingReview() {
        const storedWords = storedSpellingWrongWords();
        if (!storedWords.length) {
            renderStoredSpellingWrong();
            showToast("저장된 철자 오답이 없습니다.");
            return;
        }
        clearGameTimer();
        elements.levelScreen.hidden = true;
        elements.studyScreen.hidden = true;
        elements.gameScreen.hidden = true;
        elements.spellingScreen.hidden = false;
        setSpellingReviewMode(true);
        startSpellingRound(storedWords);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function backFromSpelling() {
        elements.spellingScreen.hidden = true;
        elements.levelScreen.hidden = false;
        renderStoredSpellingWrong();
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
        elements.gameStartButton.addEventListener("click", openGame);
        elements.backFromGame.addEventListener("click", backFromGame);
        elements.gameNextButton.addEventListener("click", continueGame);
        elements.gameResetButton.addEventListener("click", () => startGameRound(state.gamePool));
        elements.gameSpeakButton.addEventListener("click", () => speakText(state.gameTarget?.word));
        elements.gamePlayAgainButton.addEventListener("click", () => startGameRound(state.gamePool));
        elements.gameRetryWrongButton.addEventListener("click", () => {
            const retryWords = [...state.gameWrongWords];
            startGameRound(retryWords);
        });
        elements.gameLevelButtons.addEventListener("click", (event) => {
            const button = event.target.closest("[data-level]");
            if (button) selectGameLevel(button.dataset.level);
        });
        elements.spellingGameStartButton.addEventListener("click", openSpellingGame);
        elements.spellingReviewButton.addEventListener("click", openSpellingReview);
        elements.backFromSpelling.addEventListener("click", backFromSpelling);
        elements.spellingResetButton.addEventListener("click", restartSpellingMode);
        elements.spellingHintButton.addEventListener("click", showSpellingHint);
        elements.spellingSpeakButton.addEventListener("click", () => speakText(state.spellingTarget?.word));
        elements.spellingCheckButton.addEventListener("click", checkSpellingAnswer);
        elements.spellingNextButton.addEventListener("click", continueSpelling);
        elements.spellingPlayAgainButton.addEventListener("click", restartSpellingMode);
        elements.spellingRetryWrongButton.addEventListener("click", () => {
            const retryWords = state.spellingWrongEntries.map((entry) => entry.word);
            startSpellingRound(retryWords);
        });
        elements.spellingLevelButtons.addEventListener("click", (event) => {
            const button = event.target.closest("[data-level]");
            if (button && !button.disabled) selectSpellingLevel(button.dataset.level);
        });
        window.addEventListener("keydown", (event) => {
            if (event.altKey || event.ctrlKey || event.metaKey) return;
            if (!elements.spellingScreen.hidden) {
                if (event.key === "Enter" && !elements.spellingQuestionPanel.hidden) {
                    event.preventDefault();
                    if (state.spellingAnswered) continueSpelling();
                    else checkSpellingAnswer();
                }
                return;
            }
            if (!elements.gameScreen.hidden) {
                const choiceIndex = Number(event.key) - 1;
                if (choiceIndex >= 0 && choiceIndex < 4 && !state.gameAnswered) {
                    event.preventDefault();
                    elements.gameChoices.querySelectorAll(".game-choice")[choiceIndex]?.click();
                } else if (event.key === "Enter" && state.gameAnswered && !elements.gameQuestionPanel.hidden) {
                    event.preventDefault();
                    continueGame();
                }
                return;
            }
            if (elements.studyScreen.hidden) return;
            if (event.code === "Space") { event.preventDefault(); toggleMeaning(); }
            else if (event.key === "ArrowLeft") moveCard(-1);
            else if (event.key === "ArrowRight") moveCard(1);
            else if (event.key === "1") markWord("unknown");
            else if (event.key === "2") markWord("known");
        });
    }

    async function initialize() {
        try {
            const [response, imageResponse, spellingResponse] = await Promise.all([
                fetch(DATA_URL),
                fetch(IMAGE_MANIFEST_URL).catch(() => null),
                fetch(SPELLING_GAME_URL).catch(() => null),
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
            if (spellingResponse?.ok) {
                const spellingManifest = await spellingResponse.json();
                const vocabularyIds = new Set(state.data.words.map((word) => String(word.id)));
                state.spellingIds = new Set((spellingManifest.wordIds || [])
                    .map(String)
                    .filter((id) => vocabularyIds.has(id) && state.imageMap.has(id)));
            }
            elements.imageToggleButton.hidden = state.imageMap.size === 0;
            const gamePool = core.pictureGamePool(state.data.words, new Set(state.imageMap.keys()));
            elements.gameWordCount.textContent = gamePool.length.toLocaleString("ko-KR");
            elements.gameStartButton.hidden = gamePool.length < 4;
            elements.gameLevelButtons.querySelectorAll("[data-level]").forEach((button) => {
                const levelPool = core.pictureGamePool(
                    state.data.words,
                    new Set(state.imageMap.keys()),
                    button.dataset.level,
                );
                button.disabled = levelPool.length < 4;
            });
            const spellingPool = core.pictureGamePool(state.data.words, state.spellingIds);
            elements.spellingWordCount.textContent = spellingPool.length.toLocaleString("ko-KR");
            elements.spellingGameStartButton.hidden = spellingPool.length === 0;
            elements.spellingLevelButtons.querySelectorAll("[data-level]").forEach((button) => {
                const levelPool = core.pictureGamePool(
                    state.data.words,
                    state.spellingIds,
                    button.dataset.level,
                );
                button.disabled = levelPool.length === 0;
            });
            renderStoredSpellingWrong();
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
