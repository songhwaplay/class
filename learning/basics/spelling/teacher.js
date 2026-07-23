(() => {
    "use strict";

    const GAME_ID = "spelling";
    const SESSION_SIZE = 10;
    const TEACHER_DECK_KEY = "spellingTeacherQuestionDeckV1";
    const questionBank = Array.isArray(window.SPELLING_QUESTIONS) ? window.SPELLING_QUESTIONS : [];
    const elements = {
        lobbyScreen: document.getElementById("lobbyScreen"),
        racePanel: document.getElementById("teacherRacePanel"),
        roomCode: document.getElementById("roomCode"),
        raceRoomCode: document.getElementById("raceRoomCode"),
        lobbyStudentCount: document.getElementById("lobbyStudentCount"),
        teacherStartButton: document.getElementById("teacherStartButton"),
        teacherNotice: document.getElementById("teacherNotice"),
        raceNotice: document.getElementById("raceNotice"),
        racePhaseBadge: document.getElementById("racePhaseBadge"),
        raceTotalCount: document.getElementById("raceTotalCount"),
        raceFinishedCount: document.getElementById("raceFinishedCount"),
        racePlayingCount: document.getElementById("racePlayingCount"),
        rankingList: document.getElementById("teacherRankingList"),
        emptyRanking: document.getElementById("emptyRanking"),
        resetRaceButton: document.getElementById("resetRaceButton")
    };

    let lobby = null;
    let spellingState = null;

    function takeQuestionIds() {
        return window.SpellingQuestionDeck.take({
            questions: questionBank,
            size: SESSION_SIZE,
            storageKey: TEACHER_DECK_KEY,
            storage: window.localStorage
        });
    }

    function formatElapsed(milliseconds) {
        const totalTenths = Math.max(0, Math.round(Number(milliseconds || 0) / 100));
        const minutes = Math.floor(totalTenths / 600);
        const seconds = ((totalTenths % 600) / 10).toFixed(1);
        return minutes > 0 ? `${minutes}분 ${seconds.padStart(4, "0")}초` : `${seconds}초`;
    }

    function studentCountFromSnapshot(snapshot) {
        return Math.max(0, Object.keys(snapshot?.players || {}).length - 1);
    }

    function syncLobby(snapshot) {
        const count = spellingState?.phase === "lobby"
            ? spellingState.participants.length
            : studentCountFromSnapshot(snapshot);
        elements.lobbyStudentCount.textContent = `${count}명`;
        elements.raceRoomCode.textContent = snapshot?.roomCode || elements.roomCode.textContent || "----";
        elements.teacherStartButton.disabled = count < 1 || spellingState?.phase === "running";
        elements.teacherStartButton.textContent = count < 1 ? "학생 참가 대기" : `전원 시작 · ${count}명`;
    }

    function startCompetition() {
        const snapshot = lobby.snapshot();
        const studentCount = spellingState?.participants?.length ?? studentCountFromSnapshot(snapshot);
        if (studentCount < 1) {
            elements.teacherNotice.textContent = "학생이 한 명 이상 참가해야 합니다.";
            return;
        }
        const questionIds = takeQuestionIds();
        if (questionIds.length !== SESSION_SIZE) {
            elements.teacherNotice.textContent = "출제 문항을 불러오지 못했습니다.";
            return;
        }
        elements.teacherStartButton.disabled = true;
        elements.teacherStartButton.textContent = "시작하는 중...";
        elements.teacherNotice.textContent = "";
        lobby.sendServer({ type: "SPELLING_ACTION", action: "START", questionIds });
    }

    function resetCompetition() {
        const message = spellingState?.phase === "running"
            ? "진행 중인 순위와 결과를 지우고 새 순위전을 준비할까요?"
            : "현재 순위와 결과를 지우고 새 순위전을 준비할까요?";
        if (!window.confirm(message)) return;
        lobby.sendServer({ type: "SPELLING_ACTION", action: "RESET" });
    }

    function renderRanking(state) {
        const participants = Array.isArray(state.participants) ? state.participants : [];
        const rankings = Array.isArray(state.rankings) ? state.rankings : [];
        const playingCount = Math.max(0, participants.length - rankings.length);

        elements.raceTotalCount.textContent = `${participants.length}명`;
        elements.raceFinishedCount.textContent = `${rankings.length}명`;
        elements.racePlayingCount.textContent = `${playingCount}명`;
        elements.racePhaseBadge.textContent = state.phase === "ended" ? "최종 순위" : "진행 중";
        elements.racePhaseBadge.classList.toggle("ended", state.phase === "ended");
        elements.rankingList.replaceChildren();

        rankings.forEach((entry) => {
            const row = document.createElement("li");
            const rank = document.createElement("span");
            const name = document.createElement("span");
            const score = document.createElement("span");
            const time = document.createElement("span");
            row.className = "teacher-rank-row";
            rank.className = "teacher-rank-number";
            rank.textContent = `${entry.rank}위`;
            name.className = "teacher-rank-name";
            name.textContent = entry.name;
            score.className = "teacher-rank-score";
            score.textContent = `${entry.score}/${SESSION_SIZE}점`;
            time.className = "teacher-rank-time";
            time.textContent = formatElapsed(entry.elapsedMs);
            row.append(rank, name, score, time);
            elements.rankingList.append(row);
        });

        const finishedIds = new Set(rankings.map((entry) => String(entry.id)));
        participants
            .filter((participant) => !finishedIds.has(String(participant.id)))
            .forEach((participant) => {
                const row = document.createElement("li");
                const rank = document.createElement("span");
                const name = document.createElement("span");
                const status = document.createElement("span");
                const time = document.createElement("span");
                row.className = "teacher-rank-row is-playing";
                rank.className = "teacher-rank-number";
                rank.textContent = "—";
                name.className = "teacher-rank-name";
                name.textContent = participant.name;
                status.className = "teacher-rank-score";
                status.textContent = "풀이 중";
                time.className = "teacher-rank-time";
                time.textContent = "완료 대기";
                row.append(rank, name, status, time);
                elements.rankingList.append(row);
            });

        elements.emptyRanking.classList.toggle("hidden", participants.length > 0);
        elements.emptyRanking.textContent = state.phase === "ended"
            ? "완료된 결과가 없습니다."
            : "아직 완료한 학생이 없습니다.";
        elements.raceNotice.textContent = state.phase === "ended"
            ? `${participants.length}명 모두 완료했습니다.`
            : `${rankings.length}명 완료 · ${playingCount}명 풀이 중`;
    }

    function handleServerMessage(message, snapshot) {
        if (message.type === "SPELLING_ERROR") {
            const target = spellingState?.phase === "running" || spellingState?.phase === "ended"
                ? elements.raceNotice
                : elements.teacherNotice;
            target.textContent = message.message || "순위전 요청을 처리하지 못했습니다.";
            syncLobby(snapshot);
            return;
        }
        if (message.type !== "SPELLING_STATE" || !message.state) return;

        spellingState = message.state;
        syncLobby(snapshot);
        if (message.state.phase === "lobby") {
            elements.racePanel.classList.add("hidden");
            elements.lobbyScreen.classList.remove("hidden");
            elements.teacherNotice.textContent = "";
            return;
        }

        elements.lobbyScreen.classList.add("hidden");
        elements.racePanel.classList.remove("hidden");
        renderRanking(message.state);
    }

    function initialize() {
        if (!window.ClassroomMultiplayerLobby || !window.ClassroomNetwork) {
            elements.teacherNotice.textContent = "학급 서버를 불러오지 못했습니다. 잠시 후 다시 시도하세요.";
            elements.lobbyScreen.classList.remove("hidden");
            return;
        }

        lobby = window.ClassroomMultiplayerLobby.create({
            gameId: GAME_ID,
            getPlayerName: () => "교사",
            initialMode: "host",
            minPlayers: 2,
            maxPlayers: 61,
            ids: { startButton: "teacherStartButtonUnused" },
            onStateChange: syncLobby,
            onServerMessage: handleServerMessage,
            onPlayerLeftDuringGame: () => {},
            onNotice: (message) => { elements.teacherNotice.textContent = message; },
            onAbort: ({ message }) => { elements.teacherNotice.textContent = message || "학급 연결이 종료되었습니다."; },
            getLobbyPresentation: ({ count }) => {
                const students = Math.max(0, count - 1);
                return {
                    canStart: false,
                    startText: "교사 전용 시작",
                    guideText: students > 0 ? `현재 ${students}명 참가` : "학생 참가를 기다리는 중입니다."
                };
            }
        }).mount();
    }

    elements.teacherStartButton.addEventListener("click", startCompetition);
    elements.resetRaceButton.addEventListener("click", resetCompetition);
    initialize();
})();
