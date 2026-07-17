'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const zlib = require('node:zlib');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'public/index.html'), 'utf8');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
assert.ok(Number(pkg.version.split('.')[0]) >= 50);
assert.match(html, /ocean_original_tiles_lush\.png/);
assert.match(html, /biome_palette_mask\.bin\.gz/);
assert.match(html, /paletteAlpha=biomePaletteMask/);
assert.match(html, /paletteMix|ctx\.globalAlpha=paletteAlpha\/255/);

const lush = path.join(root, 'public/assets/maps/ocean_original_tiles_lush.png');
assert.ok(fs.existsSync(lush));
assert.ok(fs.statSync(lush).size > 500_000, 'lush atlas must contain the full original tile atlas');

const raw = zlib.gunzipSync(fs.readFileSync(path.join(root, 'public/assets/maps/biome_palette_mask.bin.gz')));
assert.equal(raw.length, 2500 * 1250);
function at(lon, lat) {
  const x = Math.max(0, Math.min(2499, Math.floor((lon + 180) / 360 * 2500)));
  const y = Math.max(0, Math.min(1249, Math.floor((90 - lat) / 180 * 1250)));
  return raw[y * 2500 + x];
}
assert.ok(at(-60, -5) > 150, 'Amazon rainforest palette should be strong');
assert.ok(at(22, 0) > 120, 'Congo rainforest palette should be visible');
assert.ok(at(105, 15) > 120, 'Southeast Asian rainforest palette should be visible');
assert.ok(at(15, 25) < 10, 'Sahara must keep the original dry palette');
assert.equal(at(-30, 0), 0, 'ocean must never receive a land palette');
console.log('v50 original palette ok');
