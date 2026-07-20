"use strict";

const COLOR_ORDER = Object.freeze(["blue", "red", "yellow", "green"]);
const COLOR_LABELS = Object.freeze({ blue: "파랑", red: "빨강", yellow: "노랑", green: "초록" });
const START_CORNERS = Object.freeze({
  blue: Object.freeze({ x: 0, y: 0 }),
  red: Object.freeze({ x: 19, y: 0 }),
  yellow: Object.freeze({ x: 19, y: 19 }),
  green: Object.freeze({ x: 0, y: 19 })
});

const PIECES = Object.freeze([
  { id: "I1", cells: [[0, 0]] },
  { id: "I2", cells: [[0, 0], [1, 0]] },
  { id: "I3", cells: [[0, 0], [1, 0], [2, 0]] },
  { id: "V3", cells: [[0, 0], [0, 1], [1, 1]] },
  { id: "I4", cells: [[0, 0], [1, 0], [2, 0], [3, 0]] },
  { id: "O4", cells: [[0, 0], [1, 0], [0, 1], [1, 1]] },
  { id: "T4", cells: [[0, 0], [1, 0], [2, 0], [1, 1]] },
  { id: "L4", cells: [[0, 0], [0, 1], [0, 2], [1, 2]] },
  { id: "Z4", cells: [[0, 0], [1, 0], [1, 1], [2, 1]] },
  { id: "I5", cells: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]] },
  { id: "L5", cells: [[0, 0], [0, 1], [0, 2], [0, 3], [1, 3]] },
  { id: "Y5", cells: [[0, 0], [0, 1], [1, 1], [0, 2], [0, 3]] },
  { id: "N5", cells: [[0, 0], [0, 1], [1, 1], [1, 2], [1, 3]] },
  { id: "P5", cells: [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2]] },
  { id: "U5", cells: [[0, 0], [2, 0], [0, 1], [1, 1], [2, 1]] },
  { id: "V5", cells: [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]] },
  { id: "W5", cells: [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2]] },
  { id: "X5", cells: [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]] },
  { id: "T5", cells: [[0, 0], [1, 0], [2, 0], [1, 1], [1, 2]] },
  { id: "Z5", cells: [[0, 0], [1, 0], [1, 1], [1, 2], [2, 2]] },
  { id: "F5", cells: [[1, 0], [0, 1], [1, 1], [1, 2], [2, 2]] }
].map(piece => Object.freeze({
  id: piece.id,
  cells: Object.freeze(piece.cells.map(([x, y]) => Object.freeze({ x, y })))
})));

const PIECE_BY_ID = new Map(PIECES.map(piece => [piece.id, piece]));

function normalizeCells(cells) {
  const minimumX = Math.min(...cells.map(cell => cell.x));
  const minimumY = Math.min(...cells.map(cell => cell.y));
  return cells
    .map(cell => ({ x: cell.x - minimumX, y: cell.y - minimumY }))
    .sort((left, right) => left.y - right.y || left.x - right.x);
}

function cellsKey(cells) {
  return normalizeCells(cells).map(cell => `${cell.x},${cell.y}`).join(";");
}

function orientationsFor(piece) {
  const found = new Map();
  for (const flipped of [false, true]) {
    for (let rotation = 0; rotation < 4; rotation += 1) {
      const transformed = piece.cells.map(source => {
        let x = flipped ? -source.x : source.x;
        let y = source.y;
        for (let step = 0; step < rotation; step += 1) [x, y] = [-y, x];
        return { x, y };
      });
      const normalized = normalizeCells(transformed);
      found.set(cellsKey(normalized), normalized);
    }
  }
  return [...found.values()].map(cells => Object.freeze(cells.map(cell => Object.freeze(cell))));
}

const ORIENTATIONS = Object.freeze(Object.fromEntries(
  PIECES.map(piece => [piece.id, Object.freeze(orientationsFor(piece))])
));
const ORIENTATION_KEYS = Object.freeze(Object.fromEntries(
  Object.entries(ORIENTATIONS).map(([pieceId, orientations]) => [pieceId, new Set(orientations.map(cellsKey))])
));

function cleanName(value, fallback = "플레이어") {
  return String(value || "").trim().slice(0, 12) || fallback;
}

