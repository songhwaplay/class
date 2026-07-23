import test from"node:test";import assert from"node:assert/strict";import{createTrigEquationSet,samePiAnswers}from"../lib/trigonometric-equation-workouts.ts";
test("set includes equation transformations and an inequality",()=>{const p=createTrigEquationSet(1).problems;assert.equal(p.length,5);assert.equal(p.at(-1)?.kind,"inequality");assert.ok(p.some(x=>x.answers.length===4))});
test("equivalent pi fractions are accepted in order",()=>{assert.equal(samePiAnswers([{n:"1",d:"2"}],[{n:2,d:4}]),true)});
