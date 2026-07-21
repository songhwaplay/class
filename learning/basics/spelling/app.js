(() => {
    "use strict";

    const SESSION_SIZE = 10;
    const GAME_ID = "spelling";
    const PLAYER_NAME_KEY = "classPlayerName";
    const BEST_SCORE_KEY = "spellingQuizBestScore";
    const PERSONAL_DECK_KEY = "spellingPersonalQuestionDeckV1";
    const questionBank = Array.isArray(window.SPELLING_QUESTIONS)
        ? window.SPELLING_QUESTIONS
        : [];
    const questionById = new Map(questionBank.map((question) => [question.id, question]));

    const elements = {
        modeScreen: document.getElementById("modeScreen"),
        personalScreen: document.getElementById("personalScreen"),
        missingScreen: document.getElementById("missingScreen"),
        lobbyScreen: document.getElementById("lobbyScreen"),
        quizScreen: document.getElementById("quizScreen"),
        resultScreen: document.getElementById("resultScreen"),
        personalModeButton: document.getElementById("personalModeButton"),
        classModeButton: document.getElementById("classModeButton"),
        personalStartButton: document.getElementById("personalStartButton"),
        restartButton: document.getElementById("restartButton"),
        resultModeButton: document.getElementById("resultModeButton"),
        nextButton: document.getElementById("nextButton"),
        bgm: document.getElementById("spellingBgm"),
        bgmToggle: document.getElementById("bgmToggle"),
        playerGreeting: document.getElementById("playerGreeting"),
        headerBestScore: document.getElementById("headerBestScore"),
        classWaitingPanel: document.getElementById("classWaitingPanel"),
        joinPane: document.getElementById("joinPane"),
        studentRoomCode: document.getElementById("studentRoomCode"),
        joinStatus: document.getElementById("joinStatus"),
        lobbyGuide: document.getElementById("lobbyGuide"),
        quizModeLabel: document.getElementById("quizModeLabel"),
        questionNumber: document.getElementById("questionNumber"),
        currentScore: document.getElementById("currentScore"),
        progressFill: document.getElementById("progressFill"),
        questionCategory: document.getElementById("questionCategory"),
        questionPrompt: document.getElementById("questionPrompt"),
        questionText: document.getElementById("questionText"),
        choiceList: document.getElementById("choiceList"),
        feedback: document.getElementById("feedback"),
        feedbackTitle: document.getElementById("feedbackTitle"),
        correctAnswer: document.getElementById("correctAnswer"),
        explanation: document.getElementById("explanation"),
        finalScore: document.getElementById("finalScore"),
        resultMessage: document.getElementById("resultMessage"),
        bestMessage: document.getElementById("bestMessage"),
        classRankArea: document.getElementById("classRankArea"),
        myRankCard: document.getElementById("myRankCard"),
        classRankingList: document.getElementById("classRankingList"),
        rankingWaiting: document.getElementById("rankingWaiting"),
        reviewArea: document.getElementById("reviewArea"),
        perfectReview: document.getElementById("perfectReview"),
        missedList: document.getElementById("missedList"),
        announcer: document.getElementById("announcer")
    };

    const screens = [
        elements.modeScreen,
        elements.personalScreen,
        elements.missingScreen,
        elements.lobbyScreen,
        elements.quizScreen,
        elements.resultScreen
    ];

    const state = {
        mode: "",
        questions: [],
        currentIndex: 0,
        score: 0,
        answered: false,
        answers: [],
        classSessionId: "",
        classResultSubmitted: false,
        classState: null
    };

    let lobby = null;

    function updateBgmToggle() {
        const isPlaying = Boolean(elements.bgm && !elements.bgm.paused);
        elements.bgmToggle.textContent = isPlaying ? "음악 끄기" : "음악 켜기";
        elements.bgmToggle.setAttribute("aria-pressed", String(isPlaying));
    }

    async function startBgm() {
        if (state.mode !== "personal" || !elements.bgm) return;
        elements.bgm.volume = 0.4;
        try {
            await elements.bgm.play();
        } catch (error) {
            // Some browsers require one more direct tap before audio can begin.
        }
        updateBgmToggle();
    }

    function stopBgm({ rewind = true } = {}) {
        if (!elements.bgm) return;
        elements.bgm.pause();
        if (rewind) elements.bgm.currentTime = 0;
        updateBgmToggle();
    }

    function toggleBgm() {
        if (elements.bgm.paused) {
            startBgm();
        } else {
            stopBgm({ rewind: false });
        }
    }

    function readStoredValue(key) {
        try {
            return localStorage.getItem(key) || "";
        } catch (error) {
            return "";
        }
    }

    function writeStoredValue(key, value) {
        try {
            localStorage.setItem(key, String(value));
        } catch (error) {
            // The quiz still works when storage is unavailable.
        }
    }

    function getPlayerName() {
        return readStoredValue(PLAYER_NAME_KEY).trim();
    }

    function hasValidPlayerName() {
        return /^[가-힣]{2,6}$/.test(getPlayerName());
    }

    function getBestScore() {
        const stored = Number.parseInt(readStoredValue(BEST_SCORE_KEY), 10);
        return Number.isInteger(stored) && stored >= 0 ? Math.min(stored, SESSION_SIZE) : 0;
    }

    function shuffle(items) {
        const copy = [...items];
        for (let index = copy.length - 1; index > 0; index -= 1) {
            const randomIndex = Math.floor(Math.random() * (index + 1));
            [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
        }
        return copy;
    }

    function takePersonalQuestionIds() {
        return window.SpellingQuestionDeck.take({
            questions: questionBank,
            size: SESSION_SIZE,
            storageKey: PERSONAL_DECK_KEY,
            storage: window.localStorage
        });
    }

    function buildSession(questionIds) {
        const selectedIds = Array.isArray(questionIds) ? questionIds : takePersonalQuestionIds();
        const selected = selectedIds.map((id) => questionById.get(id)).filter(Boolean);
        return selected.slice(0, SESSION_SIZE).map((question) => ({
            ...question,
            choices: shuffle(question.choices)
        }));
    }

    function setScreen(activeScreen) {
        screens.forEach((screen) => screen?.classList.toggle("hidden", screen !== activeScreen));
    }

    function updateHeaderBest() {
        elements.headerBestScore.textContent = `${getBestScore()}/${SESSION_SIZE}`;
    }

    function setGreeting() {
        const playerName = getPlayerName();
        elements.playerGreeting.textContent = playerName
            ? `${playerName} 님, 헷갈리는 우리말을 골라 볼까요?`
            : "헷갈리는 우리말, 하나씩 골라 볼까요?";
    }

    function showModeScreen() {
        if (lobby) {
            lobby.destroy();
            lobby = null;
        }
        stopBgm();
        elements.bgmToggle.classList.add("hidden");
        state.mode = "";
        state.classSessionId = "";
        state.classState = null;
        setScreen(elements.modeScreen);
        elements.personalModeButton.focus({ preventScroll: true });
    }

    function selectPersonalMode() {
        state.mode = "personal";
        elements.bgmToggle.classList.remove("hidden");
        startBgm();
        setScreen(elements.personalScreen);
        elements.personalStartButton.focus({ preventScroll: true });
    }

    function selectClassMode() {
        state.mode = "class";
        stopBgm();
        elements.bgmToggle.classList.add("hidden");
        if (!hasValidPlayerName()) {
            setScreen(elements.missingScreen);
            return;
        }
        setScreen(elements.lobbyScreen);
        initializeClassLobby();
    }

    function initializeClassLobby() {
        if (lobby) return;
        if (!window.ClassroomMultiplayerLobby || !window.ClassroomNetwork) {
            elements.joinStatus.textContent = "학급 서버를 불러오지 못했습니다. 잠시 후 다시 시도하세요.";
            return;
        }

        lobby = window.ClassroomMultiplayerLobby.create({
            gameId: GAME_ID,
            getPlayerName,
            initialMode: "guest",
            minPlayers: 2,
            maxPlayers: 61,
            ids: { startButton: "studentStartButtonUnused" },
            leaveButtonIds: ["leaveClassButton"],
            onLeave: () => { location.href = "index.html"; },
            onStateChange: syncClassLobby,
            onServerMessage: handleClassServerMessage,
            onAbort: ({ message }) => {
                elements.joinStatus.textContent = message || "학급 연결이 종료되었습니다.";
                elements.announcer.textContent = elements.joinStatus.textContent;
                setScreen(elements.lobbyScreen);
            },
            getLobbyPresentation: ({ count }) => ({
                canStart: false,
                startText: "교사 시작 대기",
                guideText: `현재 ${Math.max(1, count)}명 접속 · 교사가 시작하면 동시에 문제가 열립니다.`
            })
        }).mount();
    }

    function syncClassLobby(snapshot) {
        if (!snapshot) return;
        const connected = snapshot.connected && snapshot.roomCode;
        elements.joinPane.classList.toggle("hidden", Boolean(connected));
        elements.classWaitingPanel.classList.toggle("hidden", !connected);
        if (connected) {
            elements.studentRoomCode.textContent = snapshot.roomCode;
            elements.lobbyGuide.textContent = `현재 ${Object.keys(snapshot.players).length}명 접속 · 교사가 시작하면 동시에 문제가 열립니다.`;
        }
    }

    function handleClassServerMessage(message, snapshot) {
        if (message.type === "SPELLING_ERROR") {
            elements.joinStatus.textContent = message.message || "학급 순위전 요청을 처리하지 못했습니다.";
            elements.announcer.textContent = elements.joinStatus.textContent;
            return;
        }
        if (message.type !== "SPELLING_STATE" || !message.state) return;

        const previousSessionId = state.classSessionId;
        state.classState = message.state;
        renderClassRanking(message.state, snapshot?.myId || lobby?.snapshot().myId);

        if (message.state.phase === "running" && message.state.sessionId && message.state.sessionId !== previousSessionId) {
            state.classSessionId = message.state.sessionId;
            startQuiz(message.state.questionIds);
            return;
        }

        if (message.state.phase === "lobby" && previousSessionId) {
            state.classSessionId = "";
            state.classResultSubmitted = false;
            setScreen(elements.lobbyScreen);
            syncClassLobby(lobby.snapshot());
            elements.announcer.textContent = "새 학급 순위전을 기다립니다.";
        }
    }

    function startQuiz(questionIds) {
        if (state.mode === "class") {
            stopBgm();
        } else {
            startBgm();
        }
        const session = buildSession(questionIds);
        if (session.length !== SESSION_SIZE) {
            const target = state.mode === "class" ? elements.joinStatus : elements.personalStartButton;
            target.textContent = "문항을 불러오지 못했어요";
            if (target instanceof HTMLButtonElement) target.disabled = true;
            return;
        }

        state.questions = session;
        state.currentIndex = 0;
        state.score = 0;
        state.answered = false;
        state.answers = [];
        state.classResultSubmitted = false;
        elements.currentScore.textContent = "0";
        elements.quizModeLabel.textContent = state.mode === "class" ? "학급 순위전" : "개인 모드";
        setScreen(elements.quizScreen);
        renderQuestion();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function renderQuestion() {
        const question = state.questions[state.currentIndex];
        state.answered = false;

        elements.questionNumber.textContent = String(state.currentIndex + 1);
        elements.progressFill.style.width = `${((state.currentIndex + 1) / SESSION_SIZE) * 100}%`;
        elements.questionCategory.textContent = question.category;
        elements.questionPrompt.textContent = question.prompt;
        elements.questionText.textContent = question.sentence;
        elements.choiceList.replaceChildren();
        elements.feedback.classList.add("hidden");
        elements.feedback.classList.remove("is-wrong");
        elements.nextButton.textContent = state.currentIndex === SESSION_SIZE - 1
            ? "결과 보기"
            : "다음 문제";

        question.choices.forEach((choice, index) => {
            const button = document.createElement("button");
            const number = document.createElement("span");

            button.type = "button";
            button.className = "choice-button";
            button.dataset.choice = choice;
            button.append(document.createTextNode(choice));

            number.className = "choice-number";
            number.setAttribute("aria-hidden", "true");
            number.textContent = String(index + 1);
            button.append(number);

            button.addEventListener("click", () => selectAnswer(choice, button));
            elements.choiceList.append(button);
        });

        elements.choiceList.querySelector("button")?.focus({ preventScroll: true });
    }

    function selectAnswer(selectedChoice, selectedButton) {
        if (state.answered) return;

        state.answered = true;
        const question = state.questions[state.currentIndex];
        const isCorrect = selectedChoice === question.answer;
        const buttons = [...elements.choiceList.querySelectorAll("button")];

        buttons.forEach((button) => {
            button.disabled = true;
            if (button.dataset.choice === question.answer) button.classList.add("is-correct");
        });

        if (!isCorrect) {
            selectedButton.classList.add("is-wrong");
        } else {
            state.score += 1;
            elements.currentScore.textContent = String(state.score);
        }

        state.answers.push({ question, selectedChoice, isCorrect });
        elements.feedbackTitle.textContent = isCorrect ? "정답이에요!" : "아쉬워요!";
        elements.feedback.classList.toggle("is-wrong", !isCorrect);
        elements.correctAnswer.textContent = `정답: ${question.answer}`;
        elements.explanation.textContent = question.explanation;
        elements.feedback.classList.remove("hidden");
        elements.announcer.textContent = `${elements.feedbackTitle.textContent} 정답은 ${question.answer}입니다. ${question.explanation}`;
        elements.nextButton.focus({ preventScroll: true });
    }

    function goToNextQuestion() {
        if (!state.answered) return;
        if (state.currentIndex >= SESSION_SIZE - 1) {
            showResults();
            return;
        }
        state.currentIndex += 1;
        renderQuestion();
    }

    function getResultMessage(score) {
        const playerName = getPlayerName();
        const subject = playerName ? `${playerName} 님, ` : "";
        if (score === SESSION_SIZE) return `${subject}완벽해요! 맞춤법 달인이네요.`;
        if (score >= 8) return `${subject}훌륭해요! 거의 다 알고 있어요.`;
        if (score >= 6) return `${subject}좋아요! 헷갈린 표현만 다시 살펴봐요.`;
        return `${subject}괜찮아요. 오답노트를 읽고 한 번 더 도전해 봐요.`;
    }

    function appendReviewItem(answerRecord) {
        const item = document.createElement("li");
        const sentence = document.createElement("span");
        const answer = document.createElement("span");
        const chosen = document.createElement("span");
        const explanation = document.createElement("span");

        sentence.className = "review-sentence";
        sentence.textContent = answerRecord.question.sentence.replace("___", answerRecord.question.answer);
        answer.className = "review-answer";
        answer.textContent = `정답: ${answerRecord.question.answer}`;
        chosen.className = "review-chosen";
        chosen.textContent = `내가 고른 답: ${answerRecord.selectedChoice}`;
        explanation.className = "review-explanation";
        explanation.textContent = answerRecord.question.explanation;
        item.append(sentence, chosen, answer, explanation);
        elements.missedList.append(item);
    }

    function showResults() {
        const missed = state.answers.filter((answer) => !answer.isCorrect);
        elements.finalScore.textContent = String(state.score);
        elements.resultMessage.textContent = getResultMessage(state.score);
        elements.missedList.replaceChildren();
        missed.forEach(appendReviewItem);
        elements.perfectReview.classList.toggle("hidden", missed.length !== 0);
        elements.missedList.classList.toggle("hidden", missed.length === 0);

        if (state.mode === "personal") {
            const previousBest = getBestScore();
            const isNewBest = state.score > previousBest;
            const best = Math.max(previousBest, state.score);
            if (isNewBest) writeStoredValue(BEST_SCORE_KEY, state.score);
            elements.bestMessage.textContent = isNewBest
                ? `새 개인 최고 기록이에요! ${best}/${SESSION_SIZE}`
                : `개인 최고 기록 ${best}/${SESSION_SIZE}`;
            elements.classRankArea.classList.add("hidden");
            elements.restartButton.classList.remove("hidden");
            updateHeaderBest();
        } else {
            elements.bestMessage.textContent = "정답 수가 같으면 먼저 마친 학생이 앞서요.";
            elements.classRankArea.classList.remove("hidden");
            elements.restartButton.classList.add("hidden");
            if (!state.classResultSubmitted && lobby) {
                state.classResultSubmitted = true;
                lobby.sendServer({
                    type: "SPELLING_ACTION",
                    action: "SUBMIT",
                    sessionId: state.classSessionId,
                    score: state.score
                });
            }
            renderClassRanking(state.classState, lobby?.snapshot().myId);
        }

        setScreen(elements.resultScreen);
        elements.resultModeButton.focus({ preventScroll: true });
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function formatElapsed(milliseconds) {
        const totalTenths = Math.max(0, Math.round(Number(milliseconds || 0) / 100));
        const minutes = Math.floor(totalTenths / 600);
        const seconds = ((totalTenths % 600) / 10).toFixed(1);
        return minutes > 0 ? `${minutes}분 ${seconds.padStart(4, "0")}초` : `${seconds}초`;
    }

    function renderClassRanking(classState, myId) {
        if (!classState) return;
        const rankings = Array.isArray(classState.rankings) ? classState.rankings : [];
        const participants = Array.isArray(classState.participants) ? classState.participants : [];
        const mine = rankings.find((entry) => String(entry.id) === String(myId));

        elements.myRankCard.textContent = mine
            ? `나의 순위 ${mine.rank}위 · ${mine.score}/${SESSION_SIZE}점 · ${formatElapsed(mine.elapsedMs)}`
            : state.classResultSubmitted ? "결과를 집계하고 있어요." : "문제를 모두 풀면 내 순위가 표시됩니다.";
        elements.classRankingList.replaceChildren();

        rankings.forEach((entry) => {
            const row = document.createElement("li");
            const rank = document.createElement("span");
            const name = document.createElement("span");
            const score = document.createElement("span");
            const time = document.createElement("span");
            row.className = "ranking-row";
            row.classList.toggle("is-me", String(entry.id) === String(myId));
            rank.className = "rank-number";
            rank.textContent = `${entry.rank}위`;
            name.className = "rank-name";
            name.textContent = entry.name;
            score.className = "rank-score";
            score.textContent = `${entry.score}점`;
            time.className = "rank-time";
            time.textContent = formatElapsed(entry.elapsedMs);
            row.append(rank, name, score, time);
            elements.classRankingList.append(row);
        });

        const waitingCount = Math.max(0, participants.length - rankings.length);
        elements.rankingWaiting.textContent = classState.phase === "ended"
            ? `최종 순위 · ${participants.length}명 모두 완료`
            : waitingCount > 0
                ? `${rankings.length}명 완료 · ${waitingCount}명 풀이 중`
                : "첫 번째 완료자를 기다리고 있어요.";
    }

    function handleKeyboard(event) {
        if (elements.quizScreen.classList.contains("hidden")) return;
        if (!state.answered && /^[1-4]$/.test(event.key)) {
            const choice = elements.choiceList.querySelectorAll("button")[Number(event.key) - 1];
            if (choice) {
                event.preventDefault();
                choice.click();
            }
            return;
        }
        if (state.answered && event.key === "Enter" && document.activeElement !== elements.nextButton) {
            event.preventDefault();
            goToNextQuestion();
        }
    }

    elements.personalModeButton.addEventListener("click", selectPersonalMode);
    elements.classModeButton.addEventListener("click", selectClassMode);
    elements.personalStartButton.addEventListener("click", () => startQuiz());
    elements.restartButton.addEventListener("click", () => startQuiz());
    elements.resultModeButton.addEventListener("click", showModeScreen);
    elements.nextButton.addEventListener("click", goToNextQuestion);
    elements.bgmToggle.addEventListener("click", toggleBgm);
    elements.bgm.addEventListener("play", updateBgmToggle);
    elements.bgm.addEventListener("pause", updateBgmToggle);
    document.querySelectorAll(".mode-back-button").forEach((button) => button.addEventListener("click", showModeScreen));
    document.addEventListener("keydown", handleKeyboard);

    setGreeting();
    updateHeaderBest();
    setScreen(elements.modeScreen);
})();
