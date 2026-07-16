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
  janggi: 2
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
  const playerId = crypto.randomUUID();
  socket.meta = {
    playerId,
    roomKey: null,
    role: null
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
      if (!gameId || !roomCode) {
        safeSend(socket, { type: "ERROR", message: "방 정보가 올바르지 않습니다." });
        return;
      }

      const key = roomKey(gameId, roomCode);
      if (rooms.has(key)) {
        safeSend(socket, { type: "ROOM_EXISTS", gameId, roomCode });
        return;
      }

      const room = {
        gameId,
        roomCode,
        hostId: playerId,
        clients: new Map([[playerId, socket]])
      };
      rooms.set(key, room);
      socket.meta.roomKey = key;
      socket.meta.role = "host";

      safeSend(socket, {
        type: "ROOM_CREATED",
        gameId,
        roomCode,
        playerId
      });
      return;
    }

    if (type === "JOIN_ROOM") {
      const gameId = cleanToken(message.gameId, 30);
      const roomCode = cleanToken(message.roomCode, 10);
      const key = roomKey(gameId, roomCode);
      const room = rooms.get(key);

      if (!room) {
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

  socket.on("close", () => {
    const key = socket.meta.roomKey;
    if (!key) return;

    const room = rooms.get(key);
    if (!room) return;

    if (socket.meta.role === "host" || playerId === room.hostId) {
      for (const [id, client] of room.clients) {
        if (id !== playerId) {
          safeSend(client, {
            type: "ROOM_CLOSED",
            playerId
          });
          try { client.close(); } catch (_) {}
        }
      }
      rooms.delete(key);
      return;
    }

    room.clients.delete(playerId);
    safeSend(room.clients.get(room.hostId), {
      type: "PLAYER_LEFT",
      playerId
    });

    if (room.clients.size === 0) rooms.delete(key);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Classroom Game Hub listening on port ${PORT}`);
  console.log(`Finisher data file: ${FINISHER_DATA_FILE}`);
});
