import test from "node:test";
import assert from "node:assert/strict";
import { createExponentialLogDerivativeProblemSet } from "../lib/exponential-log-derivative-workouts.ts";
import { createSigmaRecurrenceSet } from "../lib/sigma-recurrence-workouts.ts";
import { createTranscendentalIntegralProblemSet } from "../lib/transcendental-integral-workouts.ts";
import { createTrigonometricGraphProblemSet } from "../lib/trigonometric-graph-workouts.ts";

test("고등 문제식은 0인 항을 +0 또는 -0으로 표시하지 않는다", () => {
  for (let seed = 1; seed <= 200; seed += 1) {
    const latexValues = [
      ...createExponentialLogDerivativeProblemSet(seed).problems.map(({ latex }) => latex),
      ...createTranscendentalIntegralProblemSet(seed).problems.map(({ latex }) => latex),
      ...createTrigonometricGraphProblemSet(seed).problems.map(({ latex }) => latex),
      ...createSigmaRecurrenceSet(seed).problems.map(({ latex }) => latex),
    ];
    for (const latex of latexValues) {
      assert.doesNotMatch(latex, /[+-]0(?![0-9])/);
    }
  }
});
