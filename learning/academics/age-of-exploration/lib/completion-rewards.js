'use strict';

function speedMultiplier(finishRank) {
  const rank = Number(finishRank) || 0;
  if (rank === 1) return 10;
  if (rank === 2) return 5;
  if (rank === 3) return 3;
  return 1;
}

module.exports = { speedMultiplier };
