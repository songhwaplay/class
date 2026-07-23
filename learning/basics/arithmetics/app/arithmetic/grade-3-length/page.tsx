"use client";

import { useEffect, useMemo, useState } from "react";

type PrintMode = "worksheet" | "answers" | "both";
type Operator = "+" | "−";
type UnitPair = { major: "km" | "m" | "cm"; minor: "m" | "cm" | "mm"; base: 1000 | 100 | 10 };
type LengthValue = { major: number; minor: number };
type LengthProblem = {
  id: string;
  units: UnitPair;
  operator: Operator;
  left: LengthValue;
  right: LengthValue;
  result: LengthValue;
};
type ProblemSet = { seed: number; problems: LengthProblem[] };

const INITIAL_SEED = 20260720;
const UNIT_PAIRS: UnitPair[] = [
  { major: "km", minor: "m", base: 1000 },
  { major: "m", minor: "cm", base: 100 },
  { major: "cm", minor: "mm", base: 10 },
];

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

function integer(next: () => number, minimum: number, maximum: number) {
  return minimum + Math.floor(next() * (maximum - minimum + 1));
}

function makeProblem(id: string, units: UnitPair, operator: Operator, left: LengthValue, right: LengthValue): LengthProblem {
  const leftTotal = left.major * units.base + left.minor;
  const rightTotal = right.major * units.base + right.minor;
  const total = operator === "+" ? leftTotal + rightTotal : leftTotal - rightTotal;
  return { id, units, operator, left, right, result: { major: Math.floor(total / units.base), minor: total % units.base } };
}

function standardAddition(next: () => number, units: UnitPair, id: string): LengthProblem {
  if (units.base === 1000) return makeProblem(id, units, "+", { major: integer(next, 1, 5), minor: integer(next, 100, 999) }, { major: integer(next, 1, 3), minor: integer(next, 666, 999) });
  if (units.base === 100) return makeProblem(id, units, "+", { major: integer(next, 1, 3), minor: integer(next, 10, 99) }, { major: integer(next, 1, 9), minor: integer(next, 40, 99) });
  return makeProblem(id, units, "+", { major: integer(next, 1, 9), minor: integer(next, 1, 9) }, { major: integer(next, 6, 9), minor: integer(next, 4, 9) });
}

function subtraction(next: () => number, units: UnitPair, id: string): LengthProblem {
  if (units.base === 1000) {
    const leftMajor = integer(next, 3, 6);
    return makeProblem(id, units, "−", { major: leftMajor, minor: integer(next, 1, 500) }, { major: integer(next, 1, leftMajor - 1), minor: integer(next, 200, 999) });
  }
  if (units.base === 100) {
    const leftMajor = integer(next, 5, 9);
    return makeProblem(id, units, "−", { major: leftMajor, minor: integer(next, 1, 41) }, { major: integer(next, 1, leftMajor - 1), minor: integer(next, 29, 99) });
  }
  const leftMajor = integer(next, 5, 9);
  return makeProblem(id, units, "−", { major: leftMajor, minor: integer(next, 1, 7) }, { major: integer(next, 1, leftMajor - 1), minor: integer(next, 4, 9) });
}

function secondAddition(next: () => number, units: UnitPair, id: string): LengthProblem {
  if (units.base !== 100) return standardAddition(next, units, id);
  return makeProblem(id, units, "+", { major: integer(next, 2, 9), minor: integer(next, 5, 9) * 10 }, { major: integer(next, 2, 9), minor: integer(next, 5, 9) * 10 });
}

function createProblemSet(seed: number): ProblemSet {
  const next = random(seed);
  return {
    seed,
    problems: [
      ...UNIT_PAIRS.map((units, index) => standardAddition(next, units, `grade-three-length-add-a-${index}`)),
      ...UNIT_PAIRS.map((units, index) => subtraction(next, units, `grade-three-length-subtract-${index}`)),
      ...UNIT_PAIRS.map((units, index) => secondAddition(next, units, `grade-three-length-add-b-${index}`)),
    ],
  };
}

