"use client";

import { useEffect, useMemo, useState } from "react";

type PrintMode = "worksheet" | "answers" | "both";
type Fact = { dividend: number; divisor: number; quotient: number };
type Problem = Fact & { id: string };
type ProblemSet = { seed: number; columns: Problem[][] };

const INITIAL_SEED = 20260720;

function facts(divisor: number, dividends: number[]): Fact[] {
  return dividends.map((dividend) => ({ dividend, divisor, quotient: dividend / divisor }));
}

const TWO_FACTS = facts(2, [98, 96, 94, 92, 90, 78, 76, 74, 72, 70, 58, 56, 54, 52, 50, 38, 36, 34, 32, 30]);
const FOUR_FACTS = facts(4, [96, 92, 76, 72, 68, 64, 60, 56, 52]);
const THREE_FACTS = facts(3, [87, 84, 81, 78, 75, 72, 57, 54, 51, 48, 45, 42]);
const FIVE_FACTS = facts(5, [95, 90, 85, 80, 75, 70, 65, 60]);
const SIX_FACTS = facts(6, [96, 90, 84, 78, 72]);
const SEVEN_FACTS = facts(7, [98, 91, 84]);
const EIGHT_FACTS = facts(8, [96]);
const FIRST_GROUP = [...TWO_FACTS, ...FOUR_FACTS];
const SECOND_GROUP = [...THREE_FACTS, ...FIVE_FACTS, ...SIX_FACTS, ...SEVEN_FACTS, ...EIGHT_FACTS];
const SOURCE_FACTS = [...FIRST_GROUP, ...SECOND_GROUP];

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

function createProblems(prefix: string, values: Fact[]): Problem[] {
  return values.map((fact, index) => ({ ...fact, id: `${prefix}-${index}` }));
}

function createProblemSet(seed: number): ProblemSet {
  const next = random(seed);
  const review = shuffle(SOURCE_FACTS, next);
  return {
    seed,
    columns: [
      createProblems("division-three-first", FIRST_GROUP),
      createProblems("division-three-second", SECOND_GROUP),
      createProblems("division-three-review-a", review.slice(0, 29)),
      createProblems("division-three-review-b", review.slice(29)),
    ],
  };
}

export default function GradeThreeDivisionThreePage() {
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
    setResults(Object.fromEntries(problems.map((problem) => [problem.id, answers[problem.id] === String(problem.quotient)])));
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
      <div className={`multiplication-question division-three-question${graded ? isCorrect ? " is-correct" : " is-wrong" : ""}`} data-testid="division-three-question" key={problem.id}>
        <strong>{problem.dividend}</strong><span>÷</span><strong>{problem.divisor}</strong><span>=</span>
        {answerSheet
          ? <strong className="multiplication-static-answer division-three-static-answer">{problem.quotient}</strong>
          : <input className="multiplication-input division-three-input" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2} value={answers[problem.id] ?? ""} onChange={(event) => updateAnswer(problem.id, event.target.value)} aria-label={`${problem.id} 답`} />}
        {!answerSheet && graded && <span className={`counting-result ${isCorrect ? "correct" : "wrong"}`} role="status">{isCorrect ? "맞음" : "틀림"}</span>}
      </div>
    );
  }

  function renderSheet(answerSheet: boolean) {
    return (
      <div className="a4-sheet counting-sheet multiplication-sheet division-three-sheet" style={{ transform: `scale(${sheetScale})` }}>
        <header className="counting-sheet-header">
          <div className="counting-sheet-title"><span>3학년</span><strong>나눗셈③{answerSheet ? " 정답" : ""}</strong></div>
          <div className="counting-sheet-info"><span>이름 <i /></span><span>날짜 <i /></span><small>문제지 {questionSet.seed}</small></div>
        </header>
        <div className="division-three-headings"><strong>2, 4단</strong><strong>3, 5, 6, 7, 8단</strong><strong>순서 섞기</strong></div>
        <div className="multiplication-columns division-three-columns">
          {questionSet.columns.map((column, columnIndex) => <div className="multiplication-column division-three-column" key={columnIndex}>{column.map((problem) => renderProblem(problem, answerSheet))}</div>)}
        </div>
      </div>
    );
  }

  return (
    <main className="counting-page multiplication-page">
      <div className="counting-toolbar">
        <a className="counting-back" href="/arithmetic">← 연산</a>
        <div className="counting-progress"><strong>{correct}<small>/116 정답</small></strong></div>
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
      <div className="a4-stage counting-a4-stage worksheet-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 3학년 나눗셈③ 문제지">{renderSheet(false)}</div>
      <div className="a4-stage counting-a4-stage answer-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 3학년 나눗셈③ 전체 답지">{renderSheet(true)}</div>
    </main>
  );
}
