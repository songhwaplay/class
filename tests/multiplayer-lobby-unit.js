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

guest.returnToLobby();
assert.strictEqual(guest.snapshot().started, false);
host.returnToLobby();
const returnedLobbyPayload = gameMessages(hostSocket).at(-1);
assert.strictEqual(returnedLobbyPayload.type, window.ClassroomMultiplayerLobby.MESSAGE.STATE);
guestSocket.receive({ type: "GAME_MESSAGE", senderId: "host-1", payload: returnedLobbyPayload });
assert.strictEqual(host.snapshot().started, false);
assert.strictEqual(guest.snapshot().started, false);

const unnamedIds = makeElements("unnamed");
const socketCountBeforeUnnamed = sockets.length;
const unnamed = window.ClassroomMultiplayerLobby.create({
    gameId: "name-entry-game",
    ids: unnamedIds,
    getPlayerName: () => ""
}).mount();
assert.strictEqual(sockets.length, socketCountBeforeUnnamed);
assert.strictEqual(unnamed.snapshot().connected, false);

const continuingIds = makeElements("continuing");
let playerLeftEvent = null;
const continuing = window.ClassroomMultiplayerLobby.create({
    gameId: "continuing-game",
    ids: continuingIds,
    getPlayerName: () => "방장",
    allowedPlayerCounts: [1, 2, 3, 4],
    onPlayerLeftDuringGame: event => { playerLeftEvent = event; }
}).mount();
const continuingSocket = sockets.at(-1);
continuingSocket.receive({ type: "CONNECTED", playerId: "host-2" });
continuingSocket.receive({ type: "ROOM_CREATED", playerId: "host-2", roomCode: "2468" });
continuingSocket.receive({ type: "PLAYER_JOINED", playerId: "guest-2", name: "손님" });
continuing.startGame();
continuingSocket.receive({ type: "PLAYER_LEFT", playerId: "guest-2" });
assert.strictEqual(continuing.snapshot().started, true);
assert.strictEqual(Object.keys(continuing.snapshot().players).length, 1);
assert.strictEqual(playerLeftEvent.playerId, "guest-2");
assert.strictEqual(playerLeftEvent.player.name, "손님");

const serverOwnedIds = makeElements("server-owned");
let serverMessage = null;
const socketCountBeforeServerOwned = sockets.length;
const serverOwned = window.ClassroomMultiplayerLobby.create({
    gameId: "server-owned-game",
    ids: serverOwnedIds,
    getPlayerName: () => "서버방장",
    autoCreate: false,
    getRoomRequestData: () => ({ characterStyle: "female", gameId: "ignored" }),
    onServerMessage: message => { serverMessage = message; }
}).mount();
assert.strictEqual(sockets.length, socketCountBeforeServerOwned);
serverOwned.createRoom();
const serverOwnedSocket = sockets.at(-1);
serverOwnedSocket.receive({ type: "CONNECTED", playerId: "host-3" });
assert.deepStrictEqual(serverOwnedSocket.sent.at(-1), {
    characterStyle: "female",
    gameId: "server-owned-game",
    type: "CREATE_ROOM",
    roomCode: "2468",
    name: "서버방장"
});
assert.strictEqual(serverOwned.sendServer({ type: "SERVER_ACTION", action: "START" }), true);
assert.deepStrictEqual(serverOwnedSocket.sent.at(-1), { type: "SERVER_ACTION", action: "START" });
serverOwnedSocket.receive({ type: "SERVER_STATE", phase: "ready" });
assert.deepStrictEqual(serverMessage, { type: "SERVER_STATE", phase: "ready" });

host.destroy();
guest.destroy();
unnamed.destroy();
continuing.destroy();
serverOwned.destroy();
console.log("multiplayer-lobby-unit: ok");
