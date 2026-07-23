"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createEquationChoices,
  createEquationProblemSet,
  createEquationReviewProblems,
  normalizeSolutionSet,
  type EquationExpression,
  type EquationProblem,
} from "../../../../lib/equation-workouts";
import MathFormula from "../../../components/math-formula";

type PrintMode = "worksheet" | "answers" | "both";
const INITIAL_SEED = 20260724;

function signedLinear(coefficient: number, constant: number) {
  const variable = coefficient === 1 ? "x" : coefficient === -1 ? "-x" : `${coefficient}x`;
  if (constant === 0) return variable;
  return `${variable}${constant < 0 ? "-" : "+"}${Math.abs(constant)}`;
}

function shiftedX(root: number) {
  if (root === 0) return "x";
  return `x${root > 0 ? "-" : "+"}${Math.abs(root)}`;
}

function equationLatex(expression: EquationExpression) {
  if (expression.type === "rational") {
    return `\\frac{${shiftedX(expression.numeratorShift)}}{${shiftedX(expression.firstDenominatorShift)}}=\\frac{${expression.rightNumerator}}{${shiftedX(expression.secondDenominatorShift)}}`;
  }
  if (expression.type === "radical") {
    return `\\sqrt{${shiftedX(-expression.firstOffset)}}+\\sqrt{${shiftedX(-expression.secondOffset)}}=${expression.result}`;
  }
  if (expression.type === "absolute") {
    return `\\left|${signedLinear(expression.insideCoefficient, expression.insideConstant)}\\right|=${signedLinear(expression.rightCoefficient, expression.rightConstant)}`;
  }
  const quadratic = expression.quadraticCoefficient < 0
    ? `-${Math.abs(expression.quadraticCoefficient)}x^2`
    : `+${expression.quadraticCoefficient}x^2`;
  const constant = expression.constant < 0 ? `-${Math.abs(expression.constant)}` : `+${expression.constant}`;
  return `x^4${quadratic}${constant}=0`;
}

function solutionLatex(answers: number[]) {
  return `x=${normalizeSolutionSet(answers).join(",\\ ")}`;
}

