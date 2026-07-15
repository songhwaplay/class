'use strict';

const MAX = 100;
const SEA_PER_SECOND = 0.32;
const LAND_PER_SECOND = 0.46;
const IDLE_RECOVERY_PER_SECOND = 0.18;
const CITY_RECOVERY_PER_SECOND = 1.8;
const FATIGUE_SLOWDOWN_START = 60;
const MIN_SPEED_MULTIPLIER = 0.70;

function clamp(value) {
  return Math.max(0, Math.min(MAX, Number(value) || 0));
}

function speedMultiplier(value) {
  const fatigue = clamp(value);
  if (fatigue <= FATIGUE_SLOWDOWN_START) return 1;
  const ratio = (fatigue - FATIGUE_SLOWDOWN_START) / (MAX - FATIGUE_SLOWDOWN_START);
  return Math.max(MIN_SPEED_MULTIPLIER, 1 - (1 - MIN_SPEED_MULTIPLIER) * Math.pow(ratio, 1.35));
}

function nextFatigue({ fatigue, dt, mode, moving, transition, terrainMultiplier = 1, paused = false }) {
  const before = clamp(fatigue);
  if (paused || !(dt > 0)) return before;
  let next = before;
  if (moving && !transition && (mode === 'sea' || mode === 'land')) {
    if (mode === 'sea') next += SEA_PER_SECOND * dt;
    else {
      const exertion = Math.min(1.8, 1 / Math.max(0.55, Number(terrainMultiplier) || 1));
      next += LAND_PER_SECOND * exertion * dt;
    }
  } else if (mode === 'city') next -= CITY_RECOVERY_PER_SECOND * dt;
  else next -= IDLE_RECOVERY_PER_SECOND * dt;
  return clamp(next);
}

module.exports = {
  MAX,
  SEA_PER_SECOND,
  LAND_PER_SECOND,
  IDLE_RECOVERY_PER_SECOND,
  CITY_RECOVERY_PER_SECOND,
  FATIGUE_SLOWDOWN_START,
  MIN_SPEED_MULTIPLIER,
  clamp,
  speedMultiplier,
  nextFatigue
};
