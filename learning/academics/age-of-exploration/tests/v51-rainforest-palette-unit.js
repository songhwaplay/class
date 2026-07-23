'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync('public/index.html','utf8');
assert.doesNotMatch(html,/forestAtlas|desertAtlas|riverAtlas|ocean_original_tiles_(?:lush|forest|desert|river)|biome_palette_mask/);
assert.match(html,/drawNaturalEarthLayer\(cw,ch,left,top\)/);
console.log('synthetic biome recoloring removed; Natural Earth colors preserved');
