"use client";

import { useEffect, useMemo, useState } from "react";

type PrintMode = "worksheet" | "answers" | "both";
type UnitName = "십" | "백" | "천" | "만" | "십만" | "백만" | "천만" | "억" | "십억" | "백억" | "천억" | "조";
type Problem = { id: string; left: number; leftUnit: UnitName; right: number; rightUnit: UnitName; answer: number; resultUnit: UnitName };
type ProblemSet = { seed: number; problems: Problem[] };

const INITIAL_SEED = 20260720;
const UNIT_EXPONENTS: Record<UnitName, number> = {
  십: 1, 백: 2, 천: 3, 만: 4, 십만: 5, 백만: 6, 천만: 7,
  억: 8, 십억: 9, 백억: 10, 천억: 11, 조: 12,
};
const OUTPUT_UNITS: Record<number, UnitName> = { 4: "만", 8: "억", 12: "조" };
const UNIT_PAIRS = [
  ["십", "천만"], ["십", "천억"],
  ["백", "천"], ["백", "만"], ["백", "십만"], ["백", "백만"], ["백", "천만"], ["백", "억"], ["백", "십억"], ["백", "백억"], ["백", "천억"],
  ["천", "천"], ["천", "만"], ["천", "십만"], ["천", "백만"], ["천", "천만"], ["천", "십억"], ["천", "백억"], ["천", "천억"], ["천", "조"],
  ["만", "만"], ["만", "십만"], ["만", "백만"], ["만", "천만"], ["만", "억"], ["만", "십억"], ["만", "백억"], ["만", "천억"],
  ["십만", "십만"], ["십만", "백만"], ["십만", "천만"], ["십만", "억"], ["십만", "십억"], ["십만", "백억"],
  ["백만", "백만"], ["백만", "천만"], ["백만", "억"], ["백만", "십억"],
] as const satisfies readonly (readonly [UnitName, UnitName])[];

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

function shuffle<T>(values: readonly T[], next: () => number) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(next() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function representation(leftUnit: UnitName, rightUnit: UnitName) {
  const exponent = UNIT_EXPONENTS[leftUnit] + UNIT_EXPONENTS[rightUnit];
  const resultExponent = exponent >= 12 ? 12 : exponent >= 8 ? 8 : 4;
  return { scale: 10 ** (exponent - resultExponent), resultUnit: OUTPUT_UNITS[resultExponent] };
}

function coefficients(leftUnit: UnitName, rightUnit: UnitName, scale: number, next: () => number) {
  if (scale === 1000) {
    const left = integer(next, 2, 4);
    const right = left === 4 ? 2 : left === 3 ? integer(next, 2, 3) : integer(next, 2, 4);
    return { left, right };
  }
  if (leftUnit === "천" && rightUnit === "십억") {
    return { left: integer(next, 4, 9), right: integer(next, 4, 9) };
  }
  return { left: integer(next, 2, 9), right: integer(next, 2, 9) };
}

function createProblemSet(seed: number): ProblemSet {
  const next = random(seed);
  const selectedPairs = shuffle(UNIT_PAIRS, next).slice(0, 10);
  const problems = selectedPairs.map(([leftUnit, rightUnit], index): Problem => {
    const { scale, resultUnit } = representation(leftUnit, rightUnit);
    const { left, right } = coefficients(leftUnit, rightUnit, scale, next);
    return {
      id: `grade-four-large-multiply-${index}`,
      left,
      leftUnit,
      right,
      rightUnit,
      answer: left * right * scale,
      resultUnit,
    };
  });
  return { seed, problems };
}

export default function GradeFourLargeNumberMultiplicationPage() {
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
    if (completed > 0 && !window.confirm("답이 사라집니다. 새 문제를 만들까요?")) return;
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
      <div className={`multiplication-question large-unit-multiply-question${graded ? isCorrect ? " is-correct" : " is-wrong" : ""}`} data-testid="large-unit-multiply-question" key={problem.id}>
        <span className="large-unit-multiply-index">{index + 1}</span>
        <div className="large-unit-multiply-expression">
          <strong>{problem.left}</strong><span className="large-unit-name">{problem.leftUnit}</span><span>×</span>
          <strong>{problem.right}</strong><span className="large-unit-name">{problem.rightUnit}</span><span>=</span>
          {answerSheet
            ? <strong className="large-unit-multiply-static-answer">{problem.answer}</strong>
            : <input className="large-unit-multiply-input" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={4} value={answers[problem.id] ?? ""} onChange={(event) => updateAnswer(problem.id, event.target.value)} aria-label={`${index + 1}번 답`} />}
          <strong className="large-unit-result-unit">{problem.resultUnit}</strong>
        </div>
        {!answerSheet && graded && <span className={`counting-result ${isCorrect ? "correct" : "wrong"}`} role="status">{isCorrect ? "맞음" : "틀림"}</span>}
      </div>
    );
  }

  function renderSheet(answerSheet: boolean) {
    return (
      <div className="a4-sheet counting-sheet large-unit-multiply-sheet" style={{ transform: `scale(${sheetScale})` }}>
        <header className="counting-sheet-header">
          <div className="counting-sheet-title"><span>4학년</span><strong>큰수곱셈{answerSheet ? " 정답" : ""}</strong></div>
          <div className="counting-sheet-info"><span>이름 <i /></span><span>날짜 <i /></span><small>문제지 {questionSet.seed}</small></div>
        </header>
        <div className="large-unit-multiply-grid">{questionSet.problems.map((problem, index) => renderProblem(problem, index, answerSheet))}</div>
      </div>
    );
  }

  return (
    <main className="counting-page multiplication-page">
      <div className="counting-toolbar">
        <a className="counting-back" href="/arithmetic">← 연산</a>
        <div className="counting-progress"><strong>{correct}<small>/10 정답</small></strong></div>
        <div className="toolbar">
          <button className="button secondary" type="button" onClick={newSet}>새 문제</button>
          <button className="button ghost" type="button" onClick={resetAnswers}>다시 풀기</button>
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
      <div className="a4-stage counting-a4-stage worksheet-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 4학년 큰수곱셈 문제지">{renderSheet(false)}</div>
      <div className="a4-stage counting-a4-stage answer-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 4학년 큰수곱셈 전체 답지">{renderSheet(true)}</div>
    </main>
  );
}
