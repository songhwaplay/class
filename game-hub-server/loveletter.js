"use strict";

const crypto = require("crypto");

const CARD_NAMES = Object.freeze({
  1: "근위병",
  2: "마법사",
  3: "기사",
  4: "요정",
  5: "왕자",
  6: "왕",
  7: "왕비",
  8: "공주"
});
const BASE_DECK = Object.freeze([1, 1, 1, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 7, 8]);
const TARGET_SCORES = Object.freeze({ 3: 5, 4: 4 });

function randomInt(maximum) {
  return crypto.randomInt(maximum);
}

function shuffle(values, pick = randomInt) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = pick(index + 1);
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

function createPlayer(id, name) {
  return {
    id: String(id),
    name: String(name || "플레이어").trim() || "플레이어",
    score: 0,
    alive: true,
    protected: false,
    discarded: []
  };
}

function createGame(hostId, hostName) {
  return {
    phase: "lobby",
    players: [createPlayer(hostId, hostName || "방장")],
    hands: {},
    deck: [],
    setAside: null,
    round: 0,
    targetScore: 0,
    turnIndex: 0,
    starterId: String(hostId),
    roundWinnerIds: [],
    gameWinnerIds: [],
    revealedHands: {},
    roundReason: null,
    lastAction: "플레이어를 기다리는 중입니다.",
    actionNumber: 0
  };
}

function addPlayer(game, id, name) {
  const safeId = String(id);
  if (game.phase !== "lobby" || game.players.some(player => player.id === safeId) || game.players.length >= 4) return false;
  game.players.push(createPlayer(safeId, name));
  game.lastAction = `${String(name || "플레이어").trim() || "플레이어"}님이 입장했습니다.`;
  return true;
}

function removePlayer(game, id) {
  const safeId = String(id);
  const before = game.players.length;
  game.players = game.players.filter(player => player.id !== safeId);
  delete game.hands[safeId];
  return game.players.length !== before;
}

function resetToLobby(game, notice = "대기실로 돌아왔습니다.") {
  game.phase = "lobby";
  game.players.forEach(player => {
    player.score = 0;
    player.alive = true;
    player.protected = false;
    player.discarded = [];
  });
  game.hands = {};
  game.deck = [];
  game.setAside = null;
  game.round = 0;
  game.targetScore = 0;
  game.turnIndex = 0;
  game.roundWinnerIds = [];
  game.gameWinnerIds = [];
  game.revealedHands = {};
  game.roundReason = null;
  game.lastAction = notice;
  game.actionNumber += 1;
}

function playerById(game, id) {
  return game.players.find(player => player.id === String(id));
}

function cardName(value) {
  return CARD_NAMES[value] || `카드 ${value}`;
}

function startMatch(game, pick = randomInt) {
  if (game.phase !== "lobby" || !TARGET_SCORES[game.players.length]) {
    return { ok: false, error: "3명 또는 4명이 모여야 시작할 수 있습니다." };
  }
  game.players.forEach(player => { player.score = 0; });
  game.round = 0;
  game.targetScore = TARGET_SCORES[game.players.length];
  game.starterId = game.players[0].id;
  startRound(game, pick);
  return { ok: true, reveals: [] };
}

function startRound(game, pick = randomInt) {
  game.phase = "playing";
  game.round += 1;
  game.deck = shuffle(BASE_DECK, pick);
  game.setAside = game.deck.shift();
  game.hands = {};
  game.roundWinnerIds = [];
  game.gameWinnerIds = [];
  game.revealedHands = {};
  game.roundReason = null;
  game.players.forEach(player => {
    player.alive = true;
    player.protected = false;
    player.discarded = [];
    game.hands[player.id] = [game.deck.shift()];
  });
  const starterIndex = game.players.findIndex(player => player.id === game.starterId);
  game.turnIndex = starterIndex >= 0 ? starterIndex : 0;
  beginTurn(game);
  game.lastAction = `${game.players[game.turnIndex].name}님부터 라운드를 시작합니다.`;
  game.actionNumber += 1;
}

function beginTurn(game) {
  const player = game.players[game.turnIndex];
  if (!player || !player.alive) return;
  player.protected = false;
  if (game.deck.length) game.hands[player.id].push(game.deck.shift());
}

function activePlayer(game) {
  return game.players[game.turnIndex] || null;
}

function eligibleOtherTargets(game, actorId) {
  return game.players.filter(player => player.alive && !player.protected && player.id !== actorId);
}

