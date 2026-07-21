"use strict";

const crypto = require("crypto");

const COLORS = Object.freeze(["ember", "tide", "leaf", "volt"]);
const ACTION_KINDS = Object.freeze(["skip", "turn", "draw2"]);
const HAND_SIZE = 7;
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 4;

function randomInt(max) {
  return crypto.randomInt(max);
}

function shuffle(items, pick = randomInt) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const chosen = pick(index + 1);
    [result[index], result[chosen]] = [result[chosen], result[index]];
  }
  return result;
}

function buildDeck() {
  const deck = [];
  for (const color of COLORS) {
    for (let value = 0; value <= 9; value += 1) {
      deck.push({ id: `${color}-number-${value}`, color, kind: "number", value });
    }
    for (const kind of ACTION_KINDS) {
      for (let copy = 1; copy <= 2; copy += 1) {
        deck.push({ id: `${color}-${kind}-${copy}`, color, kind, value: kind });
      }
    }
  }
  for (let copy = 1; copy <= 4; copy += 1) {
    deck.push({ id: `shift-${copy}`, color: "shift", kind: "shift", value: "shift" });
  }
  return deck;
}

function cleanName(value, fallback) {
  return String(value || "").trim().slice(0, 12) || fallback;
}

function createGame(hostId, hostName) {
  return {
    phase: "lobby",
    players: [{ id: String(hostId), name: cleanName(hostName, "방장") }],
    hands: {},
    deck: [],
    discard: [],
    activeColor: null,
    direction: 1,
    turnIndex: 0,
    winnerId: null,
    round: 0,
    lastAction: "플레이어를 기다리고 있습니다.",
    actionNumber: 0
  };
}

function addPlayer(game, playerId, name) {
  const id = String(playerId);
  if (game.phase !== "lobby") return { ok: false, error: "이미 시작한 게임입니다." };
  if (game.players.some(player => player.id === id)) return { ok: true };
  if (game.players.length >= MAX_PLAYERS) return { ok: false, error: "방이 가득 찼습니다." };
  game.players.push({ id, name: cleanName(name, `플레이어 ${game.players.length + 1}`) });
  return { ok: true };
}

function removePlayer(game, playerId) {
  const id = String(playerId);
  game.players = game.players.filter(player => player.id !== id);
  delete game.hands[id];
}

function resetToLobby(game, message = "대기실로 돌아왔습니다.") {
  game.phase = "lobby";
  game.hands = {};
  game.deck = [];
  game.discard = [];
  game.activeColor = null;
  game.direction = 1;
  game.turnIndex = 0;
  game.winnerId = null;
  game.lastAction = message;
  game.actionNumber += 1;
  return { ok: true };
}

function topCard(game) {
  return game.discard.at(-1) || null;
}

function activePlayer(game) {
  return game.players[game.turnIndex] || null;
}

function advanceIndex(game, fromIndex, steps = 1) {
  const count = game.players.length;
  return ((fromIndex + (game.direction * steps)) % count + count) % count;
}

function replenishDeck(game, pick = randomInt) {
  if (game.deck.length || game.discard.length <= 1) return;
  const top = game.discard.pop();
  game.deck = shuffle(game.discard, pick);
  game.discard = [top];
}

function drawCards(game, playerId, count, pick = randomInt) {
  const hand = game.hands[String(playerId)];
  if (!hand) return [];
  const drawn = [];
  for (let index = 0; index < count; index += 1) {
    replenishDeck(game, pick);
    const card = game.deck.pop();
    if (!card) break;
    hand.push(card);
    drawn.push(card);
  }
  return drawn;
}

function isPlayable(card, currentTop, activeColor) {
  if (!card || !currentTop) return false;
  if (card.kind === "shift") return true;
  if (card.color === activeColor) return true;
  if (card.kind === "number" && currentTop.kind === "number") return card.value === currentTop.value;
  return card.kind !== "number" && card.kind === currentTop.kind;
}

function startMatch(game, pick = randomInt) {
  if (game.phase !== "lobby" && game.phase !== "finished") {
    return { ok: false, error: "지금은 새 게임을 시작할 수 없습니다." };
  }
  if (game.players.length < MIN_PLAYERS || game.players.length > MAX_PLAYERS) {
    return { ok: false, error: "2명부터 4명까지 모여야 시작할 수 있습니다." };
  }

  game.phase = "playing";
  game.round += 1;
  game.hands = Object.fromEntries(game.players.map(player => [player.id, []]));
  game.deck = shuffle(buildDeck(), pick);
  game.discard = [];
  game.activeColor = null;
  game.direction = 1;
  game.turnIndex = 0;
  game.winnerId = null;

  for (let cardIndex = 0; cardIndex < HAND_SIZE; cardIndex += 1) {
    for (const player of game.players) drawCards(game, player.id, 1, pick);
  }

  const firstNumberIndex = game.deck.findLastIndex(card => card.kind === "number");
  const [firstCard] = game.deck.splice(firstNumberIndex, 1);
  game.discard.push(firstCard);
  game.activeColor = firstCard.color;
  game.lastAction = `${game.players[0].name}님의 차례로 게임을 시작합니다.`;
  game.actionNumber += 1;
  return { ok: true };
}

