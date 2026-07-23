import test from"node:test";import assert from"node:assert/strict";import{createSigmaRecurrenceSet,sameSigmaRecurrenceAnswer}from"../lib/sigma-recurrence-workouts.ts";
test("set covers three sums and two recurrence calculations",()=>{assert.deepEqual(createSigmaRecurrenceSet(1).problems.map(p=>p.kind),["linear-sigma","square-sigma","geometric-sigma","difference-recurrence","affine-recurrence"])});
test("answers are exact integers",()=>{assert.equal(sameSigmaRecurrenceAnswer("125",125),true);assert.equal(sameSigmaRecurrenceAnswer("125.0",125),false)});