function validatePlay(game, actor, card, targetId, guess) {
  const hand = game.hands[actor.id] || [];
  if (!hand.includes(card)) return "손에 없는 카드입니다.";
  if (hand.includes(7) && (hand.includes(5) || hand.includes(6)) && card !== 7) {
    return "왕자 또는 왕과 함께 들고 있으면 왕비를 내야 합니다.";
  }

  const otherTargets = eligibleOtherTargets(game, actor.id);
  if ([1, 2, 3, 6].includes(card)) {
    if (!otherTargets.length) return null;
    const target = playerById(game, targetId);
    if (!target || !otherTargets.some(player => player.id === target.id)) return "효과를 적용할 상대를 선택하세요.";
  }
  if (card === 1 && otherTargets.length && (!Number.isInteger(guess) || guess < 2 || guess > 8)) {
    return "근위병으로 추측할 카드를 선택하세요.";
  }
  if (card === 5) {
    const target = playerById(game, targetId);
    const valid = target && target.alive && (target.id === actor.id || !target.protected);
    if (!valid) return "왕자의 효과를 적용할 플레이어를 선택하세요.";
  }
  return null;
}

function discardHandAndEliminate(game, player) {
  const hand = game.hands[player.id] || [];
  player.discarded.push(...hand);
  game.hands[player.id] = [];
  player.alive = false;
  player.protected = false;
}

function makeReveal(playerId, title, message, card) {
  return { playerId, title, message, card };
}

function resolveCard(game, actor, card, targetId, guess) {
  const reveals = [];
  const target = playerById(game, targetId);
  const targetCard = target ? game.hands[target.id]?.[0] : null;
  let detail = `${actor.name}님이 ${cardName(card)} 카드를 냈습니다.`;

  if (card === 1 && target) {
    if (targetCard === guess) {
      discardHandAndEliminate(game, target);
      detail = `${actor.name}님이 ${cardName(guess)}을(를) 맞혀 ${target.name}님이 탈락했습니다.`;
    } else {
      detail = `${actor.name}님이 ${target.name}님의 카드를 추측했지만 빗나갔습니다.`;
    }
  } else if (card === 2 && target) {
    reveals.push(makeReveal(actor.id, `${target.name}님의 카드`, `${target.name}님은 ${cardName(targetCard)}을(를) 들고 있습니다.`, targetCard));
    detail = `${actor.name}님이 ${target.name}님의 카드를 몰래 확인했습니다.`;
  } else if (card === 3 && target) {
    const actorCard = game.hands[actor.id]?.[0];
    reveals.push(makeReveal(actor.id, `${target.name}님과 비교`, `${target.name}님의 카드는 ${cardName(targetCard)}입니다.`, targetCard));
    reveals.push(makeReveal(target.id, `${actor.name}님과 비교`, `${actor.name}님의 카드는 ${cardName(actorCard)}입니다.`, actorCard));
    if (actorCard < targetCard) {
      discardHandAndEliminate(game, actor);
      detail = `${actor.name}님과 ${target.name}님이 비교해 ${actor.name}님이 탈락했습니다.`;
    } else if (actorCard > targetCard) {
      discardHandAndEliminate(game, target);
      detail = `${actor.name}님과 ${target.name}님이 비교해 ${target.name}님이 탈락했습니다.`;
    } else {
      detail = `${actor.name}님과 ${target.name}님의 숫자가 같아 아무도 탈락하지 않았습니다.`;
    }
  } else if (card === 4) {
    actor.protected = true;
    detail = `${actor.name}님은 다음 자기 차례까지 다른 카드 효과로부터 보호됩니다.`;
  } else if (card === 5 && target) {
    const discarded = game.hands[target.id]?.shift();
    if (Number.isInteger(discarded)) target.discarded.push(discarded);
    if (discarded === 8) {
      target.alive = false;
      target.protected = false;
      detail = `${target.name}님이 공주를 버려 즉시 탈락했습니다.`;
    } else {
      const drawFromDeck = game.deck.length > 0;
      const replacement = drawFromDeck ? game.deck.shift() : game.setAside;
      if (!drawFromDeck) game.setAside = null;
      if (Number.isInteger(replacement)) game.hands[target.id] = [replacement];
      detail = `${target.name}님이 손의 카드를 버리고 새 카드 한 장을 뽑았습니다.`;
    }
  } else if (card === 6 && target) {
    const actorHand = game.hands[actor.id];
    game.hands[actor.id] = game.hands[target.id];
    game.hands[target.id] = actorHand;
    detail = `${actor.name}님과 ${target.name}님이 손의 카드를 서로 바꿨습니다.`;
  } else if (card === 7) {
    detail = `${actor.name}님이 왕비를 냈습니다.`;
  } else if (card === 8) {
    discardHandAndEliminate(game, actor);
    detail = `${actor.name}님이 공주를 내어 즉시 탈락했습니다.`;
  }
  return { reveals, detail };
}

function discardTotal(player) {
  return player.discarded.reduce((sum, value) => sum + value, 0);
}

