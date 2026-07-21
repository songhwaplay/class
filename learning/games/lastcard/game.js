(() => {
    "use strict";

    const GAME_ID = "lastcard";
    const NAME_KEY = "classPlayerName";
    const COLORS = ["ember", "tide", "leaf", "volt"];
    const COLOR_NAMES = { ember: "EMBER", tide: "TIDE", leaf: "LEAF", volt: "VOLT" };
    const ACTION_META = {
        skip: { symbol: "⨯", name: "SKIP", description: "다음 차례 건너뛰기" },
        turn: { symbol: "↻", name: "TURN", description: "진행 방향 바꾸기" },
        draw2: { symbol: "+2", name: "DRAW", description: "카드 두 장 추가" }
    };
    const SERVER_MESSAGE = Object.freeze({ STATE: "LASTCARD_STATE", ERROR: "LASTCARD_ERROR" });
    const $ = id => document.getElementById(id);
    const previewName = new URLSearchParams(location.search).get("name");
    const savedName = String(localStorage.getItem(NAME_KEY) || previewName || "").trim();

    let lobby = null;
    let gameState = null;
    let selectedCardId = null;
    let selectedShiftColor = null;
    let callLast = false;
    let actionPending = false;
    let lastActionNumber = -1;
    let toastTimer = null;

    function toDesignCard(card) {
        if (!card) return null;
        if (card.kind === "number") return { ...card, value: String(card.value) };
        if (card.kind === "shift") {
            return { ...card, color: "shift", kind: "shift", value: "◆", name: "SHIFT", description: "원하는 색으로 전환" };
        }
        const meta = ACTION_META[card.kind];
        return { ...card, kind: "action", value: meta.symbol, name: meta.name, description: meta.description };
    }

    function createVisual(card, flipped = false) {
        return window.LastCardDesign.createCard(toDesignCard(card), { interactive: false, flipped });
    }

    function isPlayable(card) {
        const top = gameState?.topCard;
        if (!card || !top) return false;
        if (card.kind === "shift") return true;
        if (card.color === gameState.activeColor) return true;
        if (card.kind === "number" && top.kind === "number") return card.value === top.value;
        return card.kind !== "number" && card.kind === top.kind;
    }

    function myId() { return lobby?.snapshot().myId || ""; }
    function myTurn() { return gameState?.phase === "playing" && gameState.turnPlayerId === myId(); }
    function playerById(id) { return gameState?.players.find(player => player.id === id) || null; }

    function showToast(message) {
        clearTimeout(toastTimer);
        $("toast").textContent = message;
        $("toast").classList.remove("hidden");
        toastTimer = setTimeout(() => $("toast").classList.add("hidden"), 2600);
    }

    function resetSelection() {
        selectedCardId = null;
        selectedShiftColor = null;
        callLast = false;
        actionPending = false;
    }

    function renderPlayers() {
        const seats = gameState.players.map(player => {
            const seat = document.createElement("article");
            seat.className = "player-seat";
            seat.classList.toggle("is-current", gameState.turnPlayerId === player.id);
            seat.classList.toggle("is-me", player.id === myId());

            const top = document.createElement("div");
            top.className = "player-seat__top";
            const name = document.createElement("span");
            name.className = "player-seat__name";
            name.textContent = `${player.name}${player.id === myId() ? " · ME" : ""}`;
            const turn = document.createElement("span");
            turn.className = "player-seat__turn";
            turn.textContent = gameState.turnPlayerId === player.id ? "PLAYING" : "";
            top.append(name, turn);

            const count = document.createElement("div");
            count.className = "player-seat__count";
            count.textContent = `${player.handCount} CARDS`;
            seat.append(top, count);
            return seat;
        });
        $("playerSeats").replaceChildren(...seats);
    }

    function renderTable() {
        const deckPlaceholder = { id: "deck-back", color: "shift", kind: "shift", value: "shift" };
        $("deckVisual").replaceChildren(createVisual(deckPlaceholder, true));
        $("topCard").replaceChildren(gameState.topCard ? createVisual(gameState.topCard) : document.createTextNode("-"));

        const color = gameState.activeColor || "ember";
        $("activeColor").dataset.color = color;
        $("activeColor").textContent = `ACTIVE · ${COLOR_NAMES[color] || "-"}`;

        const current = playerById(gameState.turnPlayerId);
        $("turnBanner").textContent = gameState.phase === "playing"
            ? (myTurn() ? "내 차례입니다" : `${current?.name || "다음 플레이어"}님의 차례`)
            : "게임이 끝났습니다";
        $("actionLog").textContent = gameState.lastAction || "카드를 준비하고 있습니다.";
        $("drawButton").disabled = !myTurn() || actionPending;
    }

    function selectCard(cardId) {
        selectedCardId = selectedCardId === cardId ? null : cardId;
        selectedShiftColor = null;
        callLast = false;
        renderHand();
        renderControls();
    }

    function renderHand() {
        const canAct = myTurn() && !actionPending;
        const cards = gameState.hand.map(card => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "hand-option";
            button.classList.toggle("is-selected", selectedCardId === card.id);
            button.disabled = !canAct || !isPlayable(card);
            button.setAttribute("aria-label", `${card.kind === "number" ? card.value : card.kind} 카드 선택`);
            button.append(createVisual(card));
            button.addEventListener("click", () => selectCard(card.id));
            return button;
        });
        $("hand").replaceChildren(...cards);
        $("handCount").textContent = `${gameState.hand.length} CARDS`;
    }

    function selectedCard() {
        return gameState?.hand.find(card => card.id === selectedCardId) || null;
    }

    function renderControls() {
        const card = selectedCard();
        const needsShiftColor = card?.kind === "shift";
        $("shiftColors").classList.toggle("hidden", !needsShiftColor);
        document.querySelectorAll("[data-shift-color]").forEach(button => {
            button.classList.toggle("is-active", button.dataset.shiftColor === selectedShiftColor);
            button.disabled = actionPending;
        });

        const canCallLast = Boolean(card && gameState.hand.length === 2);
        $("lastCallButton").classList.toggle("hidden", !canCallLast);
        $("lastCallButton").classList.toggle("is-active", callLast);
        $("lastCallButton").textContent = callLast ? "LAST! 선언됨" : "LAST! 외치기";

        const canPlay = myTurn() && !actionPending && Boolean(card) && (!needsShiftColor || COLORS.includes(selectedShiftColor));
        $("playButton").disabled = !canPlay;
        $("playButton").textContent = card ? (canPlay ? "카드 내기" : "선택을 완료하세요") : "카드 선택";
    }

    function renderFinish() {
        const finished = gameState.phase === "finished";
        $("finishPanel").classList.toggle("hidden", !finished);
        if (!finished) return;
        const winner = playerById(gameState.winnerId);
        const mine = gameState.winnerId === myId();
        $("winnerTitle").textContent = mine ? "YOU WIN!" : `${winner?.name || "플레이어"} 승리`;
        $("winnerMessage").textContent = gameState.lastAction || "마지막 카드를 모두 냈습니다.";

        const actions = [];
        if (lobby.snapshot().role === "host") {
            const newGame = document.createElement("button");
            newGame.type = "button";
            newGame.className = "primary-button";
            newGame.textContent = "NEW GAME";
            newGame.addEventListener("click", () => lobby.sendServer({ type: "LASTCARD_ACTION", action: "NEW_GAME" }));
            const returnLobby = document.createElement("button");
            returnLobby.type = "button";
            returnLobby.className = "secondary-button";
            returnLobby.textContent = "대기실로";
            returnLobby.addEventListener("click", () => lobby.sendServer({ type: "LASTCARD_ACTION", action: "RETURN_LOBBY" }));
            actions.push(newGame, returnLobby);
        } else {
            const waiting = document.createElement("span");
            waiting.textContent = "방장이 다음 게임을 준비할 때까지 기다려 주세요.";
            actions.push(waiting);
        }
        $("finishActions").replaceChildren(...actions);
    }

    function renderGame() {
        if (!gameState) return;
        $("roundText").textContent = String(gameState.round || 1);
        $("deckText").textContent = String(gameState.deckCount || 0);
        $("directionText").textContent = gameState.direction === -1 ? "←" : "→";
        renderPlayers();
        renderTable();
        renderHand();
        renderControls();
        renderFinish();
    }

    function installState(state) {
        gameState = state;
        if (state.actionNumber !== lastActionNumber) {
            lastActionNumber = state.actionNumber;
            resetSelection();
        }
        if (state.phase === "lobby") {
            if (lobby.snapshot().started) {
                $("gameScreen").classList.add("hidden");
                $("lobbyScreen").classList.remove("hidden");
                lobby.returnToLobby();
            }
            return;
        }
        $("lobbyScreen").classList.add("hidden");
        $("gameScreen").classList.remove("hidden");
        renderGame();
    }

    function handleServerMessage(message) {
        if (message.type === SERVER_MESSAGE.STATE && message.state) {
            installState(message.state);
            return;
        }
        if (message.type === SERVER_MESSAGE.ERROR) {
            actionPending = false;
            renderControls();
            showToast(message.message || "행동을 처리하지 못했습니다.");
        }
    }

    function submitPlay() {
        const card = selectedCard();
        if (!card || actionPending) return;
        actionPending = true;
        renderControls();
        const sent = lobby.sendServer({
            type: "LASTCARD_ACTION",
            action: "PLAY",
            cardId: card.id,
            color: card.kind === "shift" ? selectedShiftColor : undefined,
            callLast
        });
        if (!sent) {
            actionPending = false;
            renderControls();
            showToast("서버에 행동을 보내지 못했습니다.");
        }
    }

    function drawCard() {
        if (!myTurn() || actionPending) return;
        actionPending = true;
        $("drawButton").disabled = true;
        if (!lobby.sendServer({ type: "LASTCARD_ACTION", action: "DRAW" })) {
            actionPending = false;
            renderTable();
            showToast("서버에 행동을 보내지 못했습니다.");
        }
    }

    function showRules() { $("rulesOverlay").classList.remove("hidden"); }
    function hideRules() { $("rulesOverlay").classList.add("hidden"); }

    function init() {
        lobby = window.ClassroomMultiplayerLobby.create({
            gameId: GAME_ID,
            getPlayerName: () => /^[가-힣]{2,6}$/.test(savedName) ? savedName : "",
            allowedPlayerCounts: [2,3,4],
            maxPlayers: 4,
            rulesButtonIds: ["rulesBtnLobby", "rulesBtnGame"],
            leaveButtonIds: ["leaveBtnLobby", "leaveBtnGame"],
            onRules: showRules,
            onLeave: () => location.href = "../../../index.html",
            onNotice: showToast,
            onInvalidStart: () => showToast("2명부터 4명까지 모여야 시작할 수 있습니다."),
            onStateChange: snapshot => $("gameRoomCode").textContent = snapshot.roomCode || "----",
            getLobbyPresentation: ({ count, role, canStart }) => ({
                canStart,
                startText: role === "host" && canStart ? `START GAME · ${count} PLAYERS` : "WAITING FOR PLAYERS",
                guideText: role === "host" ? `현재 ${count}명 · 2~4명일 때 시작 가능` : "방장이 게임을 시작할 때까지 기다리세요."
            }),
            createStartData: () => ({ serverAuthoritative: true }),
            onStarted: () => {
                $("lobbyScreen").classList.add("hidden");
                $("gameScreen").classList.remove("hidden");
                if (lobby.snapshot().role === "host") {
                    lobby.sendServer({ type: "LASTCARD_ACTION", action: "START" });
                }
            },
            onServerMessage: handleServerMessage,
            onPlayerLeftDuringGame: () => showToast("플레이어가 나가 대기실로 돌아갑니다."),
            onAbort: ({ title, message }) => {
                $("abortTitle").textContent = title;
                $("abortMessage").textContent = message;
                $("abortOverlay").classList.remove("hidden");
            }
        }).mount();

        $("playButton").addEventListener("click", submitPlay);
        $("drawButton").addEventListener("click", drawCard);
        $("lastCallButton").addEventListener("click", () => {
            callLast = !callLast;
            renderControls();
        });
        document.querySelectorAll("[data-shift-color]").forEach(button => {
            button.addEventListener("click", () => {
                selectedShiftColor = button.dataset.shiftColor;
                renderControls();
            });
        });
        document.querySelectorAll("[data-go-home]").forEach(button => {
            button.addEventListener("click", () => location.href = "../../../index.html");
        });
        $("closeRulesButton").addEventListener("click", hideRules);
        $("rulesOverlay").addEventListener("click", event => {
            if (event.target === $("rulesOverlay")) hideRules();
        });
        $("reloadButton").addEventListener("click", () => location.reload());
    }

    window.addEventListener("DOMContentLoaded", init);
})();
