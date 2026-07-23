export type InequalityKind =
  | "rational-inequality"
  | "absolute-inequality"
  | "system-inequality"
  | "repeated-root-inequality";

export type SolutionPiece =
  | {
    kind: "interval";
    left: number | "-inf";
    right: number | "inf";
    leftClosed: boolean;
    rightClosed: boolean;
  }
  | {
    kind: "point";
    value: number;
  };

export type InequalityProblem = {
  id: string;
  kind: InequalityKind;
  label: string;
  expression: string;
  solution: SolutionPiece[];
};

export type InequalityProblemSet = {
  seed: number;
  problems: InequalityProblem[];
};

export type InequalityChoice = {
  solution: SolutionPiece[];
  correct: boolean;
};

const LABELS: Record<InequalityKind, string> = {
  "rational-inequality": "분수부등식 · 분모 제외",
  "absolute-inequality": "절댓값부등식 · 경우 나누기",
  "system-inequality": "연립 이차부등식 · 교집합",
  "repeated-root-inequality": "고차부등식 · 중근의 부호",
};

const VARIANTS: Record<InequalityKind, Array<Omit<InequalityProblem, "id" | "kind" | "label">>> = {
  "rational-inequality": [
    {
      expression: "((x − 3)(x + 1))/((x − 2)(x + 4)) ≤ 0",
      solution: [
        { kind: "interval", left: -4, right: -1, leftClosed: false, rightClosed: true },
        { kind: "interval", left: 2, right: 3, leftClosed: false, rightClosed: true },
      ],
    },
    {
      expression: "((x − 4)(x + 2))/((x − 1)(x + 3)) ≥ 0",
      solution: [
        { kind: "interval", left: "-inf", right: -3, leftClosed: false, rightClosed: false },
        { kind: "interval", left: -2, right: 1, leftClosed: true, rightClosed: false },
        { kind: "interval", left: 4, right: "inf", leftClosed: true, rightClosed: false },
      ],
    },
  ],
  "absolute-inequality": [
    {
      expression: "|2x − 3| > x + 3",
      solution: [
        { kind: "interval", left: "-inf", right: 0, leftClosed: false, rightClosed: false },
        { kind: "interval", left: 6, right: "inf", leftClosed: false, rightClosed: false },
      ],
    },
    {
      expression: "|3x − 2| ≤ x + 6",
      solution: [
        { kind: "interval", left: -1, right: 4, leftClosed: true, rightClosed: true },
      ],
    },
  ],
  "system-inequality": [
    {
      expression: "x² − 5x + 6 ≤ 0  그리고  x² − x − 6 < 0",
      solution: [
        { kind: "interval", left: 2, right: 3, leftClosed: true, rightClosed: false },
      ],
    },
    {
      expression: "x² − 4x − 5 < 0  그리고  x² − x − 6 ≥ 0",
      solution: [
        { kind: "interval", left: 3, right: 5, leftClosed: true, rightClosed: false },
      ],
    },
  ],
  "repeated-root-inequality": [
    {
      expression: "(x − 1)²(x + 2)(x − 4) ≥ 0",
      solution: [
        { kind: "interval", left: "-inf", right: -2, leftClosed: false, rightClosed: true },
        { kind: "point", value: 1 },
        { kind: "interval", left: 4, right: "inf", leftClosed: true, rightClosed: false },
      ],
    },
    {
      expression: "(x + 3)²(x − 1)(x − 5) ≤ 0",
      solution: [
        { kind: "point", value: -3 },
        { kind: "interval", left: 1, right: 5, leftClosed: true, rightClosed: true },
      ],
    },
  ],
};

const KINDS = Object.keys(VARIANTS) as InequalityKind[];

function random(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function buildProblem(kind: InequalityKind, next: () => number, id: string): InequalityProblem {
  const variants = VARIANTS[kind];
  const variant = variants[Math.floor(next() * variants.length)];
  return {
    id,
    kind,
    label: LABELS[kind],
    expression: variant.expression,
    solution: variant.solution.map((piece) => ({ ...piece })),
  };
}

export function createInequalityProblemSet(seed: number): InequalityProblemSet {
  const next = random(seed);
  return { seed, problems: KINDS.map((kind, index) => buildProblem(kind, next, `inequality-${index}`)) };
}

export function createInequalityReviewProblems(kinds: InequalityKind[], seed: number) {
  const next = random(seed);
  return [...new Set(kinds)].slice(0, 2).map((kind, index) => (
    buildProblem(kind, next, `inequality-review-${index}-${seed}`)
  ));
}

export function solutionPieceKey(piece: SolutionPiece) {
  if (piece.kind === "point") return `point:${piece.value}`;
  const leftClosed = piece.left === "-inf" ? false : piece.leftClosed;
  const rightClosed = piece.right === "inf" ? false : piece.rightClosed;
  if (piece.left === piece.right && leftClosed && rightClosed) return `point:${piece.left}`;
  return `interval:${piece.left}:${leftClosed}:${piece.right}:${rightClosed}`;
}

export function normalizeSolutionPieces(pieces: SolutionPiece[]) {
  return [...new Set(pieces.map(solutionPieceKey))].sort();
}

function solutionKey(pieces: SolutionPiece[]) {
  return normalizeSolutionPieces(pieces).join("|");
}

export function createInequalityChoices(problem: InequalityProblem): InequalityChoice[] {
  const correct = problem.solution.map((piece) => ({ ...piece }));
  const toggleEndpoints = correct.map((piece) => piece.kind === "point" ? piece : ({
    ...piece,
    leftClosed: typeof piece.left === "number" ? !piece.leftClosed : false,
    rightClosed: typeof piece.right === "number" ? !piece.rightClosed : false,
  }));
  const shiftRight = correct.map((piece) => piece.kind === "point"
    ? { ...piece, value: piece.value + 1 }
    : {
      ...piece,
      left: typeof piece.left === "number" ? piece.left + 1 : piece.left,
      right: typeof piece.right === "number" ? piece.right + 1 : piece.right,
    });
  const dropPiece = correct.length > 1 ? correct.slice(0, -1) : correct.map((piece) => piece.kind === "point"
    ? { ...piece, value: -piece.value }
    : { ...piece, leftClosed: false, rightClosed: false });
  const candidates = [correct, toggleEndpoints, shiftRight, dropPiece];
  const offset = [...problem.id].reduce((sum, character) => sum + character.charCodeAt(0), 0) % 4;
  return [...candidates.slice(offset), ...candidates.slice(0, offset)].map((solution) => ({
    solution,
    correct: solutionKey(solution) === solutionKey(correct),
  }));
}

export function formatInequalitySolution(pieces: SolutionPiece[]) {
  return pieces.map((piece) => {
    if (piece.kind === "point") return `{${piece.value}}`;
    const left = piece.left === "-inf" ? "−∞" : piece.left;
    const right = piece.right === "inf" ? "∞" : piece.right;
    const leftBracket = piece.left !== "-inf" && piece.leftClosed ? "[" : "(";
    const rightBracket = piece.right !== "inf" && piece.rightClosed ? "]" : ")";
    return `${leftBracket}${left}, ${right}${rightBracket}`;
  }).join(" ∪ ");
}
