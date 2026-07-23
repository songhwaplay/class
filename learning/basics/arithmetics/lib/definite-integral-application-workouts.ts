export type DefiniteIntegralApplicationKind =
  | "axis-crossing-area"
  | "between-curves"
  | "intersection-split"
  | "linear-velocity-distance"
  | "quadratic-velocity-distance"
  | "position-total-distance";

export type DefiniteIntegralApplicationProblem = {
  id: string;
  kind: DefiniteIntegralApplicationKind;
  label: string;
  prompt: string;
  latex: string;
  answerLabels: string[];
  answers: number[];
};

const KINDS: DefiniteIntegralApplicationKind[] = [
  "axis-crossing-area",
  "between-curves",
  "intersection-split",
  "linear-velocity-distance",
  "quadratic-velocity-distance",
  "position-total-distance",
];

function random(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}
function integer(next: () => number, min: number, max: number) {
  return min + Math.floor(next() * (max - min + 1));
}

function build(
  kind: DefiniteIntegralApplicationKind,
  next: () => number,
  id: string,
): DefiniteIntegralApplicationProblem {
  const scale = integer(next, 1, 4);

  if (kind === "axis-crossing-area") {
    return {
      id, kind, label: "𝑥축과 둘러싸인 넓이",
      prompt: "곡선과 𝑥축으로 둘러싸인 부분의 넓이를 구하세요.",
      latex: `y=${scale}(x^2-9)\\quad(-3\\le x\\le3)`,
      answerLabels: ["넓이"], answers: [36 * scale],
    };
  }

  if (kind === "between-curves") {
    const width = integer(next, 2, 4);
    const height = 3 * integer(next, 1, 3);
    const coefficient = height % (width ** 2) === 0
      ? String(height / (width ** 2))
      : `\\dfrac{${height}}{${width ** 2}}`;
    return {
      id, kind, label: "두 곡선 사이의 넓이",
      prompt: "두 그래프로 둘러싸인 부분의 넓이를 구하세요.",
      latex: `y=${height},\\quad y=${coefficient}x^2\\quad(-${width}\\le x\\le${width})`,
      answerLabels: ["넓이"], answers: [(2 * height * width) / 3],
    };
  }

  if (kind === "intersection-split") {
    return {
      id, kind, label: "교점과 넓이",
      prompt: "두 곡선의 교점을 구한 뒤, 둘러싸인 부분의 넓이를 구하세요.",
      latex: `y=${scale}x^2,\\quad y=${6 * scale}x`,
      answerLabels: ["넓이"], answers: [36 * scale],
    };
  }

  if (kind === "linear-velocity-distance") {
    const turningTime = integer(next, 2, 4);
    return {
      id, kind, label: "속도의 부호 변화",
      prompt: "0초부터 주어진 시각까지 움직인 거리를 구하세요.",
      latex: `v(t)=${scale}(t-${turningTime})\\quad(0\\le t\\le${2 * turningTime})`,
      answerLabels: ["거리"], answers: [scale * turningTime ** 2],
    };
  }

  if (kind === "quadratic-velocity-distance") {
    return {
      id, kind, label: "여러 번 바뀌는 운동 방향",
      prompt: "속도가 0이 되는 시각을 기준으로 나누어 이동거리를 구하세요.",
      latex: `v(t)=${scale}(t-1)(t-3)\\quad(0\\le t\\le4)`,
      answerLabels: ["거리"], answers: [4 * scale],
    };
  }

  return {
    id, kind, label: "위치와 이동거리",
    prompt: "위치함수에서 방향이 바뀌는 시각을 찾아 이동거리를 구하세요.",
    latex: `s(t)=${scale}(t^3-6t^2+9t)\\quad(0\\le t\\le4)`,
    answerLabels: ["거리"], answers: [12 * scale],
  };
}

export function createDefiniteIntegralApplicationSet(seed: number) {
  const next = random(seed);
  return { seed, problems: KINDS.map((kind, index) => build(kind, next, `definite-integral-application-${index}`)) };
}
export function createDefiniteIntegralApplicationReviews(
  kinds: DefiniteIntegralApplicationKind[],
  seed: number,
) {
  const next = random(seed);
  return [...new Set(kinds)].slice(0, 2).map((kind, index) =>
    build(kind, next, `definite-integral-application-review-${index}-${seed}`),
  );
}
