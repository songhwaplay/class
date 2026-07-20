"use client";

import { useEffect, useMemo, useState } from "react";

type PrintMode = "worksheet" | "answers" | "both";
type VerticalProblem = {
  id: string;
  left: number;
  operator: "+" | "−";
  right: number;
  result: number;
};
type ProblemSet = { seed: number; problems: VerticalProblem[] };

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

function rangedTwoDigit(next: () => number, tensMinimum: number, tensMaximum: number, onesMinimum = 2, onesMaximum = 9) {
  return integer(next, tensMinimum, tensMaximum) * 10 + integer(next, onesMinimum, onesMaximum);
}

function createProblemSet(seed: number): ProblemSet {
  const next = random(seed);
  const problems: VerticalProblem[] = [];

  function addition(tensMinimum: number, tensMaximum: number, rightTensMinimum: number, rightTensMaximum: number, leftOnesMinimum = 2, leftOnesMaximum = 9, rightOnesMinimum = 2, rightOnesMaximum = 9) {
    const left = rangedTwoDigit(next, tensMinimum, tensMaximum, leftOnesMinimum, leftOnesMaximum);
    const right = rangedTwoDigit(next, rightTensMinimum, rightTensMaximum, rightOnesMinimum, rightOnesMaximum);
    problems.push({ id: `vertical-${problems.length}`, left, operator: "+", right, result: left + right });
  }

  function subtraction() {
    const left = integer(next, 21, 99);
    const right = integer(next, 11, left - 1);
    problems.push({ id: `vertical-${problems.length}`, left, operator: "−", right, result: left - right });
  }

  addition(4, 9, 3, 9, 3, 7, 2, 7);
  subtraction();
  addition(1, 6, 1, 9);
  subtraction();

  subtraction();
  subtraction();
  addition(1, 9, 1, 9);
  subtraction();

  addition(1, 6, 1, 9);
  addition(1, 9, 1, 9);
  subtraction();
  addition(1, 5, 1, 6);

  subtraction();
  addition(1, 6, 1, 9);
  subtraction();
  addition(1, 6, 1, 9);

  return { seed, problems };
}

export default function GradeTwoAdditionSubtractionOnePage() {
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

  const expected = useMemo(
    () => questionSet.problems.map((problem) => [problem.id, String(problem.result)] as const),
    [questionSet],
  );
  const completed = Object.values(answers).filter(Boolean).length;
  const correct = Object.values(results).filter(Boolean).length;

  function updateAnswer(id: string, value: string) {
    setAnswers((current) => ({ ...current, [id]: value.replace(/[^0-9]/g, "").slice(0, 3) }));
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

  function renderProblem(problem: VerticalProblem, answerSheet: boolean) {
    const graded = problem.id in results;
    const isCorrect = results[problem.id] === true;
    return (
      <div
        className={`vertical-equation${graded ? isCorrect ? " is-correct" : " is-wrong" : ""}`}
        data-testid="vertical-equation"
        key={problem.id}
      >
        <div className="vertical-operation">
          <strong>{problem.left}</strong>
          <span><i>{problem.operator}</i><strong>{problem.right}</strong></span>
          <b aria-hidden="true" />
          {answerSheet ? (
            <strong className="vertical-static-answer">{problem.result}</strong>
          ) : (
            <input
              className="vertical-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={3}
              value={answers[problem.id] ?? ""}
              onChange={(event) => updateAnswer(problem.id, event.target.value)}
              aria-label={`${problem.id} 답`}
            />
          )}
        </div>
        {!answerSheet && graded && (
          <span className={`counting-result ${isCorrect ? "correct" : "wrong"}`} role="status">
            {isCorrect ? "맞음" : "틀림"}
          </span>
        )}
      </div>
    );
  }

  function renderSheet(answerSheet: boolean) {
    return (
      <div className="a4-sheet counting-sheet vertical-sheet" style={{ transform: `scale(${sheetScale})` }}>
        <header className="counting-sheet-header">
          <div className="counting-sheet-title">
            <span>2학년</span>
            <strong>덧셈뺄셈①{answerSheet ? " 정답" : ""}</strong>
          </div>
          <div className="counting-sheet-info">
            <span>이름 <i /></span>
            <span>날짜 <i /></span>
            <small>문제지 {questionSet.seed}</small>
          </div>
        </header>
        <div className="vertical-grid">
          {questionSet.problems.map((problem) => renderProblem(problem, answerSheet))}
        </div>
      </div>
    );
  }

  return (
    <main className="counting-page vertical-page">
      <div className="counting-toolbar">
        <a className="counting-back" href="/arithmetic">← 연산</a>
        <div className="counting-progress"><strong>{correct}<small>/16 정답</small></strong></div>
        <div className="toolbar">
          <button className="button secondary" type="button" onClick={newSet}>새 문제</button>
          <button className="button ghost" type="button" onClick={resetAnswers}>다시 쓰기</button>
          <div className="print-control">
            <button className="button ghost print-button" type="button" aria-expanded={printMenuOpen} aria-haspopup="menu" onClick={() => setPrintMenuOpen((open) => !open)}>인쇄</button>
            {printMenuOpen && (
              <div className="print-menu" role="menu" aria-label="인쇄 자료 선택">
                <button type="button" role="menuitem" onClick={() => printMaterials("worksheet")}>문제지만 인쇄</button>
                <button type="button" role="menuitem" onClick={() => printMaterials("answers")}>답지만 인쇄</button>
                <button type="button" role="menuitem" onClick={() => printMaterials("both")}>문제지+답지 인쇄</button>
              </div>
            )}
          </div>
          <button className="button primary" type="button" onClick={checkAll}>전체 채점</button>
        </div>
      </div>
      <div className="a4-stage counting-a4-stage worksheet-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 2학년 덧셈뺄셈① 문제지">
        {renderSheet(false)}
      </div>
      <div className="a4-stage counting-a4-stage answer-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 2학년 덧셈뺄셈① 전체 답지">
        {renderSheet(true)}
      </div>
    </main>
  );
}
