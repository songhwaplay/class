(function () {
    "use strict";

    const data = Array.isArray(window.IDIOM_DATA) ? window.IDIOM_DATA : [];
    const core = window.IdiomCore;
    const PLAYER_NAME_KEY = "classPlayerName";
    const LEGACY_PROGRESS_KEY = "classIdiomsProgressV1";
    const LEGACY_BEST_SCORE_KEY = "classIdiomsBestScoreV1";
    const playerName = String(localStorage.getItem(PLAYER_NAME_KEY) || "").replace(/[^가-힣]/g, "").slice(0, 6);
    const playerKeySuffix = playerName ? `:${encodeURIComponent(playerName)}` : "";
    const PROGRESS_KEY = `${LEGACY_PROGRESS_KEY}${playerKeySuffix}`;
    const BEST_SCORE_KEY = `${LEGACY_BEST_SCORE_KEY}${playerKeySuffix}`;
    const ILLUSTRATIONS = {
        sipjungpalgu: "assets/idioms/sipjungpalgu.webp",
        cheonsinmango: "assets/idioms/cheonsinmango.webp",
        samsaileon: "assets/idioms/samsaileon.webp",
        geungeomjeoryak: "assets/idioms/geungeomjeoryak.webp",
        jamunjadap: "assets/idioms/jamunjadap.webp",
        bulmungaji: "assets/idioms/bulmungaji.webp",
        suguchosim: "assets/idioms/suguchosim.webp",
        yongdusami: "assets/idioms/yongdusami.webp",
        cheonjaeilu: "assets/idioms/cheonjaeilu.webp",
        gogunbuntu: "assets/idioms/gogunbuntu.webp",
        gakjuguggeom: "assets/idioms/gakjuguggeom.webp",
        gojingamrae: "assets/idioms/gojingamrae.webp",
        isimjeonsim: "assets/idioms/isimjeonsim.webp",
        yeokjisaji: "assets/idioms/yeokjisaji.webp",
        jumagapyeon: "assets/idioms/jumagapyeon.webp",
        chiljeonpalgi: "assets/idioms/chiljeonpalgi.webp",
        ilseogijo: "assets/idioms/ilseogijo.webp",
        jagsimsamil: "assets/idioms/jagsimsamil.webp",
        jaeopjadeuk: "assets/idioms/jaeopjadeuk.webp",
        dongsangimong: "assets/idioms/dongsangimong.webp",
        gyeoljahaeji: "assets/idioms/gyeoljahaeji.webp",
        josammosa: "assets/idioms/josammosa.webp",
        dadaikseon: "assets/idioms/dadaikseon.webp",
        saeongjima: "assets/idioms/saeongjima.webp",
        eobujiri: "assets/idioms/eobujiri.webp",
        samyeonchoga: "assets/idioms/samyeonchoga.webp",
        samgochoryeo: "assets/idioms/samgochoryeo.webp",
        cheongchureoram: "assets/idioms/cheongchureoram.webp",
        hwaryongjeomjeong: "assets/idioms/hwaryongjeomjeong.webp",
        gungyeilhak: "assets/idioms/gungyeilhak.webp",
        wasinsangdam: "assets/idioms/wasinsangdam.webp",
        giu: "assets/idioms/giu.webp",
        baekbalbaekjung: "assets/idioms/baekbalbaekjung.webp",
        deungyongmun: "assets/idioms/deungyongmun.webp",
        mosun: "assets/idioms/mosun.webp",
        sajok: "assets/idioms/sajok.webp",
        baekmi: "assets/idioms/baekmi.webp",
        toego: "assets/idioms/toego.webp",
        osipbobaekbo: "assets/idioms/osipbobaekbo.webp",
        gwayubulgeup: "assets/idioms/gwayubulgeup.webp",
        ugongisan: "assets/idioms/ugongisan.webp",
        hogahowi: "assets/idioms/hogahowi.webp",
        tasanjiseok: "assets/idioms/tasanjiseok.webp",
        daegimanseong: "assets/idioms/daegimanseong.webp",
        yubimuhwan: "assets/idioms/yubimuhwan.webp",
        ongojisin: "assets/idioms/ongojisin.webp",
        jeonhwawibok: "assets/idioms/jeonhwawibok.webp",
        maengmosamcheon: "assets/idioms/maengmosamcheon.webp",
        jirokwima: "assets/idioms/jirokwima.webp",
        pajukjise: "assets/idioms/pajukjise.webp",
        gyereuk: "assets/idioms/gyereuk.webp",
        gyeolchooseun: "assets/idioms/gyeolchooseun.webp",
        bulchihamun: "assets/idioms/bulchihamun.webp",
        dongbyeongsangryeon: "assets/idioms/dongbyeongsangryeon.webp",
        gwontojungrae: "assets/idioms/gwontojungrae.webp",
        gwanpojigyo: "assets/idioms/gwanpojigyo.webp",
        tosagupaeng: "assets/idioms/tosagupaeng.webp",
        sueojigyo: "assets/idioms/sueojigyo.webp",
        hyeongseoljigong: "assets/idioms/hyeongseoljigong.webp",
        jeolchatakma: "assets/idioms/jeolchatakma.webp",
        yeonmokgueo: "assets/idioms/yeonmokgueo.webp",
        mosujacheon: "assets/idioms/mosujacheon.webp",
        nangjungjichu: "assets/idioms/nangjungjichu.webp",
        owoldongju: "assets/idioms/owoldongju.webp",
        yangsanggunja: "assets/idioms/yangsanggunja.webp"
    };

    function migrateLegacyStorage() {
        if (!playerName) return;

        try {
            if (localStorage.getItem(PROGRESS_KEY) === null) {
                const legacyProgress = localStorage.getItem(LEGACY_PROGRESS_KEY);
                if (legacyProgress !== null) {
                    localStorage.setItem(PROGRESS_KEY, legacyProgress);
                    localStorage.removeItem(LEGACY_PROGRESS_KEY);
                }
            }

            if (localStorage.getItem(BEST_SCORE_KEY) === null) {
                const legacyBestScore = localStorage.getItem(LEGACY_BEST_SCORE_KEY);
                if (legacyBestScore !== null) {
                    localStorage.setItem(BEST_SCORE_KEY, legacyBestScore);
                    localStorage.removeItem(LEGACY_BEST_SCORE_KEY);
                }
            }
        } catch (_) {}
    }

    migrateLegacyStorage();

    const byId = (id) => document.getElementById(id);
    const elements = {
        headerKnown: byId("headerKnown"), headerTotal: byId("headerTotal"),
        masteryPercent: byId("masteryPercent"), masteryBar: byId("masteryBar"),
        knownCount: byId("knownCount"), reviewCount: byId("reviewCount"), unseenCount: byId("unseenCount"),
        levelSelect: byId("levelSelect"), themeSelect: byId("themeSelect"), reviewOnlyButton: byId("reviewOnlyButton"), shuffleDeckButton: byId("shuffleDeckButton"),
        emptyDeck: byId("emptyDeck"), showAllButton: byId("showAllButton"), studyArea: byId("studyArea"),
        cardPosition: byId("cardPosition"), cardProgress: byId("cardProgress"), idiomCard: byId("idiomCard"),
        themeBadge: byId("themeBadge"), verificationBadge: byId("verificationBadge"),
        idiomHanja: byId("idiomHanja"), idiomWord: byId("idiomWord"), cardDetails: byId("cardDetails"),
        idiomMeaning: byId("idiomMeaning"), idiomStory: byId("idiomStory"),
        idiomIllustration: byId("idiomIllustration"), idiomIllustrationImage: byId("idiomIllustrationImage"),
        idiomSource: byId("idiomSource"), sourceNote: byId("sourceNote"),
        previousCard: byId("previousCard"), nextCard: byId("nextCard"), revealCard: byId("revealCard"),
        memoryActions: byId("memoryActions"), markReview: byId("markReview"), markKnown: byId("markKnown"),
        gameIntro: byId("gameIntro"), quizStage: byId("quizStage"), quizResult: byId("quizResult"),
        bestScore: byId("bestScore"), quizLevelSelect: byId("quizLevelSelect"), startQuiz: byId("startQuiz"), quizPosition: byId("quizPosition"),
        quizStreak: byId("quizStreak"), quizScore: byId("quizScore"), quizBar: byId("quizBar"),
        questionType: byId("questionType"), questionPrompt: byId("questionPrompt"), answerOptions: byId("answerOptions"),
        questionIllustration: byId("questionIllustration"), questionIllustrationImage: byId("questionIllustrationImage"),
        answerFeedback: byId("answerFeedback"), feedbackTitle: byId("feedbackTitle"), feedbackCopy: byId("feedbackCopy"),
        feedbackStory: byId("feedbackStory"), feedbackStoryCopy: byId("feedbackStoryCopy"),
        nextQuestion: byId("nextQuestion"), resultTitle: byId("resultTitle"), resultScore: byId("resultScore"),
        resultMessage: byId("resultMessage"), resultMistakeList: byId("resultMistakeList"),
        retryQuiz: byId("retryQuiz"), retryMistakes: byId("retryMistakes"), reviewMistakes: byId("reviewMistakes"),
        libraryTotal: byId("libraryTotal"), libraryLevelSelect: byId("libraryLevelSelect"), librarySearch: byId("librarySearch"), themeFilters: byId("themeFilters"),
        libraryGrid: byId("libraryGrid"), libraryEmpty: byId("libraryEmpty"), toast: byId("toast"),
        playerGreeting: byId("playerGreeting")
    };

    let progress = loadProgress();
    let deck = [...data];
    let currentIndex = 0;
    let revealed = false;
    let reviewOnly = false;
    let selectedLevel = "초급";
    let selectedTheme = "전체";
    let selectedQuizMode = "mixed";
    let selectedQuizLevel = "초급";
    let quiz = [];
    let quizIndex = 0;
    let quizScore = 0;
    let quizStreak = 0;
    let quizAnswered = false;
    let quizMistakes = [];
    let quizIsMistakeRetry = false;
    let selectedLibraryTheme = "전체";
    let selectedLibraryLevel = "초급";
    let toastTimer = 0;

    function readJson(key, fallback) {
        try {
            const parsed = JSON.parse(localStorage.getItem(key));
            return parsed ?? fallback;
        } catch (_) {
            return fallback;
        }
    }

    function loadProgress() {
        return core.normalizeProgress(readJson(PROGRESS_KEY, {}), data.map((item) => item.id));
    }

    function saveProgress() {
        try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress)); } catch (_) {}
    }

    function getBestScore() {
        const value = Number(localStorage.getItem(BEST_SCORE_KEY) || 0);
        return Number.isFinite(value) ? Math.max(0, Math.min(10, value)) : 0;
    }

    function showToast(message) {
        clearTimeout(toastTimer);
        elements.toast.textContent = message;
        elements.toast.classList.add("show");
        toastTimer = setTimeout(() => elements.toast.classList.remove("show"), 1700);
    }

    function currentIdiom() {
        return deck[currentIndex] || null;
    }

    function renderSummary() {
        const summary = core.summarize(data, progress);
        elements.headerKnown.textContent = summary.known;
        elements.headerTotal.textContent = `/ ${summary.total}`;
        elements.masteryPercent.textContent = `${summary.percent}%`;
        elements.masteryBar.style.width = `${summary.percent}%`;
        elements.knownCount.textContent = summary.known;
        elements.reviewCount.textContent = summary.review;
        elements.unseenCount.textContent = summary.unseen;
    }

    function buildDeck(options = {}) {
        const previousId = options.keepId || currentIdiom()?.id;
        deck = core.filterDeck(data, {
            status: reviewOnly ? "review" : "all",
            progress
        }, selectedTheme, selectedLevel);

        if (options.shuffle) deck = core.shuffle(deck);
        const preservedIndex = previousId ? deck.findIndex((item) => item.id === previousId) : -1;
        currentIndex = preservedIndex >= 0 ? preservedIndex : Math.min(currentIndex, Math.max(0, deck.length - 1));
        revealed = false;
        renderCard();
    }

    function setRevealed(value) {
        if (!currentIdiom()) return;
        revealed = value;
        elements.idiomCard.classList.toggle("revealed", revealed);
        elements.cardDetails.hidden = !revealed;
        elements.memoryActions.hidden = !revealed;
        elements.revealCard.textContent = revealed ? "뜻과 유래 접기" : "뜻과 유래 보기";
        elements.revealCard.setAttribute("aria-expanded", String(revealed));
    }

    function renderMemoryStatus(idiom) {
        const status = progress[idiom.id]?.status || "";
        elements.markKnown.classList.toggle("selected", status === "known");
        elements.markReview.classList.toggle("selected", status === "review");
        elements.markKnown.setAttribute("aria-pressed", String(status === "known"));
        elements.markReview.setAttribute("aria-pressed", String(status === "review"));
    }

    function renderCard() {
        const idiom = currentIdiom();
        const hasCards = Boolean(idiom);
        elements.emptyDeck.hidden = hasCards;
        elements.studyArea.hidden = !hasCards;
        if (!idiom) return;

        elements.cardPosition.textContent = `${currentIndex + 1} / ${deck.length}`;
        elements.cardProgress.style.width = `${((currentIndex + 1) / deck.length) * 100}%`;
        elements.themeBadge.textContent = `${idiom.level} · ${idiom.theme}`;
        elements.verificationBadge.textContent = idiom.verification;
        elements.verificationBadge.classList.toggle("compare", idiom.verification !== "원전 확인");
        elements.idiomHanja.textContent = idiom.hanja;
        elements.idiomWord.textContent = idiom.word;
        elements.idiomMeaning.textContent = idiom.meaning;
        elements.idiomStory.textContent = idiom.story;
        const illustration = ILLUSTRATIONS[idiom.id] || "";
        elements.idiomIllustration.hidden = !illustration;
        if (illustration) {
            elements.idiomIllustrationImage.src = illustration;
            elements.idiomIllustrationImage.alt = `${idiom.word} 유래 삽화`;
        } else {
            elements.idiomIllustrationImage.removeAttribute("src");
            elements.idiomIllustrationImage.alt = "";
        }
        elements.idiomSource.textContent = idiom.source;
        elements.sourceNote.textContent = idiom.sourceNote;
        elements.previousCard.disabled = deck.length < 2;
        elements.nextCard.disabled = deck.length < 2;
        renderMemoryStatus(idiom);
        setRevealed(revealed);
    }

    function moveCard(direction) {
        if (!deck.length) return;
        currentIndex = (currentIndex + direction + deck.length) % deck.length;
        revealed = false;
        renderCard();
        elements.idiomCard.focus({ preventScroll: true });
    }

    function markCurrent(status) {
        const idiom = currentIdiom();
        if (!idiom) return;
        progress[idiom.id] = { status, updatedAt: new Date().toISOString() };
        saveProgress();
        renderSummary();
        showToast(`${idiom.word}: ${status === "known" ? "암기 완료" : "복습 필요"}`);

        if (reviewOnly && status === "known") {
            buildDeck();
        } else {
            renderMemoryStatus(idiom);
            setTimeout(() => moveCard(1), 320);
        }
    }

    function switchView(viewName) {
        document.querySelectorAll(".mode-tab").forEach((button) => {
            const active = button.dataset.view === viewName;
            button.classList.toggle("active", active);
            button.setAttribute("aria-selected", String(active));
        });
        document.querySelectorAll(".view-panel").forEach((panel) => {
            panel.hidden = panel.id !== `${viewName}View`;
        });
        if (viewName === "library") renderLibrary();
    }

    function renderBestScore() {
        elements.bestScore.textContent = `${getBestScore()} / 10`;
    }

    function startQuiz(mistakeIds = null) {
        const levelPool = data.filter((idiom) => selectedQuizLevel === "전체" || idiom.level === selectedQuizLevel);
        const quizPool = selectedQuizMode === "image"
            ? levelPool.filter((idiom) => Boolean(ILLUSTRATIONS[idiom.id]))
            : levelPool;
        if (quizPool.length < 4) {
            showToast("이 단계에는 삽화 문제가 없습니다.");
            return;
        }
        quizIsMistakeRetry = Array.isArray(mistakeIds);
        if (quizIsMistakeRetry) {
            const mistakeSet = new Set(mistakeIds);
            quiz = core.shuffle(quizPool.filter((idiom) => mistakeSet.has(idiom.id)))
                .map((idiom) => core.createQuestion(idiom, quizPool, selectedQuizMode));
            if (!quiz.length) return;
        } else {
            quiz = core.buildQuiz(quizPool, 10, selectedQuizMode);
        }
        quizIndex = 0;
        quizScore = 0;
        quizStreak = 0;
        quizAnswered = false;
        quizMistakes = [];
        elements.gameIntro.hidden = true;
        elements.quizResult.hidden = true;
        elements.quizStage.hidden = false;
        renderQuestion();
    }

    function renderQuestion() {
        const question = quiz[quizIndex];
        if (!question) return finishQuiz();
        quizAnswered = false;
        elements.quizPosition.textContent = `문제 ${quizIndex + 1} / ${quiz.length}`;
        elements.quizStreak.textContent = quizStreak;
        elements.quizScore.textContent = quizScore;
        elements.quizBar.style.width = `${(quizIndex / quiz.length) * 100}%`;
        const typeLabels = { story: "유래 문제", meaning: "뜻 문제", image: "삽화 문제" };
        elements.questionType.textContent = typeLabels[question.type] || "뜻 문제";
        elements.questionPrompt.textContent = question.prompt;
        const illustration = question.type === "image" ? ILLUSTRATIONS[question.id] : "";
        elements.questionIllustration.hidden = !illustration;
        if (illustration) {
            elements.questionIllustrationImage.src = illustration;
            elements.questionIllustrationImage.alt = "고사성어 유래를 나타낸 문제 삽화";
        } else {
            elements.questionIllustrationImage.removeAttribute("src");
            elements.questionIllustrationImage.alt = "";
        }
        elements.answerFeedback.hidden = true;
        elements.answerFeedback.classList.remove("wrong");
        elements.answerOptions.replaceChildren();

        question.options.forEach((option, index) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "answer-option";
            button.dataset.answerId = option.id;
            button.innerHTML = `<span>${index + 1}</span>${option.label}`;
            button.addEventListener("click", () => chooseAnswer(option.id));
            elements.answerOptions.append(button);
        });
        elements.answerOptions.querySelector("button")?.focus();
    }

    function chooseAnswer(answerId) {
        if (quizAnswered) return;
        quizAnswered = true;
        const question = quiz[quizIndex];
        const correct = answerId === question.answerId;
        const answerIdiom = data.find((item) => item.id === question.answerId);

        if (correct) {
            quizScore += 1;
            quizStreak += 1;
        } else {
            quizStreak = 0;
            quizMistakes.push(question.answerId);
            progress[question.answerId] = { status: "review", updatedAt: new Date().toISOString() };
            saveProgress();
            renderSummary();
        }

        elements.quizScore.textContent = quizScore;
        elements.quizStreak.textContent = quizStreak;
        elements.answerOptions.querySelectorAll("button").forEach((button) => {
            button.disabled = true;
            if (button.dataset.answerId === question.answerId) button.classList.add("correct");
            else if (button.dataset.answerId === answerId) button.classList.add("wrong");
        });
        elements.feedbackTitle.textContent = correct ? "정답" : `오답 · 정답: ${question.answerLabel}`;
        elements.feedbackCopy.textContent = `${answerIdiom.meaning} · ${question.source}`;
        elements.feedbackStoryCopy.textContent = answerIdiom.story;
        elements.feedbackStory.open = !correct;
        elements.answerFeedback.classList.toggle("wrong", !correct);
        elements.answerFeedback.hidden = false;
        elements.nextQuestion.textContent = quizIndex === quiz.length - 1 ? "결과 보기 →" : "다음 문제 →";
        elements.nextQuestion.focus();
    }

    function goToNextQuestion() {
        if (!quizAnswered) return;
        quizIndex += 1;
        if (quizIndex >= quiz.length) finishQuiz();
        else renderQuestion();
    }

    function finishQuiz() {
        elements.quizStage.hidden = true;
        elements.quizResult.hidden = false;
        if (!quizIsMistakeRetry) {
            const best = Math.max(getBestScore(), quizScore);
            try { localStorage.setItem(BEST_SCORE_KEY, String(best)); } catch (_) {}
        }
        renderBestScore();
        elements.resultScore.textContent = `${quizScore} / ${quiz.length}`;

        const mistakeIds = [...new Set(quizMistakes)];
        elements.resultTitle.textContent = quizIsMistakeRetry ? "오답 다시 풀기 결과" : "퀴즈 결과";
        elements.resultMessage.textContent = mistakeIds.length
            ? `오답 ${mistakeIds.length}개를 복습 목록에 추가했습니다.`
            : (quizIsMistakeRetry ? "틀렸던 문제를 모두 바로잡았습니다." : "오답이 없습니다.");
        elements.resultMistakeList.replaceChildren();
        mistakeIds.forEach((id) => {
            const idiom = data.find((item) => item.id === id);
            if (!idiom) return;
            const item = document.createElement("li");
            item.textContent = `${idiom.word} · ${idiom.hanja}`;
            elements.resultMistakeList.append(item);
        });
        elements.resultMistakeList.hidden = mistakeIds.length === 0;
        elements.retryMistakes.hidden = mistakeIds.length === 0;
        elements.reviewMistakes.hidden = mistakeIds.length === 0;
    }

    function retryQuizMistakes() {
        if (!quizMistakes.length) return;
        startQuiz([...new Set(quizMistakes)]);
    }

    function reviewQuizMistakes() {
        if (!quizMistakes.length) return;
        reviewOnly = true;
        selectedLevel = "전체";
        selectedTheme = "전체";
        elements.levelSelect.value = "전체";
        elements.themeSelect.value = "전체";
        elements.reviewOnlyButton.setAttribute("aria-pressed", "true");
        buildDeck({ keepId: quizMistakes[0] });
        const targetIndex = deck.findIndex((item) => item.id === quizMistakes[0]);
        if (targetIndex >= 0) currentIndex = targetIndex;
        revealed = false;
        renderCard();
        switchView("learn");
        document.getElementById("learnHeading")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function buildThemeControls() {
        const themes = ["전체", ...new Set(data.map((item) => item.theme))];
        themes.slice(1).forEach((theme) => {
            const option = document.createElement("option");
            option.value = theme;
            option.textContent = theme;
            elements.themeSelect.append(option);
        });

        elements.themeFilters.replaceChildren();
        themes.forEach((theme) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = `theme-filter${theme === selectedLibraryTheme ? " active" : ""}`;
            button.dataset.theme = theme;
            button.textContent = theme;
            button.addEventListener("click", () => {
                selectedLibraryTheme = theme;
                renderLibrary();
            });
            elements.themeFilters.append(button);
        });
    }

    function openIdiomFromLibrary(id) {
        const selectedIdiom = data.find((idiom) => idiom.id === id);
        reviewOnly = false;
        selectedLevel = selectedIdiom?.level || "전체";
        selectedTheme = "전체";
        elements.reviewOnlyButton.setAttribute("aria-pressed", "false");
        elements.levelSelect.value = selectedLevel;
        elements.themeSelect.value = "전체";
        buildDeck({ keepId: id });
        currentIndex = deck.findIndex((item) => item.id === id);
        revealed = true;
        renderCard();
        switchView("learn");
        document.getElementById("learnHeading")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function renderLibrary() {
        const query = elements.librarySearch.value.trim().toLocaleLowerCase("ko");
        const filtered = data.filter((idiom) => {
            const levelMatches = selectedLibraryLevel === "전체" || idiom.level === selectedLibraryLevel;
            const themeMatches = selectedLibraryTheme === "전체" || idiom.theme === selectedLibraryTheme;
            const haystack = `${idiom.word} ${idiom.hanja} ${idiom.meaning} ${idiom.story}`.toLocaleLowerCase("ko");
            return levelMatches && themeMatches && (!query || haystack.includes(query));
        });

        elements.themeFilters.querySelectorAll("button").forEach((button) => {
            button.classList.toggle("active", button.dataset.theme === selectedLibraryTheme);
        });
        elements.libraryGrid.replaceChildren();
        filtered.forEach((idiom) => {
            const card = document.createElement("article");
            card.className = "library-card";
            card.tabIndex = 0;
            card.setAttribute("role", "button");
            card.setAttribute("aria-label", `${idiom.word} 자세히 학습하기`);
            card.innerHTML = `
                <span class="library-level">${idiom.level}</span>
                <span class="library-theme">${idiom.theme}</span>
                <p class="library-hanja">${idiom.hanja}</p>
                <h3>${idiom.word}</h3>
                <p>${idiom.meaning}</p>
                <footer><span>${idiom.verification}</span><span>상세 보기 →</span></footer>`;
            card.addEventListener("click", () => openIdiomFromLibrary(idiom.id));
            card.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openIdiomFromLibrary(idiom.id);
                }
            });
            elements.libraryGrid.append(card);
        });
        elements.libraryEmpty.hidden = filtered.length > 0;
    }

    document.querySelectorAll(".mode-tab").forEach((button) => {
        button.addEventListener("click", () => switchView(button.dataset.view));
    });

    elements.levelSelect.addEventListener("change", () => {
        selectedLevel = elements.levelSelect.value;
        buildDeck();
    });

    elements.themeSelect.addEventListener("change", () => {
        selectedTheme = elements.themeSelect.value;
        buildDeck();
    });
    elements.reviewOnlyButton.addEventListener("click", () => {
        reviewOnly = !reviewOnly;
        elements.reviewOnlyButton.setAttribute("aria-pressed", String(reviewOnly));
        buildDeck();
    });
    elements.shuffleDeckButton.addEventListener("click", () => {
        buildDeck({ shuffle: true });
        showToast("카드 순서를 섞었습니다.");
    });
    elements.showAllButton.addEventListener("click", () => {
        reviewOnly = false;
        selectedLevel = "전체";
        selectedTheme = "전체";
        elements.reviewOnlyButton.setAttribute("aria-pressed", "false");
        elements.levelSelect.value = "전체";
        elements.themeSelect.value = "전체";
        buildDeck();
    });
    elements.previousCard.addEventListener("click", () => moveCard(-1));
    elements.nextCard.addEventListener("click", () => moveCard(1));
    elements.revealCard.addEventListener("click", () => setRevealed(!revealed));
    elements.idiomCard.addEventListener("click", (event) => {
        if (event.target.closest("a, button")) return;
        setRevealed(!revealed);
    });
    elements.markKnown.addEventListener("click", () => markCurrent("known"));
    elements.markReview.addEventListener("click", () => markCurrent("review"));

    document.querySelectorAll(".quiz-mode").forEach((button) => {
        button.addEventListener("click", () => {
            selectedQuizMode = button.dataset.quizMode;
            document.querySelectorAll(".quiz-mode").forEach((modeButton) => {
                const selected = modeButton === button;
                modeButton.classList.toggle("selected", selected);
                modeButton.setAttribute("aria-pressed", String(selected));
            });
        });
    });
    elements.quizLevelSelect.addEventListener("change", () => {
        selectedQuizLevel = elements.quizLevelSelect.value;
    });
    elements.startQuiz.addEventListener("click", () => startQuiz());
    elements.nextQuestion.addEventListener("click", goToNextQuestion);
    elements.retryQuiz.addEventListener("click", () => startQuiz());
    elements.retryMistakes.addEventListener("click", retryQuizMistakes);
    elements.reviewMistakes.addEventListener("click", reviewQuizMistakes);
    elements.librarySearch.addEventListener("input", renderLibrary);
    elements.libraryLevelSelect.addEventListener("change", () => {
        selectedLibraryLevel = elements.libraryLevelSelect.value;
        renderLibrary();
    });

    document.addEventListener("keydown", (event) => {
        if (event.target.matches("input, select, textarea")) return;
        const learnVisible = !byId("learnView").hidden;
        const quizVisible = !elements.quizStage.hidden;

        if (learnVisible) {
            if (event.key === " ") {
                event.preventDefault();
                setRevealed(!revealed);
            } else if (event.key === "ArrowLeft") moveCard(-1);
            else if (event.key === "ArrowRight") moveCard(1);
            else if (revealed && event.key.toLocaleLowerCase() === "k") markCurrent("known");
            else if (revealed && event.key.toLocaleLowerCase() === "r") markCurrent("review");
        } else if (quizVisible && !quizAnswered && /^[1-4]$/.test(event.key)) {
            const option = quiz[quizIndex]?.options[Number(event.key) - 1];
            if (option) chooseAnswer(option.id);
        } else if (quizVisible && quizAnswered && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            goToNextQuestion();
        }
    });

    function initialize() {
        if (!data.length || !core) {
            document.body.innerHTML = "<p>학습 데이터를 불러오지 못했습니다.</p>";
            return;
        }
        if (playerName) elements.playerGreeting.textContent = `${playerName} 학습 기록`;
        elements.libraryTotal.textContent = data.length;
        buildThemeControls();
        renderSummary();
        renderBestScore();
        buildDeck();
        renderLibrary();
    }

    initialize();
})();