function createGame(hostId, hostName) {
  return {
    phase: "lobby",
    players: [{ id: String(hostId), name: cleanName(hostName, "방장") }],
    colorOwners: {},
    turnColors: [],
    turnColorIndex: 0,
    remaining: {},
    passed: {},
    placedCount: {},
    lastPiece: {},
    placements: [],
    winnerIds: [],
    lastAction: "2명 또는 4명이 모이면 시작할 수 있습니다.",
    revision: 0
  };
}

function addPlayer(game, playerId, playerName) {
  if (game.phase !== "lobby") return { ok: false, error: "이미 시작한 게임입니다." };
  if (game.players.length >= 4) return { ok: false, error: "블로커스는 최대 4명까지 참여할 수 있습니다." };
  const id = String(playerId);
  if (game.players.some(player => player.id === id)) return { ok: true };
  game.players.push({ id, name: cleanName(playerName, `플레이어 ${game.players.length + 1}`) });
  game.revision += 1;
  return { ok: true };
}

function removePlayer(game, playerId) {
  const id = String(playerId);
  game.players = game.players.filter(player => player.id !== id);
  game.revision += 1;
}

function resetToLobby(game, message = "대기실로 돌아왔습니다.") {
  game.phase = "lobby";
  game.colorOwners = {};
  game.turnColors = [];
  game.turnColorIndex = 0;
  game.remaining = {};
  game.passed = {};
  game.placedCount = {};
  game.lastPiece = {};
  game.placements = [];
  game.winnerIds = [];
  game.lastAction = message;
  game.revision += 1;
  return { ok: true };
}

function assignColors(players) {
  if (players.length === 2) {
    return {
      turnColors: [...COLOR_ORDER],
      owners: {
        blue: players[0].id,
        yellow: players[0].id,
        red: players[1].id,
        green: players[1].id
      }
    };
  }
  if (players.length !== 4) return { turnColors: [], owners: {} };
  const turnColors = [...COLOR_ORDER];
  return {
    turnColors,
    owners: Object.fromEntries(turnColors.map((color, index) => [color, players[index].id]))
  };
}

function startGame(game) {
  if (game.phase !== "lobby") return { ok: false, error: "이미 시작한 게임입니다." };
  if (![2, 4].includes(game.players.length)) {
    return { ok: false, error: "블로커스는 2명 또는 4명일 때 시작할 수 있습니다." };
  }
  const assignment = assignColors(game.players);
  game.colorOwners = assignment.owners;
  game.turnColors = assignment.turnColors;
  game.turnColorIndex = 0;
  game.remaining = {};
  game.passed = {};
  game.placedCount = {};
  game.lastPiece = {};
  for (const color of game.turnColors) {
    game.remaining[color] = PIECES.map(piece => piece.id);
    game.passed[color] = false;
    game.placedCount[color] = 0;
    game.lastPiece[color] = null;
  }
  game.placements = [];
  game.winnerIds = [];
  game.phase = "playing";
  game.lastAction = `${game.players[0].name}님의 ${COLOR_LABELS[game.turnColors[0]]} 차례로 시작합니다.`;
  game.revision += 1;
  return { ok: true };
}

function currentColor(game) {
  return game.turnColors[game.turnColorIndex] || null;
}

function playerById(game, playerId) {
  return game.players.find(player => player.id === String(playerId)) || null;
}

function occupiedMap(game) {
  const map = new Map();
  for (const placement of game.placements) {
    for (const cell of placement.cells) map.set(`${cell.x},${cell.y}`, placement.color);
  }
  return map;
}

