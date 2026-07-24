"use client";

import { useEffect, useMemo, useState } from "react";
import MathFormula from "../../../components/math-formula";
import {
  createComplexChoices,
  createComplexProblemSet,
  createComplexReviewProblems,
  formatComplexAnswerLatex,
  type ComplexProblem,
} from "../../../../lib/complex-number-workouts";

const INITIAL_SEED = 20260723;

function answerLatex(problem: ComplexProblem) {
  const { real, imaginary } = problem.answer;
  const imaginaryTerm = `${Math.abs(imaginary) === 1 ? "" : Math.abs(imaginary)}i`;
  if (problem.answerMode === "conjugate-pair") return `x=${real}\\pm ${imaginaryTerm}`;
  if (imaginary === 0) return String(real);
  if (real === 0) return `${imaginary < 0 ? "-" : ""}${imaginaryTerm}`;
  return `${real}${imaginary < 0 ? "-" : "+"}${imaginaryTerm}`;
}

export default function ComplexNumbersPage() {
  const [questionSet, setQuestionSet] = useState(() => createComplexProblemSet(INITIAL_SEED));
  const [reviewProblems, setReviewProblems] = useState<ComplexProblem[]>([]);
  const [selectedChoices, setSelectedChoices] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [answerPanelOpen, setAnswerPanelOpen] = useState(false);
  const [sheetScale, setSheetScale] = useState(0.6);
  const problems = useMemo(() => [...questionSet.problems, ...reviewProblems], [questionSet.problems, reviewProblems]);
  const correct = Object.values(results).filter(Boolean).length;
  const wrongOriginal = questionSet.problems.filter((problem) => results[problem.id] === false);

  useEffect(() => {
    const fit = () => setSheetScale(Math.min((window.innerWidth - 32) / 794, 1));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  function reset() {
    setSelectedChoices({});
    setResults({});
    setReviewProblems([]);
  }

  function newSet() {
    if (Object.keys(selectedChoices).length > 0 && !window.confirm("선택한 답이 사라집니다. 새 문제를 만들까요?")) return;
    setQuestionSet(createComplexProblemSet((Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0));
    reset();
  }

  function checkAll() {
    setResults(Object.fromEntries(problems.map((problem) => [
      problem.id,
      createComplexChoices(problem).find(({ id }) => id === selectedChoices[problem.id])?.correct === true,
    ])));
  }

  function addReviews() {
    setReviewProblems(createComplexReviewProblems(
      wrongOriginal.map(({ kind }) => kind),
      (questionSet.seed ^ 0x9e3779b9) >>> 0,
    ));
  }

  function renderProblem(problem: ComplexProblem, index: number, answerSheet: boolean) {
    const graded = problem.id in results;
    const isCorrect = results[problem.id] === true;
    return (
      <article className={`polynomial-question complex-question${answerSheet ? " is-answer-sheet" : ""}${graded ? isCorrect ? " is-correct" : " is-wrong" : ""}`} key={problem.id} data-testid="complex-number-question">
        <div className="polynomial-question-number">{String(index + 1).padStart(2, "0")}</div>
        <div className="polynomial-question-body">
          <span className="polynomial-focus-label">{problem.label}</span>
          <div className="complex-expression"><MathFormula latex={problem.latex} display /></div>
        </div>
        {answerSheet ? (
          <div className="complex-static-answer"><MathFormula latex={answerLatex(problem)} /></div>
        ) : null}
      </article>
    );
  }

  function renderAnswerPanel() {
    const markers = ["①", "②", "③", "④"];
    return <div className="trig-derivative-answer-panel-backdrop" onClick={() => setAnswerPanelOpen(false)}>
      <aside className="trig-derivative-answer-panel" aria-label="복소수 답안 입력" onClick={(event) => event.stopPropagation()}>
        <header><div><strong>답안 입력</strong><small>풀이를 마친 뒤 답만 선택하세요.</small></div><button type="button" onClick={() => setAnswerPanelOpen(false)} aria-label="답안 입력 닫기">×</button></header>
        <div className="trig-derivative-answer-list">{problems.map((problem, problemIndex) => <section className="trig-derivative-answer-item" key={problem.id}>
          <div className="trig-derivative-answer-item-heading"><strong>{String(problemIndex + 1).padStart(2, "0")}</strong><span>{problem.label}</span></div>
          <div className="trig-derivative-choices">{createComplexChoices(problem).map((choice, choiceIndex) => {
            const selected = selectedChoices[problem.id] === choice.id;
            return <button className={`trig-derivative-choice${selected ? " is-selected" : ""}`} data-testid="complex-answer-choice" type="button" aria-pressed={selected} key={choice.id} onClick={() => { setSelectedChoices((current) => ({ ...current, [problem.id]: choice.id })); setResults((current) => { const next = { ...current }; delete next[problem.id]; return next; }); }}><span>{markers[choiceIndex]}</span><MathFormula latex={choice.latex} /></button>;
          })}</div>
          {problem.id in results && <span className={`counting-result ${results[problem.id] ? "correct" : "wrong"}`}>{results[problem.id] ? "맞음" : <>정답 <MathFormula latex={formatComplexAnswerLatex(problem)} /></>}</span>}
        </section>)}</div>
        <button className="button primary trig-derivative-panel-grade" type="button" onClick={checkAll}>전체 채점</button>
      </aside>
    </div>;
  }

  function renderSheet(answerSheet: boolean) {
    return (
      <div className={`a4-sheet counting-sheet polynomial-sheet complex-sheet polynomial-sheet-${problems.length}`} style={{ transform: `scale(${sheetScale})` }}>
        <header className="counting-sheet-header polynomial-sheet-header">
          <div className="counting-sheet-title"><span>공통수학 1</span><strong>복소수{answerSheet ? " 정답" : ""}</strong></div>
          <div className="counting-sheet-info"><span>이름 <i /></span><span>날짜 <i /></span><small>문제지 {questionSet.seed}</small></div>
        </header>
        <div className="polynomial-instruction"><b>빈 공간에 복소수 계산 과정을 쓰세요.</b><span>답안 입력에서 4지선다 채점 · 오답 보충 최대 2문제</span></div>
        <div className="polynomial-problem-grid complex-problem-grid">{problems.map((problem, index) => renderProblem(problem, index, answerSheet))}</div>
      </div>
    );
  }

  return (
    <main className="counting-page polynomial-page complex-page">
      <div className="counting-toolbar">
        <a className="counting-back" href="/arithmetic">← 연산</a>
        <div className="counting-progress"><strong>{correct}<small>/{problems.length} 정답</small></strong></div>
        <div className="toolbar">
          <button className="button secondary" type="button" onClick={newSet}>새 문제</button>
          <button className="button ghost" type="button" onClick={reset}>다시 풀기</button>
          {reviewProblems.length === 0 && wrongOriginal.length > 0 && <button className="button secondary" type="button" onClick={addReviews}>틀린 유형 {Math.min(wrongOriginal.length, 2)}문제 더</button>}
          <button className="button secondary" type="button" onClick={() => setAnswerPanelOpen(true)}>답안 입력</button>
          <button className="button ghost" type="button" onClick={() => window.print()}>인쇄</button>
          <button className="button primary" type="button" onClick={checkAll}>전체 채점</button>
        </div>
      </div>
      {answerPanelOpen && renderAnswerPanel()}
      <div className="a4-stage counting-a4-stage worksheet-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 복소수 문제지">{renderSheet(false)}</div>
      <div className="a4-stage counting-a4-stage answer-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 복소수 정답지">{renderSheet(true)}</div>
    </main>
  );
}
