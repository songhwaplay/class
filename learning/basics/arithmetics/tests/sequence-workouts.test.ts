import test from"node:test";import assert from"node:assert/strict";import{createSequenceSet,sameSequenceAnswer}from"../lib/sequence-workouts.ts";
test("sequence set covers terms, inverse difference, and sums",()=>{assert.deepEqual(createSequenceSet(1).problems.map(p=>p.kind),["arithmetic-term","arithmetic-difference","arithmetic-sum","geometric-term","geometric-sum"])});
test("sequence answers stay exact integers",()=>{assert.equal(sameSequenceAnswer("-12",-12),true);assert.equal(sameSequenceAnswer("-12.0",-12),false)});
