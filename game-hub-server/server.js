const express = require("express");
const http = require("http");
const crypto = require("crypto");
const { WebSocketServer, WebSocket } = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 10000;
const rooms = new Map();

app.get("/", (req, res) => {
  res.send("Classroom Game Hub Server is running.");
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    rooms: rooms.size,
    connections: wss.clients.size
  });
});

function makeRoomKey(gameId, roomCode) {
  return `${gameId}:${roomCode}`;
}

function send(ws, data) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

function broadcast(room, data, except = null) {
  for (const client of room.clients) {
    if (client !== except) {
      send(client, data);
    }
  }
}

function leaveRoom(ws) {
  if (!ws.roomKey) return;

  const room = rooms.get(ws.roomKey);

  if (!room) {
    ws.roomKey = null;
    ws.isHost = false;
    return;
  }

  room.clients.delete(ws);

  if (room.host === ws) {
    broadcast(room, {
      type: "ROOM_CLOSED",
      reason: "HOST_LEFT"
    });

    for (const client of room.clients) {
      client.roomKey = null;
      client.isHost = false;
    }

    rooms.delete(ws.roomKey);
  } else {
    broadcast(room, {
      type: "PLAYER_LEFT",
      playerId: ws.playerId
    });

    if (room.clients.size === 0) {
      rooms.delete(ws.roomKey);
    }
  }

  ws.roomKey = null;
  ws.isHost = false;
}

wss.on("connection", (ws) => {
  ws.playerId = crypto.randomUUID();
  ws.roomKey = null;
  ws.isHost = false;

  send(ws, {
    type: "CONNECTED",
    playerId: ws.playerId
  });

  ws.on("message", (rawData) => {
    let data;

    try {
      data = JSON.parse(rawData.toString());
    } catch {
      send(ws, {
        type: "ERROR",
        message: "잘못된 데이터입니다."
      });
      return;
    }

    if (data.type === "CREATE_ROOM") {
      leaveRoom(ws);

      const gameId = String(data.gameId || "").trim();
      const roomCode = String(data.roomCode || "").trim();

      if (!gameId || !roomCode) {
        send(ws, {
          type: "ERROR",
          message: "게임 ID와 방 번호가 필요합니다."
        });
        return;
      }

      const roomKey = makeRoomKey(gameId, roomCode);

      if (rooms.has(roomKey)) {
        send(ws, {
          type: "ROOM_EXISTS"
        });
        return;
      }

      const room = {
        gameId,
        roomCode,
        host: ws,
        clients: new Set([ws])
      };

      rooms.set(roomKey, room);

      ws.roomKey = roomKey;
      ws.isHost = true;

      send(ws, {
        type: "ROOM_CREATED",
        gameId,
        roomCode,
        playerId: ws.playerId
      });

      return;
    }

    if (data.type === "JOIN_ROOM") {
      leaveRoom(ws);

      const gameId = String(data.gameId || "").trim();
      const roomCode = String(data.roomCode || "").trim();
      const roomKey = makeRoomKey(gameId, roomCode);
      const room = rooms.get(roomKey);

      if (!room) {
        send(ws, {
          type: "ROOM_NOT_FOUND"
        });
        return;
      }

      if (room.clients.size >= 4) {
        send(ws, {
          type: "ROOM_FULL"
        });
        return;
      }

      room.clients.add(ws);
      ws.roomKey = roomKey;
      ws.isHost = false;

      send(ws, {
        type: "ROOM_JOINED",
        gameId,
        roomCode,
        playerId: ws.playerId
      });

      send(room.host, {
        type: "PLAYER_JOINED",
        playerId: ws.playerId,
        name: String(data.name || "Player").slice(0, 20)
      });

      return;
    }

    if (data.type === "GAME_MESSAGE") {
      if (!ws.roomKey) return;

      const room = rooms.get(ws.roomKey);
      if (!room) return;

      if (ws.isHost) {
        broadcast(
          room,
          {
            type: "GAME_MESSAGE",
            senderId: ws.playerId,
            payload: data.payload
          },
          ws
        );
      } else {
        send(room.host, {
          type: "GAME_MESSAGE",
          senderId: ws.playerId,
          payload: data.payload
        });
      }
    }
  });

  ws.on("close", () => {
    leaveRoom(ws);
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error.message);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Game Hub Server running on port ${PORT}`);
});