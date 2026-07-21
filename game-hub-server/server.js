const express = require("express");
const http = require("http");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { WebSocketServer, WebSocket } = require("ws");
const LoveLetter = require("./loveletter");
const LastCard = require("./lastcard");
const Rummikub = require("./rummikub");
const Blokus = require("./blokus");
const DrawRelay = require("./drawrelay");

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = Number(process.env.PORT) || 10000;
const MAX_ROOM_PLAYERS = {
  setgame: 4,
  nimgame: 2,
  janggi: 2,
  omok: 2,
  connect6: 2,
  diamondgame: 3,
  lastcard: 4,
  loveletter: 4,
  rummikub: 4,
  blokus: 4,
  drawrelay: 8,
  avalon: 8,
  spelling: 61
};

const FINISHER_GAMES = new Set(["coinweighing", "hanoitower", "sphinx"]);
const FINISHER_DATA_FILE =
  process.env.FINISHERS_DATA_PATH ||
  path.join(__dirname, "finishers.json");

app.use(express.json({ limit: "32kb" }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

const rooms = new Map();
let finisherStore = loadFinisherStore();

function safeSend(socket, payload) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
  }
}

function cleanToken(value, maxLength = 40) {
  return String(value || "").trim().slice(0, maxLength);
}

function roomKey(gameId, roomCode) {
  return `${gameId}:${roomCode}`;
}

function loveLetterBroadcast(room) {
  if (!room?.loveletter) return;
  for (const [id, client] of room.clients) {
    safeSend(client, {
      type: "LOVELETTER_STATE",
      state: LoveLetter.stateFor(room.loveletter, id)
    });
  }
}

function loveLetterError(socket, message) {
  safeSend(socket, { type: "LOVELETTER_ERROR", message });
}

function lastCardBroadcast(room) {
  if (!room?.lastcard) return;
  for (const [id, client] of room.clients) {
    safeSend(client, {
      type: "LASTCARD_STATE",
      state: LastCard.stateFor(room.lastcard, id)
    });
  }
}

function lastCardError(socket, message) {
  safeSend(socket, { type: "LASTCARD_ERROR", message });
}

function rummikubBroadcast(room) {
  if (!room?.rummikub) return;
  for (const [id, client] of room.clients) {
    safeSend(client, {
      type: "RUMMIKUB_STATE",
      state: Rummikub.stateFor(room.rummikub, id)
    });
  }
}

function rummikubError(socket, message) {
  safeSend(socket, { type: "RUMMIKUB_ERROR", message });
}

function blokusBroadcast(room) {
  if (!room?.blokus) return;
  for (const [id, client] of room.clients) {
    safeSend(client, {
      type: "BLOKUS_STATE",
      state: Blokus.stateFor(room.blokus, id)
    });
  }
}

function blokusError(socket, message) {
  safeSend(socket, { type: "BLOKUS_ERROR", message });
}

function drawRelayBroadcast(room) {
  if (!room?.drawrelay) return;
  for (const [id, client] of room.clients) {
    safeSend(client, {
      type: "DRAWRELAY_STATE",
      state: DrawRelay.stateFor(room.drawrelay, id)
    });
  }
  scheduleDrawRelayDeadline(room);
}

function drawRelayError(socket, message) {
  safeSend(socket, { type: "DRAWRELAY_ERROR", message });
}

function scheduleDrawRelayDeadline(room) {
  clearTimeout(room?.drawrelayTimer);
  const game = room?.drawrelay;
  if (!game || game.phase !== "playing") return;
  const expectedStep = game.step;
  const delay = Math.max(20, game.deadline - Date.now() + 800);
  room.drawrelayTimer = setTimeout(() => {
    if (game.phase !== "playing" || game.step !== expectedStep) return;
    for (const player of game.players) {
      if (game.pending[player.id]) continue;
      const submission = game.actionType === "draw" ? { strokes: [] } : { text: "시간 초과" };
      DrawRelay.submit(game, player.id, submission);
    }
    drawRelayBroadcast(room);
  }, delay);
  room.drawrelayTimer.unref?.();
}

function spellingPublicState(room) {
  const game = room?.spelling;
  if (!game) return null;

  const finishers = game.players
    .filter(player => game.results[player.id])
    .map(player => ({
      id: player.id,
      name: player.name,
      score: game.results[player.id].score,
      elapsedMs: game.results[player.id].elapsedMs
    }))
    .sort((a, b) => b.score - a.score || a.elapsedMs - b.elapsedMs || a.name.localeCompare(b.name, "ko"))
    .map((player, index) => ({ ...player, rank: index + 1 }));
  const rankingById = new Map(finishers.map(player => [player.id, player]));

  return {
    phase: game.phase,
    sessionId: game.sessionId,
    questionIds: game.phase === "lobby" ? [] : game.questionIds,
    startedAt: game.startedAt,
    participants: game.players.map(player => ({
      id: player.id,
      name: player.name,
      status: rankingById.has(player.id) ? "finished" : game.phase === "lobby" ? "waiting" : "playing"
    })),
    rankings: finishers
  };
}

function spellingBroadcast(room) {
  const state = spellingPublicState(room);
  if (!state) return;
  for (const client of room.clients.values()) {
    safeSend(client, { type: "SPELLING_STATE", state });
  }
}

function spellingError(socket, message) {
  safeSend(socket, { type: "SPELLING_ERROR", message });
}

const AVALON_TEAM_SIZES = {
  5: [2, 3, 2, 3, 3], 6: [2, 3, 4, 3, 4], 7: [2, 3, 3, 4, 4],
  8: [3, 4, 4, 5, 5]
};
const AVALON_EVIL_COUNTS = { 5: 2, 6: 2, 7: 3, 8: 3 };

function recommendedAvalonSettings(count) {
  if (count === 7) return { percival: true, morgana: true, mordred: false, oberon: true };
  if (count === 8) return { percival: true, morgana: true, mordred: true, oberon: false };
  return { percival: false, morgana: false, mordred: false, oberon: false };
}

