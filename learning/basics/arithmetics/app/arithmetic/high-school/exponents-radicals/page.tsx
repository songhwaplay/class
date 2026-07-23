"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createExponentRadicalChoices,
  createExponentRadicalProblemSet,
  createExponentRadicalReviewProblems,
  type ExponentRadicalAnswer,
  type ExponentRadicalExpression,
  type ExponentRadicalProblem,
} from "../../../../lib/exponent-radical-worksheets";
import MathFormula from "../../../components/math-formula";

type PrintMode = "worksheet" | "answers" | "both";
const INITIAL_SEED = 20260723;

function powerFactor(variable: string, exponent: number) {
  if (exponent === 0) return "";
  return `${variable}${exponent === 1 ? "" : `^{${exponent}}`}`;
}

function expressionLatex(expression: ExponentRadicalExpression) {
  if (expression.type === "exponent") {
    const base = `${expression.baseCoefficient}${powerFactor("a", expression.baseAExponent)}${powerFactor("b", expression.baseBExponent)}`;
    const product = `${expression.productCoefficient}${powerFactor("a", expression.productAExponent)}${powerFactor("b", expression.productBExponent)}`;
    const denominator = `${expression.denominatorCoefficient}${powerFactor("a", expression.denominatorAExponent)}${powerFactor("b", expression.denominatorBExponent)}`;
    return `\\frac{\\left(${base}\\right)^{${expression.power}}\\cdot ${product}}{${denominator}}`;
  }
  if (expression.type === "fractional-exponent") {
    const term = ({ base, numerator, denominator }: { base: number; numerator: number; denominator: number }) =>
      `${base}^{\\frac{${numerator}}{${denominator}}}`;
    return `\\frac{${expression.numeratorTerms.map(term).join("\\cdot")}}{${expression.denominatorTerms.map(term).join("\\cdot")}}`;
  }
  if (expression.type === "radical-square-difference") {
    const first = `${expression.firstCoefficient === 1 ? "" : expression.firstCoefficient}\\sqrt{${expression.firstRadicand}}`;
    const second = `${expression.secondCoefficient === 1 ? "" : expression.secondCoefficient}\\sqrt{${expression.secondRadicand}}`;
    return `\\left(${first}+${second}\\right)^2-\\left(${first}-${second}\\right)^2`;
  }
  const operator = expression.operator === "add" ? "+" : "-";
  return `\\frac{${expression.firstNumerator}}{\\sqrt{${expression.radicand}}-${expression.integerPart}}${operator}\\frac{${expression.secondNumerator}}{\\sqrt{${expression.radicand}}+${expression.integerPart}}`;
}

function answerLatex(answer: ExponentRadicalAnswer) {
  if (answer.type === "exponent") return `${answer.coefficient}${powerFactor("a", answer.aExponent)}${powerFactor("b", answer.bExponent)}`;
  if (answer.type === "integer") return String(answer.value);
  if (answer.type === "radical") {
    const coefficient = answer.coefficient === 1 ? "" : answer.coefficient === -1 ? "-" : String(answer.coefficient);
    return `${coefficient}\\sqrt{${answer.radicand}}`;
  }
  const coefficient = Math.abs(answer.radicalCoefficient) === 1 ? "" : Math.abs(answer.radicalCoefficient);
  const operator = answer.radicalCoefficient < 0 ? "-" : "+";
  return `\\frac{${answer.integerPart}${operator}${coefficient}\\sqrt{${answer.radicand}}}{${answer.denominator}}`;
}

