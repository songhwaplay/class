'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'public/index.html'),'utf8');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
for(const file of ['ocean_original_tiles_forest_v53.png','ocean_original_tiles_desert_v53.png','ocean_original_tiles_river_v53.png']){
  const full=path.join(root,'public/assets/maps',file);assert.ok(fs.existsSync(full),file);assert.ok(fs.statSync(full).size>500000,file+' too small');
}
assert.match(html,/terrainInfo\.type==='river'\)tileAtlas=riverAtlas/);
assert.match(html,/terrainInfo\.type==='forest'\)tileAtlas=forestAtlas/);
assert.match(html,/terrainInfo\.type==='desert'\)tileAtlas=desertAtlas/);
assert.match(html,/const portVisible=!inCity&&!busy&&!!portInteraction/);
assert.match(html,/const cityVisible=!inCity&&!busy&&!!cityInteraction\?\.canUse/);
assert.match(html,/setInterval\(\(\)=>\{if\(joined&&self\)updateHud\(\)\},100\)/);
assert.match(html,/function displayedGameMinutes\(\)/);
assert.match(html,/바깥 바람:/);
assert.match(server,/cityInteraction: player \? cityInteractionForPlayer\(player\) : null/);
assert.match(server,/portInteraction: player \? nearbyCatalogPort\(player\) : null/);
assert.match(server,/socket\.on\('enterCity'/);
assert.match(server,/socket\.on\('useCatalogPort'/);
console.log(JSON.stringify({ok:true,portAndCityPromptIndependent:true,liveHud100ms:true,forest:true,riverBlue:true,desert:true}));
