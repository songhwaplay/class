"use client";

import { useEffect, useMemo, useState } from "react";

type PrintMode = "worksheet" | "answers" | "both";
type Problem = { id: string; left: number; right: number; result: number };
type ProblemSet = { seed: number; leftColumn: Problem[]; rightColumn: Problem[] };

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

function subtrahend(next: () => number) {
  return integer(next, 2, 7) * 10 + integer(next, 1, 9);
}

function createProblemSet(seed: number): ProblemSet {
  const next = random(seed);
  const leftColumn = Array.from({ length: 11 }, (_, index) => {
    const left = 100;
    const right = subtrahend(next);
    return { id: `complement-hundred-left-${index}`, left, right, result: left - right };
  });
  const rightColumn = Array.from({ length: 11 }, (_, index) => {
    const left = 100 + integer(next, 1, 3);
    const right = subtrahend(next);
    return { id: `complement-hundred-right-${index}`, left, right, result: left - right };
  });
  return { seed, leftColumn, rightColumn };
}

function ResultMark({ value }: { value?: boolean }) {
  if (value === undefined) return null;
  return <span className={`counting-result ${value ? "correct" : "wrong"}`} role="status">{value ? "맞음" : "틀림"}</span>;
}

export default function GradeThreeComplementSubtractionHundredPage() {
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

  const problems = useMemo(() => [...questionSet.leftColumn, ...questionSet.rightColumn], [questionSet]);
  const expected = useMemo(() => problems.map((problem) => [problem.id, String(problem.result)] as const), [problems]);
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
    setResults(Object.fromEntries(expected.map(([id, answer]) => [id, answers[id] === answer])));
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

  function renderProblem(problem: Problem, answerSheet: boolean) {
    const result = results[problem.id];
    return (
      <div className={`complement-row simple hundred-complement-row${result === true ? " is-correct" : result === false ? " is-wrong" : ""}`} data-testid="hundred-complement-row" key={problem.id}>
        <strong>{problem.left}</strong><span>−</span><strong>{problem.right}</strong><span>=</span>
        {answerSheet ? (
          <strong className="complement-static-answer wide">{problem.result}</strong>
        ) : (
          <input
            className="complement-input wide"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={2}
            value={answers[problem.id] ?? ""}
            onChange={(event) => updateAnswer(problem.id, event.target.value)}
            aria-label={`${problem.id} 답`}
          />
        )}
        {!answerSheet && <ResultMark value={result} />}
      </div>
    );
  }

  function renderSheet(answerSheet: boolean) {
    return (
      <div className="a4-sheet counting-sheet complement-sheet hundred-complement-sheet" style={{ transform: `scale(${sheetScale})` }}>
        <header className="counting-sheet-header">
          <div className="counting-sheet-title"><span>3학년</span><strong>보수뺄셈100{answerSheet ? " 정답" : ""}</strong></div>
          <div className="counting-sheet-info"><span>이름 <i /></span><span>날짜 <i /></span><small>문제지 {questionSet.seed}</small></div>
        </header>
        <div className="complement-columns hundred-complement-columns">
          <section className="complement-column hundred-complement-column column-1" aria-label="100에서 빼기">
            {questionSet.leftColumn.map((problem) => renderProblem(problem, answerSheet))}
          </section>
          <section className="complement-column hundred-complement-column column-2" aria-label="101부터 103에서 빼기">
            {questionSet.rightColumn.map((problem) => renderProblem(problem, answerSheet))}
          </section>
        </div>
      </div>
    );
  }

  return (
    <main className="counting-page complement-page">
      <div className="counting-toolbar">
        <a className="counting-back" href="/arithmetic">← 연산</a>
        <div className="counting-progress"><strong>{correct}<small>/22 정답</small></strong></div>
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
      <div className="a4-stage counting-a4-stage worksheet-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 3학년 보수뺄셈100 문제지">{renderSheet(false)}</div>
      <div className="a4-stage counting-a4-stage answer-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 3학년 보수뺄셈100 전체 답지">{renderSheet(true)}</div>
    </main>
  );
}
