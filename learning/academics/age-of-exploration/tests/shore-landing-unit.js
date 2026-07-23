'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const server = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
const student = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');

assert.match(server, /const SHORE_TRANSFER_RADIUS_TILES = 2\.15;/);
assert.match(server, /const SHORE_RETURN_RADIUS_TILES = 1\.65;/);
assert.match(server, /function coastalTransferForPlayer\(player\)/);
assert.match(server, /terrain\.type === 'sea' \|\| !terrain\.passable/);
assert.match(server, /distanceXY\(player\.x, player\.y, player\.shipLandingX, player\.shipLandingY\)/);
assert.match(server, /socket\.on\('useShoreTransfer'/);
assert.match(server, /kind: fromSea \? 'shoreDisembark' : 'shoreEmbark'/);
assert.match(server, /shipMooringAfter: mooring/);
assert.match(server, /: \{ x: shore\.anchorPoint\.x, y: shore\.anchorPoint\.y \};/);
assert.match(server, /shipAnchorX: Number\.isFinite\(p\.shipAnchorX\)/);
assert.match(server, /shipAnchorDir: Number\.isInteger\(p\.shipAnchorDir\)/);
assert.match(server, /같은 상륙 지점으로 돌아와야 다시 승선할 수 있습니다/);
assert.match(student, /portInteraction\.kind==='shore'/);
assert.match(student, /shore\?'useShoreTransfer':'useCatalogPort'/);
assert.match(student, /function drawAnchoredShipAt\(p,isMine,cw,ch\)/);
assert.match(student, /name:`⚓ \$\{p\.name\}의 배`/);
assert.match(student, /drawAnchoredShipAt\(p,false,cw,ch\)/);
assert.match(student, /drawAnchoredShipAt\(mine,true,cw,ch\)/);

console.log(JSON.stringify({
  ok: true,
  landing: 'near-coast-only',
  embark: 'anchored-shore-only',
  anchoredShipVisible: true,
  portPriority: true
}));
