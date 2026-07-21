'use strict';
const assert = require('node:assert/strict');
const Fatigue = require('../lib/fatigue.js');

assert.equal(Fatigue.clamp(-4), 0);
assert.equal(Fatigue.clamp(140), 100);
assert.equal(Fatigue.speedMultiplier(0), 1);
assert.equal(Fatigue.speedMultiplier(59), 1);
assert.equal(Fatigue.speedMultiplier(60), 1);
assert.ok(Fatigue.speedMultiplier(70) < 0.97 && Fatigue.speedMultiplier(70) > 0.94);
assert.ok(Fatigue.speedMultiplier(80) < 0.90 && Fatigue.speedMultiplier(80) > 0.86);
assert.ok(Fatigue.speedMultiplier(90) < 0.82 && Fatigue.speedMultiplier(90) > 0.78);
assert.equal(Fatigue.speedMultiplier(100), 0.70);

const sea10s = Fatigue.nextFatigue({ fatigue:0, dt:10, mode:'sea', moving:true, transition:null });
const plain10s = Fatigue.nextFatigue({ fatigue:0, dt:10, mode:'land', moving:true, transition:null, terrainMultiplier:0.88 });
const mountain10s = Fatigue.nextFatigue({ fatigue:0, dt:10, mode:'land', moving:true, transition:null, terrainMultiplier:0.30 });
assert.ok(sea10s > 3 && sea10s < 3.3);
assert.ok(plain10s > sea10s);
assert.ok(mountain10s > plain10s);

const rested = Fatigue.nextFatigue({ fatigue:60, dt:10, mode:'city', moving:false, transition:null });
assert.equal(rested, 42);
const idle = Fatigue.nextFatigue({ fatigue:60, dt:10, mode:'sea', moving:false, transition:null });
assert.ok(idle > 58 && idle < 59);

console.log(JSON.stringify({
  ok:true,
  speedAt60:+Fatigue.speedMultiplier(60).toFixed(3),
  speedAt70:+Fatigue.speedMultiplier(70).toFixed(3),
  speedAt80:+Fatigue.speedMultiplier(80).toFixed(3),
  speedAt90:+Fatigue.speedMultiplier(90).toFixed(3),
  speedAt100:Fatigue.speedMultiplier(100),
  sea10s:+sea10s.toFixed(2),
  plain10s:+plain10s.toFixed(2),
  mountain10s:+mountain10s.toFixed(2),
  cityRest10s:rested
}));
