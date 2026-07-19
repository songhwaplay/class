(() => {
    "use strict";

    const HTTP_URL = "https://classroom-game-hub.onrender.com";
    const WS_URL = "wss://classroom-game-hub.onrender.com";
    const MAX_OPEN_ATTEMPTS = 3;
    const HEALTH_ATTEMPTS = 3;
    let statusElement = null;
    let lastHealthyAt = 0;

    const script = document.currentScript;
    if (!document.querySelector('link[data-class-network-style]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.dataset.classNetworkStyle = "true";
        link.href = script
            ? new URL("game-network.css", script.src).href
            : "../../assets/network/game-network.css";
        document.head.appendChild(link);
    }

    function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function ensureStatusElement() {
        if (statusElement?.isConnected) return statusElement;
        if (!document.body) return null;
        statusElement = document.createElement("div");
        statusElement.className = "class-network-status";
        statusElement.setAttribute("role", "status");
        statusElement.setAttribute("aria-live", "polite");
        document.body.appendChild(statusElement);
        return statusElement;
    }

    function showStatus(headline, detail, error = false) {
        const element = ensureStatusElement();
        if (!element) return;
        element.innerHTML = `<strong>${headline}</strong><small>${detail}</small>`;
        element.classList.toggle("error", error);
        element.classList.add("show");
    }

    function hideStatus() {
        statusElement?.classList.remove("show", "error");
    }

    async function fetchWithTimeout(url, timeoutMs) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
            return await fetch(url, { cache: "no-store", signal: controller.signal });
        } finally {
            clearTimeout(timer);
        }
    }

    async function wakeServer() {
        if (Date.now() - lastHealthyAt < 60000) return true;
        for (let attempt = 1; attempt <= HEALTH_ATTEMPTS; attempt += 1) {
            showStatus(
                attempt === 1 ? "CONNECTING TO SERVER..." : `RETRYING SERVER... ${attempt}/${HEALTH_ATTEMPTS}`,
                "수업용 게임 서버를 준비하고 있습니다. 잠시 기다려 주세요."
            );
            try {
                const response = await fetchWithTimeout(`${HTTP_URL}/health`, 12000);
                if (response.ok) {
                    lastHealthyAt = Date.now();
                    return true;
                }
            } catch (_) {}
            if (attempt < HEALTH_ATTEMPTS) await wait(attempt * 900);
        }
        return false;
    }

    function cloneMessageEvent(event) {
        return new MessageEvent("message", { data: event.data, origin: event.origin });
    }

    function getRoomSessionToken() {
        const key = "classRoomSessionToken";
        try {
            let token = sessionStorage.getItem(key);
            if (!token) {
                token = crypto.randomUUID?.() || `room-${Date.now()}-${Math.random().toString(36).slice(2)}`;
                sessionStorage.setItem(key, token);
            }
            return token;
        } catch (_) {
            return `room-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        }
    }

    class ManagedRoomSocket extends EventTarget {
        constructor() {
            super();
            this._socket = null;
            this._queue = [];
            this._intentional = false;
            this._handshakeReady = false;
            this._openAttempts = 0;
            this._roomEstablished = false;
            this._reconnecting = false;
            this._savedRoomRequest = null;
            this._sessionToken = getRoomSessionToken();
            this.onopen = null;
            this.onmessage = null;
            this.onerror = null;
            this.onclose = null;
            this._begin();
        }

        get readyState() {
            return this._socket?.readyState ?? WebSocket.CONNECTING;
        }

        get url() {
            return WS_URL;
        }

        async _begin() {
            await wakeServer();
            if (!this._intentional) this._openNative();
        }

        _emit(type, event) {
            this.dispatchEvent(event);
            const handler = this[`on${type}`];
            if (typeof handler === "function") handler.call(this, event);
        }

        _openNative() {
            if (this._intentional) return;
            this._openAttempts += 1;
            showStatus(
                this._openAttempts === 1 ? "CONNECTING TO ROOM SERVER..." : `RECONNECTING... ${this._openAttempts}/${MAX_OPEN_ATTEMPTS}`,
                "연결이 완료되면 방을 만들거나 입장합니다."
            );

            let nativeSocket;
            try {
                nativeSocket = new WebSocket(WS_URL);
            } catch (_) {
                this._retryBeforeRoom();
                return;
            }
            this._socket = nativeSocket;

            nativeSocket.addEventListener("open", () => {
                if (this._socket !== nativeSocket || this._intentional) return;
                this._emit("open", new Event("open"));
            });

            nativeSocket.addEventListener("message", event => {
                if (this._socket !== nativeSocket || this._intentional) return;
                let message = null;
                try { message = JSON.parse(event.data); } catch (_) {}
                if (message?.type === "CONNECTED") {
                    this._handshakeReady = true;
                    if (!this._reconnecting) this._emit("message", cloneMessageEvent(event));
                    else if (this._savedRoomRequest) {
                        try {
                            const resumeRequest = JSON.parse(this._savedRoomRequest);
                            resumeRequest.resumeOnly = true;
                            this._queueMessage(JSON.stringify(resumeRequest));
                        } catch (_) {
                            this._queueMessage(this._savedRoomRequest);
                        }
                    }
                    this._flushQueue();
                    return;
                }
                if (message?.type === "ROOM_RESUMED") {
                    this._roomEstablished = true;
                    this._reconnecting = false;
                    this._openAttempts = 0;
                    hideStatus();
                    this._emit("message", new MessageEvent("message", {
                        data: JSON.stringify({ type: "CONNECTED", playerId: message.playerId, resumed: true })
                    }));
                    return;
                }
                if (message?.type === "ROOM_CREATED" || message?.type === "ROOM_JOINED") {
                    this._roomEstablished = true;
                    this._reconnecting = false;
                    this._openAttempts = 0;
                    hideStatus();
                }
                if (message?.type === "ROOM_NOT_FOUND" || message?.type === "ROOM_FULL" || message?.type === "ERROR") {
                    hideStatus();
                }
                if (this._reconnecting && (message?.type === "ROOM_NOT_FOUND" || message?.type === "ROOM_CLOSED" || message?.type === "ERROR")) {
                    this._reconnecting = false;
                    this._intentional = true;
                    showStatus("CONNECTION LOST", "기존 방을 복구하지 못했습니다. 새 방을 만들어 주세요.", true);
                    this._emit("message", cloneMessageEvent(event));
                    this._emit("error", new Event("error"));
                    this._emit("close", new CloseEvent("close", { code: 4001, reason: "ROOM_RESUME_FAILED", wasClean: false }));
                    try { nativeSocket.close(4001, "ROOM_RESUME_FAILED"); } catch (_) {}
                    return;
                }
                this._emit("message", cloneMessageEvent(event));
            });

            nativeSocket.addEventListener("error", () => {
                if (this._socket !== nativeSocket || this._intentional) return;
                if (this._roomEstablished) {
                    showStatus("RECONNECTING...", "일시적인 연결 오류가 발생했습니다. 기존 방으로 다시 연결합니다.");
                }
            });

            nativeSocket.addEventListener("close", event => {
                if (this._socket !== nativeSocket || this._intentional) return;
                this._socket = null;
                this._handshakeReady = false;
                if (this._roomEstablished) {
                    this._roomEstablished = false;
                    this._reconnecting = true;
                    this._openAttempts = 0;
                    this._retryBeforeRoom();
                    return;
                }
                if (!this._roomEstablished && this._openAttempts < MAX_OPEN_ATTEMPTS) {
                    this._retryBeforeRoom();
                    return;
                }
                showStatus(
                    "CONNECTION LOST",
                    this._roomEstablished
                        ? "게임 서버 연결이 끊어졌습니다. 화면 안내에 따라 다시 접속해 주세요."
                        : "서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.",
                    true
                );
                this._emit("error", new Event("error"));
                this._emit("close", new CloseEvent("close", {
                    code: event.code,
                    reason: event.reason,
                    wasClean: event.wasClean
                }));
            });
        }

        async _retryBeforeRoom() {
            showStatus(
                `RECONNECTING... ${Math.min(this._openAttempts + 1, MAX_OPEN_ATTEMPTS)}/${MAX_OPEN_ATTEMPTS}`,
                "서버 응답을 기다리고 있습니다."
            );
            await wait(Math.max(700, this._openAttempts * 900));
            this._openNative();
        }

        _queueMessage(data) {
            let type = "";
            try { type = JSON.parse(data)?.type || ""; } catch (_) {}
            if (type === "CREATE_ROOM" || type === "JOIN_ROOM") {
                this._queue = this._queue.filter(item => {
                    try {
                        const queuedType = JSON.parse(item)?.type;
                        return queuedType !== "CREATE_ROOM" && queuedType !== "JOIN_ROOM";
                    } catch (_) {
                        return true;
                    }
                });
            }
            this._queue.push(data);
        }

        _prepareData(data) {
            const serialized = typeof data === "string" ? data : String(data);
            try {
                const message = JSON.parse(serialized);
                if (message?.type === "CREATE_ROOM" || message?.type === "JOIN_ROOM") {
                    message.clientToken = this._sessionToken;
                    if (this._reconnecting) message.resumeOnly = true;
                    const prepared = JSON.stringify(message);
                    this._savedRoomRequest = prepared;
                    return prepared;
                }
            } catch (_) {}
            return serialized;
        }

        _flushQueue() {
            if (!this._socket || this._socket.readyState !== WebSocket.OPEN || !this._handshakeReady) return;
            const queued = this._queue.splice(0);
            queued.forEach(data => this._socket.send(data));
        }

        send(data) {
            if (this._intentional) throw new DOMException("Socket is closed", "InvalidStateError");
            const serialized = this._prepareData(data);
            if (this._socket?.readyState === WebSocket.OPEN && this._handshakeReady) {
                this._socket.send(serialized);
            } else {
                this._queueMessage(serialized);
            }
        }

        close(code, reason) {
            this._intentional = true;
            this._queue.length = 0;
            hideStatus();
            try { this._socket?.close(code ?? 4000, reason || "CLIENT_LEAVE"); } catch (_) {}
            this._socket = null;
        }
    }

    function generateRoomCode(length = 4) {
        const safeLength = Math.max(3, Math.min(8, Number(length) || 4));
        const minimum = 10 ** (safeLength - 1);
        const range = 9 * minimum;
        const cryptoObject = window.crypto || window.msCrypto;
        if (cryptoObject?.getRandomValues) {
            const random = new Uint32Array(1);
            cryptoObject.getRandomValues(random);
            return String(minimum + (random[0] % range));
        }
        return String(minimum + Math.floor(Math.random() * range));
    }

    window.ClassroomNetwork = Object.freeze({
        HTTP_URL,
        WS_URL,
        createSocket: () => new ManagedRoomSocket(),
        generateRoomCode,
        wakeServer,
        showStatus,
        hideStatus
    });
})();
