(() => {
    "use strict";

    const GAME_ID = document.body.dataset.gameId || "circulation";
    const MESSAGE_PREFIX = (document.body.dataset.messagePrefix || "CIRCULATION").toUpperCase();
    const TOTAL_STAGES = 10;
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
    let expeditionState = null;

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
        const count = expeditionState?.phase === "lobby"
            ? expeditionState.participants.length
            : studentCountFromSnapshot(snapshot);
        elements.lobbyStudentCount.textContent = `${count}명`;
        elements.raceRoomCode.textContent = snapshot?.roomCode || elements.roomCode.textContent || "----";
        elements.teacherStartButton.disabled = count < 1 || expeditionState?.phase === "running";
        elements.teacherStartButton.textContent = count < 1 ? "학생 참가 대기" : `전원 출발 · ${count}명`;
    }

    function startCompetition() {
        const snapshot = lobby.snapshot();
        const studentCount = expeditionState?.participants?.length ?? studentCountFromSnapshot(snapshot);
        if (studentCount < 1) {
            elements.teacherNotice.textContent = "학생이 한 명 이상 참가해야 합니다.";
            return;
        }
        elements.teacherStartButton.disabled = true;
        elements.teacherStartButton.textContent = "출발 준비 중...";
        elements.teacherNotice.textContent = "";
        lobby.sendServer({ type: `${MESSAGE_PREFIX}_ACTION`, action: "START" });
    }

    function resetCompetition() {
        const prompt = expeditionState?.phase === "running"
            ? "진행 중인 탐험과 순위를 지우고 새 탐험을 준비할까요?"
            : "현재 순위와 결과를 지우고 새 탐험을 준비할까요?";
        if (!window.confirm(prompt)) return;
        lobby.sendServer({ type: `${MESSAGE_PREFIX}_ACTION`, action: "RESET" });
    }

    function renderRanking(state) {
        const participants = Array.isArray(state.participants) ? state.participants : [];
        const rankings = Array.isArray(state.rankings) ? state.rankings : [];
        const playingCount = Math.max(0, participants.length - rankings.length);

        elements.raceTotalCount.textContent = `${participants.length}명`;
        elements.raceFinishedCount.textContent = `${rankings.length}명`;
        elements.racePlayingCount.textContent = `${playingCount}명`;
        elements.racePhaseBadge.textContent = state.phase === "ended" ? "최종 순위" : "탐험 중";
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
            score.textContent = `${entry.score}/${TOTAL_STAGES}`;
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
                status.textContent = state.phase === "lobby" ? "출발 대기" : "탐험 중";
                time.className = "teacher-rank-time";
                time.textContent = "완주 대기";
                row.append(rank, name, status, time);
                elements.rankingList.append(row);
            });

        elements.emptyRanking.classList.toggle("hidden", participants.length > 0);
        elements.emptyRanking.textContent = state.phase === "ended"
            ? "완료된 결과가 없습니다."
            : "아직 완주한 학생이 없습니다.";
        elements.raceNotice.textContent = state.phase === "ended"
            ? `${participants.length}명 모두 완주했습니다.`
            : `${rankings.length}명 완주 · ${playingCount}명 탐험 중`;
    }

    function handleServerMessage(message, snapshot) {
        if (message.type === `${MESSAGE_PREFIX}_ERROR`) {
            const target = expeditionState?.phase === "running" || expeditionState?.phase === "ended"
                ? elements.raceNotice
                : elements.teacherNotice;
            target.textContent = message.message || "탐험 요청을 처리하지 못했습니다.";
            syncLobby(snapshot);
            return;
        }
        if (message.type !== `${MESSAGE_PREFIX}_STATE` || !message.state) return;

        expeditionState = message.state;
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
                    startText: "교사 전용 출발",
                    guideText: students > 0 ? `현재 ${students}명 참가` : "학생 참가를 기다리는 중입니다."
                };
            }
        }).mount();
    }

    elements.teacherStartButton.addEventListener("click", startCompetition);
    elements.resetRaceButton.addEventListener("click", resetCompetition);
    initialize();
})();
