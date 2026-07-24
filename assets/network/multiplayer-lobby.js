(() => {
    "use strict";

    const MESSAGE = Object.freeze({
        STATE: "CLASSROOM_LOBBY_STATE",
        START: "CLASSROOM_LOBBY_START",
        ABORT: "CLASSROOM_LOBBY_ABORT",
        PLAYER_UPDATE: "CLASSROOM_LOBBY_PLAYER_UPDATE"
    });

    const DEFAULT_IDS = Object.freeze({
        missingScreen: "missingScreen",
        lobbyScreen: "lobbyScreen",
        savedName: "savedName",
        hostTab: "hostTab",
        joinTab: "joinTab",
        hostPane: "hostPane",
        joinPane: "joinPane",
        roomCode: "roomCode",
        hostStatus: "hostStatus",
        joinCode: "joinCode",
        joinButton: "joinBtn",
        joinStatus: "joinStatus",
        copyButton: "copyBtn",
        playerList: "lobbyPlayers",
        guide: "lobbyGuide",
        startButton: "startBtn"
    });

    function safeName(value) {
        return String(value || "").trim() || "플레이어";
    }

    function getElement(id) {
        return id ? document.getElementById(id) : null;
    }

    class MultiplayerLobby {
        constructor(options) {
            if (!options?.gameId) throw new Error("MultiplayerLobby requires gameId.");
            if (!window.ClassroomNetwork) throw new Error("Load game-network.js before multiplayer-lobby.js.");

            this.options = options;
            this.gameId = String(options.gameId);
            this.ids = { ...DEFAULT_IDS, ...(options.ids || {}) };
            this.allowedPlayerCounts = Array.isArray(options.allowedPlayerCounts)
                ? [...new Set(options.allowedPlayerCounts.map(Number).filter(Number.isInteger))].sort((a, b) => a - b)
                : null;
            this.minPlayers = Number(options.minPlayers) || this.allowedPlayerCounts?.[0] || 2;
            this.maxPlayers = Number(options.maxPlayers) || this.allowedPlayerCounts?.at(-1) || 4;
            this.socket = null;
            this.pendingAction = null;
            this.intentionalClose = false;
            this.hostCreateAttempts = 0;
            this.role = "host";
            this.roomCode = "";
            this.myId = null;
            this.players = {};
            this.connected = false;
            this.started = false;
            this.mounted = false;
            this._boundBeforeUnload = () => this.destroy();
        }

        mount() {
            if (this.mounted) return this;
            this.mounted = true;
            this.elements = Object.fromEntries(Object.entries(this.ids).map(([key, id]) => [key, getElement(id)]));

            const name = this.playerName;
            if (!name) {
                this.elements.missingScreen?.classList.remove("hidden");
                return this;
            }

            if (this.elements.savedName) this.elements.savedName.textContent = name;
            this.elements.lobbyScreen?.classList.remove("hidden");
            this.elements.hostTab?.addEventListener("click", () => this.setMode("host"));
            this.elements.joinTab?.addEventListener("click", () => this.setMode("guest"));
            this.elements.joinButton?.addEventListener("click", () => this.joinRoom());
            this.elements.copyButton?.addEventListener("click", () => this.copyRoomCode());
            this.elements.startButton?.addEventListener("click", () => this.startGame());

            const joinInput = this.elements.joinCode;
            joinInput?.addEventListener("input", event => {
                event.target.value = event.target.value.replace(/\D/g, "").slice(0, 4);
            });
            joinInput?.addEventListener("keydown", event => {
                if (event.key === "Enter") this.joinRoom();
            });

            (this.options.rulesButtonIds || []).forEach(id => {
                getElement(id)?.addEventListener("click", () => this.options.onRules?.());
            });
            (this.options.leaveButtonIds || []).forEach(id => {
                getElement(id)?.addEventListener("click", () => {
                    this.destroy();
                    if (typeof this.options.onLeave === "function") this.options.onLeave();
                    else location.reload();
                });
            });
            window.addEventListener("beforeunload", this._boundBeforeUnload);
            this.setMode(this.options.initialMode === "guest" ? "guest" : "host");
            return this;
        }

        get playerName() {
            return String(this.options.getPlayerName?.() || "").trim();
        }

        snapshot() {
            return {
                role: this.role,
                roomCode: this.roomCode,
                myId: this.myId,
                players: this.players,
                connected: this.connected,
                started: this.started
            };
        }

        _emitState() {
            this.options.onStateChange?.(this.snapshot());
        }

        setMode(mode) {
            if (this.started) return;
            this._closeTransport();
            this.role = mode === "host" ? "host" : "guest";
            this.roomCode = "";
            this.myId = null;
            this.players = {};
            this.connected = false;
            this.hostCreateAttempts = 0;

            const isHost = this.role === "host";
            this.elements.hostTab?.classList.toggle("active", isHost);
            this.elements.joinTab?.classList.toggle("active", !isHost);
            this.elements.hostPane?.classList.toggle("hidden", !isHost);
            this.elements.joinPane?.classList.toggle("hidden", isHost);
            if (this.elements.playerList) this.elements.playerList.replaceChildren();
            if (this.elements.startButton) this.elements.startButton.disabled = true;
            this.render();

            if (isHost) {
                if (this.options.autoCreate !== false) this.createRoom();
                else this._setStatus("방을 만들려면 CREATE ROOM을 누르세요.");
            } else {
                this._setStatus("방장이 알려준 번호를 입력하세요.");
                setTimeout(() => this.elements.joinCode?.focus(), 50);
            }
        }

        _roomRequest(type, roomCode) {
            const extra = this.options.getRoomRequestData?.(this.snapshot());
            return {
                ...(extra && typeof extra === "object" ? extra : {}),
                type,
                gameId: this.gameId,
                roomCode,
                name: this.playerName
            };
        }

        createRoom() {
            this.players = {};
            this.started = false;
            this.connected = false;
            this.hostCreateAttempts = 0;
            this.roomCode = window.ClassroomNetwork.generateRoomCode(4);
            if (this.elements.roomCode) this.elements.roomCode.textContent = "----";
            if (this.elements.hostStatus) this.elements.hostStatus.textContent = "방을 만드는 중입니다.";
            this._connect(this._roomRequest("CREATE_ROOM", this.roomCode));
        }

        joinRoom() {
            if (typeof this.options.canJoin === "function" && this.options.canJoin(this.snapshot()) !== true) {
                this.options.onInvalidJoin?.(this.snapshot());
                return;
            }
            const input = this.elements.joinCode;
            const code = String(input?.value || "").replace(/\D/g, "").slice(0, 4);
            if (input) input.value = code;
            if (code.length !== 4) {
                this._setStatus("4자리 방 번호를 입력하세요.");
                return;
            }
            this.role = "guest";
            this.roomCode = code;
            this._setStatus(`방 ${code}에 연결하는 중입니다.`);
            this._connect(this._roomRequest("JOIN_ROOM", code));
        }

        _connect(action) {
            this._closeTransport();
            this.pendingAction = action;
            this.intentionalClose = false;
            let socket;
            try {
                socket = window.ClassroomNetwork.createSocket();
                this.socket = socket;
            } catch (_) {
                this._setStatus("CONNECTION ERROR · 통신 서버에 연결할 수 없습니다.");
                return;
            }
            socket.addEventListener("open", () => {
                if (this.socket !== socket) return;
                this._setStatus(this.role === "host"
                    ? "서버 연결 완료 · 방을 등록하는 중입니다."
                    : "서버 연결 완료 · 방에 입장하는 중입니다.");
            });
            socket.addEventListener("message", event => {
                if (this.socket !== socket) return;
                let message;
                try { message = JSON.parse(event.data); } catch (_) { return; }
                this._handleServerMessage(message);
            });
            socket.addEventListener("error", () => {
                if (this.socket === socket) this._setStatus("통신 서버 연결 중 오류가 발생했습니다.");
            });
            socket.addEventListener("close", () => {
                if (this.socket !== socket || this.intentionalClose) return;
                if (this.started) this._abort("연결 종료", "통신 서버와의 연결이 끊어졌습니다.");
                else this._setStatus("게임 서버 연결이 끊어졌습니다. 다시 시도하세요.");
            });
        }

        _closeTransport() {
            this.pendingAction = null;
            this.intentionalClose = true;
            if (this.socket) {
                try { this.socket.close(); } catch (_) {}
            }
            this.socket = null;
            setTimeout(() => { this.intentionalClose = false; }, 0);
        }

        _sendRaw(message) {
            if (!this.socket) return false;
            try {
                this.socket.send(JSON.stringify(message));
                return true;
            } catch (_) {
                return false;
            }
        }

        send(payload) {
            return this._sendRaw({ type: "GAME_MESSAGE", payload });
        }

        sendServer(message) {
            return message && typeof message === "object" && this._sendRaw(message);
        }

        broadcast(payload) {
            return this.role === "host" && this.send(payload);
        }

        _handleServerMessage(message) {
            if (!message || typeof message.type !== "string") return;
            if (message.type === "CONNECTED") {
                if (message.playerId != null) this.myId = String(message.playerId);
                if (this.pendingAction) {
                    const action = this.pendingAction;
                    this.pendingAction = null;
                    this._sendRaw(action);
                }
                this._emitState();
                return;
            }
            if (message.type === "ROOM_CREATED") {
                this.myId = String(message.playerId ?? this.myId);
                this.connected = true;
                this.roomCode = String(message.roomCode || this.roomCode);
                this.players = { [this.myId]: { name: this.playerName } };
                if (this.elements.roomCode) this.elements.roomCode.textContent = this.roomCode;
                if (this.elements.hostStatus) this.elements.hostStatus.textContent = "참가자를 기다리는 중입니다.";
                this.render();
                return;
            }
            if (message.type === "ROOM_EXISTS") {
                if (this.role === "host" && this.hostCreateAttempts < 8) {
                    this.hostCreateAttempts += 1;
                    this.roomCode = window.ClassroomNetwork.generateRoomCode(4);
                    this._sendRaw(this._roomRequest("CREATE_ROOM", this.roomCode));
                } else this._setStatus("빈 방 번호를 만들지 못했습니다. 다시 시도하세요.");
                return;
            }
            if (message.type === "ROOM_JOINED") {
                if (message.playerId != null) this.myId = String(message.playerId);
                this.connected = true;
                this.players = this.myId ? { [this.myId]: { name: this.playerName } } : {};
                // Nearby Chromebooks should not play the same music as the host.
                // Only signal after the server confirms a successful join.
                window.dispatchEvent(new CustomEvent("classroommultiplayerjoined", {
                    detail: { gameId: this.gameId, roomCode: this.roomCode }
                }));
                this._setStatus(`방 ${this.roomCode}에 입장했습니다.`);
                this.render();
                return;
            }
            if (message.type === "PLAYER_JOINED" && this.role === "host" && !this.started) {
                const id = String(message.playerId);
                if (!this.players[id] && Object.keys(this.players).length >= this.maxPlayers) return;
                this.players[id] = { name: safeName(message.name) };
                this._broadcastLobbyState();
                this.render();
                return;
            }
            if (message.type === "PLAYER_LEFT" && this.role === "host") {
                const id = String(message.playerId);
                const leftPlayer = this.players[id] || null;
                const leftName = leftPlayer?.name || "참가자";
                delete this.players[id];
                if (this.started) {
                    if (typeof this.options.onPlayerLeftDuringGame === "function") {
                        this.render();
                        this.options.onPlayerLeftDuringGame({
                            playerId: id,
                            player: leftPlayer,
                            ...this.snapshot()
                        });
                    } else {
                        this.broadcast({ type: MESSAGE.ABORT, message: `${leftName}님이 게임에서 나갔습니다.` });
                        this._abort("게임 중단", `${leftName}님이 게임에서 나갔습니다.`);
                    }
                } else {
                    this._broadcastLobbyState();
                    this.render();
                }
                return;
            }
            if (message.type === "GAME_MESSAGE") {
                this._handleGameMessage(message.senderId, message.payload);
                return;
            }
            if (message.type === "ROOM_NOT_FOUND") this._setStatus("방을 찾지 못했습니다. 방 번호를 확인하세요.");
            else if (message.type === "ROOM_FULL") this._setStatus(`방이 가득 찼습니다. 최대 ${this.maxPlayers}명까지 입장할 수 있습니다.`);
            else if (message.type === "ROOM_CLOSED") this._abort("방 종료", "방장이 방을 나갔습니다.");
            else if (message.type === "ERROR") {
                this._setStatus(message.message || "방 처리 중 오류가 발생했습니다.");
                this.options.onServerMessage?.(message, this.snapshot());
            } else {
                this.options.onServerMessage?.(message, this.snapshot());
            }
        }

        _handleGameMessage(senderId, payload) {
            if (!payload) return;
            if (payload.type === MESSAGE.STATE && !this.started) {
                this.players = payload.players || {};
                this.options.onLobbyData?.(payload.data, this.snapshot());
                this.render();
                return;
            }
            if (payload.type === MESSAGE.START && !this.started) {
                this.players = payload.players || this.players;
                this.started = true;
                this._emitState();
                this.options.onStarted?.({ ...this.snapshot(), data: payload.data });
                return;
            }
            if (payload.type === MESSAGE.ABORT) {
                this._abort("게임 중단", payload.message || "게임이 중단되었습니다.");
                return;
            }
            if (payload.type === MESSAGE.PLAYER_UPDATE && this.role === "host" && !this.started) {
                const id = String(senderId ?? "");
                if (this.players[id]) {
                    const playerPatch = { ...(payload.player || {}) };
                    delete playerPatch.name;
                    this.players[id] = { ...this.players[id], ...playerPatch };
                    this._broadcastLobbyState();
                    this.render();
                }
                return;
            }
            this.options.onGameMessage?.(String(senderId ?? ""), payload, this.snapshot());
        }

        _broadcastLobbyState() {
            const data = this.options.getLobbyData?.(this.snapshot());
            this.broadcast({ type: MESSAGE.STATE, players: this.players, data });
        }

        _canStart(count = Object.keys(this.players).length) {
            if (typeof this.options.canStart === "function") {
                return this.options.canStart({ ...this.snapshot(), count }) === true;
            }
            return this.allowedPlayerCounts
                ? this.allowedPlayerCounts.includes(count)
                : count >= this.minPlayers && count <= this.maxPlayers;
        }

        startGame() {
            if (this.role !== "host") return;
            const count = Object.keys(this.players).length;
            if (!this._canStart(count)) {
                this.options.onInvalidStart?.(count);
                return;
            }
            const data = this.options.createStartData?.(this.snapshot());
            this.started = true;
            this.broadcast({ type: MESSAGE.START, players: this.players, data });
            this._emitState();
            this.options.onStarted?.({ ...this.snapshot(), data });
        }

        render() {
            const ids = Object.keys(this.players);
            const list = this.elements.playerList;
            if (list) {
                const fragment = document.createDocumentFragment();
                ids.forEach(id => {
                    const chip = document.createElement("span");
                    chip.className = `mp-lobby-player${id === this.myId ? " me" : ""}`;
                    const label = this.options.formatPlayerName?.(this.players[id], id, this.snapshot())
                        || safeName(this.players[id]?.name);
                    chip.textContent = `${label}${id === this.myId ? " (나)" : ""}`;
                    fragment.appendChild(chip);
                });
                list.replaceChildren(fragment);
            }

            const presentation = this.options.getLobbyPresentation?.({
                count: ids.length,
                role: this.role,
                canStart: this._canStart(ids.length),
                players: this.players,
                myId: this.myId
            }) || this._defaultPresentation(ids.length);
            if (this.elements.startButton) {
                this.elements.startButton.disabled = this.role !== "host" || !presentation.canStart;
                this.elements.startButton.textContent = presentation.startText;
            }
            if (this.elements.guide) {
                this.elements.guide.textContent = presentation.guideText;
                this.elements.guide.classList.toggle("mp-lobby-warning", presentation.warning === true);
            }
            this._emitState();
        }

        _defaultPresentation(count) {
            if (this.role !== "host") {
                return { canStart: false, startText: "WAITING FOR HOST", guideText: `현재 ${count}명 접속` };
            }
            const canStart = this._canStart(count);
            return {
                canStart,
                startText: canStart ? `START GAME · ${count} PLAYERS` : "WAITING FOR PLAYERS",
                guideText: canStart ? "게임을 시작할 수 있습니다." : `최소 ${this.minPlayers}명이 필요합니다.`
            };
        }

        _setStatus(text) {
            const element = this.role === "host" ? this.elements.hostStatus : this.elements.joinStatus;
            if (element) element.textContent = text;
        }

        async copyRoomCode() {
            if (!this.roomCode) return;
            const fallback = () => this.options.onNotice?.(`방 번호: ${this.roomCode}`);
            if (!navigator.clipboard?.writeText) return fallback();
            try {
                await navigator.clipboard.writeText(this.roomCode);
                this.options.onNotice?.(`방 번호 ${this.roomCode}가 복사되었습니다.`);
            } catch (_) {
                fallback();
            }
        }

        updateLocalPlayer(patch) {
            if (!this.myId || !this.players[this.myId] || !patch || typeof patch !== "object") return false;
            const playerPatch = { ...patch };
            delete playerPatch.name;
            this.players[this.myId] = { ...this.players[this.myId], ...playerPatch };
            if (this.role === "host") this._broadcastLobbyState();
            else this.send({ type: MESSAGE.PLAYER_UPDATE, player: playerPatch });
            this.render();
            return true;
        }

        publishLobbyState() {
            if (this.role !== "host" || this.started) return false;
            this._broadcastLobbyState();
            this.render();
            return true;
        }

        returnToLobby() {
            this.started = false;
            if (this.role === "host" && this.connected) this._broadcastLobbyState();
            this.render();
            return true;
        }

        _abort(title, message) {
            this.options.onAbort?.({ title, message, ...this.snapshot() });
        }

        destroy() {
            this._closeTransport();
            window.removeEventListener("beforeunload", this._boundBeforeUnload);
        }
    }

    window.ClassroomMultiplayerLobby = Object.freeze({
        create: options => new MultiplayerLobby(options),
        MESSAGE
    });
})();