function validatePlacement(game, color, pieceId, proposedCells) {
  if (!game.turnColors.includes(color)) return { ok: false, error: "사용하지 않는 색입니다." };
  const piece = PIECE_BY_ID.get(String(pieceId));
  if (!piece || !(game.remaining[color] || []).includes(piece.id)) {
    return { ok: false, error: "이미 사용했거나 존재하지 않는 조각입니다." };
  }
  if (!Array.isArray(proposedCells) || proposedCells.length !== piece.cells.length) {
    return { ok: false, error: "조각의 칸 수가 올바르지 않습니다." };
  }
  const cells = proposedCells.map(cell => ({ x: Number(cell?.x), y: Number(cell?.y) }));
  if (cells.some(cell => !Number.isInteger(cell.x) || !Number.isInteger(cell.y))) {
    return { ok: false, error: "보드 좌표가 올바르지 않습니다." };
  }
  if (new Set(cells.map(cell => `${cell.x},${cell.y}`)).size !== cells.length) {
    return { ok: false, error: "한 칸을 두 번 차지할 수 없습니다." };
  }
  if (!ORIENTATION_KEYS[piece.id].has(cellsKey(cells))) {
    return { ok: false, error: "조각의 모양이 올바르지 않습니다." };
  }
  if (cells.some(cell => cell.x < 0 || cell.y < 0 || cell.x >= 20 || cell.y >= 20)) {
    return { ok: false, error: "조각이 보드 밖으로 나갔습니다." };
  }

  const occupied = occupiedMap(game);
  if (cells.some(cell => occupied.has(`${cell.x},${cell.y}`))) {
    return { ok: false, error: "이미 조각이 놓인 칸입니다." };
  }

  if ((game.placedCount[color] || 0) === 0) {
    const corner = START_CORNERS[color];
    if (!cells.some(cell => cell.x === corner.x && cell.y === corner.y)) {
      return { ok: false, error: `${COLOR_LABELS[color]}의 첫 조각은 시작 모서리를 덮어야 합니다.` };
    }
    return { ok: true, cells };
  }

  const edgeDirections = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const cornerDirections = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  for (const cell of cells) {
    if (edgeDirections.some(([dx, dy]) => occupied.get(`${cell.x + dx},${cell.y + dy}`) === color)) {
      return { ok: false, error: "같은 색 조각끼리는 변이 닿을 수 없습니다." };
    }
  }
  const touchesCorner = cells.some(cell =>
    cornerDirections.some(([dx, dy]) => occupied.get(`${cell.x + dx},${cell.y + dy}`) === color)
  );
  if (!touchesCorner) return { ok: false, error: "같은 색 조각의 모서리와 한 곳 이상 닿아야 합니다." };
  return { ok: true, cells };
}

function firstLegalPlacement(game, color) {
  if (game.passed[color]) return null;
  for (const pieceId of game.remaining[color] || []) {
    for (const orientation of ORIENTATIONS[pieceId]) {
      const width = Math.max(...orientation.map(cell => cell.x)) + 1;
      const height = Math.max(...orientation.map(cell => cell.y)) + 1;
      for (let y = 0; y <= 20 - height; y += 1) {
        for (let x = 0; x <= 20 - width; x += 1) {
          const cells = orientation.map(cell => ({ x: cell.x + x, y: cell.y + y }));
          if (validatePlacement(game, color, pieceId, cells).ok) return { pieceId, cells };
        }
      }
    }
  }
  return null;
}

function colorScore(game, color) {
  const squaresLeft = (game.remaining[color] || []).reduce((sum, pieceId) => sum + PIECE_BY_ID.get(pieceId).cells.length, 0);
  if (squaresLeft > 0) return -squaresLeft;
  return 15 + (game.lastPiece[color] === "I1" ? 5 : 0);
}

function finishGame(game) {
  game.phase = "ended";
  const scores = game.players.map(player => ({
    id: player.id,
    score: game.turnColors
      .filter(color => game.colorOwners[color] === player.id)
      .reduce((sum, color) => sum + colorScore(game, color), 0)
  }));
  const best = Math.max(...scores.map(entry => entry.score));
  game.winnerIds = scores.filter(entry => entry.score === best).map(entry => entry.id);
  const winnerNames = game.winnerIds.map(id => playerById(game, id)?.name).filter(Boolean).join(", ");
  game.lastAction = `${winnerNames || "플레이어"}님이 ${best}점으로 승리했습니다!`;
}

function advanceTurn(game) {
  if (game.turnColors.every(color => game.passed[color])) {
    finishGame(game);
    return;
  }
  do {
    game.turnColorIndex = (game.turnColorIndex + 1) % game.turnColors.length;
  } while (game.passed[currentColor(game)]);
}

