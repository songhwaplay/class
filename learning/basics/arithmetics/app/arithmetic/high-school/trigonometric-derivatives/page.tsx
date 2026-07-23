"use client";

import { useEffect, useMemo, useState } from "react";
import MathFormula from "../../../components/math-formula";
import {
  createTrigonometricDerivativeChoices,
  createTrigonometricDerivativeProblemSet,
  createTrigonometricDerivativeReviewProblems,
  formatTrigonometricDerivativeAnswerLatex,
  formatTrigonometricDerivativeProblemLatex,
  type TrigonometricDerivativeProblem,
} from "../../../../lib/trigonometric-derivative-workouts";

const INITIAL_SEED = 20260728;

export default function TrigonometricDerivativesPage() {
  const [questionSet, setQuestionSet] = useState(() => createTrigonometricDerivativeProblemSet(INITIAL_SEED));
  const [reviewProblems, setReviewProblems] = useState<TrigonometricDerivativeProblem[]>([]);
  const [selectedChoices, setSelectedChoices] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [answerPanelOpen, setAnswerPanelOpen] = useState(false);
  const [sheetScale, setSheetScale] = useState(0.6);
  const problems = useMemo(() => [...questionSet.problems, ...reviewProblems], [questionSet.problems, reviewProblems]);

  useEffect(() => {
    function fitA4Sheet() {
      setSheetScale(Math.min((window.innerWidth - 32) / 794, 1));
    }
    fitA4Sheet();
    window.addEventListener("resize", fitA4Sheet);
    return () => window.removeEventListener("resize", fitA4Sheet);
  }, []);

  const wrongOriginal = questionSet.problems.filter((problem) => results[problem.id] === false);
  const correct = Object.values(results).filter(Boolean).length;

  function clearResult(problem: TrigonometricDerivativeProblem) {
    setResults((current) => {
      if (!(problem.id in current)) return current;
      const next = { ...current };
      delete next[problem.id];
      return next;
    });
  }

  function resetAnswers() {
    setSelectedChoices({});
    setResults({});
    setReviewProblems([]);
  }

  function newSet() {
    setQuestionSet(createTrigonometricDerivativeProblemSet((Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0));
    resetAnswers();
  }

  function checkAll() {
    setResults(Object.fromEntries(problems.map((problem) => {
      const selected = createTrigonometricDerivativeChoices(problem).find(({ id }) => id === selectedChoices[problem.id]);
      return [problem.id, selected?.correct === true];
    })));
  }

  function addReviews() {
    setReviewProblems(createTrigonometricDerivativeReviewProblems(
      wrongOriginal.map(({ kind }) => kind),
      (questionSet.seed ^ 0x9e3779b9) >>> 0,
    ));
  }

  function renderChoices(problem: TrigonometricDerivativeProblem, problemNumber: number) {
    const markers = ["①", "②", "③", "④"];
    return (
      <div className="trig-derivative-choices">
        {createTrigonometricDerivativeChoices(problem).map((choice, index) => {
          const selected = selectedChoices[problem.id] === choice.id;
          return (
            <button
              className={`trig-derivative-choice${selected ? " is-selected" : ""}`}
              data-testid="trigonometric-derivative-choice"
              type="button"
              aria-label={`${problemNumber}번 ${index + 1}번 선택지`}
              aria-pressed={selected}
              key={choice.id}
              onClick={() => {
                setSelectedChoices((current) => ({ ...current, [problem.id]: choice.id }));
                clearResult(problem);
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

  function renderProblem(problem: TrigonometricDerivativeProblem, index: number, answerSheet: boolean) {
    const graded = problem.id in results;
    const isCorrect = results[problem.id] === true;
    return (
      <article className={`polynomial-question derivative-question trig-derivative-question${answerSheet ? " is-answer-sheet" : ""}${graded ? isCorrect ? " is-correct" : " is-wrong" : ""}`} data-testid="trigonometric-derivative-question" key={problem.id}>
        <div className="polynomial-question-number">{String(index + 1).padStart(2, "0")}</div>
        <div className="polynomial-question-body">
          <span className="polynomial-focus-label">{problem.label}</span>
          <div className="derivative-expression trig-derivative-expression">
            <div><MathFormula latex={formatTrigonometricDerivativeProblemLatex(problem)} /></div>
            <div className="derivative-expression-target"><MathFormula latex="f^{\prime}(x)" /></div>
          </div>
        </div>
        {answerSheet ? (
          <div className="derivative-static-answer trig-derivative-static-answer"><MathFormula latex={formatTrigonometricDerivativeAnswerLatex(problem)} /></div>
        ) : null}
      </article>
    );
  }

  function renderAnswerPanel() {
    return (
      <div className="trig-derivative-answer-panel-backdrop" onClick={() => setAnswerPanelOpen(false)}>
        <aside className="trig-derivative-answer-panel" aria-label="삼각함수 미분 답안 입력" onClick={(event) => event.stopPropagation()}>
          <header>
            <div><strong>답안 입력</strong><small>풀이를 마친 뒤 답만 입력하세요.</small></div>
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
                  {graded && <span className={`counting-result ${isCorrect ? "correct" : "wrong"}`} role="status">{isCorrect ? "맞음" : <>정답 <MathFormula latex={formatTrigonometricDerivativeAnswerLatex(problem)} /></>}</span>}
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
      <div className={`a4-sheet counting-sheet polynomial-sheet derivative-sheet trig-derivative-sheet polynomial-sheet-${problems.length}`} style={{ transform: `scale(${sheetScale})` }}>
        <header className="counting-sheet-header polynomial-sheet-header">
          <div className="counting-sheet-title"><span>미적분Ⅱ</span><strong>삼각함수 미분 ①{answerSheet ? " 정답" : ""}</strong></div>
          <div className="counting-sheet-info"><span>이름 <i /></span><span>날짜 <i /></span><small>문제지 {questionSet.seed}</small></div>
        </header>
        <div className="polynomial-instruction"><b>각 문항의 빈 공간에 도함수를 풀어 쓰세요.</b><span>답안 입력에서 4지선다 채점 · 오답 보충 최대 2문제</span></div>
        <div className="polynomial-problem-grid derivative-problem-grid trig-derivative-problem-grid">{problems.map((problem, index) => renderProblem(problem, index, answerSheet))}</div>
      </div>
    );
  }

  return (
    <main className="counting-page polynomial-page derivative-page trig-derivative-page">
      <div className="counting-toolbar">
        <a className="counting-back" href="/arithmetic">← 연산</a>
        <div className="counting-progress"><strong>{correct}<small>/{problems.length} 정답</small></strong></div>
        <div className="toolbar">
          <button className="button secondary" type="button" onClick={newSet}>새 문제</button>
          <button className="button ghost" type="button" onClick={resetAnswers}>다시 풀기</button>
          {reviewProblems.length === 0 && wrongOriginal.length > 0 && <button className="button secondary" type="button" onClick={addReviews}>틀린 유형 {Math.min(wrongOriginal.length, 2)}문제 더</button>}
          <button className="button secondary" type="button" onClick={() => setAnswerPanelOpen(true)}>답안 입력</button>
          <button className="button ghost" type="button" onClick={() => window.print()}>인쇄</button>
          <button className="button primary" type="button" onClick={checkAll}>전체 채점</button>
        </div>
      </div>
      {answerPanelOpen && renderAnswerPanel()}
      <div className="a4-stage counting-a4-stage worksheet-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 삼각함수 미분 ① 문제지">{renderSheet(false)}</div>
      <div className="a4-stage counting-a4-stage answer-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 삼각함수 미분 ① 정답지">{renderSheet(true)}</div>
    </main>
  );
}
