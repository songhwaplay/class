import type { GeometryChoiceItem } from "../app/arithmetic/high-school/components/geometry-choice-worksheet";

type Next = () => number;

function rng(seed: number): Next {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function integer(next: Next, min: number, max: number) {
  return min + Math.floor(next() * (max - min + 1));
}

function nonzero(next: Next, min = -6, max = 6) {
  let value = 0;
  while (value === 0) value = integer(next, min, max);
  return value;
}

function signed(value: number) {
  return value < 0 ? `${value}` : `+${value}`;
}

function shifted(variable: string, value: number) {
  if (value === 0) return variable;
  return `(${variable}${signed(-value)})`;
}

function choiceList(id: string, answer: string, distractors: string[]) {
  const unique = [...new Set([answer, ...distractors.filter((value) => value !== answer)])].slice(0, 4);
  for (let n = 1; unique.length < 4; n += 1) unique.push(`${answer}+${n}`);
  return unique.map((latex, index) => ({ id: `${id}-${index}`, latex, correct: index === 0 }));
}

function item(id: string, label: string, latex: string, answer: string, distractors: string[]): GeometryChoiceItem {
  return { id, label, latex, correctLatex: answer, choices: choiceList(id, answer, distractors) };
}

export function createConicProblems(seed: number): GeometryChoiceItem[] {
  const next = rng(seed);
  const a = integer(next, 4, 8);
  const b = integer(next, 2, a - 1);
  const a2 = a * a;
  const b2 = b * b;
  const c2 = a2 - b2;
  const p = integer(next, 2, 6);
  const h = nonzero(next, -4, 4);
  const k = nonzero(next, -4, 4);
  return [
    item("c1", "타원의 초점", `\\frac{x^2}{${a2}}+\\frac{y^2}{${b2}}=1`, `(\\pm\\sqrt{${c2}},0)`, [`(0,\\pm\\sqrt{${c2}})`, `(\\pm${a},0)`, `(\\pm\\sqrt{${a2 + b2}},0)`]),
    item("c2", "쌍곡선의 꼭짓점", `\\frac{x^2}{${a2}}-\\frac{y^2}{${b2}}=1`, `(\\pm${a},0)`, [`(0,\\pm${b})`, `(\\pm${b},0)`, `(\\pm\\sqrt{${a2 + b2}},0)`]),
    item("c3", "포물선의 초점", `y^2=${4 * p}x`, `(${p},0)`, [`(${2 * p},0)`, `(0,${p})`, `(-${p},0)`]),
    item("c4", "평행이동한 타원의 중심", `\\frac{${shifted("x", h)}^2}{${a2}}+\\frac{${shifted("y", k)}^2}{${b2}}=1`, `(${h},${k})`, [`(${-h},${-k})`, `(${k},${h})`, `(${-h},${k})`]),
    item("c5", "타원의 이심률", `\\frac{x^2}{${a2}}+\\frac{y^2}{${b2}}=1,\\quad e=?`, `\\frac{\\sqrt{${c2}}}{${a}}`, [`\\frac{${b}}{${a}}`, `\\frac{${a}}{\\sqrt{${c2}}}`, `\\frac{\\sqrt{${c2}}}{${b}}`]),
    item("c6", "쌍곡선의 점근선", `\\frac{x^2}{${a2}}-\\frac{y^2}{${b2}}=1`, `y=\\pm\\frac{${b}}{${a}}x`, [`y=\\pm\\frac{${a}}{${b}}x`, `y=\\pm${a}x`, `y=\\pm${b}x`]),
    item("c7", "포물선의 준선", `x^2=${-4 * p}y`, `y=${p}`, [`y=-${p}`, `x=${p}`, `x=-${p}`]),
  ];
}

export function createConicMoveTangentProblems(seed: number): GeometryChoiceItem[] {
  const next = rng(seed);
  const a = integer(next, 3, 7);
  const b = integer(next, 2, a - 1);
  const h = nonzero(next, -4, 4);
  const k = nonzero(next, -4, 4);
  const p = integer(next, 2, 5);
  const ellipse = `\\frac{x^2}{${a * a}}+\\frac{y^2}{${b * b}}=1`;
  const movedEllipse = `\\frac{${shifted("x", h)}^2}{${a * a}}+\\frac{${shifted("y", k)}^2}{${b * b}}=1`;
  const movedHyperbola = `\\frac{${shifted("x", h)}^2}{${a * a}}-\\frac{${shifted("y", k)}^2}{${b * b}}=1`;
  return [
    item("t1", "타원의 평행이동", `${ellipse}\\ \\xrightarrow{(${h},${k})}`, movedEllipse, [`\\frac{${shifted("x", -h)}^2}{${a * a}}+\\frac{${shifted("y", -k)}^2}{${b * b}}=1`, `\\frac{${shifted("x", h)}^2}{${b * b}}+\\frac{${shifted("y", k)}^2}{${a * a}}=1`, ellipse]),
    item("t2", "쌍곡선의 평행이동", `\\frac{x^2}{${a * a}}-\\frac{y^2}{${b * b}}=1\\ \\xrightarrow{(${h},${k})}`, movedHyperbola, [`\\frac{${shifted("x", -h)}^2}{${a * a}}-\\frac{${shifted("y", -k)}^2}{${b * b}}=1`, `\\frac{${shifted("x", h)}^2}{${b * b}}-\\frac{${shifted("y", k)}^2}{${a * a}}=1`, movedEllipse]),
    item("t3", "타원의 접선", `${ellipse},\\quad P(0,${b})`, `y=${b}`, [`x=${b}`, `y=-${b}`, `x=${a}`]),
    item("t4", "쌍곡선의 접선", `\\frac{x^2}{${a * a}}-\\frac{y^2}{${b * b}}=1,\\quad P(${a},0)`, `x=${a}`, [`y=${a}`, `x=-${a}`, `y=${b}`]),
    item("t5", "포물선의 꼭짓점에서의 접선", `y^2=${4 * p}x`, `x=0`, [`y=0`, `x=${p}`, `y=${p}`]),
    item("t6", "이동한 타원의 꼭짓점에서의 접선", `${movedEllipse},\\quad P(${h + a},${k})`, `x=${h + a}`, [`y=${k + b}`, `x=${h - a}`, `y=${k}`]),
    item("t7", "이동한 포물선의 초점", `${shifted("y", k)}^2=${4 * p}${shifted("x", h)}`, `(${h + p},${k})`, [`(${h - p},${k})`, `(${h},${k + p})`, `(${h},${k})`]),
  ];
}

export function createPlaneVectorProblems(seed: number): GeometryChoiceItem[] {
  const next = rng(seed);
  const ax = nonzero(next), ay = nonzero(next), bx = nonzero(next), by = nonzero(next);
  const scale = integer(next, 2, 4);
  const ratio = integer(next, 1, 3);
  return [
    item("v1", "벡터의 합", `(${ax},${ay})+(${bx},${by})=?`, `(${ax + bx},${ay + by})`, [`(${ax - bx},${ay - by})`, `(${ax + bx},${ay - by})`, `(${bx - ax},${by - ay})`]),
    item("v2", "벡터의 크기", `\\left|(${3 * scale},${4 * scale})\\right|=?`, `${5 * scale}`, [`${7 * scale}`, `${25 * scale}`, `${scale}`]),
    item("v3", "실수배와 합", `${scale}(${ax},${ay})-(${bx},${by})=?`, `(${scale * ax - bx},${scale * ay - by})`, [`(${scale * ax + bx},${scale * ay + by})`, `(${ax - scale * bx},${ay - scale * by})`, `(${scale * ax - bx},${scale * ay + by})`]),
    item("v4", "단위벡터", `\\vec a=(${3 * scale},${4 * scale}),\\quad \\frac{\\vec a}{|\\vec a|}=?`, `\\left(\\frac35,\\frac45\\right)`, [`(${3 * scale},${4 * scale})`, `\\left(\\frac45,\\frac35\\right)`, `\\left(\\frac15,\\frac15\\right)`]),
    item("v5", "평행 조건", `(k,${scale * by})\\parallel(${bx},${by}),\\quad k=?`, `k=${scale * bx}`, [`k=${bx}`, `k=${scale * by}`, `k=${-scale * bx}`]),
    item("v6", "위치벡터", `\\overrightarrow{OA}=(${ax},${ay}),\\quad\\overrightarrow{AB}=(${bx},${by}),\\quad\\overrightarrow{OB}=?`, `(${ax + bx},${ay + by})`, [`(${ax - bx},${ay - by})`, `(${bx - ax},${by - ay})`, `(${ax + bx},${ay - by})`]),
    item("v7", "내분점의 위치벡터", `AP:PB=${ratio}:1,\\quad\\vec a=(${ax},${ay}),\\quad\\vec b=(${bx},${by})`, `\\vec p=\\frac{\\vec a+${ratio}\\vec b}{${ratio + 1}}`, [`\\vec p=\\frac{${ratio}\\vec a+\\vec b}{${ratio + 1}}`, `\\vec p=\\vec a+\\vec b`, `\\vec p=\\frac{\\vec a+\\vec b}{2}`]),
  ];
}

export function createProjectionProblems(seed: number): GeometryChoiceItem[] {
  const next = rng(seed);
  const ax = nonzero(next), ay = nonzero(next), bx = nonzero(next), by = nonzero(next);
  const dot = ax * bx + ay * by;
  const perpendicularX = by;
  const perpendicularY = -bx;
  const scale = integer(next, 2, 5);
  const projectionFactorNumerator = dot;
  const projectionFactorDenominator = bx * bx + by * by;
  return [
    item("p1", "내적", `\\vec a=(${ax},${ay}),\\quad\\vec b=(${bx},${by}),\\quad\\vec a\\cdot\\vec b=?`, `${dot}`, [`${ax * bx - ay * by}`, `${ax + ay + bx + by}`, `${-dot}`]),
    item("p2", "수직 조건", `(k,${scale})\\perp(${perpendicularX},${perpendicularY}),\\quad k=?`, `k=${scale * bx / by}`, [`k=${-scale * bx / by}`, `k=${scale}`, `k=${perpendicularX}`]),
    item("p3", "두 벡터가 이루는 각", `\\vec a=(1,0),\\quad\\vec b=(1,1),\\quad\\theta=?`, `\\frac{\\pi}{4}`, [`\\frac{\\pi}{3}`, `\\frac{\\pi}{6}`, `\\frac{3\\pi}{4}`]),
    item("p4", "스칼라 정사영", `\\vec a=(${3 * scale},${4 * scale}),\\quad\\vec b=(1,0),\\quad\\frac{\\vec a\\cdot\\vec b}{|\\vec b|}=?`, `${3 * scale}`, [`${4 * scale}`, `${5 * scale}`, `${12 * scale * scale}`]),
    item("p5", "벡터 정사영", `\\vec a=(${ax},${ay}),\\quad\\vec b=(${bx},${by}),\\quad\\mathrm{proj}_{\\vec b}\\vec a=?`, `\\frac{${projectionFactorNumerator}}{${projectionFactorDenominator}}(${bx},${by})`, [`\\frac{${projectionFactorDenominator}}{${projectionFactorNumerator || 1}}(${bx},${by})`, `(${ax},${ay})`, `${dot}(${bx},${by})`]),
    item("p6", "수직 성분", `\\vec a=(${ax},${ay}),\\quad\\vec b=(${bx},${by}),\\quad\\vec a_{\\perp}=?`, `\\vec a-\\frac{${projectionFactorNumerator}}{${projectionFactorDenominator}}\\vec b`, [`\\frac{${projectionFactorNumerator}}{${projectionFactorDenominator}}\\vec b`, `\\vec a+\\vec b`, `\\vec a-\\vec b`]),
    item("p7", "좌표축과 이루는 각", `\\vec a=(${3 * scale},${4 * scale}),\\quad\\cos\\angle(\\vec a,\\ x\\text{축})=?`, `\\frac35`, [`\\frac45`, `\\frac34`, `\\frac53`]),
  ];
}

export function createVectorGeometryProblems(seed: number): GeometryChoiceItem[] {
  const next = rng(seed);
  const a = nonzero(next), b = nonzero(next), c = nonzero(next);
  const px = nonzero(next), py = nonzero(next);
  const dx = nonzero(next), dy = nonzero(next);
  const distanceNumerator = Math.abs(a * px + b * py + c);
  return [
    item("g1", "직선의 방향벡터", `${a}x${signed(b)}y${signed(c)}=0`, `(${b},${-a})`, [`(${a},${b})`, `(${-b},${a})`, `(${b},${a})`]),
    item("g2", "법선벡터", `${a}x${signed(b)}y${signed(c)}=0`, `(${a},${b})`, [`(${b},${-a})`, `(${-a},${-b})`, `(${b},${a})`]),
    item("g3", "벡터로 나타낸 직선", `P(${px},${py}),\\quad\\vec d=(${dx},${dy})`, `(x,y)=(${px},${py})+t(${dx},${dy})`, [`(x,y)=(${dx},${dy})+t(${px},${py})`, `(x,y)=t(${px + dx},${py + dy})`, `(x,y)=(${px},${-py})+t(${dx},${-dy})`]),
    item("g4", "점과 직선 사이의 거리", `P(${px},${py}),\\quad ${a}x${signed(b)}y${signed(c)}=0`, `\\frac{${distanceNumerator}}{\\sqrt{${a * a + b * b}}}`, [`\\frac{${distanceNumerator}}{${a * a + b * b}}`, `${distanceNumerator}`, `\\sqrt{${a * a + b * b}}`]),
    item("g5", "삼각형의 넓이", `\\overrightarrow{AB}=(${ax(next)},${ay(next)}),\\quad\\overrightarrow{AC}=(${dx},${dy})`, `\\frac12|\\det(\\overrightarrow{AB},\\overrightarrow{AC})|`, [`|\\overrightarrow{AB}\\cdot\\overrightarrow{AC}|`, `|\\det(\\overrightarrow{AB},\\overrightarrow{AC})|`, `\\frac12|\\overrightarrow{AB}\\cdot\\overrightarrow{AC}|`]),
    item("g6", "좌표축에 내린 수선의 발", `P(${px},${py}),\\quad x\\text{축에 내린 수선의 발 }H=?`, `H=(${px},0)`, [`H=(0,${py})`, `H=(${px},${py})`, `H=(0,${px})`]),
    item("g7", "두 직선의 수직 조건", `\\vec d_1=(${dx},${dy}),\\quad\\vec d_2=(k,${dx}),\\quad\\vec d_1\\perp\\vec d_2`, `k=${-dy}`, [`k=${dy}`, `k=${dx}`, `k=${-dx}`]),
  ];
}

function ax(next: Next) { return nonzero(next); }
function ay(next: Next) { return nonzero(next); }

export function createSpaceCoordinateProblems(seed: number): GeometryChoiceItem[] {
  const next = rng(seed);
  const ax = nonzero(next), ay = nonzero(next), az = nonzero(next);
  const dx = nonzero(next, -4, 4), dy = nonzero(next, -4, 4), dz = nonzero(next, -4, 4);
  const bx = ax + dx, by = ay + dy, bz = az + dz;
  const cx = nonzero(next), cy = nonzero(next), cz = nonzero(next);
  const radius = integer(next, 2, 7);
  const ratio = integer(next, 1, 3);
  return [
    item("s1", "공간에서 두 점 사이의 거리", `A(${ax},${ay},${az}),\\quad B(${bx},${by},${bz})`, `\\sqrt{${dx * dx + dy * dy + dz * dz}}`, [`\\sqrt{${Math.abs(dx) + Math.abs(dy) + Math.abs(dz)}}`, `${dx * dx + dy * dy + dz * dz}`, `\\sqrt{${dx * dx + dy * dy}}`]),
    item("s2", "선분의 중점", `A(${ax},${ay},${az}),\\quad B(${bx},${by},${bz})`, `\\left(\\frac{${ax + bx}}2,\\frac{${ay + by}}2,\\frac{${az + bz}}2\\right)`, [`(${ax + bx},${ay + by},${az + bz})`, `\\left(\\frac{${ax - bx}}2,\\frac{${ay - by}}2,\\frac{${az - bz}}2\\right)`, `(${bx},${by},${bz})`]),
    item("s3", "내분점", `AP:PB=${ratio}:1,\\quad A(${ax},${ay},${az}),\\quad B(${bx},${by},${bz})`, `P=\\frac{A+${ratio}B}{${ratio + 1}}`, [`P=\\frac{${ratio}A+B}{${ratio + 1}}`, `P=\\frac{A+B}{2}`, `P=A+${ratio}B`]),
    item("s4", "구의 중심과 반지름", `${shifted("x", cx)}^2+${shifted("y", cy)}^2+${shifted("z", cz)}^2=${radius * radius}`, `C=(${cx},${cy},${cz}),\\quad r=${radius}`, [`C=(${-cx},${-cy},${-cz}),\\quad r=${radius}`, `C=(${cx},${cy},${cz}),\\quad r=${radius * radius}`, `C=(${cy},${cz},${cx}),\\quad r=${radius}`]),
    item("s5", "구의 방정식", `C=(${cx},${cy},${cz}),\\quad r=${radius}`, `${shifted("x", cx)}^2+${shifted("y", cy)}^2+${shifted("z", cz)}^2=${radius * radius}`, [`${shifted("x", -cx)}^2+${shifted("y", -cy)}^2+${shifted("z", -cz)}^2=${radius * radius}`, `${shifted("x", cx)}^2+${shifted("y", cy)}^2+${shifted("z", cz)}^2=${radius}`, `x^2+y^2+z^2=${radius * radius}`]),
    item("s6", "좌표평면에 대한 대칭", `P(${ax},${ay},${az})\\text{를 }xy\\text{평면에 대칭이동}`, `(${ax},${ay},${-az})`, [`(${-ax},${-ay},${az})`, `(${ax},${-ay},${az})`, `(${-ax},${ay},${az})`]),
    item("s7", "좌표평면 위의 점", `P(a,b,c)\\text{가 }yz\\text{평면 위}`, `a=0`, [`b=0`, `c=0`, `a=b=c`]),
  ];
}
