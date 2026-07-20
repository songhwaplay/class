import assert from "node:assert/strict";
import test from "node:test";
import { rankArrivedParticipants } from "../lib/arithmetic-race-ranking.ts";

test("shows only fully correct arrivals and ranks mistakes before arrival time", () => {
  const ranked = rankArrivedParticipants([
    { name: "미도착", submitted_at: null, correct_count: 10, total_count: 10, mistake_count: 0 },
    { name: "오답남음", submitted_at: null, correct_count: 9, total_count: 10, mistake_count: 1 },
    { name: "한번에늦게", submitted_at: 2000, correct_count: 10, total_count: 10, mistake_count: 0 },
    { name: "두개오답빨리", submitted_at: 500, correct_count: 10, total_count: 10, mistake_count: 2 },
    { name: "한개오답", submitted_at: 700, correct_count: 10, total_count: 10, mistake_count: 1 },
    { name: "한번에빨리", submitted_at: 1000, correct_count: 10, total_count: 10, mistake_count: 0 },
  ]);

  assert.deepEqual(ranked.map((participant) => participant.name), [
    "한번에빨리",
    "한번에늦게",
    "한개오답",
    "두개오답빨리",
  ]);
});