function finishRound(game, reason) {
  const alive = game.players.filter(player => player.alive);
  let winners = alive;
  if (alive.length > 1) {
    const highestCard = Math.max(...alive.map(player => game.hands[player.id]?.[0] || 0));
    winners = alive.filter(player => (game.hands[player.id]?.[0] || 0) === highestCard);
    if (winners.length > 1) {
      const highestDiscard = Math.max(...winners.map(discardTotal));
      winners = winners.filter(player => discardTotal(player) === highestDiscard);
    }
  }

  game.revealedHands = Object.fromEntries(alive.map(player => [player.id, game.hands[player.id]?.[0] || null]));
  winners.forEach(player => { player.score += 1; });
  game.roundWinnerIds = winners.map(player => player.id);
  game.starterId = winners[0]?.id || game.players[0]?.id || "";
  game.roundReason = reason;
  game.gameWinnerIds = winners.filter(player => player.score >= game.targetScore).map(player => player.id);
  game.phase = game.gameWinnerIds.length ? "gameEnd" : "roundEnd";
  const names = winners.map(player => player.name).join(", ");
  game.lastAction = `${names}님이 ${reason === "lastPlayer" ? "마지막까지 살아남아" : "가장 높은 카드를 남겨"} 라운드에서 승리했습니다.`;
  game.actionNumber += 1;
}

function advanceTurn(game) {
  for (let offset = 1; offset <= game.players.length; offset += 1) {
    const nextIndex = (game.turnIndex + offset) % game.players.length;
    if (game.players[nextIndex].alive) {
      game.turnIndex = nextIndex;
      beginTurn(game);
      return;
    }
  }
}

function play(game, playerId, message) {
  if (game.phase !== "playing") return { ok: false, error: "진행 중인 라운드가 없습니다." };
  const actor = activePlayer(game);
  if (!actor || actor.id !== String(playerId)) return { ok: false, error: "현재 차례가 아닙니다." };
  const card = Number(message.card);
  const guess = Number(message.guess);
  const targetId = message.targetId == null ? "" : String(message.targetId);
  const validationError = validatePlay(game, actor, card, targetId, guess);
  if (validationError) return { ok: false, error: validationError };

  const hand = game.hands[actor.id];
  hand.splice(hand.indexOf(card), 1);
  actor.discarded.push(card);
  const hasOtherTarget = eligibleOtherTargets(game, actor.id).length > 0;
  const effectiveTargetId = [1, 2, 3, 6].includes(card) && !hasOtherTarget ? "" : targetId;
  const resolution = resolveCard(game, actor, card, effectiveTargetId, guess);
  game.lastAction = resolution.detail;
  game.actionNumber += 1;

  const aliveCount = game.players.filter(player => player.alive).length;
  if (aliveCount === 1) finishRound(game, "lastPlayer");
  else if (game.deck.length === 0) finishRound(game, "deckEmpty");
  else advanceTurn(game);

  return { ok: true, reveals: resolution.reveals };
}

function nextRound(game, pick = randomInt) {
  if (game.phase !== "roundEnd") return { ok: false, error: "다음 라운드를 시작할 수 없습니다." };
  startRound(game, pick);
  return { ok: true, reveals: [] };
}

function newGame(game, pick = randomInt) {
  if (game.phase !== "gameEnd") return { ok: false, error: "새 게임을 시작할 수 없습니다." };
  game.players.forEach(player => { player.score = 0; });
  game.round = 0;
  game.starterId = game.players[0]?.id || "";
  startRound(game, pick);
  return { ok: true, reveals: [] };
}

function stateFor(game, viewerId) {
  const safeViewer = String(viewerId);
  const revealFinalCards = game.phase === "roundEnd" || game.phase === "gameEnd";
  return {
    phase: game.phase,
    round: game.round,
    targetScore: game.targetScore,
    turnPlayerId: game.phase === "playing" ? activePlayer(game)?.id || null : null,
    deckCount: game.deck.length,
    hand: game.phase === "playing" ? [...(game.hands[safeViewer] || [])] : [],
    players: game.players.map(player => ({
      id: player.id,
      name: player.name,
      score: player.score,
      alive: player.alive,
      protected: player.protected,
      discarded: [...player.discarded],
      handCount: (game.hands[player.id] || []).length,
      finalCard: revealFinalCards ? game.revealedHands[player.id] || null : null
    })),
    roundWinnerIds: [...game.roundWinnerIds],
    gameWinnerIds: [...game.gameWinnerIds],
    roundReason: game.roundReason,
    lastAction: game.lastAction,
    actionNumber: game.actionNumber
  };
}

module.exports = {
  BASE_DECK,
  CARD_NAMES,
  TARGET_SCORES,
  createGame,
  addPlayer,
  removePlayer,
  resetToLobby,
  startMatch,
  nextRound,
  newGame,
  play,
  stateFor,
  shuffle
};
