export type CircleProblem = { id: string; givenLabel: "반지름" | "지름"; given: number; target: "둘레" | "넓이"; unit: "cm" | "mm" | "m"; answer: number };

function random(seed: number) { let value = seed >>> 0; return () => { value += 0x6d2b79f5; let next = value; next = Math.imul(next ^ (next >>> 15), next | 1); next ^= next + Math.imul(next ^ (next >>> 7), next | 61); return ((next ^ (next >>> 14)) >>> 0) / 4294967296; }; }
function integer(next: () => number, minimum: number, maximum: number) { return minimum + Math.floor(next() * (maximum - minimum + 1)); }
function rounded(value: number) { return Number(value.toFixed(2)); }

export function createGradeSixCircleSet(seed: number): CircleProblem[] {
  const next = random(seed);
  const sources = [["반지름", integer(next, 1, 5), "둘레", "cm"], ["반지름", integer(next, 1, 5), "넓이", "mm"], ["반지름", integer(next, 6, 9), "넓이", "cm"], ["지름", integer(next, 7, 10) * 2 - 1, "둘레", "m"], ["지름", integer(next, 5, 10) * 2, "넓이", "m"], ["지름", integer(next, 5, 12) * 2, "넓이", "cm"], ["지름", integer(next, 12, 15) * 2 - 1, "둘레", "cm"], ["지름", integer(next, 2, 5) * 2 - 1, "둘레", "m"]] as const;
  return sources.map(([givenLabel, given, target, unit], index) => { const radius = givenLabel === "반지름" ? given : given / 2; const answer = target === "둘레" ? rounded(radius * 2 * 3.14) : rounded(radius * radius * 3.14); return { id: `grade-six-circle-${index + 1}`, givenLabel, given, target, unit, answer }; });
}

export function normalizeCircleAnswer(input: string) { const value = Number(input.replace(/[^0-9.-]/g, "")); return input.trim() && Number.isFinite(value) ? value : null; }