function normalizeAvalonSettings(count, settings) {
  const normalized = {
    percival: !!settings?.percival,
    morgana: !!settings?.morgana,
    mordred: !!settings?.mordred,
    oberon: !!settings?.oberon
  };
  const evilSpecialLimit = Math.max(0, (AVALON_EVIL_COUNTS[count] || 1) - 1);
  const selectedEvil = ["morgana", "mordred", "oberon"].filter(role => normalized[role]);
  selectedEvil.slice(evilSpecialLimit).forEach(role => { normalized[role] = false; });
  return normalized;
}

function normalizeAvalonCharacterStyle(value) {
  return value === "male" || value === "female" ? value : "random";
}

function avalonRoleComposition(count, settings) {
  const evilCount = AVALON_EVIL_COUNTS[count];
  if (!evilCount) return { good: [], evil: [] };
  const good = ["Merlin"];
  const evil = ["Assassin"];
  if (settings.percival && good.length < count - evilCount) good.push("Percival");
  if (settings.morgana && evil.length < evilCount) evil.push("Morgana");
  if (settings.mordred && evil.length < evilCount) evil.push("Mordred");
  if (settings.oberon && evil.length < evilCount) evil.push("Oberon");
  while (good.length < count - evilCount) good.push("Loyal Servant");
  while (evil.length < evilCount) evil.push("Minion of Mordred");
  return { good, evil };
}

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = crypto.randomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function avalonPublicState(room) {
  const game = room.avalon;
  const roleSummary = avalonRoleComposition(game.players.length, game.settings);
  return {
    phase: game.phase,
    players: game.players.map(player => ({ id: player.id, name: player.name, connected: room.clients.has(player.id) })),
    hostId: room.hostId,
    leaderId: game.players[game.leaderIndex]?.id || null,
    quest: game.quest,
    teamSize: AVALON_TEAM_SIZES[game.players.length]?.[game.quest] || 0,
    selectedTeam: game.selectedTeam,
    proposalVotes: Object.keys(game.proposalVotes).length,
    questVotes: Object.keys(game.questVotes).length,
    rejects: game.rejects,
    results: game.results,
    winner: game.winner,
    settings: game.settings,
    settingsCustomized: game.settingsCustomized,
    recommendedSettings: recommendedAvalonSettings(game.players.length),
    roleSummary
  };
}

function avalonBroadcast(room) {
  const payload = { type: "AVALON_STATE", state: avalonPublicState(room) };
  for (const client of room.clients.values()) safeSend(client, payload);
}

function avalonNotice(room, message) {
  for (const client of room.clients.values()) safeSend(client, { type: "AVALON_NOTICE", message });
}

function resetAvalonToLobby(game) {
  game.phase = "lobby";
  game.settings = recommendedAvalonSettings(game.players.length);
  game.settingsCustomized = false;
  game.leaderIndex = 0;
  game.quest = 0;
  game.selectedTeam = [];
  game.proposalVotes = {};
  game.questVotes = {};
  game.rejects = 0;
  game.results = [];
  game.winner = null;
  game.assassinId = null;
  game.players.forEach(player => {
    delete player.role;
    delete player.resolvedCharacterStyle;
    delete player.cardVariant;
  });
}

function avalonRevealRoles(room) {
  const roles = room.avalon.players.map(player => ({ name: player.name, role: player.role }));
  for (const client of room.clients.values()) safeSend(client, { type: "AVALON_REVEAL", roles });
}

function buildAvalonRoles(count, settings) {
  const { good, evil } = avalonRoleComposition(count, normalizeAvalonSettings(count, settings));
  return shuffle([...good, ...evil]);
}

function avalonRoleInfo(game, player) {
  const evilRoles = new Set(["Assassin", "Morgana", "Mordred", "Oberon", "Minion of Mordred"]);
  const visible = [];
  if (player.role === "Merlin") {
    game.players.filter(p => evilRoles.has(p.role) && p.role !== "Mordred").forEach(p => visible.push(p.name));
  } else if (player.role === "Percival") {
    game.players.filter(p => p.role === "Merlin" || p.role === "Morgana").forEach(p => visible.push(p.name));
  } else if (evilRoles.has(player.role) && player.role !== "Oberon") {
    game.players.filter(p => p.id !== player.id && evilRoles.has(p.role) && p.role !== "Oberon").forEach(p => visible.push(p.name));
  }
  return {
    role: player.role,
    alignment: evilRoles.has(player.role) ? "evil" : "good",
    visible,
    characterStyle: player.resolvedCharacterStyle,
    cardVariant: player.cardVariant || 1
  };
}

function getKoreaDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts.filter(part => part.type !== "literal").map(part => [part.type, part.value])
  );

  return {
    date: `${values.year}-${values.month}-${values.day}`,
    time: `${values.hour}:${values.minute}`
  };
}

function loadFinisherStore() {
  try {
    if (!fs.existsSync(FINISHER_DATA_FILE)) return {};
    const parsed = JSON.parse(fs.readFileSync(FINISHER_DATA_FILE, "utf8"));
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    console.error("Failed to read finisher data:", error);
    return {};
  }
}