function playCard(game, playerId, message, pick = randomInt) {
  if (game.phase !== "playing") return { ok: false, error: "진행 중인 게임이 없습니다." };
  const actor = activePlayer(game);
  if (!actor || actor.id !== String(playerId)) return { ok: false, error: "현재 차례가 아닙니다." };

  const hand = game.hands[actor.id];
  const cardIndex = hand.findIndex(card => card.id === String(message.cardId || ""));
  if (cardIndex < 0) return { ok: false, error: "내 손에 없는 카드입니다." };
  const card = hand[cardIndex];
  if (!isPlayable(card, topCard(game), game.activeColor)) {
    return { ok: false, error: "현재 카드와 색상, 숫자 또는 기호가 맞지 않습니다." };
  }

  let chosenColor = null;
  if (card.kind === "shift") {
    chosenColor = String(message.color || "");
    if (!COLORS.includes(chosenColor)) return { ok: false, error: "시프트 카드의 색상을 선택하세요." };
  }

  hand.splice(cardIndex, 1);
  game.discard.push(card);
  game.activeColor = card.kind === "shift" ? chosenColor : card.color;

  const actionParts = [`${actor.name}님이 ${card.kind === "number" ? card.value : card.kind.toUpperCase()} 카드를 냈습니다.`];
  if (hand.length === 0) {
    game.phase = "finished";
    game.winnerId = actor.id;
    game.lastAction = `${actor.name}님이 마지막 카드를 내고 승리했습니다!`;
    game.actionNumber += 1;
    return { ok: true };
  }

  if (hand.length === 1) {
    if (message.callLast === true) actionParts.push("LAST! 선언 성공.");
    else {
      drawCards(game, actor.id, 2, pick);
      actionParts.push("LAST! 선언을 놓쳐 카드 2장을 받았습니다.");
    }
  }

  let steps = 1;
  if (card.kind === "skip") {
    steps = 2;
    actionParts.push("다음 플레이어의 차례를 건너뜁니다.");
  } else if (card.kind === "turn") {
    game.direction *= -1;
    steps = game.players.length === 2 ? 2 : 1;
    actionParts.push("진행 방향이 바뀌었습니다.");
  } else if (card.kind === "draw2") {
    const targetIndex = advanceIndex(game, game.turnIndex, 1);
    const target = game.players[targetIndex];
    drawCards(game, target.id, 2, pick);
    steps = 2;
    actionParts.push(`${target.name}님이 카드 2장을 받고 차례를 쉽니다.`);
  } else if (card.kind === "shift") {
    actionParts.push(`활성 색상이 ${chosenColor.toUpperCase()}로 바뀌었습니다.`);
  }

  game.turnIndex = advanceIndex(game, game.turnIndex, steps);
  game.lastAction = actionParts.join(" ");
  game.actionNumber += 1;
  return { ok: true };
}

function drawAndPass(game, playerId, pick = randomInt) {
  if (game.phase !== "playing") return { ok: false, error: "진행 중인 게임이 없습니다." };
  const actor = activePlayer(game);
  if (!actor || actor.id !== String(playerId)) return { ok: false, error: "현재 차례가 아닙니다." };
  const count = drawCards(game, actor.id, 1, pick).length;
  game.turnIndex = advanceIndex(game, game.turnIndex, 1);
  game.lastAction = count
    ? `${actor.name}님이 카드 1장을 뽑고 차례를 넘겼습니다.`
    : `${actor.name}님이 뽑을 카드가 없어 차례를 넘겼습니다.`;
  game.actionNumber += 1;
  return { ok: true };
}

function stateFor(game, viewerId) {
  const viewer = String(viewerId);
  return {
    phase: game.phase,
    round: game.round,
    turnPlayerId: game.phase === "playing" ? activePlayer(game)?.id || null : null,
    players: game.players.map(player => ({
      id: player.id,
      name: player.name,
      handCount: (game.hands[player.id] || []).length
    })),
    hand: game.phase === "playing" ? [...(game.hands[viewer] || [])] : [],
    topCard: topCard(game),
    activeColor: game.activeColor,
    direction: game.direction,
    deckCount: game.deck.length,
    winnerId: game.winnerId,
    lastAction: game.lastAction,
    actionNumber: game.actionNumber
  };
}

module.exports = {
  COLORS,
  ACTION_KINDS,
  HAND_SIZE,
  MIN_PLAYERS,
  MAX_PLAYERS,
  buildDeck,
  shuffle,
  createGame,
  addPlayer,
  removePlayer,
  resetToLobby,
  startMatch,
  playCard,
  drawAndPass,
  isPlayable,
  stateFor
};