export default function EquationTransformationsPage() {
  const [questionSet, setQuestionSet] = useState(() => createEquationProblemSet(INITIAL_SEED));
  const [reviewProblems, setReviewProblems] = useState<EquationProblem[]>([]);
  const [selectedChoices, setSelectedChoices] = useState<Record<string, number>>({});
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [answerPanelOpen, setAnswerPanelOpen] = useState(false);
  const [sheetScale, setSheetScale] = useState(0.6);
  const [printMenuOpen, setPrintMenuOpen] = useState(false);

  const problems = useMemo(() => [...questionSet.problems, ...reviewProblems], [questionSet.problems, reviewProblems]);
  const completed = Object.keys(selectedChoices).filter((id) => problems.some((problem) => problem.id === id)).length;
  const correct = Object.values(results).filter(Boolean).length;
  const wrongOriginal = questionSet.problems.filter((problem) => results[problem.id] === false);

  useEffect(() => {
    const fitA4Sheet = () => setSheetScale(Math.min((window.innerWidth - 32) / 794, 1));
    fitA4Sheet();
    window.addEventListener("resize", fitA4Sheet);
    return () => window.removeEventListener("resize", fitA4Sheet);
  }, []);

  function resetAnswers() {
    setSelectedChoices({});
    setResults({});
    setReviewProblems([]);
  }

  function newSet() {
    if (completed > 0 && !window.confirm("입력한 답이 사라집니다. 새 문제를 만들까요?")) return;
    setQuestionSet(createEquationProblemSet((Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0));
    resetAnswers();
  }

  function selectChoice(problem: EquationProblem, choiceIndex: number) {
    setSelectedChoices((current) => ({ ...current, [problem.id]: choiceIndex }));
    setResults((current) => {
      if (!(problem.id in current)) return current;
      const next = { ...current };
      delete next[problem.id];
      return next;
    });
  }

  function checkAll() {
    setResults(Object.fromEntries(problems.map((problem) => {
      const selected = selectedChoices[problem.id];
      return [problem.id, selected !== undefined && createEquationChoices(problem)[selected]?.correct === true];
    })));
  }

  function addReviews() {
    setReviewProblems(createEquationReviewProblems(
      wrongOriginal.map(({ kind }) => kind),
      (questionSet.seed ^ 0x9e3779b9) >>> 0,
    ));
  }

  function printMaterials(mode: PrintMode) {
    setPrintMenuOpen(false);
    document.documentElement.dataset.printMode = mode;
    const clear = () => delete document.documentElement.dataset.printMode;
    window.addEventListener("afterprint", clear, { once: true });
    window.requestAnimationFrame(() => window.print());
  }

  function renderProblem(problem: EquationProblem, index: number, answerSheet: boolean) {
    return (
      <article className="polynomial-question equation-question" data-testid="equation-question" key={problem.id}>
        <div className="polynomial-question-number">{String(index + 1).padStart(2, "0")}</div>
        <div className="polynomial-question-body">
          <span className="polynomial-focus-label">{problem.label}</span>
          <div className="equation-expression"><MathFormula latex={equationLatex(problem.expression)} display /></div>
          {problem.restrictions && <small className="rational-restrictions">단, <MathFormula latex={`x\\ne ${problem.restrictions.join(",\\ ")}`} /></small>}
          {answerSheet && <div className="equation-static-answer">정답 <MathFormula latex={solutionLatex(problem.answers)} /></div>}
        </div>
      </article>
    );
  }

  function renderSheet(answerSheet: boolean) {
    return (
      <div className={`a4-sheet counting-sheet polynomial-sheet equation-sheet polynomial-sheet-${problems.length}`} style={{ transform: `scale(${sheetScale})` }}>
        <header className="counting-sheet-header polynomial-sheet-header">
          <div className="counting-sheet-title"><span>공통수학 1</span><strong>방정식{answerSheet ? " 정답" : ""}</strong></div>
          <div className="counting-sheet-info"><span>이름 <i /></span><span>날짜 <i /></span><small>문제지 {questionSet.seed}</small></div>
        </header>
        <div className="polynomial-instruction">
          <b>방정식의 해를 구하세요. 빈 공간에 풀이 과정을 쓰세요.</b>
          <span>답안 입력에서 4지선다 채점 · 오답 보충 최대 2문제</span>
        </div>
        <div className="polynomial-problem-grid equation-problem-grid">{problems.map((problem, index) => renderProblem(problem, index, answerSheet))}</div>
      </div>
    );
  }

  return (
    <main className="counting-page polynomial-page equation-page">
      <div className="counting-toolbar">
        <a className="counting-back" href="/arithmetic">← 연산</a>
        <div className="counting-progress"><strong>{correct}<small>/{problems.length} 정답</small></strong></div>
        <div className="toolbar">
          <button className="button secondary" type="button" onClick={newSet}>새 문제</button>
          <button className="button ghost" type="button" onClick={resetAnswers}>다시 풀기</button>
          {reviewProblems.length === 0 && wrongOriginal.length > 0 && <button className="button secondary" type="button" onClick={addReviews}>틀린 유형 {Math.min(wrongOriginal.length, 2)}문제 더</button>}
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
      <div className="a4-stage counting-a4-stage worksheet-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 방정식 문제지">{renderSheet(false)}</div>
      <div className="a4-stage counting-a4-stage answer-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 방정식 정답지">{renderSheet(true)}</div>
      {answerPanelOpen && (
        <div className="trig-derivative-answer-panel-backdrop" role="presentation" onClick={() => setAnswerPanelOpen(false)}>
          <aside className="trig-derivative-answer-panel" role="dialog" aria-modal="true" aria-label="방정식 답안 입력" onClick={(event) => event.stopPropagation()}>
            <header><div><strong>답안 입력</strong><span>{completed}/{problems.length}문제 선택</span></div><button type="button" onClick={() => setAnswerPanelOpen(false)} aria-label="닫기">×</button></header>
            <div className="trig-derivative-answer-list">
              {problems.map((problem, problemIndex) => (
                <section className="trig-derivative-answer-item" key={problem.id}>
                  <div className="trig-derivative-answer-item-heading"><strong>{String(problemIndex + 1).padStart(2, "0")}</strong><span>{problem.label}</span></div>
                  <div className="trig-derivative-choices">
                    {createEquationChoices(problem).map((choice, choiceIndex) => (
                      <button className={selectedChoices[problem.id] === choiceIndex ? "is-selected" : ""} type="button" key={choiceIndex} onClick={() => selectChoice(problem, choiceIndex)}>
                        <span>{choiceIndex + 1}</span><MathFormula latex={solutionLatex(choice.answers)} />
                      </button>
                    ))}
                  </div>
                  {problem.id in results && <div className={`trig-derivative-panel-grade ${results[problem.id] ? "is-correct" : "is-wrong"}`}>{results[problem.id] ? "정답" : <>정답 <MathFormula latex={solutionLatex(problem.answers)} /></>}</div>}
                </section>
              ))}
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
