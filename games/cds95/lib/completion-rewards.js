'use strict';

function speedMultiplier(finishRank) {
  const rank = Number(finishRank) || 0;
  if (rank === 1) return 4;
  if (rank === 2) return 3;
  if (rank === 3) return 2;
  if (rank >= 4) return 1.5;
  return 1;
}

module.exports = { speedMultiplier };
