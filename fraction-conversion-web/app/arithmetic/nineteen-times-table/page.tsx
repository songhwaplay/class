"use client";

import { useEffect, useMemo, useState } from "react";

type PrintMode = "worksheet" | "answers" | "both";
type Range = readonly [number, number];
type Pattern = { left: Range; right: Range };
type Problem = { id: string; left: number; right: number; product: number };
type ProblemSet = { seed: number; columns: Problem[][] };

const INITIAL_SEED = 20260720;
const GROUPED_RIGHT_RANGES: Range[] = [[11, 13], [14, 16], [17, 19]];

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

function shuffle<T>(values: T[], next: () => number) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(next() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function sourcePatterns(): Pattern[] {
  const elevenThroughEighteen = Array.from({ length: 8 }, (_, index) => index + 11)
    .flatMap((left) => GROUPED_RIGHT_RANGES.map((right) => ({ left: [left, left] as Range, right })));
  const nineteen = ([[11, 13], [14, 15], [16, 17], [18, 19]] as Range[])
    .map((right) => ({ left: [19, 19] as Range, right }));
  return [
    ...elevenThroughEighteen,
    ...nineteen,
    { left: [1, 2], right: [16, 20] },
    { left: [14, 19], right: [1, 2] },
  ];
}

function createProblemSet(seed: number): ProblemSet {
  const next = random(seed);
  const generated = sourcePatterns().map((pattern, index) => {
    let left = integer(next, pattern.left);
    let right = integer(next, pattern.right);
    if (index === 28) left *= 10;
    if (index === 29) right *= 10;
    return { id: `nineteen-times-${index}`, left, right, product: left * right };
  });
  const ordered = shuffle(generated, next);
  const columns = Array.from({ length: 3 }, (_, columnIndex) => ordered.slice(columnIndex * 10, columnIndex * 10 + 10));
  return { seed, columns };
}

export default function NineteenTimesTablePage() {
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

  const problems = useMemo(() => questionSet.columns.flat(), [questionSet]);
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
    setResults(Object.fromEntries(problems.map((problem) => [problem.id, answers[problem.id] === String(problem.product)])));
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
    return (
      <div className={`multiplication-question nineteen-times-question${graded ? isCorrect ? " is-correct" : " is-wrong" : ""}`} data-testid="nineteen-times-question" key={problem.id}>
        <strong>{problem.left}</strong><span>×</span><strong>{problem.right}</strong><span>=</span>
        {answerSheet
          ? <strong className="multiplication-static-answer nineteen-times-static-answer">{problem.product}</strong>
          : <input className="multiplication-input nineteen-times-input" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={3} value={answers[problem.id] ?? ""} onChange={(event) => updateAnswer(problem.id, event.target.value)} aria-label={`${problem.id} 답`} />}
        {!answerSheet && graded && <span className={`counting-result ${isCorrect ? "correct" : "wrong"}`} role="status">{isCorrect ? "맞음" : "틀림"}</span>}
      </div>
    );
  }

  function renderSheet(answerSheet: boolean) {
    return (
      <div className="a4-sheet counting-sheet multiplication-sheet" style={{ transform: `scale(${sheetScale})` }}>
        <header className="counting-sheet-header">
          <div className="counting-sheet-title"><span>3학년</span><strong>19단{answerSheet ? " 정답" : ""}</strong></div>
          <div className="counting-sheet-info"><span>이름 <i /></span><span>날짜 <i /></span><small>문제지 {questionSet.seed}</small></div>
        </header>
        <div className="multiplication-columns nineteen-times-columns">
          {questionSet.columns.map((column, columnIndex) => <div className="multiplication-column nineteen-times-column" key={columnIndex}>{column.map((problem) => renderProblem(problem, answerSheet))}</div>)}
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
      <div className="a4-stage counting-a4-stage worksheet-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 19단 문제지">{renderSheet(false)}</div>
      <div className="a4-stage counting-a4-stage answer-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 19단 전체 답지">{renderSheet(true)}</div>
    </main>
  );
}
