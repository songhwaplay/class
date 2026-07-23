"use client";

import { useEffect, useMemo, useState } from "react";
import { createDivisorMultipleSet } from "../../../lib/divisors-multiples";
import type { DivisorMultipleProblem } from "../../../lib/divisors-multiples";

type PrintMode = "worksheet" | "answers" | "both";

const INITIAL_SEED = 20260721;

export default function GradeFiveDivisorsMultiplesPage() {
  const [seed, setSeed] = useState(INITIAL_SEED);
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

  const problemSet = useMemo(() => createDivisorMultipleSet(seed), [seed]);
  const problems = useMemo(() => problemSet.columns.flat(), [problemSet]);
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

  function moveOnEnter(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const inputs = Array.from(document.querySelectorAll<HTMLInputElement>("[data-divisor-answer]"));
    const index = inputs.indexOf(event.currentTarget);
    const target = inputs[index + (event.shiftKey ? -1 : 1)];
    target?.focus();
    target?.select();
  }

  function checkAll() {
    setResults(Object.fromEntries(problems.map((problem) => [
      problem.id,
      answers[problem.id] === String(problem.answer),
    ])));
  }

  function resetAnswers() {
    setAnswers({});
    setResults({});
  }

  function newSet() {
    if (completed > 0 && !window.confirm("쓴 답이 사라집니다. 새 문제를 만들까요?")) return;
    setSeed((Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0);
    resetAnswers();
  }

  function printMaterials(mode: PrintMode) {
    setPrintMenuOpen(false);
    document.documentElement.dataset.printMode = mode;
    const clearPrintMode = () => delete document.documentElement.dataset.printMode;
    window.addEventListener("afterprint", clearPrintMode, { once: true });
    window.requestAnimationFrame(() => window.print());
  }

  function renderProblem(problem: DivisorMultipleProblem, index: number, answerSheet: boolean) {
    const graded = problem.id in results;
    const isCorrect = results[problem.id] === true;
    return (
      <div className={`multiplication-question divisor-multiple-question${graded ? isCorrect ? " is-correct" : " is-wrong" : ""}`} data-testid="divisor-multiple-question" key={problem.id}>
        <span className="divisor-multiple-index">{index + 1}</span>
        <div className="divisor-multiple-expression">
          <strong>{problem.left}</strong>
          <span>,</span>
          <strong>{problem.right}</strong>
          <span>→</span>
          {answerSheet
            ? <span className="divisor-multiple-static-answer">{problem.answer}</span>
            : <input className="divisor-multiple-input" data-divisor-answer type="text" inputMode="numeric" pattern="[0-9]*" maxLength={3} value={answers[problem.id] ?? ""} onChange={(event) => updateAnswer(problem.id, event.target.value)} onKeyDown={moveOnEnter} aria-label={`${problem.left}과 ${problem.right}의 ${problem.kind === "gcd" ? "최대공약수" : "최소공배수"} 답`} />}
        </div>
        {!answerSheet && graded && <span className={`counting-result ${isCorrect ? "correct" : "wrong"}`} role="status">{isCorrect ? "맞음" : "틀림"}</span>}
      </div>
    );
  }

  function renderSheet(answerSheet: boolean) {
    return (
      <div className="a4-sheet counting-sheet divisor-multiple-sheet" style={{ transform: `scale(${sheetScale})` }}>
        <header className="counting-sheet-header">
          <div className="counting-sheet-title"><span>5학년</span><strong>약수, 배수{answerSheet ? " 정답" : ""}</strong></div>
          <div className="counting-sheet-info"><span>이름 <i /></span><span>날짜 <i /></span><small>문제지 {seed}</small></div>
        </header>
        <p className="divisor-multiple-guide">두 수의 최대공약수 또는 최소공배수를 구하세요.</p>
        <div className="divisor-multiple-columns">
          {problemSet.columns.map((column, columnIndex) => (
            <section className="divisor-multiple-column" key={columnIndex}>
              <h2>{columnIndex < 2 ? "최대공약수" : "최소공배수"}</h2>
              {column.map((problem, rowIndex) => renderProblem(problem, rowIndex, answerSheet))}
            </section>
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
      <div className="a4-stage counting-a4-stage worksheet-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 5학년 약수, 배수 문제지">{renderSheet(false)}</div>
      <div className="a4-stage counting-a4-stage answer-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 5학년 약수, 배수 전체 답지">{renderSheet(true)}</div>
    </main>
  );
}
