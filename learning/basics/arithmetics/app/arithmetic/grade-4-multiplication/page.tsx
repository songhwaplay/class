"use client";

import { useEffect, useMemo, useState } from "react";

type PrintMode = "worksheet" | "answers" | "both";
type Layout = "horizontal" | "vertical";
type Problem = { id: string; top: number; bottom: number; result: number; layout: Layout };
type ProblemSet = { seed: number; problems: Problem[] };

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

function tensMultiple(next: () => number, minimumDigit: number, maximumDigit: number, minimumPower: number, maximumPower: number) {
  return integer(next, minimumDigit, maximumDigit) * (10 ** integer(next, minimumPower, maximumPower));
}

function problem(id: string, top: number, bottom: number, layout: Layout): Problem {
  return { id, top, bottom, result: top * bottom, layout };
}

function createProblemSet(seed: number): ProblemSet {
  const next = random(seed);
  const problems: Problem[] = [
    ...Array.from({ length: 2 }, (_, index) => problem(
      `grade-four-multiply-horizontal-${index}`,
      tensMultiple(next, 2, 6, 1, 3),
      tensMultiple(next, 2, 6, 2, 3),
      "horizontal",
    )),
    problem("grade-four-multiply-vertical-0", integer(next, 150, 999), integer(next, 15, 99), "vertical"),
    problem("grade-four-multiply-vertical-1", integer(next, 150, 999), tensMultiple(next, 5, 9, 1, 1), "vertical"),
    problem("grade-four-multiply-vertical-2", integer(next, 150, 999), integer(next, 15, 99), "vertical"),
    problem("grade-four-multiply-vertical-3", tensMultiple(next, 15, 99, 1, 1), tensMultiple(next, 5, 9, 1, 1), "vertical"),
    problem("grade-four-multiply-vertical-4", integer(next, 150, 999), tensMultiple(next, 5, 9, 1, 1), "vertical"),
    problem("grade-four-multiply-vertical-5", integer(next, 150, 999), integer(next, 15, 99), "vertical"),
    problem("grade-four-multiply-vertical-6", integer(next, 777, 999), integer(next, 77, 99), "vertical"),
    problem("grade-four-multiply-vertical-7", integer(next, 7777, 9999), integer(next, 77, 99), "vertical"),
    problem("grade-four-multiply-vertical-8", integer(next, 4444, 9999), tensMultiple(next, 3, 9, 2, 3), "vertical"),
  ];
  return { seed, problems };
}

export default function GradeFourMultiplicationPage() {
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
    setAnswers((current) => ({ ...current, [id]: value.replace(/[^0-9]/g, "").slice(0, 8) }));
    setResults((current) => {
      if (!(id in current)) return current;
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  function checkAll() {
    setResults(Object.fromEntries(problems.map((item) => [item.id, answers[item.id] === String(item.result)])));
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

  function answerField(item: Problem, answerSheet: boolean, index: number) {
    if (answerSheet) return <strong className="grade-four-multiply-static-answer">{item.result}</strong>;
    return <input className="grade-four-multiply-input" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={8} value={answers[item.id] ?? ""} onChange={(event) => updateAnswer(item.id, event.target.value)} aria-label={`${index + 1}번 답`} />;
  }

  function renderProblem(item: Problem, index: number, answerSheet: boolean) {
    const graded = item.id in results;
    const isCorrect = results[item.id] === true;
    const className = `multiplication-question grade-four-multiply-question ${item.layout}${graded ? isCorrect ? " is-correct" : " is-wrong" : ""}`;
    return (
      <div className={className} data-testid="grade-four-multiplication-question" key={item.id}>
        <span className="grade-four-multiply-index">{index + 1}</span>
        {item.layout === "horizontal" ? (
          <div className="grade-four-multiply-horizontal-expression">
            <strong>{item.top}</strong><span>×</span><strong>{item.bottom}</strong><span>=</span>{answerField(item, answerSheet, index)}
          </div>
        ) : (
          <div className="grade-four-multiply-vertical-operation">
            <strong>{item.top}</strong>
            <span><i>×</i><strong>{item.bottom}</strong></span>
            <b aria-hidden="true" />
            {answerField(item, answerSheet, index)}
          </div>
        )}
        {!answerSheet && graded && <span className={`counting-result ${isCorrect ? "correct" : "wrong"}`} role="status">{isCorrect ? "맞음" : "틀림"}</span>}
      </div>
    );
  }

  function renderSheet(answerSheet: boolean) {
    return (
      <div className="a4-sheet counting-sheet grade-four-multiply-sheet" style={{ transform: `scale(${sheetScale})` }}>
        <header className="counting-sheet-header">
          <div className="counting-sheet-title"><span>4학년</span><strong>곱셈{answerSheet ? " 정답" : ""}</strong></div>
          <div className="counting-sheet-info"><span>이름 <i /></span><span>날짜 <i /></span><small>문제지 {questionSet.seed}</small></div>
        </header>
        <div className="grade-four-multiply-horizontal-grid">{questionSet.problems.slice(0, 2).map((item, index) => renderProblem(item, index, answerSheet))}</div>
        <div className="grade-four-multiply-vertical-grid">{questionSet.problems.slice(2).map((item, index) => renderProblem(item, index + 2, answerSheet))}</div>
      </div>
    );
  }

  return (
    <main className="counting-page multiplication-page">
      <div className="counting-toolbar">
        <a className="counting-back" href="/arithmetic">← 연산</a>
        <div className="counting-progress"><strong>{correct}<small>/11 정답</small></strong></div>
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
      <div className="a4-stage counting-a4-stage worksheet-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 4학년 곱셈 문제지">{renderSheet(false)}</div>
      <div className="a4-stage counting-a4-stage answer-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 4학년 곱셈 전체 답지">{renderSheet(true)}</div>
    </main>
  );
}
