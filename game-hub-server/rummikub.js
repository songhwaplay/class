"use strict";

const crypto = require("crypto");

const COLORS = Object.freeze(["red", "blue", "black", "orange"]);
const COLOR_ORDER = Object.freeze(Object.fromEntries(COLORS.map((color, index) => [color, index])));

function cleanName(value, fallback = "플레이어") {
  return String(value || "").trim().slice(0, 12) || fallback;
}

function createTiles() {
  const tiles = [];
  for (let copy = 1; copy <= 2; copy += 1) {
    for (const color of COLORS) {
      for (let number = 1; number <= 13; number += 1) {
        tiles.push({ id: `${color}-${number}-${copy}`, color, number });
      }
    }
  }
  return tiles;
}

const BASE_TILES = Object.freeze(createTiles().map(tile => Object.freeze(tile)));

function shuffle(items, randomIndex = maximum => crypto.randomInt(maximum)) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function sortTiles(tiles) {
  return [...tiles].sort((left, right) =>
    COLOR_ORDER[left.color] - COLOR_ORDER[right.color] ||
    left.number - right.number ||
    left.id.localeCompare(right.id)
  );
}

function createGame(hostId, hostName) {
  return {
    phase: "lobby",
    players: [{ id: String(hostId), name: cleanName(hostName, "방장"), opened: false }],
    hands: {},
    deck: [],
    board: [],
    turnIndex: 0,
    passCount: 0,
    winnerId: null,
    lastAction: "2~4명이 모이면 시작할 수 있습니다.",
    revision: 0
  };
}

function addPlayer(game, playerId, playerName) {
  if (game.phase !== "lobby") return { ok: false, error: "이미 시작한 게임입니다." };
  if (game.players.length >= 4) return { ok: false, error: "루미큐브는 최대 4명까지 참여할 수 있습니다." };
  const id = String(playerId);
  if (game.players.some(player => player.id === id)) return { ok: true };
  game.players.push({ id, name: cleanName(playerName, `플레이어 ${game.players.length + 1}`), opened: false });
  game.revision += 1;
  return { ok: true };
}

function removePlayer(game, playerId) {
  const id = String(playerId);
  game.players = game.players.filter(player => player.id !== id);
  delete game.hands[id];
  if (game.turnIndex >= game.players.length) game.turnIndex = 0;
  game.revision += 1;
}

function resetToLobby(game, message = "대기실로 돌아왔습니다.") {
  game.phase = "lobby";
  game.hands = {};
  game.deck = [];
  game.board = [];
  game.turnIndex = 0;
  game.passCount = 0;
  game.winnerId = null;
  game.players.forEach(player => { player.opened = false; });
  game.lastAction = message;
  game.revision += 1;
  return { ok: true };
}

function startGame(game, randomIndex) {
  if (game.phase !== "lobby") return { ok: false, error: "이미 시작한 게임입니다." };
  if (game.players.length < 2 || game.players.length > 4) {
    return { ok: false, error: "게임 시작에는 2~4명이 필요합니다." };
  }

  game.deck = shuffle(BASE_TILES, randomIndex);
  game.hands = {};
  game.players.forEach(player => {
    player.opened = false;
    game.hands[player.id] = sortTiles(game.deck.splice(0, 14));
  });
  game.board = [];
  game.turnIndex = 0;
  game.passCount = 0;
  game.winnerId = null;
  game.phase = "playing";
  game.lastAction = `${game.players[0].name}님부터 시작합니다.`;
  game.revision += 1;
  return { ok: true };
}

function tileMap(game) {
  const map = new Map();
  for (const tile of game.deck) map.set(tile.id, tile);
  for (const hand of Object.values(game.hands)) {
    for (const tile of hand) map.set(tile.id, tile);
  }
  for (const group of game.board) {
    for (const tile of group) map.set(tile.id, tile);
  }
  return map;
}

function groupType(group) {
  if (!Array.isArray(group) || group.length < 3) return null;
  const colors = new Set(group.map(tile => tile.color));
  const numbers = group.map(tile => tile.number);
  const uniqueNumbers = new Set(numbers);

  if (group.length <= 4 && uniqueNumbers.size === 1 && colors.size === group.length) return "set";
  if (colors.size !== 1 || uniqueNumbers.size !== group.length) return null;
  const sorted = [...numbers].sort((a, b) => a - b);
  for (let index = 1; index < sorted.length; index += 1) {
    if (sorted[index] !== sorted[index - 1] + 1) return null;
  }
  return "run";
}

function normalizeGroup(group) {
  const type = groupType(group);
  if (type === "run") return [...group].sort((left, right) => left.number - right.number);
  return [...group].sort((left, right) => COLOR_ORDER[left.color] - COLOR_ORDER[right.color]);
}

function sameIds(left, right) {
  return left.length === right.length && left.every((tile, index) => tile.id === right[index].id);
}

function currentPlayer(game) {
  return game.players[game.turnIndex] || null;
}

function advanceTurn(game) {
  if (game.players.length) game.turnIndex = (game.turnIndex + 1) % game.players.length;
}