export default function GradeThreeLengthPage() {
  const [questionSet, setQuestionSet] = useState(() => createProblemSet(INITIAL_SEED));
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [sheetScale, setSheetScale] = useState(0.6);
  const [printMenuOpen, setPrintMenuOpen] = useState(false);

  useEffect(() => {
    function fitA4Sheet() {
      setSheetScale(Math.min((window.innerWidth - 32) / 794, 1));
    }
    fitA4Sheet();
    window.addEventListener("resize", fitA4Sheet);
    return () => window.removeEventListener("resize", fitA4Sheet);
  }, []);

  const expected = useMemo(() => questionSet.problems.map((problem) => [problem.id, String(problem.result.major), String(problem.result.minor)] as const), [questionSet]);
  const completed = Object.values(answers).filter(Boolean).length;
  const correct = Object.values(results).filter(Boolean).length;

  function updateAnswer(id: string, part: "major" | "minor", value: string) {
    setAnswers((current) => ({ ...current, [`${id}-${part}`]: value.replace(/[^0-9]/g, "").slice(0, 3) }));
    setResults((current) => {
      if (!(id in current)) return current;
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  function checkAll() {
    setResults(Object.fromEntries(expected.map(([id, major, minor]) => [id, answers[`${id}-major`] === major && answers[`${id}-minor`] === minor])));
  }

  function resetAnswers() {
    setAnswers({});
    setResults({});
  }

  function newSet() {
    if (completed > 0 && !window.confirm("쓴 답이 사라집니다. 새 문제를 만들까요?")) return;
    setQuestionSet(createProblemSet((Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0));
    resetAnswers();
  }

  function printMaterials(mode: PrintMode) {
    setPrintMenuOpen(false);
    document.documentElement.dataset.printMode = mode;
    const clearPrintMode = () => delete document.documentElement.dataset.printMode;
    window.addEventListener("afterprint", clearPrintMode, { once: true });
    window.requestAnimationFrame(() => window.print());
  }

  function renderValue(problem: LengthProblem, value: LengthValue) {
    return <div className="length-operation-value"><strong>{value.major}</strong><span>{problem.units.major}</span><strong>{value.minor}</strong><span>{problem.units.minor}</span></div>;
  }

  function renderAnswer(problem: LengthProblem, answerSheet: boolean) {
    if (answerSheet) {
      return <div className="length-operation-value"><strong className="length-operation-static">{problem.result.major}</strong><span>{problem.units.major}</span><strong className="length-operation-static minor">{problem.result.minor}</strong><span>{problem.units.minor}</span></div>;
    }
    return (
      <div className="length-operation-value">
        <input className="length-operation-input" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2} value={answers[`${problem.id}-major`] ?? ""} onChange={(event) => updateAnswer(problem.id, "major", event.target.value)} aria-label={`${problem.id} ${problem.units.major} 답`} />
        <span>{problem.units.major}</span>
        <input className="length-operation-input minor" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={3} value={answers[`${problem.id}-minor`] ?? ""} onChange={(event) => updateAnswer(problem.id, "minor", event.target.value)} aria-label={`${problem.id} ${problem.units.minor} 답`} />
        <span>{problem.units.minor}</span>
      </div>
    );
  }

  function renderProblem(problem: LengthProblem, index: number, answerSheet: boolean) {
    const graded = problem.id in results;
    const isCorrect = results[problem.id] === true;
    return (
      <div className={`length-question length-operation-question${graded ? isCorrect ? " is-correct" : " is-wrong" : ""}`} data-testid="grade-three-length-question" key={problem.id}>
        <span className="length-operation-number">{index + 1}</span>
        <div className="length-operation-line"><b aria-hidden="true" />{renderValue(problem, problem.left)}</div>
        <div className="length-operation-line"><b>{problem.operator}</b>{renderValue(problem, problem.right)}</div>
        <span className="length-operation-rule" aria-hidden="true" />
        <div className="length-operation-line"><b aria-hidden="true" />{renderAnswer(problem, answerSheet)}</div>
        {!answerSheet && graded && <span className={`counting-result ${isCorrect ? "correct" : "wrong"}`} role="status">{isCorrect ? "맞음" : "틀림"}</span>}
      </div>
    );
  }

  function renderSheet(answerSheet: boolean) {
    return (
      <div className="a4-sheet counting-sheet length-sheet" style={{ transform: `scale(${sheetScale})` }}>
        <header className="counting-sheet-header">
          <div className="counting-sheet-title"><span>3학년</span><strong>길이{answerSheet ? " 정답" : ""}</strong></div>
          <div className="counting-sheet-info"><span>이름 <i /></span><span>날짜 <i /></span><small>문제지 {questionSet.seed}</small></div>
        </header>
        <div className="length-operation-grid">{questionSet.problems.map((problem, index) => renderProblem(problem, index, answerSheet))}</div>
      </div>
    );
  }

  return (
    <main className="counting-page length-page">
      <div className="counting-toolbar">
        <a className="counting-back" href="/arithmetic">← 연산</a>
        <div className="counting-progress"><strong>{correct}<small>/9 정답</small></strong></div>
        <div className="toolbar">
          <button className="button secondary" type="button" onClick={newSet}>새 문제</button>
          <button className="button ghost" type="button" onClick={resetAnswers}>다시 쓰기</button>
          <div className="print-control">
            <button className="button ghost print-button" type="button" aria-expanded={printMenuOpen} aria-haspopup="menu" onClick={() => setPrintMenuOpen((open) => !open)}>인쇄</button>
            {printMenuOpen && <div className="print-menu" role="menu" aria-label="인쇄 자료 선택">
              <button type="button" role="menuitem" onClick={() => printMaterials("worksheet")}>문제지만 인쇄</button>
              <button type="button" role="menuitem" onClick={() => printMaterials("answers")}>답지만 인쇄</button>
              <button type="button" role="menuitem" onClick={() => printMaterials("both")}>문제지+답지 인쇄</button>
            </div>}
          </div>
          <button className="button primary" type="button" onClick={checkAll}>전체 채점</button>
        </div>
      </div>
      <div className="a4-stage counting-a4-stage worksheet-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 3학년 길이 문제지">{renderSheet(false)}</div>
      <div className="a4-stage counting-a4-stage answer-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 3학년 길이 전체 답지">{renderSheet(true)}</div>
    </main>
  );
}