function persistFinisherStore() {
  try {
    fs.mkdirSync(path.dirname(FINISHER_DATA_FILE), { recursive: true });
    const tempFile = `${FINISHER_DATA_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(finisherStore, null, 2), "utf8");
    fs.renameSync(tempFile, FINISHER_DATA_FILE);
  } catch (error) {
    console.error("Failed to save finisher data:", error);
  }
}

function cleanOldFinisherDates() {
  const dates = Object.keys(finisherStore).sort().reverse();
  dates.slice(14).forEach(date => delete finisherStore[date]);
}

function getTodayRecords(gameId) {
  const { date } = getKoreaDateParts();
  const records = finisherStore[date]?.[gameId] || {};
  return Object.values(records).sort((a, b) => {
    const timeCompare = String(a.time).localeCompare(String(b.time));
    return timeCompare || String(a.name).localeCompare(String(b.name), "ko");
  });
}

app.get("/", (req, res) => {
  res.type("text").send("Classroom Game Hub is running.");
});

app.get("/health", (req, res) => {
  let connections = 0;
  for (const room of rooms.values()) connections += room.clients.size;
  res.json({
    status: "ok",
    rooms: rooms.size,
    connections
  });
});

app.get("/api/finishers", (req, res) => {
  const gameId = cleanToken(req.query.gameId, 30);
  if (!FINISHER_GAMES.has(gameId)) {
    return res.status(400).json({ error: "INVALID_GAME" });
  }

  const { date } = getKoreaDateParts();
  return res.json({
    date,
    gameId,
    records: getTodayRecords(gameId)
  });
});

app.post("/api/finishers", (req, res) => {
  const gameId = cleanToken(req.body?.gameId, 30);
  const name = cleanToken(req.body?.name, 10);
  const difficulty = cleanToken(req.body?.difficulty, 50);
  const rank = Number(req.body?.rank);

  if (!FINISHER_GAMES.has(gameId)) {
    return res.status(400).json({ error: "INVALID_GAME" });
  }
  if (!/^[가-힣]{2,6}$/.test(name)) {
    return res.status(400).json({ error: "INVALID_NAME" });
  }
  if (!difficulty || difficulty.length > 50) {
    return res.status(400).json({ error: "INVALID_DIFFICULTY" });
  }
  if (!Number.isFinite(rank) || rank < 0 || rank > 10000) {
    return res.status(400).json({ error: "INVALID_RANK" });
  }

  const now = getKoreaDateParts();
  finisherStore[now.date] ||= {};
  finisherStore[now.date][gameId] ||= {};

  const existing = finisherStore[now.date][gameId][name];
  if (!existing || rank > Number(existing.rank || 0)) {
    finisherStore[now.date][gameId][name] = {
      name,
      difficulty,
      rank,
      time: now.time
    };
    cleanOldFinisherDates();
    persistFinisherStore();
  }

  return res.json({
    ok: true,
    date: now.date,
    gameId,
    records: getTodayRecords(gameId)
  });
});

wss.on("connection", socket => {
  let playerId = crypto.randomUUID();
  socket.isAlive = true;
  socket.on("pong", () => { socket.isAlive = true; });
  socket.meta = {
    playerId,
    roomKey: null,
    role: null,
    clientToken: null,
    disconnectTimer: null
  };

  safeSend(socket, {
    type: "CONNECTED",
    playerId
  });

  socket.on("message", raw => {
    let message;
    try {
      message = JSON.parse(raw.toString());
    } catch (_) {
      safeSend(socket, { type: "ERROR", message: "잘못된 메시지입니다." });
      return;
    }

    const type = cleanToken(message.type, 30);

    if (type === "CREATE_ROOM") {
      const gameId = cleanToken(message.gameId, 30);
      const roomCode = cleanToken(message.roomCode, 10);
      const clientToken = cleanToken(message.clientToken, 80);
      const resumeOnly = message.resumeOnly === true;
      if (!gameId || !roomCode) {
        safeSend(socket, { type: "ERROR", message: "방 정보가 올바르지 않습니다." });
        return;
      }

      const key = roomKey(gameId, roomCode);
      const existingRoom = rooms.get(key);
      const previousHost = existingRoom?.clients.get(existingRoom.hostId);
      if (existingRoom && clientToken && previousHost?.meta?.clientToken === clientToken && previousHost.readyState !== WebSocket.OPEN) {
        clearTimeout(previousHost.meta.disconnectTimer);
        playerId = existingRoom.hostId;
        socket.meta.playerId = playerId;
        socket.meta.roomKey = key;
        socket.meta.role = "host";
        socket.meta.clientToken = clientToken;
        existingRoom.clients.set(playerId, socket);
        safeSend(socket, { type: "ROOM_RESUMED", gameId, roomCode, playerId });
        if (existingRoom.avalon) avalonBroadcast(existingRoom);
        if (existingRoom.lastcard) lastCardBroadcast(existingRoom);
        if (existingRoom.loveletter) loveLetterBroadcast(existingRoom);
        if (existingRoom.rummikub) rummikubBroadcast(existingRoom);
        if (existingRoom.blokus) blokusBroadcast(existingRoom);
        if (existingRoom.drawrelay) drawRelayBroadcast(existingRoom);
        if (existingRoom.spelling) spellingBroadcast(existingRoom);
        return;
      }
      if (resumeOnly) {
        safeSend(socket, { type: "ROOM_NOT_FOUND", gameId, roomCode });
        return;
      }
      if (existingRoom) {
        safeSend(socket, { type: "ROOM_EXISTS", gameId, roomCode });
        return;
      }

      const room = {
        gameId,
        roomCode,
        hostId: playerId,
        clients: new Map([[playerId, socket]])
      };
      if (gameId === "avalon") {
        room.avalon = {
          phase: "lobby", players: [{ id: playerId, name: cleanToken(message.name, 12) || "방장", characterStyle: normalizeAvalonCharacterStyle(message.characterStyle) }],
          settings: recommendedAvalonSettings(1), settingsCustomized: false,
          leaderIndex: 0, quest: 0, selectedTeam: [], proposalVotes: {}, questVotes: {},
          rejects: 0, results: [], winner: null, assassinId: null
        };
      }
      if (gameId === "loveletter") {
        room.loveletter = LoveLetter.createGame(playerId, cleanToken(message.name, 12) || "방장");
      }
      if (gameId === "lastcard") {
        room.lastcard = LastCard.createGame(playerId, cleanToken(message.name, 12) || "방장");
      }
      if (gameId === "rummikub") {
        room.rummikub = Rummikub.createGame(playerId, cleanToken(message.name, 12) || "방장");
      }
      if (gameId === "blokus") {
        room.blokus = Blokus.createGame(playerId, cleanToken(message.name, 12) || "방장");
      }
      if (gameId === "drawrelay") {
        room.drawrelay = DrawRelay.createGame(playerId, cleanToken(message.name, 12) || "방장");
      }
      if (gameId === "spelling") {
        room.spelling = {
          phase: "lobby",
          sessionId: "",
          questionIds: [],
          startedAt: 0,
          players: [],
          results: {}
        };
      }
      rooms.set(key, room);
      socket.meta.roomKey = key;
      socket.meta.role = "host";
      socket.meta.clientToken = clientToken;

      safeSend(socket, {
        type: "ROOM_CREATED",
        gameId,
        roomCode,
        playerId
      });
      if (room.avalon) avalonBroadcast(room);
      if (room.lastcard) lastCardBroadcast(room);
      if (room.loveletter) loveLetterBroadcast(room);
      if (room.rummikub) rummikubBroadcast(room);
      if (room.blokus) blokusBroadcast(room);
      if (room.drawrelay) drawRelayBroadcast(room);
      if (room.spelling) spellingBroadcast(room);
      return;
    }

    if (type === "JOIN_ROOM") {
      const gameId = cleanToken(message.gameId, 30);
      const roomCode = cleanToken(message.roomCode, 10);
      const clientToken = cleanToken(message.clientToken, 80);
      const resumeOnly = message.resumeOnly === true;
      const key = roomKey(gameId, roomCode);
      const room = rooms.get(key);

      if (!room) {
        safeSend(socket, { type: "ROOM_NOT_FOUND", gameId, roomCode });
        return;
      }

      const resumeEntry = clientToken
        ? [...room.clients.entries()].find(([, client]) => client?.meta?.clientToken === clientToken && client.readyState !== WebSocket.OPEN)
        : null;
      if (resumeEntry) {
        const [resumeId, previousSocket] = resumeEntry;
        clearTimeout(previousSocket.meta.disconnectTimer);
        playerId = resumeId;
        socket.meta.playerId = playerId;
        socket.meta.roomKey = key;
        socket.meta.role = resumeId === room.hostId ? "host" : "guest";
        socket.meta.clientToken = clientToken;
        room.clients.set(playerId, socket);
        safeSend(socket, { type: "ROOM_RESUMED", gameId, roomCode, playerId });
        if (room.avalon) avalonBroadcast(room);
        if (room.lastcard) lastCardBroadcast(room);
        if (room.loveletter) loveLetterBroadcast(room);
        if (room.rummikub) rummikubBroadcast(room);
        if (room.blokus) blokusBroadcast(room);
        if (room.drawrelay) drawRelayBroadcast(room);
        if (room.spelling) spellingBroadcast(room);
        return;
      }
      if (resumeOnly) {
        safeSend(socket, { type: "ROOM_NOT_FOUND", gameId, roomCode });
        return;
      }

      const maxPlayers = MAX_ROOM_PLAYERS[gameId] || 4;
      if (room.clients.size >= maxPlayers) {
        safeSend(socket, { type: "ROOM_FULL", gameId, roomCode });
        return;
      }

      room.clients.set(playerId, socket);
      socket.meta.roomKey = key;
      socket.meta.role = "guest";
      socket.meta.clientToken = clientToken;

      if (room.avalon) {
        if (room.avalon.phase !== "lobby") {
          room.clients.delete(playerId);
          socket.meta.roomKey = null;
          socket.meta.role = null;
          safeSend(socket, { type: "ERROR", message: "이미 시작한 게임입니다." });
          return;
        }
        room.avalon.players.push({ id: playerId, name: cleanToken(message.name, 12) || `플레이어 ${room.avalon.players.length + 1}`, characterStyle: normalizeAvalonCharacterStyle(message.characterStyle) });
        if (!room.avalon.settingsCustomized) {
          room.avalon.settings = recommendedAvalonSettings(room.avalon.players.length);
        }
      }
      if (room.loveletter) {
        if (room.loveletter.phase !== "lobby") {
          room.clients.delete(playerId);
          socket.meta.roomKey = null;
          socket.meta.role = null;
          safeSend(socket, { type: "ERROR", message: "이미 시작한 게임입니다." });
          return;
        }
        LoveLetter.addPlayer(room.loveletter, playerId, cleanToken(message.name, 12) || `플레이어 ${room.loveletter.players.length + 1}`);
      }
      if (room.lastcard) {
        if (room.lastcard.phase !== "lobby") {
          room.clients.delete(playerId);
          socket.meta.roomKey = null;
          socket.meta.role = null;
          safeSend(socket, { type: "ERROR", message: "이미 시작한 게임입니다." });
          return;
        }
        LastCard.addPlayer(room.lastcard, playerId, cleanToken(message.name, 12) || `플레이어 ${room.lastcard.players.length + 1}`);
      }
      if (room.rummikub) {
        if (room.rummikub.phase !== "lobby") {
          room.clients.delete(playerId);
          socket.meta.roomKey = null;
          socket.meta.role = null;
          safeSend(socket, { type: "ERROR", message: "이미 시작한 게임입니다." });
          return;
        }
        Rummikub.addPlayer(room.rummikub, playerId, cleanToken(message.name, 12) || `플레이어 ${room.rummikub.players.length + 1}`);
      }
      if (room.blokus) {
        if (room.blokus.phase !== "lobby") {
          room.clients.delete(playerId);
          socket.meta.roomKey = null;
          socket.meta.role = null;
          safeSend(socket, { type: "ERROR", message: "이미 시작한 게임입니다." });
          return;
        }
        Blokus.addPlayer(room.blokus, playerId, cleanToken(message.name, 12) || `플레이어 ${room.blokus.players.length + 1}`);
      }
      if (room.drawrelay) {
        if (room.drawrelay.phase !== "lobby") {
          room.clients.delete(playerId);
          socket.meta.roomKey = null;
          socket.meta.role = null;
          safeSend(socket, { type: "ERROR", message: "이미 시작한 게임입니다." });
          return;
        }
        DrawRelay.addPlayer(room.drawrelay, playerId, cleanToken(message.name, 12) || `플레이어 ${room.drawrelay.players.length + 1}`);
      }
      if (room.spelling) {
        if (room.spelling.phase !== "lobby") {
          room.clients.delete(playerId);
          socket.meta.roomKey = null;
          socket.meta.role = null;
          safeSend(socket, { type: "ERROR", message: "이미 시작한 학급 순위전입니다." });
          return;
        }
        const name = cleanToken(message.name, 12);
        if (!/^[가-힣]{2,6}$/.test(name)) {
          room.clients.delete(playerId);
          socket.meta.roomKey = null;
          socket.meta.role = null;
          safeSend(socket, { type: "ERROR", message: "메인 화면에서 한글 이름을 먼저 저장하세요." });
          return;
        }
        room.spelling.players.push({ id: playerId, name });
      }

      safeSend(socket, {
        type: "ROOM_JOINED",
        gameId,
        roomCode,
        playerId
      });

      const hostSocket = room.clients.get(room.hostId);
      safeSend(hostSocket, {
        type: "PLAYER_JOINED",
        playerId,
        name: cleanToken(message.name, 20)
      });
      if (room.avalon) avalonBroadcast(room);
      if (room.lastcard) lastCardBroadcast(room);
      if (room.loveletter) loveLetterBroadcast(room);
      if (room.rummikub) rummikubBroadcast(room);
      if (room.blokus) blokusBroadcast(room);
      if (room.drawrelay) drawRelayBroadcast(room);
      if (room.spelling) spellingBroadcast(room);
      return;
    }

    if (type === "SPELLING_ACTION") {
      const room = socket.meta.roomKey ? rooms.get(socket.meta.roomKey) : null;
      const game = room?.spelling;
      const action = cleanToken(message.action, 30);
      if (!room || !game) {
        spellingError(socket, "한글 맞춤법 학급에 참가하지 않았습니다.");
        return;
      }

      if (action === "START") {
        if (playerId !== room.hostId) {
          spellingError(socket, "교사 화면에서만 순위전을 시작할 수 있습니다.");
          return;
        }
        if (game.phase !== "lobby") {
          spellingError(socket, "이미 순위전이 진행 중입니다.");
          return;
        }
        if (game.players.length < 1) {
          spellingError(socket, "학생이 한 명 이상 참가해야 합니다.");
          return;
        }
        const questionIds = Array.isArray(message.questionIds)
          ? [...new Set(message.questionIds.map(id => cleanToken(id, 60)).filter(id => /^[a-z0-9_-]+$/i.test(id)))]
          : [];
        if (questionIds.length !== 10) {
          spellingError(socket, "순위전 문항 10개가 필요합니다.");
          return;
        }
        game.phase = "running";
        game.sessionId = crypto.randomUUID();
        game.questionIds = questionIds;
        game.startedAt = Date.now();
        game.results = {};
        spellingBroadcast(room);
        return;
      }

      if (action === "SUBMIT") {
        if (game.phase !== "running") {
          spellingError(socket, "현재 진행 중인 순위전이 없습니다.");
          return;
        }
        if (cleanToken(message.sessionId, 80) !== game.sessionId) {
          spellingError(socket, "현재 순위전의 결과가 아닙니다.");
          return;
        }
        if (!game.players.some(player => player.id === playerId)) {
          spellingError(socket, "참가 학생만 결과를 제출할 수 있습니다.");
          return;
        }
        const score = Number(message.score);
        if (!Number.isInteger(score) || score < 0 || score > 10) {
          spellingError(socket, "점수가 올바르지 않습니다.");
          return;
        }
        if (!game.results[playerId]) {
          game.results[playerId] = {
            score,
            elapsedMs: Math.max(0, Date.now() - game.startedAt)
          };
        }
        if (game.players.length > 0 && game.players.every(player => game.results[player.id])) {
          game.phase = "ended";
        }
        spellingBroadcast(room);
        return;
      }

      if (action === "RESET") {
        if (playerId !== room.hostId) {
          spellingError(socket, "교사 화면에서만 새 순위전을 준비할 수 있습니다.");
          return;
        }
        game.phase = "lobby";
        game.sessionId = "";
        game.questionIds = [];
        game.startedAt = 0;
        game.results = {};
        game.players = game.players.filter(player => room.clients.has(player.id));
        spellingBroadcast(room);
        return;
      }

      spellingError(socket, "알 수 없는 학급 순위전 요청입니다.");
      return;
    }

    if (type === "LASTCARD_ACTION") {
      const room = socket.meta.roomKey ? rooms.get(socket.meta.roomKey) : null;
      const game = room?.lastcard;
      const action = cleanToken(message.action, 30);
      if (!room || !game) {
        lastCardError(socket, "라스트 카드 방에 참가하지 않았습니다.");
        return;
      }

      let result = null;
      if (action === "START") {
        if (playerId !== room.hostId) result = { ok: false, error: "방장만 게임을 시작할 수 있습니다." };
        else result = LastCard.startMatch(game);
      } else if (action === "PLAY") {
        result = LastCard.playCard(game, playerId, message);
      } else if (action === "DRAW") {
        result = LastCard.drawAndPass(game, playerId);
      } else if (action === "NEW_GAME") {
        if (playerId !== room.hostId) result = { ok: false, error: "방장만 새 게임을 시작할 수 있습니다." };
        else result = LastCard.startMatch(game);
      } else if (action === "RETURN_LOBBY") {
        if (playerId !== room.hostId) result = { ok: false, error: "방장만 대기실로 돌아갈 수 있습니다." };
        else result = LastCard.resetToLobby(game);
      } else {
        result = { ok: false, error: "알 수 없는 행동입니다." };
      }

      if (!result.ok) {
        lastCardError(socket, result.error || "행동을 처리하지 못했습니다.");
        return;
      }
      lastCardBroadcast(room);
      return;
    }

    if (type === "LOVELETTER_ACTION") {
      const room = socket.meta.roomKey ? rooms.get(socket.meta.roomKey) : null;
      const game = room?.loveletter;
      const action = cleanToken(message.action, 30);
      if (!room || !game) {
        loveLetterError(socket, "궁정 추리 방에 참가하지 않았습니다.");
        return;
      }

      let result = null;
      if (action === "START") {
        if (playerId !== room.hostId) result = { ok: false, error: "방장만 게임을 시작할 수 있습니다." };
        else result = LoveLetter.startMatch(game);
      } else if (action === "PLAY") {
        result = LoveLetter.play(game, playerId, message);
      } else if (action === "NEXT_ROUND") {
        if (playerId !== room.hostId) result = { ok: false, error: "방장만 다음 라운드를 시작할 수 있습니다." };
        else result = LoveLetter.nextRound(game);
      } else if (action === "NEW_GAME") {
        if (playerId !== room.hostId) result = { ok: false, error: "방장만 새 게임을 시작할 수 있습니다." };
        else result = LoveLetter.newGame(game);
      } else if (action === "RETURN_LOBBY") {
        if (playerId !== room.hostId) result = { ok: false, error: "방장만 대기실로 돌아갈 수 있습니다." };
        else {
          LoveLetter.resetToLobby(game);
          result = { ok: true, reveals: [] };
        }
      } else {
        result = { ok: false, error: "알 수 없는 행동입니다." };
      }

      if (!result.ok) {
        loveLetterError(socket, result.error || "행동을 처리하지 못했습니다.");
        return;
      }
      for (const reveal of result.reveals || []) {
        safeSend(room.clients.get(reveal.playerId), {
          type: "LOVELETTER_REVEAL",
          reveal: {
            title: reveal.title,
            message: reveal.message,
            card: reveal.card
          }
        });
      }
      loveLetterBroadcast(room);
      return;
    }

    if (type === "AVALON_ACTION") {
      const room = socket.meta.roomKey ? rooms.get(socket.meta.roomKey) : null;
      const game = room?.avalon;
      const action = cleanToken(message.action, 30);
      if (!room || !game) return safeSend(socket, { type: "ERROR", message: "원정대 추리 방에 참가하지 않았습니다." });
      const player = game.players.find(p => p.id === playerId);
      if (!player) return;

      if (action === "SETTINGS" && playerId === room.hostId && game.phase === "lobby") {
        game.settings = normalizeAvalonSettings(game.players.length, message.settings);
        game.settingsCustomized = true;
        avalonBroadcast(room);
      } else if (action === "RESET_RECOMMENDED" && playerId === room.hostId && game.phase === "lobby") {
        game.settings = recommendedAvalonSettings(game.players.length);
        game.settingsCustomized = false;
        avalonBroadcast(room);
      } else if (action === "START" && playerId === room.hostId && game.phase === "lobby") {
        if (game.players.length < 5) return safeSend(socket, { type: "ERROR", message: "게임 시작에는 최소 5명이 필요합니다." });
        if (game.players.length > 8) return safeSend(socket, { type: "ERROR", message: "원정대 추리는 최대 8명까지 참여할 수 있습니다." });
        const roles = buildAvalonRoles(game.players.length, game.settings);
        const roleVariantCounts = new Map();
        game.players.forEach((p, index) => {
          p.role = roles[index];
          const variant = (roleVariantCounts.get(p.role) || 0) + 1;
          roleVariantCounts.set(p.role, variant);
          p.cardVariant = variant;
          p.resolvedCharacterStyle = p.characterStyle === "random"
            ? (crypto.randomInt(2) === 0 ? "male" : "female")
            : p.characterStyle;
        });
        game.leaderIndex = crypto.randomInt(game.players.length);
        game.phase = "team";
        game.assassinId = game.players.find(p => p.role === "Assassin")?.id || null;
        game.players.forEach(p => safeSend(room.clients.get(p.id), { type: "AVALON_ROLE", info: avalonRoleInfo(game, p) }));
        avalonBroadcast(room);
      } else if (action === "PROPOSE" && game.phase === "team" && game.players[game.leaderIndex]?.id === playerId) {
        const team = Array.isArray(message.team) ? [...new Set(message.team.map(id => cleanToken(id, 60)))] : [];
        const required = AVALON_TEAM_SIZES[game.players.length][game.quest];
        if (team.length !== required || team.some(id => !game.players.some(p => p.id === id))) return safeSend(socket, { type: "ERROR", message: `원정대 ${required}명을 선택하세요.` });
        game.selectedTeam = team; game.proposalVotes = {}; game.phase = "proposalVote"; avalonBroadcast(room);
      } else if (action === "PROPOSAL_VOTE" && game.phase === "proposalVote" && !(playerId in game.proposalVotes)) {
        game.proposalVotes[playerId] = !!message.approve;
        if (Object.keys(game.proposalVotes).length === game.players.length) {
          const approvals = Object.values(game.proposalVotes).filter(Boolean).length;
          if (approvals > game.players.length / 2) { game.phase = "questVote"; game.questVotes = {}; avalonNotice(room, `원정대가 ${approvals}:${game.players.length - approvals}로 승인되었습니다.`); }
          else { game.rejects += 1; game.leaderIndex = (game.leaderIndex + 1) % game.players.length; game.phase = "team"; avalonNotice(room, `원정대가 ${approvals}:${game.players.length - approvals}로 부결되었습니다.`); }
          if (game.rejects >= 5) { game.winner = "evil"; game.phase = "ended"; avalonRevealRoles(room); }
        }
        avalonBroadcast(room);
      } else if (action === "QUEST_VOTE" && game.phase === "questVote" && game.selectedTeam.includes(playerId) && !(playerId in game.questVotes)) {
        const evil = ["Assassin", "Morgana", "Mordred", "Oberon", "Minion of Mordred"].includes(player.role);
        game.questVotes[playerId] = evil ? !!message.success : true;
        if (Object.keys(game.questVotes).length === game.selectedTeam.length) {
          const fails = Object.values(game.questVotes).filter(v => !v).length;
          const needed = game.players.length >= 7 && game.quest === 3 ? 2 : 1;
          const success = fails < needed;
          game.results.push({ success, fails }); game.quest += 1; game.rejects = 0;
          const goodWins = game.results.filter(r => r.success).length;
          const evilWins = game.results.filter(r => !r.success).length;
          if (evilWins >= 3) { game.winner = "evil"; game.phase = "ended"; avalonRevealRoles(room); }
          else if (goodWins >= 3) { game.phase = "assassination"; }
          else { game.leaderIndex = (game.leaderIndex + 1) % game.players.length; game.phase = "team"; }
          avalonNotice(room, success ? `임무 성공! (실패 카드 ${fails}장)` : `임무 실패! (실패 카드 ${fails}장)`);
        }
        avalonBroadcast(room);
      } else if (action === "ASSASSINATE" && game.phase === "assassination" && playerId === game.assassinId) {
        const target = game.players.find(p => p.id === cleanToken(message.targetId, 60));
        if (!target) return;
        game.winner = target.role === "Merlin" ? "evil" : "good"; game.phase = "ended";
        avalonRevealRoles(room);
        avalonBroadcast(room);
      }
      return;
    }

    if (type === "RUMMIKUB_ACTION") {
      const room = socket.meta.roomKey ? rooms.get(socket.meta.roomKey) : null;
      const game = room?.rummikub;
      const action = cleanToken(message.action, 30);
      if (!room || !game) {
        rummikubError(socket, "숫자 타일 방에 참가하지 않았습니다.");
        return;
      }

      let result;
      if (action === "START") {
        result = playerId === room.hostId
          ? Rummikub.startGame(game)
          : { ok: false, error: "방장만 게임을 시작할 수 있습니다." };
      } else if (action === "PLAY") {
        result = Rummikub.play(game, playerId, message.groups);
      } else if (action === "DRAW") {
        result = Rummikub.draw(game, playerId);
      } else if (action === "NEW_GAME") {
        if (playerId !== room.hostId) result = { ok: false, error: "방장만 새 게임을 시작할 수 있습니다." };
        else if (game.phase !== "ended") result = { ok: false, error: "게임이 끝난 뒤 새 게임을 시작할 수 있습니다." };
        else {
          Rummikub.resetToLobby(game);
          result = Rummikub.startGame(game);
        }
      } else if (action === "RETURN_LOBBY") {
        result = playerId === room.hostId
          ? Rummikub.resetToLobby(game)
          : { ok: false, error: "방장만 대기실로 돌아갈 수 있습니다." };
      } else {
        result = { ok: false, error: "알 수 없는 행동입니다." };
      }

      if (!result.ok) {
        rummikubError(socket, result.error || "행동을 처리하지 못했습니다.");
        return;
      }
      rummikubBroadcast(room);
      return;
    }

    if (type === "BLOKUS_ACTION") {
      const room = socket.meta.roomKey ? rooms.get(socket.meta.roomKey) : null;
      const game = room?.blokus;
      const action = cleanToken(message.action, 30);
      if (!room || !game) {
        blokusError(socket, "코너 블록 방에 참가하지 않았습니다.");
        return;
      }

      let result;
      if (action === "START") {
        result = playerId === room.hostId
          ? Blokus.startGame(game)
          : { ok: false, error: "방장만 게임을 시작할 수 있습니다." };
      } else if (action === "PLACE") {
        result = Blokus.place(game, playerId, cleanToken(message.pieceId, 10), message.cells);
      } else if (action === "PASS") {
        result = Blokus.pass(game, playerId);
      } else if (action === "NEW_GAME") {
        if (playerId !== room.hostId) result = { ok: false, error: "방장만 새 게임을 시작할 수 있습니다." };
        else if (game.phase !== "ended") result = { ok: false, error: "게임이 끝난 뒤 새 게임을 시작할 수 있습니다." };
        else {
          Blokus.resetToLobby(game);
          result = Blokus.startGame(game);
        }
      } else if (action === "RETURN_LOBBY") {
        result = playerId === room.hostId
          ? Blokus.resetToLobby(game)
          : { ok: false, error: "방장만 대기실로 돌아갈 수 있습니다." };
      } else {
        result = { ok: false, error: "알 수 없는 행동입니다." };
      }

      if (!result.ok) {
        blokusError(socket, result.error || "행동을 처리하지 못했습니다.");
        return;
      }
      blokusBroadcast(room);
      return;
    }

    if (type === "DRAWRELAY_ACTION") {
      const room = socket.meta.roomKey ? rooms.get(socket.meta.roomKey) : null;
      const game = room?.drawrelay;
      const action = cleanToken(message.action, 30);
      if (!room || !game) {
        drawRelayError(socket, "그림 릴레이 방에 참가하지 않았습니다.");
        return;
      }

      let result;
      if (action === "START") {
        result = playerId === room.hostId
          ? DrawRelay.startGame(game, cleanToken(message.packId, 20))
          : { ok: false, error: "방장만 게임을 시작할 수 있습니다." };
      } else if (action === "SUBMIT_DRAWING") {
        result = DrawRelay.submit(game, playerId, { strokes: message.strokes });
      } else if (action === "SUBMIT_GUESS") {
        result = DrawRelay.submit(game, playerId, { text: message.text });
      } else if (action === "RETURN_LOBBY") {
        result = playerId === room.hostId
          ? DrawRelay.resetToLobby(game)
          : { ok: false, error: "방장만 대기실로 돌아갈 수 있습니다." };
      } else {
        result = { ok: false, error: "알 수 없는 행동입니다." };
      }

      if (!result.ok) {
        drawRelayError(socket, result.error || "행동을 처리하지 못했습니다.");
        return;
      }
      drawRelayBroadcast(room);
      return;
    }

    if (type === "GAME_MESSAGE") {
      const key = socket.meta.roomKey;
      const room = key ? rooms.get(key) : null;
      if (!room) {
        safeSend(socket, { type: "ERROR", message: "참여 중인 방이 없습니다." });
        return;
      }

      const packet = {
        type: "GAME_MESSAGE",
        senderId: playerId,
        payload: message.payload
      };

      if (socket.meta.role === "host") {
        for (const [id, client] of room.clients) {
          if (id !== playerId) safeSend(client, packet);
        }
      } else {
        safeSend(room.clients.get(room.hostId), packet);
      }
    }
  });

  socket.on("close", code => {
    const key = socket.meta.roomKey;
    if (!key) return;

    const room = rooms.get(key);
    if (!room) return;

    const finishDisconnect = () => {
      const currentRoom = rooms.get(key);
      if (!currentRoom || currentRoom.clients.get(playerId) !== socket) return;

      if (socket.meta.role === "host" || playerId === currentRoom.hostId) {
        clearTimeout(currentRoom.drawrelayTimer);
        for (const [id, client] of currentRoom.clients) {
          if (id !== playerId) {
            safeSend(client, {
              type: "ROOM_CLOSED",
              playerId
            });
            try { client.close(4002, "HOST_LEFT"); } catch (_) {}
          }
        }
        rooms.delete(key);
        return;
      }

      currentRoom.clients.delete(playerId);
      if (currentRoom.avalon) {
        const gameWasActive = currentRoom.avalon.phase !== "lobby";
        currentRoom.avalon.players = currentRoom.avalon.players.filter(player => player.id !== playerId);
        if (gameWasActive) {
          resetAvalonToLobby(currentRoom.avalon);
          avalonNotice(currentRoom, "플레이어가 나가 게임을 중단하고 대기실로 돌아왔습니다.");
        } else if (!currentRoom.avalon.settingsCustomized) {
          currentRoom.avalon.settings = recommendedAvalonSettings(currentRoom.avalon.players.length);
        }
      }
      if (currentRoom.loveletter) {
        const gameWasActive = currentRoom.loveletter.phase !== "lobby";
        LoveLetter.removePlayer(currentRoom.loveletter, playerId);
        if (gameWasActive) {
          LoveLetter.resetToLobby(currentRoom.loveletter, "플레이어가 나가 게임을 중단하고 대기실로 돌아왔습니다.");
        }
      }
      if (currentRoom.lastcard) {
        const gameWasActive = currentRoom.lastcard.phase !== "lobby";
        LastCard.removePlayer(currentRoom.lastcard, playerId);
        if (gameWasActive) {
          LastCard.resetToLobby(currentRoom.lastcard, "플레이어가 나가 게임을 중단하고 대기실로 돌아왔습니다.");
        }
      }
      if (currentRoom.rummikub) {
        const gameWasActive = currentRoom.rummikub.phase !== "lobby";
        Rummikub.removePlayer(currentRoom.rummikub, playerId);
        if (gameWasActive) {
          Rummikub.resetToLobby(currentRoom.rummikub, "플레이어가 나가 게임을 중단하고 대기실로 돌아왔습니다.");
        }
      }
      if (currentRoom.blokus) {
        const gameWasActive = currentRoom.blokus.phase !== "lobby";
        Blokus.removePlayer(currentRoom.blokus, playerId);
        if (gameWasActive) {
          Blokus.resetToLobby(currentRoom.blokus, "플레이어가 나가 게임을 중단하고 대기실로 돌아왔습니다.");
        }
      }
      if (currentRoom.drawrelay) {
        const gameWasActive = currentRoom.drawrelay.phase !== "lobby";
        DrawRelay.removePlayer(currentRoom.drawrelay, playerId);
        if (gameWasActive) {
          DrawRelay.resetToLobby(currentRoom.drawrelay, "플레이어가 나가 게임을 중단하고 대기실로 돌아왔습니다.");
        }
      }
      if (currentRoom.spelling) {
        const spelling = currentRoom.spelling;
        if (spelling.phase === "lobby" || !spelling.results[playerId]) {
          spelling.players = spelling.players.filter(player => player.id !== playerId);
        }
        if (spelling.phase === "running" && spelling.players.length > 0 && spelling.players.every(player => spelling.results[player.id])) {
          spelling.phase = "ended";
        }
      }
      safeSend(currentRoom.clients.get(currentRoom.hostId), {
        type: "PLAYER_LEFT",
        playerId
      });

      if (currentRoom.avalon) avalonBroadcast(currentRoom);
      if (currentRoom.lastcard) lastCardBroadcast(currentRoom);
      if (currentRoom.loveletter) loveLetterBroadcast(currentRoom);
      if (currentRoom.rummikub) rummikubBroadcast(currentRoom);
      if (currentRoom.blokus) blokusBroadcast(currentRoom);
      if (currentRoom.drawrelay) drawRelayBroadcast(currentRoom);
      if (currentRoom.spelling) spellingBroadcast(currentRoom);

      if (currentRoom.clients.size === 0) rooms.delete(key);
    };

    if (Number(code) === 4000) finishDisconnect();
    else socket.meta.disconnectTimer = setTimeout(finishDisconnect, 12000);
  });
});

const heartbeatTimer = setInterval(() => {
  for (const client of wss.clients) {
    if (client.isAlive === false) {
      try { client.terminate(); } catch (_) {}
      continue;
    }
    client.isAlive = false;
    try { client.ping(); } catch (_) {}
  }
}, 30000);
heartbeatTimer.unref?.();
wss.on("close", () => clearInterval(heartbeatTimer));

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Classroom Game Hub listening on port ${PORT}`);
  console.log(`Finisher data file: ${FINISHER_DATA_FILE}`);
});
