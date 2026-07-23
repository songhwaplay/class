export type ProportionProblem = { id: string; prompt: string; answer: string; guide: string };

function random(seed: number) { let value = seed >>> 0; return () => { value += 0x6d2b79f5; let next = value; next = Math.imul(next ^ (next >>> 15), next | 1); next ^= next + Math.imul(next ^ (next >>> 7), next | 61); return ((next ^ (next >>> 14)) >>> 0) / 4294967296; }; }
function integer(next: () => number, min: number, max: number) { return min + Math.floor(next() * (max - min + 1)); }
function gcd(a: number, b: number): number { while (b) [a, b] = [b, a % b]; return a; }
function simplify(a: number, b: number) { const d = gcd(a, b); return `${a / d} : ${b / d}`; }

export function normalizeProportionAnswer(answer: string) { return answer.replace(/\s/g, "").replace(/:/g, ":").replace(/,/g, ","); }
export function createGradeSixProportionSet(seed: number): ProportionProblem[] {
  const next = random(seed);
  const a = integer(next, 2, 5), b = integer(next, 2, 6), c = integer(next, 2, 7);
  const total = integer(next, 8, 16) * (a + b);
  const left = total / (a + b) * a, right = total / (a + b) * b;
  const x1 = integer(next, 2, 9), y1 = integer(next, 2, 9), scale1 = integer(next, 2, 8);
  const x2 = integer(next, 2, 9), y2 = integer(next, 2, 9), scale2 = integer(next, 2, 8);
  const p = integer(next, 2, 8), q = integer(next, 2, 8);
  return [
    { id: "proportion-1", prompt: `가 : 나 = ${a} : ${b}, 가 : 다 = ${a} : ${c}일 때 가 : 나 : 다`, answer: `${a} : ${b} : ${c}`, guide: "세 수의 비" },
    { id: "proportion-2", prompt: `${total}을 ${a} : ${b}로 비례배분`, answer: `${left}, ${right}`, guide: "앞, 뒤 순서" },
    { id: "proportion-3", prompt: `${x1 * scale1} : ${y1 * scale1} = ${x1} : □`, answer: String(y1), guide: "빈칸에 들어갈 수" },
    { id: "proportion-4", prompt: `□ : ${y2 * scale2} = ${x2} : ${y2}`, answer: String(x2 * scale2), guide: "빈칸에 들어갈 수" },
    { id: "proportion-5", prompt: `${p * 10} : ${q * 10}을 가장 간단한 자연수의 비로`, answer: simplify(p * 10, q * 10), guide: "간단한 비" },
    { id: "proportion-6", prompt: `${p * 3} : ${q * 3} = ${p} : ${q} 가 맞는지`, answer: "맞다", guide: "맞다 또는 아니다" },
  ];
}
