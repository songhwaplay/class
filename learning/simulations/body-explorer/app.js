(() => {
    "use strict";

    const config = {
        gameId: "circulation",
        messagePrefix: "CIRCULATION",
        bestScoreKey: "circulationBestScore",
        experienceType: "quiz",
        namedGreeting: "{name} 탐험가, 인체 탐험을 출발해 볼까요?",
        guestGreeting: "우리 몸속을 직접 여행하며 배워 보세요.",
        resetAnnouncement: "새 인체 탐험을 기다립니다.",
        stateLabels: {},
        resultMessages: {},
        ...window.BODY_EXPLORER_CONFIG
    };
    const GAME_ID = config.gameId;
    const MESSAGE_PREFIX = config.messagePrefix;
    const PLAYER_NAME_KEY = "classPlayerName";
    const BEST_SCORE_KEY = config.bestScoreKey;
    const stages = Array.isArray(window.BODY_EXPLORER_STAGES)
        ? window.BODY_EXPLORER_STAGES
        : Array.isArray(window.CIRCULATION_STAGES) ? window.CIRCULATION_STAGES : [];
    const TOTAL_STAGES = stages.length;
    const HAS_ANATOMY_EXPLORER = config.experienceType === "circulation-explorer";
    const HAS_INTERACTIVE_SIMULATION = config.experienceType === "nervous-simulation"
        || config.experienceType === "immune-simulation"
        || config.experienceType === "movement-simulation"
        || config.experienceType === "excretion-simulation"
        || config.experienceType === "temperature-simulation";
    const simulationCopy = {
        thresholdWord: "감지 기준",
        slotLabel: "경로",
        selectedTitle: "경로를 조립하고 있어요",
        selectedText: "경로가 완성되면 신호를 보내 보세요.",
        removeTitle: "경로를 다시 연결해 보세요",
        undoTitle: "마지막 연결을 지웠어요",
        undoText: "기관을 이동 순서대로 다시 선택하세요.",
        clearTitle: "경로를 비웠어요",
        clearText: "자극을 받아들이는 곳부터 다시 연결하세요.",
        runLabel: "신호 보내기",
        idleTitle: "먼저 자극 세기와 신호 경로를 조절하세요",
        idleText: "실행하면 구성한 경로에 따라 몸의 반응이 달라집니다.",
        incompleteTitle: "신호 경로가 아직 이어지지 않았어요",
        incompleteText: "빈칸 {count}개를 연결한 뒤 다시 실행하세요.",
        lowTitle: "자극은 도착했지만 반응이 시작되지 않았어요",
        lowText: "{message} 자극 세기를 높여 다시 관찰해 보세요.",
        mismatchTitle: "{index}번째 연결에서 신호가 멈췄어요",
        successTitle: "신호가 끝까지 전달됐어요!",
        completeLabel: "실험 완료",
        nextLabel: "관찰 확인 문제로",
        reviewLabel: "처음 실행한 경로",
        ...config.simulationCopy
    };

    const elements = {
        modeScreen: document.getElementById("modeScreen"),
        personalScreen: document.getElementById("personalScreen"),
        missingScreen: document.getElementById("missingScreen"),
        lobbyScreen: document.getElementById("lobbyScreen"),
        journeyScreen: document.getElementById("journeyScreen"),
        resultScreen: document.getElementById("resultScreen"),
        personalModeButton: document.getElementById("personalModeButton"),
        classModeButton: document.getElementById("classModeButton"),
        personalStartButton: document.getElementById("personalStartButton"),
        restartButton: document.getElementById("restartButton"),
        resultModeButton: document.getElementById("resultModeButton"),
        playerGreeting: document.getElementById("playerGreeting"),
        headerBestScore: document.getElementById("headerBestScore"),
        savedName: document.getElementById("savedName"),
        joinPane: document.getElementById("joinPane"),
        classWaitingPanel: document.getElementById("classWaitingPanel"),
        studentRoomCode: document.getElementById("studentRoomCode"),
        joinStatus: document.getElementById("joinStatus"),
        lobbyGuide: document.getElementById("lobbyGuide"),
        journeyModeLabel: document.getElementById("journeyModeLabel"),
        stageNumber: document.getElementById("stageNumber"),
        currentScore: document.getElementById("currentScore"),
        oxygenMeter: document.querySelector(".oxygen-meter"),
        oxygenLabel: document.getElementById("oxygenLabel"),
        routeMap: document.getElementById("routeMap"),
        scenePanel: document.getElementById("scenePanel"),
        cellExplorer: document.getElementById("cellExplorer"),
        chapterLabel: document.getElementById("chapterLabel"),
        stageLocation: document.getElementById("stageLocation"),
        stageMission: document.getElementById("stageMission"),
        factCard: document.querySelector(".fact-card"),
        stageFact: document.getElementById("stageFact"),
        questionCard: document.querySelector(".question-card"),
        stageQuestion: document.getElementById("stageQuestion"),
        choiceList: document.getElementById("choiceList"),
        feedback: document.getElementById("feedback"),
        feedbackTitle: document.getElementById("feedbackTitle"),
        feedbackText: document.getElementById("feedbackText"),
        nextStageButton: document.getElementById("nextStageButton"),
        anatomyExplorer: document.getElementById("anatomyExplorer"),
        anatomyMap: document.getElementById("anatomyMap"),
        explorerQuestion: document.getElementById("explorerQuestion"),
        explorerFeedback: document.getElementById("explorerFeedback"),
        explorerFeedbackTitle: document.getElementById("explorerFeedbackTitle"),
        explorerFeedbackText: document.getElementById("explorerFeedbackText"),
        explorerNextButton: document.getElementById("explorerNextButton"),
        bloodCellMarker: document.getElementById("bloodCellMarker"),
        atlasStep: document.getElementById("atlasStep"),
        atlasFocus: document.getElementById("atlasFocus"),
        mapReadout: document.getElementById("mapReadout"),
        bodyModel: document.querySelector(".body-model"),
        simulationCard: document.getElementById("simulationCard"),
        simulationTitle: document.getElementById("simulationTitle"),
        stimulusIcon: document.getElementById("stimulusIcon"),
        stimulusName: document.getElementById("stimulusName"),
        stimulusIntensity: document.getElementById("stimulusIntensity"),
        stimulusValue: document.getElementById("stimulusValue"),
        stimulusThreshold: document.getElementById("stimulusThreshold"),
        signalPath: document.getElementById("signalPath"),
        componentBank: document.getElementById("componentBank"),
        undoPathButton: document.getElementById("undoPathButton"),
        clearPathButton: document.getElementById("clearPathButton"),
        runSimulationButton: document.getElementById("runSimulationButton"),
        simulationFeedback: document.getElementById("simulationFeedback"),
        simulationFeedbackTitle: document.getElementById("simulationFeedbackTitle"),
        simulationFeedbackText: document.getElementById("simulationFeedbackText"),
        simulationNextButton: document.getElementById("simulationNextButton"),
        motionVisual: document.getElementById("motionVisual"),
        motionForearm: document.getElementById("motionForearm"),
        motionFrontMuscle: document.getElementById("motionFrontMuscle"),
        motionBackMuscle: document.getElementById("motionBackMuscle"),
        motionFrontTendon: document.getElementById("motionFrontTendon"),
        motionBackTendon: document.getElementById("motionBackTendon"),
        motionLoad: document.getElementById("motionLoad"),
        motionAngle: document.getElementById("motionAngle"),
        motionFrontState: document.getElementById("motionFrontState"),
        motionBackState: document.getElementById("motionBackState"),
        excretionVisual: document.getElementById("excretionVisual"),
        excretionWasteDots: document.getElementById("excretionWasteDots"),
        returnFlow: document.getElementById("returnFlow"),
        urineStreamLeft: document.getElementById("urineStreamLeft"),
        urineStreamRight: document.getElementById("urineStreamRight"),
        bladderFluid: document.getElementById("bladderFluid"),
        urethraFlow: document.getElementById("urethraFlow"),
        filterState: document.getElementById("filterState"),
        urineState: document.getElementById("urineState"),
        bladderState: document.getElementById("bladderState"),
        temperatureVisual: document.getElementById("temperatureVisual"),
        temperatureColumn: document.getElementById("temperatureColumn"),
        brainSignal: document.getElementById("brainSignal"),
        skinVessel: document.getElementById("skinVessel"),
        sweatDrops: document.getElementById("sweatDrops"),
        heatArrows: document.getElementById("heatArrows"),
        muscleShiver: document.getElementById("muscleShiver"),
        temperatureState: document.getElementById("temperatureState"),
        vesselState: document.getElementById("vesselState"),
        responseState: document.getElementById("responseState"),
        finalScore: document.getElementById("finalScore"),
        resultMessage: document.getElementById("resultMessage"),
        bestMessage: document.getElementById("bestMessage"),
        classRankArea: document.getElementById("classRankArea"),
        myRankCard: document.getElementById("myRankCard"),
        classRankingList: document.getElementById("classRankingList"),
        rankingWaiting: document.getElementById("rankingWaiting"),
        perfectReview: document.getElementById("perfectReview"),
        missedList: document.getElementById("missedList"),
        announcer: document.getElementById("announcer")
    };

    const screens = [
        elements.modeScreen,
        elements.personalScreen,
        elements.missingScreen,
        elements.lobbyScreen,
        elements.journeyScreen,
        elements.resultScreen
    ];

    const state = {
        mode: "",
        currentIndex: 0,
        score: 0,
        attempts: 0,
        stageSolved: false,
        experimentPath: [],
        componentOrder: [],
        missed: [],
        startedAt: 0,
        classSessionId: "",
        classResultSubmitted: false,
        classState: null
    };

    let lobby = null;

    function readStored(key) {
        try {
            return localStorage.getItem(key) || "";
        } catch (_) {
            return "";
        }
    }

    function writeStored(key, value) {
        try {
            localStorage.setItem(key, String(value));
        } catch (_) {
            // Local records are optional; the journey still works without storage.
        }
    }

    function getPlayerName() {
        return readStored(PLAYER_NAME_KEY).trim();
    }

    function hasValidPlayerName() {
        return /^[가-힣]{2,6}$/.test(getPlayerName());
    }

    function getBestScore() {
        const value = Number.parseInt(readStored(BEST_SCORE_KEY), 10);
        return Number.isInteger(value) ? Math.max(0, Math.min(TOTAL_STAGES, value)) : 0;
    }

    function shuffledChoices(choices) {
        const result = [...choices];
        for (let index = result.length - 1; index > 0; index -= 1) {
            const swapIndex = Math.floor(Math.random() * (index + 1));
            [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
        }
        return result;
    }

    function setScreen(activeScreen) {
        screens.forEach((screen) => screen?.classList.toggle("hidden", screen !== activeScreen));
        document.body.classList.toggle("journey-active", activeScreen === elements.journeyScreen);
        document.body.classList.toggle("anatomy-active", activeScreen === elements.journeyScreen && HAS_ANATOMY_EXPLORER);
    }

    function setGreeting() {
        const name = getPlayerName();
        elements.playerGreeting.textContent = name
            ? config.namedGreeting.replace("{name}", name)
            : config.guestGreeting;
        elements.savedName.textContent = name;
    }

    function updateBestScore() {
        elements.headerBestScore.textContent = `${getBestScore()}/${TOTAL_STAGES}`;
    }

    function showModeScreen() {
        const activeLobby = lobby;
        lobby = null;
        activeLobby?.destroy();
        state.mode = "";
        state.classSessionId = "";
        state.classState = null;
        setScreen(elements.modeScreen);
        elements.personalModeButton.focus({ preventScroll: true });
    }

    function selectPersonalMode() {
        state.mode = "personal";
        setScreen(elements.personalScreen);
        elements.personalStartButton.focus({ preventScroll: true });
    }

    function selectClassMode() {
        state.mode = "class";
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
            onLeave: showModeScreen,
            onStateChange: syncClassLobby,
            onServerMessage: handleClassServerMessage,
            onAbort: ({ message }) => {
                elements.joinStatus.textContent = message || "학급 연결이 종료되었습니다.";
                elements.announcer.textContent = elements.joinStatus.textContent;
                setScreen(elements.lobbyScreen);
            },
            getLobbyPresentation: ({ count }) => ({
                canStart: false,
                startText: "교사 출발 대기",
                guideText: `현재 ${Math.max(1, count)}명 접속 · 교사가 출발시키면 동시에 첫 관문이 열립니다.`
            })
        }).mount();
    }

    function syncClassLobby(snapshot) {
        if (!snapshot) return;
        const connected = Boolean(snapshot.connected && snapshot.roomCode);
        elements.joinPane.classList.toggle("hidden", connected);
        elements.classWaitingPanel.classList.toggle("hidden", !connected);
        if (connected) {
            elements.studentRoomCode.textContent = snapshot.roomCode;
            elements.lobbyGuide.textContent = `현재 ${Object.keys(snapshot.players || {}).length}명 접속 · 교사의 출발 신호를 기다리세요.`;
        }
    }

    function handleClassServerMessage(message, snapshot) {
        if (message.type === `${MESSAGE_PREFIX}_ERROR`) {
            elements.joinStatus.textContent = message.message || "학급 탐험 요청을 처리하지 못했습니다.";
            elements.announcer.textContent = elements.joinStatus.textContent;
            return;
        }
        if (message.type !== `${MESSAGE_PREFIX}_STATE` || !message.state) return;

        const previousSessionId = state.classSessionId;
        state.classState = message.state;
        renderClassRanking(message.state, snapshot?.myId || lobby?.snapshot().myId);

        if (message.state.phase === "running" && message.state.sessionId && message.state.sessionId !== previousSessionId) {
            state.classSessionId = message.state.sessionId;
            startJourney();
            return;
        }

        if (message.state.phase === "lobby" && previousSessionId) {
            state.classSessionId = "";
            state.classResultSubmitted = false;
            setScreen(elements.lobbyScreen);
            syncClassLobby(lobby.snapshot());
            elements.announcer.textContent = config.resetAnnouncement;
        }
    }

    function startJourney() {
        if (TOTAL_STAGES !== 10) {
            elements.announcer.textContent = "탐험 관문을 불러오지 못했습니다.";
            return;
        }
        state.currentIndex = 0;
        state.score = 0;
        state.attempts = 0;
        state.stageSolved = false;
        state.experimentPath = [];
        state.componentOrder = [];
        state.missed = [];
        state.startedAt = performance.now();
        state.classResultSubmitted = false;
        elements.currentScore.textContent = "0";
        elements.journeyModeLabel.textContent = state.mode === "class" ? "학급 순위 탐험" : "개인 탐험";
        buildRouteMap();
        setScreen(elements.journeyScreen);
        renderStage();
        window.scrollTo({ top: 0, behavior: "auto" });
    }

    function buildRouteMap() {
        elements.routeMap.replaceChildren();
        stages.forEach((stage, index) => {
            const node = document.createElement("li");
            node.className = "route-node";
            node.dataset.number = String(index + 1);
            node.textContent = stage.shortLabel;
            elements.routeMap.append(node);
        });
    }

    function updateRouteMap() {
        [...elements.routeMap.children].forEach((node, index) => {
            node.classList.toggle("passed", index < state.currentIndex || (index === state.currentIndex && state.stageSolved));
            node.classList.toggle("current", index === state.currentIndex && !state.stageSolved);
        });
        elements.routeMap.children[state.currentIndex]?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
    }

    function stateText(stateName) {
        return config.stateLabels[stateName] || stateName;
    }

    function isExperimentStage(stage) {
        return Boolean(HAS_INTERACTIVE_SIMULATION && stage?.kind === "experiment" && elements.simulationCard);
    }

    function isAnatomyExplorerStage(stage) {
        return Boolean(HAS_ANATOMY_EXPLORER && stage?.target && elements.anatomyExplorer);
    }

    const anatomyMarkerPositions = {
        "body-return": [154, 393],
        "right-atrium": [169, 214],
        tricuspid: [174, 231],
        "pulmonary-artery": [145, 178],
        alveoli: [218, 156],
        "pulmonary-vein": [214, 203],
        mitral: [190, 222],
        "left-ventricle": [193, 246],
        aorta: [202, 145],
        "tissue-exchange": [207, 394]
    };

    function setExplorerFeedback(stateName, title, message, showNext = false) {
        elements.explorerFeedback.dataset.state = stateName;
        elements.explorerFeedbackTitle.textContent = title;
        elements.explorerFeedbackText.textContent = message;
        elements.explorerNextButton.classList.toggle("hidden", !showNext);
    }

    function updateAnatomyMap(stage, arrived = false) {
        elements.anatomyMap.dataset.oxygen = stage.oxygen;
        const focus = stage.target === "alveoli" || stage.target === "pulmonary-vein"
            ? "lung"
            : ["right-atrium", "tricuspid", "pulmonary-artery", "mitral", "left-ventricle"].includes(stage.target)
                ? "heart"
                : "body";
        elements.anatomyMap.dataset.focus = focus;
        elements.anatomyMap.dataset.target = stage.target;
        elements.anatomyMap.dataset.arrived = String(arrived);
        elements.bodyModel?.setAttribute("aria-label", focus === "heart"
            ? "우심방, 우심실, 좌심방, 좌심실과 판막이 보이는 심장 단면도"
            : focus === "lung"
                ? "폐동맥, 폐정맥, 폐포와 기체 교환이 보이는 폐 확대도"
                : "대정맥, 대동맥과 모세혈관망이 보이는 전신 순환도");
        elements.anatomyMap.style.setProperty("--journey-progress", `${Math.max(0, state.currentIndex + (arrived ? 1 : 0)) * 10}`);
        elements.atlasStep.textContent = `ROUTE ${String(state.currentIndex + 1).padStart(2, "0")} / ${String(TOTAL_STAGES).padStart(2, "0")}`;
        elements.atlasFocus.textContent = `${stage.chapter.toUpperCase()} · ${stage.location}`;
        elements.mapReadout.textContent = stage.oxygen === "rich"
            ? "O₂ RICH · SYSTEMIC DELIVERY"
            : stage.oxygen === "exchange" ? "GAS EXCHANGE · O₂ LOADING" : "O₂ LOW · CO₂ RETURN";
        const markerStage = arrived
            ? stage
            : stages[Math.max(0, state.currentIndex - 1)] || stage;
        const [x, y] = anatomyMarkerPositions[markerStage.target] || anatomyMarkerPositions["body-return"];
        elements.bloodCellMarker?.setAttribute("cx", String(x));
        elements.bloodCellMarker?.setAttribute("cy", String(y));

        elements.anatomyMap.querySelectorAll(".anatomy-hotspot").forEach((button) => {
            const targetIndex = stages.findIndex((item) => item.target === button.dataset.target);
            button.disabled = state.stageSolved || button.classList.contains("is-wrong");
            button.classList.toggle("is-discovered", targetIndex < state.currentIndex || (arrived && targetIndex === state.currentIndex));
            button.classList.toggle("is-arrival", arrived && button.dataset.target === stage.target);
        });
    }

    function renderAnatomyExplorer(stage) {
        elements.questionCard.classList.add("hidden");
        elements.simulationCard?.classList.add("hidden");
        elements.anatomyExplorer.classList.remove("hidden");
        elements.explorerQuestion.textContent = stage.question;
        elements.explorerNextButton.textContent = state.currentIndex === TOTAL_STAGES - 1 ? "탐험 결과 보기" : "혈구를 따라 계속 이동";
        elements.anatomyMap.querySelectorAll(".anatomy-hotspot").forEach((button) => {
            button.disabled = false;
            button.classList.remove("is-wrong", "is-arrival");
        });
        setExplorerFeedback("idle", "몸속 어디로 이동해야 할까요?", "기관 이름과 혈액의 방향을 관찰한 뒤 지도에서 직접 눌러 보세요.");
        updateAnatomyMap(stage);
        updateRouteMap();
        elements.anatomyExplorer.focus?.({ preventScroll: true });
        elements.announcer.textContent = `${stage.location}. ${stage.mission} ${stage.question}`;
    }

    function selectAnatomyTarget(button) {
        if (state.stageSolved || button.disabled) return;
        const stage = stages[state.currentIndex];
        const isCorrect = button.dataset.target === stage.target;

        if (!isCorrect) {
            if (state.attempts === 0) {
                state.missed.push({ stage, chosen: button.dataset.label });
            }
            state.attempts += 1;
            button.disabled = true;
            button.classList.add("is-wrong");
            setExplorerFeedback("correcting", `${button.dataset.label}에서는 흐름이 이어지지 않아요`, stage.hint);
            elements.announcer.textContent = `${elements.explorerFeedbackTitle.textContent}. ${stage.hint}`;
            window.ClassGameSfx?.play("error");
            return;
        }

        state.stageSolved = true;
        if (state.attempts === 0) {
            state.score += 1;
            elements.currentScore.textContent = String(state.score);
        }
        revealFact(stage);
        updateAnatomyMap(stage, true);
        setExplorerFeedback(
            "success",
            state.attempts === 0 ? "혈구가 정확한 위치에 도착했어요!" : "혈액의 흐름을 찾아냈어요!",
            stage.explanation,
            true
        );
        elements.cellExplorer.classList.add("moving");
        setTimeout(() => elements.cellExplorer.classList.remove("moving"), 320);
        elements.announcer.textContent = `${elements.explorerFeedbackTitle.textContent} ${stage.explanation}`;
        window.ClassGameSfx?.play("success");
        updateRouteMap();
        elements.explorerNextButton.focus({ preventScroll: true });
    }

    function hideFact() {
        elements.stageFact.textContent = "";
        elements.factCard.classList.remove("is-revealed");
        elements.factCard.setAttribute("aria-hidden", "true");
    }

    function revealFact(stage) {
        elements.stageFact.textContent = stage.fact;
        elements.factCard.classList.add("is-revealed");
        elements.factCard.removeAttribute("aria-hidden");
    }

    function setSimulationFeedback(stateName, title, message, showNext = false) {
        if (!elements.simulationFeedback) return;
        elements.simulationFeedback.dataset.state = stateName;
        elements.simulationFeedbackTitle.textContent = title;
        elements.simulationFeedbackText.textContent = message;
        elements.simulationNextButton.classList.toggle("hidden", !showNext);
    }

    function experimentIntensityGoal(stage) {
        if (stage.scenario.targetMin != null) {
            return {
                min: stage.scenario.targetMin,
                max: stage.scenario.targetMax ?? 100,
                start: stage.scenario.startIntensity ?? Math.max(10, stage.scenario.targetMin - 20)
            };
        }
        const experimentStages = stages.filter((item) => isExperimentStage(item));
        const experimentIndex = Math.max(0, experimentStages.findIndex((item) => item.id === stage.id));
        const patterns = [
            { offset: [0, 12], startOffset: 30 },
            { offset: [-6, 8], startOffset: -28 },
            { offset: [3, 15], startOffset: 30 },
            { offset: [-4, 7], startOffset: -26 },
            { offset: [0, 10], startOffset: 28 }
        ];
        const pattern = patterns[experimentIndex % patterns.length];
        const clamp = (value) => Math.max(0, Math.min(100, value));
        return {
            min: clamp(stage.scenario.threshold + pattern.offset[0]),
            max: clamp(stage.scenario.threshold + pattern.offset[1]),
            start: clamp(stage.scenario.threshold + pattern.startOffset)
        };
    }

    function updateStimulusReadout() {
        const stage = stages[state.currentIndex];
        if (!isExperimentStage(stage)) return;
        const intensity = Number(elements.stimulusIntensity.value);
        const goal = experimentIntensityGoal(stage);
        elements.stimulusValue.textContent = String(intensity);
        elements.stimulusThreshold.textContent = `${stage.scenario.intensityLabel} · 관찰 구간 ${goal.min}–${goal.max}`;
        elements.stimulusIntensity.style.setProperty("--stimulus-level", `${intensity}%`);
        updateMovementVisual(stage, intensity);
        updateExcretionVisual(stage, intensity);
        updateTemperatureVisual(stage, intensity);
    }

    function updateMovementVisual(stage, intensity) {
        const visual = stage?.scenario?.visual;
        if (!elements.motionVisual || !visual) return;
        const progress = Math.max(0, Math.min(1, intensity / 100));
        const angle = Math.round(visual.startAngle + (visual.endAngle - visual.startAngle) * progress);
        const rotation = angle - 180;
        const activeFront = visual.activeMuscle !== "back";
        const activeWidth = 12 + progress * 13;
        const relaxedWidth = 18 - progress * 7;

        elements.motionVisual.dataset.motion = visual.motion || "flex";
        elements.motionVisual.classList.toggle("has-load", Boolean(visual.load));
        elements.motionVisual.classList.remove("is-success");
        elements.motionForearm?.setAttribute("transform", `rotate(${rotation} 136 130)`);
        elements.motionFrontMuscle?.setAttribute("stroke-width", String(activeFront ? activeWidth : relaxedWidth));
        elements.motionBackMuscle?.setAttribute("stroke-width", String(activeFront ? relaxedWidth : activeWidth));
        elements.motionFrontTendon?.classList.toggle("is-active", activeFront);
        elements.motionBackTendon?.classList.toggle("is-active", !activeFront);
        if (elements.motionLoad) elements.motionLoad.hidden = !visual.load;
        if (elements.motionAngle) elements.motionAngle.textContent = `${angle}°`;
        if (elements.motionFrontState) elements.motionFrontState.textContent = activeFront ? (intensity >= stage.scenario.threshold ? "수축" : "수축 준비") : "이완";
        if (elements.motionBackState) elements.motionBackState.textContent = !activeFront ? (intensity >= stage.scenario.threshold ? "수축" : "수축 준비") : "이완";
    }

    function updateExcretionVisual(stage, intensity) {
        const visual = stage?.scenario?.visual;
        if (!elements.excretionVisual || !visual) return;

        const progress = Math.max(0, Math.min(1, intensity / 100));
        const process = visual.process || "filter";
        const fillPercent = visual.startFill + (visual.endFill - visual.startFill) * progress;
        const fluidHeight = Math.max(6, 54 * fillPercent / 100);
        const returnStrength = process === "reclaim" ? progress : process === "balance" ? 0.35 + progress * 0.4 : 0.2;
        const releaseStrength = process === "bladder" && intensity >= stage.scenario.threshold ? progress : 0.1;
        const flowStrength = process === "bladder" ? Math.max(0.25, progress * 0.65) : progress;
        const urineLightness = process === "balance" ? 48 + progress * 22 : 51 + progress * 7;

        elements.excretionVisual.dataset.process = process;
        elements.excretionVisual.classList.remove("is-success");
        elements.excretionVisual.style.setProperty("--flow-strength", String(flowStrength));
        elements.excretionVisual.style.setProperty("--return-strength", String(returnStrength));
        elements.excretionVisual.style.setProperty("--release-strength", String(releaseStrength));
        elements.excretionVisual.style.setProperty("--urine-color", `hsl(42 82% ${urineLightness}%)`);
        elements.bladderFluid?.setAttribute("y", String(210 - fluidHeight));
        elements.bladderFluid?.setAttribute("height", String(fluidHeight));

        if (process === "filter") {
            elements.filterState.textContent = `거르기 ${Math.round(progress * 100)}%`;
            elements.urineState.textContent = intensity >= stage.scenario.threshold ? "노폐물 이동" : "이동 준비";
            elements.bladderState.textContent = "저장 시작";
        } else if (process === "reclaim") {
            elements.filterState.textContent = `필요한 물질 회수 ${Math.round(progress * 100)}%`;
            elements.urineState.textContent = "노폐물·남는 물 이동";
            elements.bladderState.textContent = "소변 재료 모임";
        } else if (process === "pathway") {
            elements.filterState.textContent = "콩팥에서 소변 생성";
            elements.urineState.textContent = `요관 흐름 ${Math.round(progress * 100)}%`;
            elements.bladderState.textContent = `${Math.round(fillPercent)}% 참`;
        } else if (process === "balance") {
            elements.filterState.textContent = `들어온 물 ${intensity}%`;
            elements.urineState.textContent = progress >= 0.55 ? "양 증가·색 옅어짐" : "양 적음·색 진함";
            elements.bladderState.textContent = `${Math.round(fillPercent)}% 참`;
        } else {
            elements.filterState.textContent = "소변 만들기 계속";
            elements.urineState.textContent = "요관으로 이동";
            elements.bladderState.textContent = intensity >= stage.scenario.threshold ? "비울 신호 전달" : `${Math.round(fillPercent)}% 참`;
        }
    }

    function updateTemperatureVisual(stage, intensity) {
        const visual = stage?.scenario?.visual;
        if (!elements.temperatureVisual || !visual) return;

        const progress = Math.max(0, Math.min(1, intensity / 100));
        const process = visual.process || "sense";
        const temperature = visual.startTemp + (visual.endTemp - visual.startTemp) * progress;
        const temperatureRatio = Math.max(0, Math.min(1, (temperature - 35.5) / 3));
        const columnHeight = 28 + temperatureRatio * 97;
        let vesselWidth = 7;
        let sweatLevel = 0.08;
        let heatLevel = 0.2;
        let shiverLevel = 0.05;
        let brainLevel = 0.35 + progress * 0.65;
        let vesselText = "반응 준비";
        let responseText = `온도 신호 ${Math.round(progress * 100)}%`;
        let vesselColor = "#ed7262";
        let heatColor = "#f4a64a";

        if (process === "cool") {
            vesselWidth = 5 + progress * 11;
            sweatLevel = 0.08 + progress * 0.92;
            heatLevel = 0.15 + progress * 0.85;
            vesselText = `넓어짐 ${Math.round(progress * 100)}%`;
            responseText = `땀 증발 ${Math.round(progress * 100)}%`;
        } else if (process === "conserve") {
            vesselWidth = 13 - progress * 9;
            sweatLevel = 0.02;
            heatLevel = 0.68 - progress * 0.56;
            vesselColor = "#769bd0";
            heatColor = "#87c9ea";
            vesselText = `좁아짐 ${Math.round(progress * 100)}%`;
            responseText = `열 손실 감소 ${Math.round(progress * 100)}%`;
        } else if (process === "shiver") {
            vesselWidth = 5 - progress * 2;
            sweatLevel = 0.02;
            heatLevel = 0.18 + progress * 0.52;
            shiverLevel = 0.08 + progress * 0.92;
            vesselColor = "#769bd0";
            vesselText = "좁아져 열 지킴";
            responseText = `근육 떨림 ${Math.round(progress * 100)}%`;
        } else if (process === "balance") {
            vesselWidth = 15 - progress * 8;
            sweatLevel = 1 - progress * 0.72;
            heatLevel = 1 - progress * 0.7;
            brainLevel = 0.95 - progress * 0.38;
            vesselText = "평소 폭으로 회복";
            responseText = `냉각 반응 감소 ${Math.round(progress * 100)}%`;
        }

        elements.temperatureVisual.dataset.process = process;
        elements.temperatureVisual.classList.remove("is-success");
        elements.temperatureVisual.style.setProperty("--brain-level", String(brainLevel));
        elements.temperatureVisual.style.setProperty("--vessel-width", `${vesselWidth}px`);
        elements.temperatureVisual.style.setProperty("--vessel-color", vesselColor);
        elements.temperatureVisual.style.setProperty("--sweat-level", String(sweatLevel));
        elements.temperatureVisual.style.setProperty("--sweat-shift", `${Math.max(0, (1 - sweatLevel) * 8)}px`);
        elements.temperatureVisual.style.setProperty("--heat-level", String(heatLevel));
        elements.temperatureVisual.style.setProperty("--heat-color", heatColor);
        elements.temperatureVisual.style.setProperty("--shiver-level", String(shiverLevel));
        elements.temperatureColumn?.setAttribute("y", String(153 - columnHeight));
        elements.temperatureColumn?.setAttribute("height", String(columnHeight));
        if (elements.temperatureState) elements.temperatureState.textContent = `${temperature.toFixed(1)}℃`;
        if (elements.vesselState) elements.vesselState.textContent = vesselText;
        if (elements.responseState) elements.responseState.textContent = responseText;
    }

    function renderExperimentPath(stage, mismatchIndex = -1, animate = false) {
        elements.signalPath.replaceChildren();
        stage.scenario.correctPath.forEach((_, index) => {
            const item = document.createElement("li");
            const component = state.experimentPath[index];
            item.className = "signal-path-step";
            item.style.setProperty("--signal-delay", `${index * 110}ms`);
            item.classList.toggle("is-filled", Boolean(component));
            item.classList.toggle("is-mismatch", index === mismatchIndex);
            item.classList.toggle("is-signal", animate && Boolean(component));

            if (component) {
                const button = document.createElement("button");
                button.type = "button";
                button.dataset.sfx = "none";
                button.textContent = component;
                button.title = `${component}부터 경로 다시 만들기`;
                button.disabled = state.stageSolved;
                button.addEventListener("click", () => removeExperimentComponent(index));
                item.append(button);
            } else {
                const placeholder = document.createElement("span");
                placeholder.innerHTML = `<b>${index + 1}</b><small>${simulationCopy.slotLabel}</small>`;
                item.append(placeholder);
            }
            elements.signalPath.append(item);
        });
    }

    function renderComponentBank(stage) {
        elements.componentBank.replaceChildren();
        state.componentOrder.forEach((component) => {
            const button = document.createElement("button");
            const isSelected = state.experimentPath.includes(component);
            button.type = "button";
            button.className = "component-button";
            button.dataset.sfx = "none";
            button.textContent = component;
            button.classList.toggle("is-selected", isSelected);
            button.disabled = isSelected || state.experimentPath.length >= stage.scenario.correctPath.length || state.stageSolved;
            button.addEventListener("click", () => addExperimentComponent(component));
            elements.componentBank.append(button);
        });
    }

    function addExperimentComponent(component) {
        const stage = stages[state.currentIndex];
        if (!isExperimentStage(stage) || state.stageSolved || state.experimentPath.includes(component)) return;
        if (state.experimentPath.length >= stage.scenario.correctPath.length) return;
        state.experimentPath.push(component);
        renderExperimentPath(stage);
        renderComponentBank(stage);
        setSimulationFeedback("idle", simulationCopy.selectedTitle, `${state.experimentPath.length}/${stage.scenario.correctPath.length}칸을 연결했습니다. ${simulationCopy.selectedText}`);
        window.ClassGameSfx?.play("click");
    }

    function removeExperimentComponent(index) {
        const stage = stages[state.currentIndex];
        if (!isExperimentStage(stage) || state.stageSolved) return;
        state.experimentPath.splice(index);
        renderExperimentPath(stage);
        renderComponentBank(stage);
        setSimulationFeedback("idle", simulationCopy.removeTitle, `${index + 1}번째 칸부터 비웠습니다.`);
    }

    function undoExperimentPath() {
        const stage = stages[state.currentIndex];
        if (!isExperimentStage(stage) || state.stageSolved || state.experimentPath.length === 0) return;
        state.experimentPath.pop();
        renderExperimentPath(stage);
        renderComponentBank(stage);
        setSimulationFeedback("idle", simulationCopy.undoTitle, simulationCopy.undoText);
    }

    function clearExperimentPath() {
        const stage = stages[state.currentIndex];
        if (!isExperimentStage(stage) || state.stageSolved) return;
        state.experimentPath = [];
        renderExperimentPath(stage);
        renderComponentBank(stage);
        setSimulationFeedback("idle", simulationCopy.clearTitle, simulationCopy.clearText);
    }

    function renderExperimentStage(stage) {
        elements.questionCard.classList.add("hidden");
        elements.simulationCard.classList.remove("hidden");
        elements.simulationTitle.textContent = stage.question;
        elements.stimulusIcon.textContent = stage.scenario.icon;
        elements.stimulusName.textContent = stage.scenario.stimulus;
        elements.stimulusIntensity.value = String(experimentIntensityGoal(stage).start);
        elements.stimulusIntensity.disabled = false;
        elements.undoPathButton.disabled = false;
        elements.clearPathButton.disabled = false;
        elements.runSimulationButton.disabled = false;
        elements.runSimulationButton.textContent = simulationCopy.runLabel;
        elements.motionVisual?.classList.remove("hidden", "is-success");
        elements.excretionVisual?.classList.remove("hidden", "is-success");
        elements.temperatureVisual?.classList.remove("hidden", "is-success");
        state.experimentPath = [];
        state.componentOrder = shuffledChoices(stage.scenario.components);
        updateStimulusReadout();
        renderExperimentPath(stage);
        renderComponentBank(stage);
        setSimulationFeedback("idle", simulationCopy.idleTitle, simulationCopy.idleText);
        updateRouteMap();
        elements.stimulusIntensity.focus({ preventScroll: true });
        elements.announcer.textContent = `${stage.location}. ${stage.mission}`;
    }

    function runInteractiveExperiment() {
        const stage = stages[state.currentIndex];
        if (!isExperimentStage(stage) || state.stageSolved) return;
        const scenario = stage.scenario;
        const intensity = Number(elements.stimulusIntensity.value);
        const intensityGoal = experimentIntensityGoal(stage);

        if (state.experimentPath.length < scenario.correctPath.length) {
            const emptyCount = scenario.correctPath.length - state.experimentPath.length;
            setSimulationFeedback("correcting", simulationCopy.incompleteTitle, simulationCopy.incompleteText.replace("{count}", String(emptyCount)));
            elements.announcer.textContent = elements.simulationFeedbackText.textContent;
            return;
        }

        if (intensity < intensityGoal.min || intensity > intensityGoal.max) {
            const direction = intensity < intensityGoal.min ? "높여" : "낮춰";
            const observation = intensity < intensityGoal.min
                ? scenario.lowMessage
                : "자극이나 반응이 지나치게 강하면 관찰하려는 과정이 안정적으로 나타나지 않아요.";
            setSimulationFeedback("observing", "관찰 조건을 다시 맞춰 보세요", `${observation} 값을 ${direction} ${intensityGoal.min}–${intensityGoal.max} 구간에 맞추세요.`);
            elements.announcer.textContent = `${elements.simulationFeedbackTitle.textContent}. ${elements.simulationFeedbackText.textContent}`;
            window.ClassGameSfx?.play("click");
            elements.stimulusIntensity.focus({ preventScroll: true });
            return;
        }

        const mismatchIndex = state.experimentPath.findIndex((component, index) => component !== scenario.correctPath[index]);
        if (mismatchIndex !== -1) {
            if (state.attempts === 0) {
                state.missed.push({ stage, chosen: state.experimentPath.join(" → ") });
            }
            state.attempts += 1;
            renderExperimentPath(stage, mismatchIndex);
            setSimulationFeedback("correcting", simulationCopy.mismatchTitle.replace("{index}", String(mismatchIndex + 1)), scenario.hints[mismatchIndex]);
            elements.announcer.textContent = `${elements.simulationFeedbackTitle.textContent}. ${elements.simulationFeedbackText.textContent}`;
            window.ClassGameSfx?.play("error");
            elements.signalPath.children[mismatchIndex]?.querySelector("button")?.focus({ preventScroll: true });
            return;
        }

        state.stageSolved = true;
        if (state.attempts === 0) {
            state.score += 1;
            elements.currentScore.textContent = String(state.score);
        }
        revealFact(stage);
        renderExperimentPath(stage, -1, true);
        renderComponentBank(stage);
        elements.stimulusIntensity.disabled = true;
        elements.undoPathButton.disabled = true;
        elements.clearPathButton.disabled = true;
        elements.runSimulationButton.disabled = true;
        elements.runSimulationButton.textContent = simulationCopy.completeLabel;
        setSimulationFeedback("success", simulationCopy.successTitle, `${scenario.response} ${stage.explanation}`, true);
        elements.simulationNextButton.textContent = simulationCopy.nextLabel;
        elements.scenePanel.classList.add("simulation-reacting");
        elements.motionVisual?.classList.add("is-success");
        elements.excretionVisual?.classList.add("is-success");
        elements.temperatureVisual?.classList.add("is-success");
        setTimeout(() => elements.scenePanel.classList.remove("simulation-reacting"), 900);
        elements.announcer.textContent = `${elements.simulationFeedbackTitle.textContent} ${elements.simulationFeedbackText.textContent}`;
        window.ClassGameSfx?.play("success");
        updateRouteMap();
        elements.simulationNextButton.focus({ preventScroll: true });
    }

    function renderStage() {
        const stage = stages[state.currentIndex];
        state.attempts = 0;
        state.stageSolved = false;
        elements.stageNumber.textContent = String(state.currentIndex + 1);
        elements.scenePanel.dataset.scene = stage.scene;
        elements.chapterLabel.textContent = stage.chapter;
        elements.stageLocation.textContent = stage.location;
        elements.stageMission.textContent = stage.mission;
        elements.scenePanel.classList.remove("simulation-reacting");
        elements.motionVisual?.classList.toggle("hidden", !isExperimentStage(stage));
        elements.excretionVisual?.classList.toggle("hidden", !isExperimentStage(stage));
        elements.temperatureVisual?.classList.toggle("hidden", !isExperimentStage(stage));
        hideFact();
        elements.oxygenLabel.textContent = stateText(stage.oxygen);
        elements.oxygenMeter.dataset.state = stage.oxygen;
        elements.oxygenMeter.classList.toggle("rich", stage.oxygen === "rich");
        elements.oxygenMeter.classList.toggle("exchange", stage.oxygen === "exchange");
        elements.feedback.className = "feedback hidden";
        elements.nextStageButton.classList.add("hidden");
        elements.choiceList.replaceChildren();

        if (isAnatomyExplorerStage(stage)) {
            renderAnatomyExplorer(stage);
            document.dispatchEvent(new CustomEvent("body-explorer-stage-rendered", { detail: { stageId: stage.id, kind: stage.kind || "anatomy" } }));
            return;
        }

        if (isExperimentStage(stage)) {
            renderExperimentStage(stage);
            document.dispatchEvent(new CustomEvent("body-explorer-stage-rendered", { detail: { stageId: stage.id, kind: stage.kind } }));
            return;
        }

        elements.simulationCard?.classList.add("hidden");
        elements.anatomyExplorer?.classList.add("hidden");
        elements.questionCard.classList.remove("hidden");
        elements.stageQuestion.textContent = stage.question;

        shuffledChoices(stage.choices).forEach((choice, index) => {
            const button = document.createElement("button");
            const number = document.createElement("span");
            button.type = "button";
            button.className = "choice-button";
            button.dataset.choice = choice;
            button.dataset.sfx = "none";
            button.append(document.createTextNode(choice));
            number.className = "choice-number";
            number.setAttribute("aria-hidden", "true");
            number.textContent = String(index + 1);
            button.append(number);
            button.addEventListener("click", () => selectRoute(choice, button));
            elements.choiceList.append(button);
        });

        updateRouteMap();
        elements.choiceList.querySelector("button")?.focus({ preventScroll: true });
        elements.announcer.textContent = `${stage.location}. ${stage.mission} ${stage.question}`;
        document.dispatchEvent(new CustomEvent("body-explorer-stage-rendered", { detail: { stageId: stage.id, kind: stage.kind || "check" } }));
    }

    function selectRoute(choice, button) {
        if (state.stageSolved || button.disabled) return;
        const stage = stages[state.currentIndex];
        const isCorrect = choice === stage.answer;

        if (!isCorrect) {
            if (state.attempts === 0) {
                state.missed.push({ stage, chosen: choice });
            }
            state.attempts += 1;
            button.disabled = true;
            button.classList.add("is-wrong");
            elements.feedback.className = "feedback is-wrong";
            elements.feedbackTitle.textContent = "근거를 한 번 더 살펴봐요";
            elements.feedbackText.textContent = `${stage.hint} 다른 선택지와 비교해 보세요.`;
            elements.announcer.textContent = `${elements.feedbackTitle.textContent}. ${elements.feedbackText.textContent}`;
            window.ClassGameSfx?.play("error");
            elements.choiceList.querySelector("button:not(:disabled)")?.focus({ preventScroll: true });
            return;
        }

        state.stageSolved = true;
        if (state.attempts === 0) {
            state.score += 1;
            elements.currentScore.textContent = String(state.score);
        }
        [...elements.choiceList.querySelectorAll("button")].forEach((choiceButton) => {
            choiceButton.disabled = true;
            if (choiceButton.dataset.choice === stage.answer) choiceButton.classList.add("is-correct");
        });
        revealFact(stage);
        elements.feedback.className = "feedback";
        elements.feedbackTitle.textContent = state.attempts === 0 ? "정확한 경로예요!" : "근거를 찾아냈어요!";
        elements.feedbackText.textContent = stage.explanation;
        elements.nextStageButton.textContent = state.currentIndex === TOTAL_STAGES - 1 ? "완주 결과 보기" : "다음 장소로 이동";
        elements.nextStageButton.classList.remove("hidden");
        elements.announcer.textContent = `${elements.feedbackTitle.textContent} ${stage.explanation}`;
        elements.cellExplorer.classList.add("moving");
        setTimeout(() => elements.cellExplorer.classList.remove("moving"), 320);
        window.ClassGameSfx?.play("success");
        updateRouteMap();
        elements.nextStageButton.focus({ preventScroll: true });
    }

    function goToNextStage() {
        if (!state.stageSolved) return;
        if (state.currentIndex >= TOTAL_STAGES - 1) {
            showResults();
            return;
        }
        state.currentIndex += 1;
        renderStage();
        elements.scenePanel.scrollIntoView({ block: "start", behavior: "smooth" });
    }

    function resultMessage(score) {
        const name = getPlayerName();
        const subject = name ? `${name} 탐험가, ` : "";
        if (score === TOTAL_STAGES) return `${subject}${config.resultMessages.perfect}`;
        if (score >= 8) return `${subject}${config.resultMessages.great}`;
        if (score >= 6) return `${subject}${config.resultMessages.good}`;
        return `${subject}${config.resultMessages.retry}`;
    }

    function renderReview() {
        elements.missedList.replaceChildren();
        elements.perfectReview.classList.toggle("hidden", state.missed.length !== 0);
        elements.missedList.classList.toggle("hidden", state.missed.length === 0);
        state.missed.forEach(({ stage, chosen }) => {
            const item = document.createElement("li");
            const location = document.createElement("span");
            const question = document.createElement("span");
            const selected = document.createElement("span");
            const answer = document.createElement("span");
            const explanation = document.createElement("span");
            location.className = "review-location";
            location.textContent = stage.location;
            question.className = "review-question";
            question.textContent = stage.question;
            selected.className = "review-chosen";
            selected.textContent = stage.kind === "experiment" ? `${simulationCopy.reviewLabel}: ${chosen}` : `처음 선택: ${chosen}`;
            answer.className = "review-answer";
            answer.textContent = `확인한 정답: ${stage.answer}`;
            explanation.className = "review-explanation";
            explanation.textContent = stage.explanation;
            item.append(location, question, selected, answer, explanation);
            elements.missedList.append(item);
        });
    }

    function showResults() {
        const elapsedMs = Math.max(0, performance.now() - state.startedAt);
        elements.finalScore.textContent = String(state.score);
        elements.resultMessage.textContent = resultMessage(state.score);
        renderReview();

        if (state.mode === "personal") {
            const previousBest = getBestScore();
            const isNewBest = state.score > previousBest;
            const best = Math.max(previousBest, state.score);
            if (isNewBest) writeStored(BEST_SCORE_KEY, state.score);
            elements.bestMessage.textContent = isNewBest
                ? `새 개인 최고 기록 ${best}/${TOTAL_STAGES} · ${formatElapsed(elapsedMs)}`
                : `개인 최고 기록 ${best}/${TOTAL_STAGES} · 이번 탐험 ${formatElapsed(elapsedMs)}`;
            elements.classRankArea.classList.add("hidden");
            elements.restartButton.classList.remove("hidden");
            updateBestScore();
        } else {
            elements.bestMessage.textContent = "첫 도전 정답 수가 같으면 먼저 완주한 탐험가가 앞서요.";
            elements.classRankArea.classList.remove("hidden");
            elements.restartButton.classList.add("hidden");
            if (!state.classResultSubmitted && lobby) {
                state.classResultSubmitted = true;
                lobby.sendServer({
                    type: `${MESSAGE_PREFIX}_ACTION`,
                    action: "SUBMIT",
                    sessionId: state.classSessionId,
                    score: state.score
                });
            }
            renderClassRanking(state.classState, lobby?.snapshot().myId);
        }

        setScreen(elements.resultScreen);
        window.ClassGameSfx?.play("success");
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
            ? `나의 순위 ${mine.rank}위 · ${mine.score}/${TOTAL_STAGES} · ${formatElapsed(mine.elapsedMs)}`
            : state.classResultSubmitted ? "결과를 집계하고 있어요." : "한 바퀴를 완주하면 내 순위가 표시됩니다.";
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
            score.textContent = `${entry.score}/${TOTAL_STAGES}`;
            time.className = "rank-time";
            time.textContent = formatElapsed(entry.elapsedMs);
            row.append(rank, name, score, time);
            elements.classRankingList.append(row);
        });

        const waitingCount = Math.max(0, participants.length - rankings.length);
        elements.rankingWaiting.textContent = classState.phase === "ended"
            ? `최종 순위 · ${participants.length}명 모두 완주`
            : waitingCount > 0
                ? `${rankings.length}명 완주 · ${waitingCount}명 탐험 중`
                : "첫 완주자를 기다리고 있어요.";
    }

    function handleKeyboard(event) {
        if (elements.journeyScreen.classList.contains("hidden")) return;
        const stage = stages[state.currentIndex];
        if (!isExperimentStage(stage) && !isAnatomyExplorerStage(stage) && !state.stageSolved && /^[1-3]$/.test(event.key)) {
            const choice = elements.choiceList.querySelectorAll("button")[Number(event.key) - 1];
            if (choice && !choice.disabled) {
                event.preventDefault();
                choice.click();
            }
            return;
        }
        if (state.stageSolved && event.key === "Enter" && document.activeElement !== elements.nextStageButton && document.activeElement !== elements.simulationNextButton) {
            event.preventDefault();
            goToNextStage();
        }
    }

    elements.personalModeButton.addEventListener("click", selectPersonalMode);
    elements.classModeButton.addEventListener("click", selectClassMode);
    elements.personalStartButton.addEventListener("click", startJourney);
    elements.restartButton.addEventListener("click", startJourney);
    elements.resultModeButton.addEventListener("click", showModeScreen);
    elements.nextStageButton.addEventListener("click", goToNextStage);
    elements.anatomyMap?.querySelectorAll(".anatomy-hotspot").forEach((button) => {
        button.addEventListener("click", () => selectAnatomyTarget(button));
    });
    elements.explorerNextButton?.addEventListener("click", goToNextStage);
    elements.stimulusIntensity?.addEventListener("input", updateStimulusReadout);
    elements.undoPathButton?.addEventListener("click", undoExperimentPath);
    elements.clearPathButton?.addEventListener("click", clearExperimentPath);
    elements.runSimulationButton?.addEventListener("click", runInteractiveExperiment);
    elements.simulationNextButton?.addEventListener("click", goToNextStage);
    document.querySelectorAll(".mode-back-button").forEach((button) => button.addEventListener("click", showModeScreen));
    document.addEventListener("keydown", handleKeyboard);

    setGreeting();
    updateBestScore();
    setScreen(elements.modeScreen);
})();
