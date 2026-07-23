"use client";

import { useEffect, useMemo, useState } from "react";
import MathFormula from "../../../components/math-formula";
import {
  createPolynomialChoices,
  createPolynomialProblemSet,
  createPolynomialReviewProblems,
  formatPolynomial,
  formatPolynomialExpression,
  type PolynomialProblem,
} from "../../../../lib/polynomial-worksheets";

type PrintMode = "worksheet" | "answers" | "both";

const INITIAL_SEED = 20260721;

export default function PolynomialAdditionSubtractionPage() {
  const [questionSet, setQuestionSet] = useState(() => createPolynomialProblemSet(INITIAL_SEED));
  const [reviewProblems, setReviewProblems] = useState<PolynomialProblem[]>([]);
  const [selectedChoices, setSelectedChoices] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [sheetScale, setSheetScale] = useState(0.6);
  const [printMenuOpen, setPrintMenuOpen] = useState(false);
  const [answerPanelOpen, setAnswerPanelOpen] = useState(false);

  const problems = useMemo(
    () => [...questionSet.problems, ...reviewProblems],
    [questionSet.problems, reviewProblems],
  );

  useEffect(() => {
    function fitA4Sheet() {
      setSheetScale(Math.min((window.innerWidth - 32) / 794, 1));
    }
    fitA4Sheet();
    window.addEventListener("resize", fitA4Sheet);
    return () => window.removeEventListener("resize", fitA4Sheet);
  }, []);

  const completed = useMemo(
    () => problems.filter((problem) => selectedChoices[problem.id]).length,
    [selectedChoices, problems],
  );
  const correct = Object.values(results).filter(Boolean).length;
  const wrongOriginalProblems = questionSet.problems.filter((problem) => results[problem.id] === false);
  const canAddReview = reviewProblems.length === 0 && wrongOriginalProblems.length > 0;
  const reviewCount = Math.min(wrongOriginalProblems.length, 2);

  function checkAll() {
    setResults(Object.fromEntries(problems.map((problem) => [
      problem.id,
      createPolynomialChoices(problem).find(({ id }) => id === selectedChoices[problem.id])?.correct === true,
    ])));
  }

  function resetAnswers() {
    setSelectedChoices({});
    setResults({});
    setReviewProblems([]);
  }

  function newSet() {
    if (completed > 0 && !window.confirm("입력이 사라집니다. 새 문제를 만들까요?")) return;
    setQuestionSet(createPolynomialProblemSet((Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0));
    resetAnswers();
  }

  function addReviewProblems() {
    const reviewSeed = (questionSet.seed ^ 0x9e3779b9) >>> 0;
    setReviewProblems(createPolynomialReviewProblems(
      wrongOriginalProblems.map(({ kind }) => kind),
      reviewSeed,
    ));
  }

  function printMaterials(mode: PrintMode) {
    setPrintMenuOpen(false);
    document.documentElement.dataset.printMode = mode;
    const clearPrintMode = () => delete document.documentElement.dataset.printMode;
    window.addEventListener("afterprint", clearPrintMode, { once: true });
    window.requestAnimationFrame(() => window.print());
  }

  function renderProblem(problem: PolynomialProblem, index: number, answerSheet: boolean) {
    const graded = problem.id in results;
    const isCorrect = results[problem.id] === true;
    return (
      <article className={`polynomial-question${answerSheet ? " is-answer-sheet" : ""}${graded ? isCorrect ? " is-correct" : " is-wrong" : ""}`} data-testid="polynomial-question" key={problem.id}>
        <div className="polynomial-question-number">{String(index + 1).padStart(2, "0")}</div>
        <div className="polynomial-question-body">
          <span className="polynomial-focus-label">{problem.label}</span>
          <div className="polynomial-expression">{formatPolynomialExpression(problem.operations)}</div>
        </div>
        {answerSheet ? (
          <div className="polynomial-static-answer">= {formatPolynomial(problem.answer)}</div>
        ) : null}
      </article>
    );
  }

  function renderChoices(problem: PolynomialProblem, problemNumber: number) {
    const markers = ["①", "②", "③", "④"];
    return (
      <div className="trig-derivative-choices polynomial-answer-choices">
        {createPolynomialChoices(problem).map((choice, index) => {
          const selected = selectedChoices[problem.id] === choice.id;
          return (
            <button
              className={`trig-derivative-choice${selected ? " is-selected" : ""}`}
              data-testid="polynomial-answer-choice"
              type="button"
              aria-label={`${problemNumber}번 ${index + 1}번 선택지`}
              aria-pressed={selected}
              key={choice.id}
              onClick={() => {
                setSelectedChoices((current) => ({ ...current, [problem.id]: choice.id }));
                setResults((current) => {
                  if (!(problem.id in current)) return current;
                  const next = { ...current };
                  delete next[problem.id];
                  return next;
                });
              }}
            >
              <span>{markers[index]}</span>
              <MathFormula latex={choice.latex} />
            </button>
          );
        })}
      </div>
    );
  }

  function renderAnswerPanel() {
    return (
      <div className="trig-derivative-answer-panel-backdrop" onClick={() => setAnswerPanelOpen(false)}>
        <aside className="trig-derivative-answer-panel" aria-label="다항식 답안 입력" onClick={(event) => event.stopPropagation()}>
          <header>
            <div><strong>답안 입력</strong><small>풀이를 마친 뒤 답만 선택하세요.</small></div>
            <button type="button" onClick={() => setAnswerPanelOpen(false)} aria-label="답안 입력 닫기">×</button>
          </header>
          <div className="trig-derivative-answer-list">
            {problems.map((problem, index) => {
              const graded = problem.id in results;
              const isCorrect = results[problem.id] === true;
              return (
                <section className="trig-derivative-answer-item" key={problem.id}>
                  <div className="trig-derivative-answer-item-heading">
                    <strong>{String(index + 1).padStart(2, "0")}</strong>
                    <span>{problem.label}</span>
                  </div>
                  {renderChoices(problem, index + 1)}
                  {graded && <span className={`counting-result ${isCorrect ? "correct" : "wrong"}`} role="status">{isCorrect ? "맞음" : <>정답 <MathFormula latex={createPolynomialChoices(problem).find(({ correct }) => correct)?.latex ?? "0"} /></>}</span>}
                </section>
              );
            })}
          </div>
          <button className="button primary trig-derivative-panel-grade" type="button" onClick={checkAll}>전체 채점</button>
        </aside>
      </div>
    );
  }

  function renderSheet(answerSheet: boolean) {
    return (
      <div className={`a4-sheet counting-sheet polynomial-sheet polynomial-sheet-${problems.length}`} style={{ transform: `scale(${sheetScale})` }}>
        <header className="counting-sheet-header polynomial-sheet-header">
          <div className="counting-sheet-title"><span>공통수학 1</span><strong>다항식{answerSheet ? " 정답" : ""}</strong></div>
          <div className="counting-sheet-info"><span>이름 <i /></span><span>날짜 <i /></span><small>문제지 {questionSet.seed}</small></div>
        </header>
        <div className="polynomial-instruction"><b>식을 전개하고 빈 공간에 정리 과정을 쓰세요.</b><span>답안 입력에서 4지선다 채점 · 오답 보충 최대 2문제</span></div>
        <div className="polynomial-problem-grid">
          {problems.map((problem, index) => renderProblem(problem, index, answerSheet))}
        </div>
      </div>
    );
  }

  return (
    <main className="counting-page polynomial-page polynomial-drill-page">
      <div className="counting-toolbar">
        <a className="counting-back" href="/arithmetic">← 연산</a>
        <div className="counting-progress"><strong>{correct}<small>/{problems.length} 정답</small></strong></div>
        <div className="toolbar">
          <button className="button secondary" type="button" onClick={newSet}>새 문제</button>
          <button className="button ghost" type="button" onClick={resetAnswers}>다시 풀기</button>
          {canAddReview && <button className="button secondary polynomial-review-button" type="button" onClick={addReviewProblems}>틀린 유형 {reviewCount}문제 더</button>}
          <button className="button secondary" type="button" onClick={() => setAnswerPanelOpen(true)}>답안 입력</button>
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
      {answerPanelOpen && renderAnswerPanel()}
      <div className="a4-stage counting-a4-stage worksheet-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 다항식 문제지">{renderSheet(false)}</div>
      <div className="a4-stage counting-a4-stage answer-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 다항식 정답지">{renderSheet(true)}</div>
    </main>
  );
}