function play(game, playerId, proposedGroups) {
  const id = String(playerId);
  const player = game.players.find(candidate => candidate.id === id);
  if (game.phase !== "playing") return { ok: false, error: "진행 중인 게임이 아닙니다." };
  if (!player || currentPlayer(game)?.id !== id) return { ok: false, error: "지금은 내 차례가 아닙니다." };
  if (!Array.isArray(proposedGroups) || proposedGroups.length > 40) {
    return { ok: false, error: "보드 정보가 올바르지 않습니다." };
  }

  const groups = proposedGroups.map(group => Array.isArray(group) ? group.map(value => String(value)) : null);
  if (groups.some(group => !group || group.length > 13)) return { ok: false, error: "조합 정보가 올바르지 않습니다." };
  const proposedIds = groups.flat();
  if (new Set(proposedIds).size !== proposedIds.length) return { ok: false, error: "같은 타일을 두 번 사용할 수 없습니다." };

  const existingBoardIds = new Set(game.board.flat().map(tile => tile.id));
  const hand = game.hands[id] || [];
  const handIds = new Set(hand.map(tile => tile.id));
  const allowedIds = new Set([...existingBoardIds, ...handIds]);
  if (proposedIds.some(tileId => !allowedIds.has(tileId))) return { ok: false, error: "사용할 수 없는 타일이 포함되어 있습니다." };
  if ([...existingBoardIds].some(tileId => !proposedIds.includes(tileId))) return { ok: false, error: "기존 보드의 타일을 손패로 가져갈 수 없습니다." };

  const playedIds = new Set(proposedIds.filter(tileId => handIds.has(tileId)));
  if (playedIds.size === 0) return { ok: false, error: "내 손패에서 타일을 한 개 이상 내려놓아야 합니다." };
  if (proposedIds.length !== existingBoardIds.size + playedIds.size) return { ok: false, error: "보드의 타일 구성이 올바르지 않습니다." };

  const byId = tileMap(game);
  const tileGroups = groups.map(group => group.map(tileId => byId.get(tileId)));
  if (tileGroups.some(group => group.some(tile => !tile) || !groupType(group))) {
    return { ok: false, error: "모든 조합은 같은 숫자 3~4개 또는 같은 색 연속 숫자 3개 이상이어야 합니다." };
  }

  if (!player.opened) {
    if (tileGroups.length < game.board.length) return { ok: false, error: "최초 등록 전에는 기존 보드를 바꿀 수 없습니다." };
    for (let index = 0; index < game.board.length; index += 1) {
      if (!sameIds(tileGroups[index], game.board[index])) {
        return { ok: false, error: "최초 등록 전에는 기존 보드를 재배치할 수 없습니다." };
      }
    }
    const initialScore = hand.filter(tile => playedIds.has(tile.id)).reduce((sum, tile) => sum + tile.number, 0);
    if (initialScore < 30) return { ok: false, error: `최초 등록은 합계 30점 이상이어야 합니다. 현재 ${initialScore}점입니다.` };
  }

  game.board = tileGroups.map(normalizeGroup);
  game.hands[id] = sortTiles(hand.filter(tile => !playedIds.has(tile.id)));
  player.opened = true;
  game.passCount = 0;
  game.revision += 1;

  if (game.hands[id].length === 0) {
    game.phase = "ended";
    game.winnerId = id;
    game.lastAction = `${player.name}님이 모든 타일을 내려놓아 승리했습니다!`;
    return { ok: true };
  }

  game.lastAction = `${player.name}님이 타일 ${playedIds.size}개를 내려놓았습니다.`;
  advanceTurn(game);
  return { ok: true };
}

function draw(game, playerId) {
  const id = String(playerId);
  const player = game.players.find(candidate => candidate.id === id);
  if (game.phase !== "playing") return { ok: false, error: "진행 중인 게임이 아닙니다." };
  if (!player || currentPlayer(game)?.id !== id) return { ok: false, error: "지금은 내 차례가 아닙니다." };

  const tile = game.deck.pop() || null;
  if (tile) {
    game.hands[id] = sortTiles([...(game.hands[id] || []), tile]);
    game.passCount = 0;
  } else {
    game.passCount += 1;
  }
  game.lastAction = tile
    ? `${player.name}님이 타일 한 개를 뽑았습니다.`
    : `${player.name}님이 더미가 비어 차례를 넘겼습니다.`;
  advanceTurn(game);
  game.revision += 1;
  if (!tile && game.passCount >= game.players.length) {
    const ranked = [...game.players].sort((left, right) => {
      const leftHand = game.hands[left.id] || [];
      const rightHand = game.hands[right.id] || [];
      return leftHand.reduce((sum, item) => sum + item.number, 0) - rightHand.reduce((sum, item) => sum + item.number, 0) ||
        leftHand.length - rightHand.length;
    });
    const winner = ranked[0];
    game.phase = "ended";
    game.winnerId = winner?.id || null;
    game.lastAction = `더 이상 낼 타일이 없어 ${winner?.name || "플레이어"}님이 가장 낮은 손패 점수로 승리했습니다!`;
  }
  return { ok: true };
}

function stateFor(game, playerId) {
  const id = String(playerId);
  return {
    phase: game.phase,
    players: game.players.map(player => ({
      id: player.id,
      name: player.name,
      opened: player.opened,
      tileCount: (game.hands[player.id] || []).length
    })),
    board: game.board.map(group => group.map(tile => ({ ...tile }))),
    hand: sortTiles(game.hands[id] || []).map(tile => ({ ...tile })),
    deckCount: game.deck.length,
    turnPlayerId: currentPlayer(game)?.id || null,
    winnerId: game.winnerId,
    lastAction: game.lastAction,
    revision: game.revision
  };
}

module.exports = {
  COLORS,
  BASE_TILES,
  createGame,
  addPlayer,
  removePlayer,
  resetToLobby,
  startGame,
  groupType,
  play,
  draw,
  stateFor
};
