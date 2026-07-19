"use strict";

const assert = require("assert");
const path = require("path");

class FakeClassList {
    constructor() { this.values = new Set(); }
    add(...names) { names.forEach(name => this.values.add(name)); }
    remove(...names) { names.forEach(name => this.values.delete(name)); }
    toggle(name, force) {
        if (force === undefined) force = !this.values.has(name);
        if (force) this.values.add(name);
        else this.values.delete(name);
        return force;
    }
    contains(name) { return this.values.has(name); }
}

class FakeElement extends EventTarget {
    constructor() {
        super();
        this.classList = new FakeClassList();
        this.children = [];
        this.dataset = {};
        this.value = "";
        this.textContent = "";
        this.disabled = false;
        this.className = "";
    }
    appendChild(child) { this.children.push(child); return child; }
    replaceChildren(...children) { this.children = [...children.flatMap(child => child.children || [child])]; }
    focus() {}
}

const elements = new Map();
global.document = {
    getElementById: id => elements.get(id) || null,
    createElement: () => new FakeElement(),
    createDocumentFragment: () => new FakeElement()
};
Object.defineProperty(global, "navigator", {
    configurable: true,
    value: { clipboard: { writeText: async () => {} } }
});
global.location = { reload() {} };
global.window = new EventTarget();
window.document = document;
window.navigator = navigator;
window.location = location;

const sockets = [];
class FakeSocket extends EventTarget {
    constructor() {
        super();
        this.sent = [];
        this.closed = false;
    }
    send(data) { this.sent.push(JSON.parse(data)); }
    close() { this.closed = true; }
    receive(message) {
        this.dispatchEvent(new MessageEvent("message", { data: JSON.stringify(message) }));
    }
}

window.ClassroomNetwork = {
    generateRoomCode: () => "2468",
    createSocket: () => {
        const socket = new FakeSocket();
        sockets.push(socket);
        return socket;
    }
};

require(path.join(__dirname, "..", "assets", "network", "multiplayer-lobby.js"));

function makeElements(prefix) {
    const keys = [
        "missingScreen", "lobbyScreen", "savedName", "hostTab", "joinTab", "hostPane", "joinPane",
        "roomCode", "hostStatus", "joinCode", "joinButton", "joinStatus", "copyButton", "playerList",
        "guide", "startButton"
    ];
    const ids = {};
    keys.forEach(key => {
        ids[key] = `${prefix}-${key}`;
        elements.set(ids[key], new FakeElement());
    });
    return ids;
}

function gameMessages(socket) {
    return socket.sent.filter(message => message.type === "GAME_MESSAGE").map(message => message.payload);
}

const hostIds = makeElements("host");
let hostStart = null;
const host = window.ClassroomMultiplayerLobby.create({
    gameId: "test-game",
    ids: hostIds,
    getPlayerName: () => "방장",
    allowedPlayerCounts: [2, 4],
    getLobbyData: () => ({ mode: "team" }),
    createStartData: () => ({ seed: 7 }),
    onStarted: event => { hostStart = event; }
}).mount();

const hostSocket = sockets.at(-1);
hostSocket.receive({ type: "CONNECTED", playerId: "host-1" });
assert.deepStrictEqual(hostSocket.sent.at(-1), {
    type: "CREATE_ROOM", gameId: "test-game", roomCode: "2468", name: "방장"
});
hostSocket.receive({ type: "ROOM_CREATED", playerId: "host-1", roomCode: "2468" });
hostSocket.receive({ type: "PLAYER_JOINED", playerId: "guest-1", name: "손님" });

assert.strictEqual(Object.keys(host.snapshot().players).length, 2);
const lobbyStatePayload = gameMessages(hostSocket).at(-1);
assert.strictEqual(lobbyStatePayload.type, window.ClassroomMultiplayerLobby.MESSAGE.STATE);
assert.deepStrictEqual(lobbyStatePayload.data, { mode: "team" });
assert.strictEqual(host.updateLocalPlayer({ name: "변경 시도", ready: true }), true);
assert.strictEqual(host.snapshot().players["host-1"].name, "방장");
assert.strictEqual(host.snapshot().players["host-1"].ready, true);

host.startGame();
const startPayload = gameMessages(hostSocket).at(-1);
assert.strictEqual(startPayload.type, window.ClassroomMultiplayerLobby.MESSAGE.START);
assert.deepStrictEqual(startPayload.data, { seed: 7 });
assert.strictEqual(host.snapshot().started, true);
assert.deepStrictEqual(hostStart.data, { seed: 7 });

const guestIds = makeElements("guest");
let guestStart = null;
let guestLobbyData = null;
const guest = window.ClassroomMultiplayerLobby.create({
    gameId: "test-game",
    ids: guestIds,
    initialMode: "guest",
    getPlayerName: () => "손님",
    allowedPlayerCounts: [2, 4],
    onLobbyData: data => { guestLobbyData = data; },
    onStarted: event => { guestStart = event; }
}).mount();

elements.get(guestIds.joinCode).value = "2468";
guest.joinRoom();
const guestSocket = sockets.at(-1);
guestSocket.receive({ type: "CONNECTED", playerId: "guest-1" });
assert.deepStrictEqual(guestSocket.sent.at(-1), {
    type: "JOIN_ROOM", gameId: "test-game", roomCode: "2468", name: "손님"
});
guestSocket.receive({ type: "ROOM_JOINED", playerId: "guest-1", roomCode: "2468" });
guestSocket.receive({ type: "GAME_MESSAGE", senderId: "host-1", payload: lobbyStatePayload });
guestSocket.receive({ type: "GAME_MESSAGE", senderId: "host-1", payload: startPayload });

assert.strictEqual(Object.keys(guest.snapshot().players).length, 2);
assert.deepStrictEqual(guestLobbyData, { mode: "team" });
assert.strictEqual(guest.snapshot().started, true);
assert.deepStrictEqual(guestStart.data, { seed: 7 });

const unnamedIds = makeElements("unnamed");
const socketCountBeforeUnnamed = sockets.length;
const unnamed = window.ClassroomMultiplayerLobby.create({
    gameId: "name-entry-game",
    ids: unnamedIds,
    getPlayerName: () => ""
}).mount();
assert.strictEqual(sockets.length, socketCountBeforeUnnamed);
assert.strictEqual(unnamed.snapshot().connected, false);

host.destroy();
guest.destroy();
unnamed.destroy();
console.log("multiplayer-lobby-unit: ok");