function place(game, playerId, pieceId, proposedCells) {
  if (game.phase !== "playing") return { ok: false, error: "진행 중인 게임이 아닙니다." };
  const color = currentColor(game);
  if (game.colorOwners[color] !== String(playerId)) return { ok: false, error: "지금은 내 차례가 아닙니다." };
  const validation = validatePlacement(game, color, pieceId, proposedCells);
  if (!validation.ok) return validation;

  game.placements.push({
    color,
    pieceId: String(pieceId),
    cells: validation.cells.map(cell => ({ ...cell })),
    order: game.placements.length
  });
  game.remaining[color] = game.remaining[color].filter(id => id !== String(pieceId));
  game.placedCount[color] += 1;
  game.lastPiece[color] = String(pieceId);
  const player = playerById(game, playerId);
  game.lastAction = `${player?.name || "플레이어"}님이 ${COLOR_LABELS[color]} ${pieceId} 조각을 놓았습니다.`;
  if (game.remaining[color].length === 0) game.passed[color] = true;
  advanceTurn(game);
  game.revision += 1;
  return { ok: true };
}

function pass(game, playerId) {
  if (game.phase !== "playing") return { ok: false, error: "진행 중인 게임이 아닙니다." };
  const color = currentColor(game);
  if (game.colorOwners[color] !== String(playerId)) return { ok: false, error: "지금은 내 차례가 아닙니다." };
  if (firstLegalPlacement(game, color)) return { ok: false, error: "아직 놓을 수 있는 조각이 있습니다." };
  game.passed[color] = true;
  const player = playerById(game, playerId);
  game.lastAction = `${player?.name || "플레이어"}님의 ${COLOR_LABELS[color]}은 더 놓을 수 없어 종료되었습니다.`;
  advanceTurn(game);
  game.revision += 1;
  return { ok: true };
}

function stateFor(game, playerId) {
  const id = String(playerId);
  const activeColor = currentColor(game);
  const activePlayerId = activeColor ? game.colorOwners[activeColor] : null;
  const colorStates = game.turnColors.map(color => ({
    id: color,
    label: COLOR_LABELS[color],
    ownerId: game.colorOwners[color],
    pieceCount: (game.remaining[color] || []).length,
    squareCount: (game.remaining[color] || []).reduce((sum, pieceId) => sum + PIECE_BY_ID.get(pieceId).cells.length, 0),
    score: colorScore(game, color),
    passed: !!game.passed[color],
    startCorner: START_CORNERS[color]
  }));
  const players = game.players.map(player => {
    const colors = game.turnColors.filter(color => game.colorOwners[color] === player.id);
    return {
      id: player.id,
      name: player.name,
      colors,
      pieceCount: colors.reduce((sum, color) => sum + (game.remaining[color] || []).length, 0),
      squareCount: colors.reduce((sum, color) => sum + colorStates.find(state => state.id === color).squareCount, 0),
      score: colors.reduce((sum, color) => sum + colorScore(game, color), 0),
      out: colors.length > 0 && colors.every(color => game.passed[color])
    };
  });
  const hasMove = game.phase === "playing" && activeColor ? !!firstLegalPlacement(game, activeColor) : false;
  return {
    phase: game.phase,
    boardSize: 20,
    players,
    colors: colorStates,
    placements: game.placements.map(placement => ({
      color: placement.color,
      pieceId: placement.pieceId,
      cells: placement.cells.map(cell => ({ ...cell })),
      order: placement.order
    })),
    remaining: Object.fromEntries(game.turnColors.map(color => [color, [...(game.remaining[color] || [])]])),
    activeColor,
    activePlayerId,
    myColors: game.turnColors.filter(color => game.colorOwners[color] === id),
    canPass: activePlayerId === id && !hasMove,
    winnerIds: [...game.winnerIds],
    lastAction: game.lastAction,
    revision: game.revision
  };
}

module.exports = {
  COLOR_ORDER,
  COLOR_LABELS,
  START_CORNERS,
  PIECES,
  ORIENTATIONS,
  createGame,
  addPlayer,
  removePlayer,
  resetToLobby,
  assignColors,
  startGame,
  currentColor,
  validatePlacement,
  firstLegalPlacement,
  colorScore,
  place,
  pass,
  stateFor
};
