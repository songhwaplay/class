"use client";

import { useEffect, useMemo, useState } from "react";

type PrintMode = "worksheet" | "answers" | "both";
type Range = readonly [number, number];
type ProblemPattern = { left: Range; right: Range };
type Problem = { id: string; left: number; right: number; product: number };
type ProblemSet = { seed: number; problems: Problem[] };

const INITIAL_SEED = 20260720;
const THREE_BY_ONE: ProblemPattern = { left: [666, 999], right: [6, 9] };
const TWO_BY_TWO: ProblemPattern = { left: [15, 99], right: [15, 99] };
const HIGH_TWO_BY_TWO: ProblemPattern = { left: [77, 99], right: [77, 99] };
const PATTERNS: ProblemPattern[] = [
  ...Array.from({ length: 4 }, () => THREE_BY_ONE),
  ...Array.from({ length: 8 }, () => TWO_BY_TWO),
  ...Array.from({ length: 2 }, () => HIGH_TWO_BY_TWO),
  ...Array.from({ length: 2 }, () => THREE_BY_ONE),
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

function integer(next: () => number, [minimum, maximum]: Range) {
  return minimum + Math.floor(next() * (maximum - minimum + 1));
}

function createProblemSet(seed: number): ProblemSet {
  const next = random(seed);
  return {
    seed,
    problems: PATTERNS.map((pattern, index) => {
      const left = integer(next, pattern.left);
      const right = integer(next, pattern.right);
      return { id: `grade-three-multiplication-three-${index}`, left, right, product: left * right };
    }),
  };
}

export default function GradeThreeMultiplicationThreePage() {
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

  const expected = useMemo(() => questionSet.problems.map((problem) => [problem.id, String(problem.product)] as const), [questionSet]);
  const completed = Object.values(answers).filter(Boolean).length;
  const correct = Object.values(results).filter(Boolean).length;

  function updateAnswer(id: string, answer: string) {
    setAnswers((current) => ({ ...current, [id]: answer.replace(/[^0-9]/g, "").slice(0, 4) }));
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
    const graded = problem.id in results;
    const isCorrect = results[problem.id] === true;
    return (
      <div className={`multiplication-question grade-three-multiplication-three-question${graded ? isCorrect ? " is-correct" : " is-wrong" : ""}`} data-testid="grade-three-multiplication-three-question" key={problem.id}>
        <strong>{problem.left}</strong><span>×</span><strong>{problem.right}</strong><span>=</span>
        {answerSheet
          ? <strong className="multiplication-static-answer grade-three-multiplication-three-static-answer">{problem.product}</strong>
          : <input className="multiplication-input grade-three-multiplication-three-input" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={4} value={answers[problem.id] ?? ""} onChange={(event) => updateAnswer(problem.id, event.target.value)} aria-label={`${problem.id} 답`} />}
        {!answerSheet && graded && <span className={`counting-result ${isCorrect ? "correct" : "wrong"}`} role="status">{isCorrect ? "맞음" : "틀림"}</span>}
      </div>
    );
  }

  function renderSheet(answerSheet: boolean) {
    return (
      <div className="a4-sheet counting-sheet multiplication-sheet" style={{ transform: `scale(${sheetScale})` }}>
        <header className="counting-sheet-header">
          <div className="counting-sheet-title"><span>3학년</span><strong>곱셈③{answerSheet ? " 정답" : ""}</strong></div>
          <div className="counting-sheet-info"><span>이름 <i /></span><span>날짜 <i /></span><small>문제지 {questionSet.seed}</small></div>
        </header>
        <div className="grade-three-multiplication-three-grid">{questionSet.problems.map((problem) => renderProblem(problem, answerSheet))}</div>
      </div>
    );
  }

  return (
    <main className="counting-page multiplication-page">
      <div className="counting-toolbar">
        <a className="counting-back" href="/arithmetic">← 연산</a>
        <div className="counting-progress"><strong>{correct}<small>/16 정답</small></strong></div>
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
      <div className="a4-stage counting-a4-stage worksheet-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 3학년 곱셈③ 문제지">{renderSheet(false)}</div>
      <div className="a4-stage counting-a4-stage answer-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 3학년 곱셈③ 전체 답지">{renderSheet(true)}</div>
    </main>
  );
}
