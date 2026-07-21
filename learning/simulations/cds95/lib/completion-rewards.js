'use strict';

function speedMultiplier(finishRank) {
  const rank = Number(finishRank) || 0;
  if (rank === 1) return 1.3;
  if (rank === 2) return 1.2;
  if (rank === 3) return 1.1;
  return 1;
}

module.exports = { speedMultiplier };
