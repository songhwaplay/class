const express = require("express");
const http = require("http");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { WebSocketServer, WebSocket } = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = Number(process.env.PORT) || 10000;
const MAX_ROOM_PLAYERS = {
  setgame: 4,
  nimgame: 2,
  janggi: 2,
  avalon: 8
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
      return;
    }

    if (type === "AVALON_ACTION") {
      const room = socket.meta.roomKey ? rooms.get(socket.meta.roomKey) : null;
      const game = room?.avalon;
      const action = cleanToken(message.action, 30);
      if (!room || !game) return safeSend(socket, { type: "ERROR", message: "아발론 방에 참가하지 않았습니다." });
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
        if (game.players.length > 8) return safeSend(socket, { type: "ERROR", message: "수업용 아발론은 최대 8명까지 참여할 수 있습니다." });
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
        currentRoom.avalon.players = currentRoom.avalon.players.filter(player => player.id !== playerId);
        if (currentRoom.avalon.phase === "lobby" && !currentRoom.avalon.settingsCustomized) {
          currentRoom.avalon.settings = recommendedAvalonSettings(currentRoom.avalon.players.length);
        }
      }
      safeSend(currentRoom.clients.get(currentRoom.hostId), {
        type: "PLAYER_LEFT",
        playerId
      });

      if (currentRoom.avalon) avalonBroadcast(currentRoom);

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