export default function ExponentsRadicalsPage() {
  const [questionSet, setQuestionSet] = useState(() => createExponentRadicalProblemSet(INITIAL_SEED));
  const [reviewProblems, setReviewProblems] = useState<ExponentRadicalProblem[]>([]);
  const [selectedChoices, setSelectedChoices] = useState<Record<string, number>>({});
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [answerPanelOpen, setAnswerPanelOpen] = useState(false);
  const [sheetScale, setSheetScale] = useState(0.6);
  const [printMenuOpen, setPrintMenuOpen] = useState(false);

  const problems = useMemo(() => [...questionSet.problems, ...reviewProblems], [questionSet.problems, reviewProblems]);
  const completed = Object.keys(selectedChoices).filter((id) => problems.some((problem) => problem.id === id)).length;
  const correct = Object.values(results).filter(Boolean).length;
  const wrongOriginalProblems = questionSet.problems.filter((problem) => results[problem.id] === false);
  const canAddReview = reviewProblems.length === 0 && wrongOriginalProblems.length > 0;
  const reviewCount = Math.min(wrongOriginalProblems.length, 2);

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
    setQuestionSet(createExponentRadicalProblemSet((Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0));
    resetAnswers();
  }

  function selectChoice(problem: ExponentRadicalProblem, choiceIndex: number) {
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
      return [problem.id, selected !== undefined && createExponentRadicalChoices(problem)[selected]?.correct === true];
    })));
  }

  function addReviewProblems() {
    setReviewProblems(createExponentRadicalReviewProblems(
      wrongOriginalProblems.map(({ kind }) => kind),
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

  function renderProblem(problem: ExponentRadicalProblem, index: number, answerSheet: boolean) {
    return (
      <article className="polynomial-question exponent-radical-question" data-testid="exponent-radical-question" key={problem.id}>
        <div className="polynomial-question-number">{String(index + 1).padStart(2, "0")}</div>
        <div className="polynomial-question-body">
          <span className="polynomial-focus-label">{problem.label}</span>
          <div className="exponent-radical-expression"><MathFormula latex={expressionLatex(problem.expression)} display /></div>
          {answerSheet && <div className="exponent-radical-static-answer">정답 <MathFormula latex={answerLatex(problem.answer)} /></div>}
        </div>
      </article>
    );
  }

  function renderSheet(answerSheet: boolean) {
    return (
      <div className={`a4-sheet counting-sheet polynomial-sheet exponent-radical-sheet polynomial-sheet-${problems.length}`} style={{ transform: `scale(${sheetScale})` }}>
        <header className="counting-sheet-header polynomial-sheet-header">
          <div className="counting-sheet-title"><span>공통수학 1</span><strong>지수와 근호{answerSheet ? " 정답" : ""}</strong></div>
          <div className="counting-sheet-info"><span>이름 <i /></span><span>날짜 <i /></span><small>문제지 {questionSet.seed}</small></div>
        </header>
        <div className="polynomial-instruction">
          <b>식을 간단히 하세요. 빈 공간에 계산 과정을 쓰세요.</b>
          <span>답안 입력에서 4지선다 채점 · 오답 보충 최대 2문제</span>
        </div>
        <div className="polynomial-problem-grid exponent-radical-problem-grid">
          {problems.map((problem, index) => renderProblem(problem, index, answerSheet))}
        </div>
      </div>
    );
  }

  return (
    <main className="counting-page polynomial-page exponent-radical-page">
      <div className="counting-toolbar">
        <a className="counting-back" href="/arithmetic">← 연산</a>
        <div className="counting-progress"><strong>{correct}<small>/{problems.length} 정답</small></strong></div>
        <div className="toolbar">
          <button className="button secondary" type="button" onClick={newSet}>새 문제</button>
          <button className="button ghost" type="button" onClick={resetAnswers}>다시 풀기</button>
          {canAddReview && <button className="button secondary" type="button" onClick={addReviewProblems}>틀린 유형 {reviewCount}문제 더</button>}
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
      <div className="a4-stage counting-a4-stage worksheet-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 지수와 근호 문제지">{renderSheet(false)}</div>
      <div className="a4-stage counting-a4-stage answer-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 지수와 근호 정답지">{renderSheet(true)}</div>
      {answerPanelOpen && (
        <div className="trig-derivative-answer-panel-backdrop" role="presentation" onClick={() => setAnswerPanelOpen(false)}>
          <aside className="trig-derivative-answer-panel" role="dialog" aria-modal="true" aria-label="지수와 근호 답안 입력" onClick={(event) => event.stopPropagation()}>
            <header><div><strong>답안 입력</strong><span>{completed}/{problems.length}문제 선택</span></div><button type="button" onClick={() => setAnswerPanelOpen(false)} aria-label="닫기">×</button></header>
            <div className="trig-derivative-answer-list">
              {problems.map((problem, problemIndex) => (
                <section className="trig-derivative-answer-item" key={problem.id}>
                  <div className="trig-derivative-answer-item-heading"><strong>{String(problemIndex + 1).padStart(2, "0")}</strong><span>{problem.label}</span></div>
                  <div className="trig-derivative-choices">
                    {createExponentRadicalChoices(problem).map((choice, choiceIndex) => (
                      <button className={selectedChoices[problem.id] === choiceIndex ? "is-selected" : ""} type="button" key={choiceIndex} onClick={() => selectChoice(problem, choiceIndex)}>
                        <span>{choiceIndex + 1}</span><MathFormula latex={answerLatex(choice.answer)} />
                      </button>
                    ))}
                  </div>
                  {problem.id in results && <div className={`trig-derivative-panel-grade ${results[problem.id] ? "is-correct" : "is-wrong"}`}>{results[problem.id] ? "정답" : <>정답 <MathFormula latex={answerLatex(problem.answer)} /></>}</div>}
                </section>
              ))}
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
