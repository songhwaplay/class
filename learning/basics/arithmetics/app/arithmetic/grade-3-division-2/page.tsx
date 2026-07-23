"use client";

import { useEffect, useMemo, useState } from "react";

type PrintMode = "worksheet" | "answers" | "both";
type Problem = { id: string; dividend: number; divisor: number; quotient: number; remainder: number; large: boolean };
type ProblemSet = { seed: number; columns: Problem[][] };
type Answer = { quotient: string; remainder: string };

const INITIAL_SEED = 20260720;

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

function makeProblem(id: string, dividend: number, divisor: number, large: boolean): Problem {
  return { id, dividend, divisor, quotient: Math.floor(dividend / divisor), remainder: dividend % divisor, large };
}

function createProblemSet(seed: number): ProblemSet {
  const next = random(seed);
  const smallProblems = Array.from({ length: 20 }, (_, index) => makeProblem(
    `division-remainder-small-${index}`,
    integer(next, 11, 99),
    integer(next, 2, 9),
    false,
  ));
  const largeDivisors = shuffle([2, 3, 4, 5, 6, 7, 8, 9], next).slice(0, 5);
  const largeProblems = largeDivisors.map((divisor, index) => makeProblem(
    `division-remainder-large-${index}`,
    integer(next, 101, 999),
    divisor,
    true,
  ));
  return { seed, columns: [smallProblems.slice(0, 10), smallProblems.slice(10, 20), largeProblems] };
}

export default function GradeThreeDivisionTwoPage() {
  const [questionSet, setQuestionSet] = useState(() => createProblemSet(INITIAL_SEED));
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
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
  const completed = Object.values(answers).filter((answer) => answer.quotient || answer.remainder).length;
  const correct = Object.values(results).filter(Boolean).length;

  function updateAnswer(id: string, field: keyof Answer, value: string) {
    const maximumLength = field === "quotient" ? 3 : 1;
    setAnswers((current) => ({ ...current, [id]: { quotient: current[id]?.quotient ?? "", remainder: current[id]?.remainder ?? "", [field]: value.replace(/[^0-9]/g, "").slice(0, maximumLength) } }));
    setResults((current) => {
      if (!(id in current)) return current;
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  function checkAll() {
    setResults(Object.fromEntries(problems.map((problem) => {
      const answer = answers[problem.id];
      return [problem.id, answer?.quotient === String(problem.quotient) && answer?.remainder === String(problem.remainder)];
    })));
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

  function renderProblem(problem: Problem, answerSheet: boolean) {
    const graded = problem.id in results;
    const isCorrect = results[problem.id] === true;
    const answer = answers[problem.id] ?? { quotient: "", remainder: "" };
    return (
      <div className={`multiplication-question division-remainder-question${problem.large ? " division-remainder-question-large" : ""}${graded ? isCorrect ? " is-correct" : " is-wrong" : ""}`} data-testid="division-remainder-question" key={problem.id}>
        <strong>{problem.dividend}</strong><span>÷</span><strong>{problem.divisor}</strong><span>=</span>
        {answerSheet
          ? <strong className="multiplication-static-answer division-remainder-static">{problem.quotient}</strong>
          : <input className="multiplication-input division-remainder-input" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={3} value={answer.quotient} onChange={(event) => updateAnswer(problem.id, "quotient", event.target.value)} aria-label={`${problem.id} 몫`} />}
        <span>···</span>
        {answerSheet
          ? <strong className="multiplication-static-answer division-remainder-static division-remainder-static-small">{problem.remainder}</strong>
          : <input className="multiplication-input division-remainder-input division-remainder-input-small" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={1} value={answer.remainder} onChange={(event) => updateAnswer(problem.id, "remainder", event.target.value)} aria-label={`${problem.id} 나머지`} />}
        {!answerSheet && graded && <span className={`counting-result ${isCorrect ? "correct" : "wrong"}`} role="status">{isCorrect ? "맞음" : "틀림"}</span>}
      </div>
    );
  }

  function renderSheet(answerSheet: boolean) {
    return (
      <div className="a4-sheet counting-sheet multiplication-sheet" style={{ transform: `scale(${sheetScale})` }}>
        <header className="counting-sheet-header">
          <div className="counting-sheet-title"><span>3학년</span><strong>나눗셈②{answerSheet ? " 정답" : ""}</strong></div>
          <div className="counting-sheet-info"><span>이름 <i /></span><span>날짜 <i /></span><small>문제지 {questionSet.seed}</small></div>
        </header>
        <div className="multiplication-columns division-remainder-columns">
          {questionSet.columns.map((column, columnIndex) => <div className={`multiplication-column division-remainder-column${columnIndex === 2 ? " division-remainder-column-large" : ""}`} key={columnIndex}>{column.map((problem) => renderProblem(problem, answerSheet))}</div>)}
        </div>
      </div>
    );
  }

  return (
    <main className="counting-page multiplication-page">
      <div className="counting-toolbar">
        <a className="counting-back" href="/arithmetic">← 연산</a>
        <div className="counting-progress"><strong>{correct}<small>/25 정답</small></strong></div>
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
      <div className="a4-stage counting-a4-stage worksheet-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 3학년 나눗셈② 문제지">{renderSheet(false)}</div>
      <div className="a4-stage counting-a4-stage answer-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 3학년 나눗셈② 전체 답지">{renderSheet(true)}</div>
    </main>
  );
}
