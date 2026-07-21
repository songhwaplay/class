"use client";

import { useEffect, useMemo, useState } from "react";

type PrintMode = "worksheet" | "answers" | "both";
type UnitDefinition = { unit: string; convertedUnit: string; factor: number; denominators: readonly number[] };
type Problem = { id: string; whole: number; numerator: number; denominator: number; unit: string; convertedUnit: string; answer: number };
type ProblemSet = { seed: number; problems: Problem[] };

const INITIAL_SEED = 20260720;
const UNITS: UnitDefinition[] = [
  { unit: "년", convertedUnit: "개월", factor: 12, denominators: [2, 3, 4, 6] },
  { unit: "일", convertedUnit: "시간", factor: 24, denominators: [2, 3, 4, 6, 8] },
  { unit: "시간", convertedUnit: "분", factor: 60, denominators: [2, 3, 4, 5, 6] },
  { unit: "분", convertedUnit: "초", factor: 60, denominators: [2, 3, 4, 5, 6] },
  { unit: "t", convertedUnit: "kg", factor: 1000, denominators: [2, 4, 5, 8] },
  { unit: "kg", convertedUnit: "g", factor: 1000, denominators: [2, 4, 5, 8] },
  { unit: "km", convertedUnit: "m", factor: 1000, denominators: [2, 4, 5, 8] },
  { unit: "m", convertedUnit: "cm", factor: 100, denominators: [2, 4, 5] },
  { unit: "L", convertedUnit: "mL", factor: 1000, denominators: [2, 4, 5, 8] },
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

function shuffle<T>(values: T[], next: () => number) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(next() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function createProblemSet(seed: number): ProblemSet {
  const next = random(seed);
  const selectedUnits = shuffle(UNITS, next).slice(0, 8);
  const problems = selectedUnits.map((definition, index): Problem => {
    const denominator = definition.denominators[integer(next, 0, definition.denominators.length - 1)];
    const whole = index < 6 ? 0 : integer(next, 1, 3);
    const numerator = index < 4
      ? integer(next, 1, denominator - 1)
      : index < 6
        ? integer(next, denominator + 1, denominator + 3)
        : integer(next, 1, denominator - 1);
    return {
      id: `grade-three-unit-fraction-${index}`,
      whole,
      numerator,
      denominator,
      unit: definition.unit,
      convertedUnit: definition.convertedUnit,
      answer: whole * definition.factor + (definition.factor * numerator) / denominator,
    };
  });
  return { seed, problems };
}

function FractionValue({ numerator, denominator }: { numerator: number; denominator: number }) {
  return (
    <span className="unit-fraction-stack" aria-label={`${denominator}분의 ${numerator}`}>
      <strong>{numerator}</strong><span className="unit-fraction-line" aria-hidden="true" /><strong>{denominator}</strong>
    </span>
  );
}

export default function GradeThreeFractionThreePage() {
  const [questionSet, setQuestionSet] = useState(() => createProblemSet(INITIAL_SEED));
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [sheetScale, setSheetScale] = useState(0.6);
  const [printMenuOpen, setPrintMenuOpen] = useState(false);

  useEffect(() => {
    function fitA4Sheet() {
      setSheetScale(Math.min((window.innerWidth - 16) / 794, (window.innerHeight - 68) / 1123, 1));
    }
    fitA4Sheet();
    window.addEventListener("resize", fitA4Sheet);
    return () => window.removeEventListener("resize", fitA4Sheet);
  }, []);

  const problems = useMemo(() => questionSet.problems, [questionSet]);
  const completed = Object.values(answers).filter(Boolean).length;
  const correct = Object.values(results).filter(Boolean).length;

  function updateAnswer(id: string, value: string) {
    setAnswers((current) => ({ ...current, [id]: value.replace(/[^0-9]/g, "").slice(0, 4) }));
    setResults((current) => {
      if (!(id in current)) return current;
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  function checkAll() {
    setResults(Object.fromEntries(problems.map((problem) => [problem.id, answers[problem.id] === String(problem.answer)])));
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

  function renderProblem(problem: Problem, index: number, answerSheet: boolean) {
    const graded = problem.id in results;
    const isCorrect = results[problem.id] === true;
    return (
      <div className={`multiplication-question unit-fraction-question${graded ? isCorrect ? " is-correct" : " is-wrong" : ""}`} data-testid="unit-fraction-question" key={problem.id}>
        <span className="unit-fraction-number">{index + 1}</span>
        <span className="unit-fraction-expression">
          {problem.whole > 0 && <strong className="unit-fraction-whole">{problem.whole}</strong>}
          <FractionValue numerator={problem.numerator} denominator={problem.denominator} />
          <strong className="unit-fraction-unit">{problem.unit}</strong><span>=</span>
          {answerSheet
            ? <strong className="unit-fraction-static-answer">{problem.answer}</strong>
            : <input className="unit-fraction-input" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={4} value={answers[problem.id] ?? ""} onChange={(event) => updateAnswer(problem.id, event.target.value)} aria-label={`${index + 1}번 답`} />}
          <strong className="unit-fraction-converted-unit">{problem.convertedUnit}</strong>
        </span>
        {!answerSheet && graded && <span className={`counting-result ${isCorrect ? "correct" : "wrong"}`} role="status">{isCorrect ? "맞음" : "틀림"}</span>}
      </div>
    );
  }

  function renderSheet(answerSheet: boolean) {
    return (
      <div className="a4-sheet counting-sheet unit-fraction-sheet" style={{ transform: `scale(${sheetScale})` }}>
        <header className="counting-sheet-header">
          <div className="counting-sheet-title"><span>3학년</span><strong>분수③{answerSheet ? " 정답" : ""}</strong></div>
          <div className="counting-sheet-info"><span>이름 <i /></span><span>날짜 <i /></span><small>문제지 {questionSet.seed}</small></div>
        </header>
        <div className="unit-fraction-grid">{questionSet.problems.map((problem, index) => renderProblem(problem, index, answerSheet))}</div>
      </div>
    );
  }

  return (
    <main className="counting-page multiplication-page">
      <div className="counting-toolbar">
        <a className="counting-back" href="/arithmetic">← 연산</a>
        <div className="counting-progress"><strong>{correct}<small>/8 정답</small></strong></div>
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
      <div className="a4-stage counting-a4-stage worksheet-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 3학년 분수③ 문제지">{renderSheet(false)}</div>
      <div className="a4-stage counting-a4-stage answer-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 3학년 분수③ 전체 답지">{renderSheet(true)}</div>
    </main>
  );
}
