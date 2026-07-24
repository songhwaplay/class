"use client";

import { useEffect, useMemo, useState } from "react";

type PrintMode = "worksheet" | "answers" | "both";
type BlankPosition = "factor" | "result";
type MultiplicationProblem = {
  id: string;
  multiplicand: number;
  factor: number;
  product: number;
  blank: BlankPosition;
};
type ProblemSet = { seed: number; columns: MultiplicationProblem[][] };

const INITIAL_SEED = 20260720;
const FACTOR_BLANK_ROWS = new Set([2, 5, 8]);

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

function shuffle<T>(values: T[], next: () => number) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(next() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function randomInteger(min: number, max: number, next: () => number) {
  return min + Math.floor(next() * (max - min + 1));
}

function makeColumn(
  columnIndex: number,
  multiplicands: number[],
  factors: number[],
): MultiplicationProblem[] {
  return factors.map((factor, rowIndex) => {
    const multiplicand = multiplicands[rowIndex];
    return {
      id: `multiplication-${columnIndex}-${rowIndex}`,
      multiplicand,
      factor,
      product: multiplicand * factor,
      blank: FACTOR_BLANK_ROWS.has(rowIndex) ? "factor" : "result",
    };
  });
}

function createProblemSet(seed: number): ProblemSet {
  const next = random(seed);
  const twoFactors = [...shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], next), randomInteger(3, 9, next)];
  const fiveFactors = [...shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], next), randomInteger(3, 9, next)];
  const mixedMultiplicands = Array.from({ length: 10 }, (_, index) => index % 2 === 0 ? 2 : 5);
  const mixedFactors = Array.from({ length: 10 }, (_, index) => randomInteger(index === 9 ? 3 : 2, 9, next));

  return {
    seed,
    columns: [
      makeColumn(0, Array(10).fill(2), twoFactors),
      makeColumn(1, Array(10).fill(5), fiveFactors),
      makeColumn(2, mixedMultiplicands, mixedFactors),
    ],
  };
}

export default function MultiplicationOnePage() {
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

  const problems = useMemo(() => questionSet.columns.flat(), [questionSet]);
  const expected = useMemo(
    () => problems.map((problem) => [problem.id, String(problem.blank === "factor" ? problem.factor : problem.product)] as const),
    [problems],
  );
  const completed = Object.values(answers).filter(Boolean).length;
  const correct = Object.values(results).filter(Boolean).length;

  function updateAnswer(id: string, value: string) {
    setAnswers((current) => ({ ...current, [id]: value.replace(/[^0-9]/g, "").slice(0, 2) }));
    setResults((current) => {
      if (!(id in current)) return current;
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  function checkAll() {
    setResults(Object.fromEntries(expected.map(([id, value]) => [id, answers[id] === value])));
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

  function renderBlank(problem: MultiplicationProblem, answerSheet: boolean) {
    const value = problem.blank === "factor" ? problem.factor : problem.product;
    if (answerSheet) return <strong className="multiplication-static-answer">{value}</strong>;
    return (
      <input
        className="multiplication-input"
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={2}
        value={answers[problem.id] ?? ""}
        onChange={(event) => updateAnswer(problem.id, event.target.value)}
        aria-label={`${problem.id} 답`}
      />
    );
  }

  function renderProblem(problem: MultiplicationProblem, answerSheet: boolean) {
    const graded = problem.id in results;
    const isCorrect = results[problem.id] === true;
    return (
      <div className={`multiplication-question${graded ? isCorrect ? " is-correct" : " is-wrong" : ""}`} data-testid="multiplication-question" key={problem.id}>
        <span>{problem.multiplicand}</span>
        <span>×</span>
        {problem.blank === "factor" ? renderBlank(problem, answerSheet) : <strong>{problem.factor}</strong>}
        <span>=</span>
        {problem.blank === "result" ? renderBlank(problem, answerSheet) : <strong>{problem.product}</strong>}
        {!answerSheet && graded && <span className={`counting-result ${isCorrect ? "correct" : "wrong"}`} role="status">{isCorrect ? "맞음" : "틀림"}</span>}
      </div>
    );
  }

  function renderSheet(answerSheet: boolean) {
    return (
      <div className="a4-sheet counting-sheet multiplication-sheet" style={{ transform: `scale(${sheetScale})` }}>
        <header className="counting-sheet-header">
          <div className="counting-sheet-title"><span>2학년</span><strong>구구단(2·5단){answerSheet ? " 정답" : ""}</strong></div>
          <div className="counting-sheet-info"><span>이름 <i /></span><span>날짜 <i /></span><small>문제지 {questionSet.seed}</small></div>
        </header>
        <div className="multiplication-columns">
          {questionSet.columns.map((column, columnIndex) => (
            <div className="multiplication-column" key={columnIndex}>
              {column.map((problem) => renderProblem(problem, answerSheet))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <main className="counting-page multiplication-page">
      <div className="counting-toolbar">
        <a className="counting-back" href="/arithmetic">← 연산</a>
        <div className="counting-progress"><strong>{correct}<small>/30 정답</small></strong></div>
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
      <div className="a4-stage counting-a4-stage worksheet-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 구구단(2·5단) 문제지">{renderSheet(false)}</div>
      <div className="a4-stage counting-a4-stage answer-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 구구단(2·5단) 전체 답지">{renderSheet(true)}</div>
    </main>
  );
}
