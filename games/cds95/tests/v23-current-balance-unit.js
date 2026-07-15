'use strict';
const assert=require('node:assert/strict');const Current=require('../public/js/ocean-current.js');
const tail=Current.movementFactor(1,.30,.08,.14),cross=Current.movementFactor(0,.30,.08,.14),head=Current.movementFactor(-1,.30,.08,.14);
assert.equal(tail,.30);assert.equal(cross,.14);assert.equal(head,.08);assert.ok(tail>cross&&cross>head);
console.log(JSON.stringify({ok:true,tail,cross,head}));
