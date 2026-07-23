"use client";

import { useEffect, useMemo, useState } from "react";
import { createNaturalNumberDecompositionSet, isPrimeFactorizationAnswer } from "../../../lib/natural-number-decomposition";
import type { NaturalNumberDecompositionProblem } from "../../../lib/natural-number-decomposition";

type PrintMode = "worksheet" | "answers" | "both";

const INITIAL_SEED = 20260721;

export default function GradeFiveNaturalNumberDecompositionPage() {
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

  const problems = useMemo(() => createNaturalNumberDecompositionSet(seed), [seed]);
  const completed = Object.values(answers).filter((answer) => answer.trim()).length;
  const correct = Object.values(results).filter(Boolean).length;

  function updateAnswer(id: string, input: string) {
    const cleaned = input.replace(/[^0-9×xX*·⋅\s]/g, "").slice(0, 24);
    setAnswers((current) => ({ ...current, [id]: cleaned }));
    setResults((current) => {
      if (!(id in current)) return current;
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  function checkAll() {
    setResults(Object.fromEntries(problems.map((problem) => [
      problem.id,
      isPrimeFactorizationAnswer(problem.number, answers[problem.id] ?? ""),
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

  function renderProblem(problem: NaturalNumberDecompositionProblem, index: number, answerSheet: boolean) {
    const graded = problem.id in results;
    const isCorrect = results[problem.id] === true;
    return (
      <div className={`multiplication-question natural-decomposition-question${graded ? isCorrect ? " is-correct" : " is-wrong" : ""}`} data-testid="natural-decomposition-question" key={problem.id}>
        <span className="natural-decomposition-index">{index + 1}</span>
        <div className="natural-decomposition-expression">
          <strong>{problem.number}</strong>
          <span>→</span>
          {answerSheet
            ? <span className="natural-decomposition-static-answer">{problem.answer}</span>
            : <input className="natural-decomposition-input" type="text" inputMode="text" maxLength={24} placeholder="2×2×3" value={answers[problem.id] ?? ""} onChange={(event) => updateAnswer(problem.id, event.target.value)} aria-label={`${problem.number}의 소인수분해 답`} />}
        </div>
        {!answerSheet && graded && <span className={`counting-result ${isCorrect ? "correct" : "wrong"}`} role="status">{isCorrect ? "맞음" : "틀림"}</span>}
      </div>
    );
  }

  function renderSheet(answerSheet: boolean) {
    return (
      <div className="a4-sheet counting-sheet natural-decomposition-sheet" style={{ transform: `scale(${sheetScale})` }}>
        <header className="counting-sheet-header">
          <div className="counting-sheet-title"><span>5학년</span><strong>자연수분해{answerSheet ? " 정답" : ""}</strong></div>
          <div className="counting-sheet-info"><span>이름 <i /></span><span>날짜 <i /></span><small>문제지 {seed}</small></div>
        </header>
        <p className="natural-decomposition-guide">소수는 그대로 쓰고, 합성수는 소인수의 곱으로 나타내세요. <small>× 대신 x 또는 *도 입력할 수 있어요.</small></p>
        <div className="natural-decomposition-grid">
          {problems.map((problem, index) => renderProblem(problem, index, answerSheet))}
          <div className="natural-decomposition-empty" aria-hidden="true" />
        </div>
      </div>
    );
  }

  return (
    <main className="counting-page multiplication-page">
      <div className="counting-toolbar">
        <a className="counting-back" href="/arithmetic">← 연산</a>
        <div className="counting-progress"><strong>{correct}<small>/15 정답</small></strong></div>
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
      <div className="a4-stage counting-a4-stage worksheet-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 5학년 자연수분해 문제지">{renderSheet(false)}</div>
      <div className="a4-stage counting-a4-stage answer-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 5학년 자연수분해 전체 답지">{renderSheet(true)}</div>
    </main>
  );
}
