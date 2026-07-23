"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createRationalExpressionChoices,
  createRationalExpressionProblemSet,
  createRationalExpressionReviewProblems,
  formatRationalFractionLatex,
  type RationalExpressionProblem,
  type RationalFraction,
  type RationalOperation,
  type RationalPolynomial,
} from "../../../../lib/rational-expression-worksheets";
import MathFormula from "../../../components/math-formula";

type PrintMode = "worksheet" | "answers" | "both";
type PolynomialInput = [quadratic: string, linear: string, constant: string];
type RationalAnswerInput = {
  numerator: PolynomialInput;
  denominator: PolynomialInput;
};

const INITIAL_SEED = 20260722;
const TERM_LABELS = [
  { label: "x²", latex: "x^2" },
  { label: "x", latex: "x" },
  { label: "상수", latex: "" },
] as const;
const OPERATOR_LATEX: Record<RationalOperation["operator"], string> = {
  start: "",
  multiply: "\\times",
  divide: "\\div",
  add: "+",
  subtract: "-",
};

function polynomialLatex(polynomial: RationalPolynomial) {
  const terms = polynomial.map((coefficient, index) => {
    if (coefficient === 0) return "";
    const power = 2 - index;
    const magnitude = Math.abs(coefficient);
    const variable = power === 2 ? "x^2" : power === 1 ? "x" : "";
    const number = variable && magnitude === 1 ? "" : String(magnitude);
    return `${coefficient < 0 ? "-" : "+"}${number}${variable}`;
  }).filter(Boolean);
  if (!terms.length) return "0";
  return terms.join("").replace(/^\+/, "");
}

function fractionLatex(value: RationalFraction) {
  return `\\frac{${polynomialLatex(value.numerator)}}{${polynomialLatex(value.denominator)}}`;
}

function expressionLatex(operations: RationalOperation[]) {
  return operations.map((operation, index) => `${index === 0 ? "" : OPERATOR_LATEX[operation.operator]}${fractionLatex(operation.fraction)}`).join(" ");
}

function emptyAnswer(): RationalAnswerInput {
  return { numerator: ["", "", ""], denominator: ["", "", ""] };
}

function normalizeCoefficient(value: string) {
  const sanitized = value.replace(/[^0-9-]/g, "");
  const negative = sanitized.startsWith("-");
  const digits = sanitized.replace(/-/g, "").slice(0, 3);
  if (!digits) return negative ? "-" : "";
  return `${negative ? "-" : ""}${digits}`;
}

function parsedPolynomial(input: PolynomialInput): RationalPolynomial | null {
  if (input.some((value) => !/^-?\d+$/.test(value))) return null;
  return input.map(Number) as RationalPolynomial;
}

function parsedAnswer(input: RationalAnswerInput | undefined): RationalFraction | null {
  if (!input) return null;
  const numerator = parsedPolynomial(input.numerator);
  const denominator = parsedPolynomial(input.denominator);
  if (!numerator || !denominator || denominator.every((coefficient) => coefficient === 0)) return null;
  return { numerator, denominator };
}

function greatestCommonDivisor(left: number, right: number): number {
  let first = Math.abs(left);
  let second = Math.abs(right);
  while (second !== 0) [first, second] = [second, first % second];
  return first;
}

function normalizedAnswer(value: RationalFraction) {
  const coefficients = [...value.numerator, ...value.denominator];
  const divisor = coefficients.reduce((result, coefficient) => (
    coefficient === 0 ? result : greatestCommonDivisor(result, coefficient)
  ), 0) || 1;
  const firstDenominatorCoefficient = value.denominator.find((coefficient) => coefficient !== 0) ?? 1;
  const sign = firstDenominatorCoefficient < 0 ? -1 : 1;
  const normalize = (polynomial: RationalPolynomial) => (
    polynomial.map((coefficient) => coefficient / divisor * sign) as RationalPolynomial
  );
  return { numerator: normalize(value.numerator), denominator: normalize(value.denominator) };
}

function sameRationalAnswer(answer: RationalFraction | null, expected: RationalFraction) {
  if (!answer) return false;
  const normalized = normalizedAnswer(answer);
  const normalizedExpected = normalizedAnswer(expected);
  return normalized.numerator.every((coefficient, index) => coefficient === normalizedExpected.numerator[index])
    && normalized.denominator.every((coefficient, index) => coefficient === normalizedExpected.denominator[index]);
}

export default function FactorizationRationalPage() {
  const [questionSet, setQuestionSet] = useState(() => createRationalExpressionProblemSet(INITIAL_SEED));
  const [reviewProblems, setReviewProblems] = useState<RationalExpressionProblem[]>([]);
  const [answers, setAnswers] = useState<Record<string, RationalAnswerInput>>({});
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

  function updateAnswer(
    id: string,
    part: keyof RationalAnswerInput,
    coefficientIndex: number,
    value: string,
  ) {
    setAnswers((current) => {
      const nextAnswer = current[id]
        ? { numerator: [...current[id].numerator], denominator: [...current[id].denominator] } as RationalAnswerInput
        : emptyAnswer();
      nextAnswer[part][coefficientIndex] = normalizeCoefficient(value);
      return { ...current, [id]: nextAnswer };
    });
    setResults((current) => {
      if (!(id in current)) return current;
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  function toggleSign(id: string, part: keyof RationalAnswerInput, coefficientIndex: number) {
    const currentValue = answers[id]?.[part][coefficientIndex] ?? "";
    updateAnswer(id, part, coefficientIndex, currentValue.startsWith("-") ? currentValue.slice(1) : `-${currentValue}`);
  }

  function checkAll() {
    setResults(Object.fromEntries(problems.map((problem) => [
      problem.id,
      createRationalExpressionChoices(problem).find(({ id }) => id === selectedChoices[problem.id])?.correct === true,
    ])));
  }

  function resetAnswers() {
    setAnswers({});
    setSelectedChoices({});
    setResults({});
    setReviewProblems([]);
  }

  function newSet() {
    if (completed > 0 && !window.confirm("입력이 사라집니다. 새 문제를 만들까요?")) return;
    setQuestionSet(createRationalExpressionProblemSet((Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0));
    resetAnswers();
  }

  function addReviewProblems() {
    setReviewProblems(createRationalExpressionReviewProblems(
      wrongOriginalProblems.map(({ kind }) => kind),
      (questionSet.seed ^ 0x9e3779b9) >>> 0,
    ));
  }

  function printMaterials(mode: PrintMode) {
    setPrintMenuOpen(false);
    document.documentElement.dataset.printMode = mode;
    const clearPrintMode = () => delete document.documentElement.dataset.printMode;
    window.addEventListener("afterprint", clearPrintMode, { once: true });
    window.requestAnimationFrame(() => window.print());
  }

  function renderExpression(operations: RationalOperation[]) {
    return <div className="rational-expression"><MathFormula latex={expressionLatex(operations)} display /></div>;
  }

  function renderPolynomialInputs(problem: RationalExpressionProblem, part: keyof RationalAnswerInput) {
    const values = answers[problem.id]?.[part] ?? emptyAnswer()[part];
    return (
      <div className="rational-coefficient-row" aria-label={`${problem.id} ${part === "numerator" ? "분자" : "분모"} 계수 입력`}>
        {TERM_LABELS.map((term, coefficientIndex) => (
          <label className="rational-coefficient-field" key={term.label}>
            <span className="rational-input-shell">
              <button type="button" tabIndex={-1} onClick={() => toggleSign(problem.id, part, coefficientIndex)} aria-label={`${term} 계수 부호 바꾸기`}>±</button>
              <input
                className="rational-coefficient-input"
                type="text"
                inputMode="numeric"
                pattern="-?[0-9]*"
                maxLength={4}
                value={values[coefficientIndex]}
                onChange={(event) => updateAnswer(problem.id, part, coefficientIndex, event.target.value)}
                aria-label={`${part === "numerator" ? "분자" : "분모"} ${term.label}의 계수`}
              />
            </span>
            <b aria-hidden="true">{term.latex && <MathFormula latex={term.latex} />}</b>
          </label>
        ))}
      </div>
    );
  }

  function renderProblem(problem: RationalExpressionProblem, index: number, answerSheet: boolean) {
    const graded = problem.id in results;
    const isCorrect = results[problem.id] === true;
    return (
      <article className={`polynomial-question rational-question${answerSheet ? " is-answer-sheet" : ""}${graded ? isCorrect ? " is-correct" : " is-wrong" : ""}`} data-testid="rational-expression-question" key={problem.id}>
        <div className="polynomial-question-number">{String(index + 1).padStart(2, "0")}</div>
        <div className="polynomial-question-body">
          <span className="polynomial-focus-label">{problem.label}</span>
          {renderExpression(problem.operations)}
          <small className="rational-restrictions">단, <MathFormula latex={`x \\ne ${problem.restrictions.join(",\\,")}`} /></small>
        </div>
        {answerSheet ? (
          <div className="rational-static-answer"><MathFormula latex={fractionLatex(problem.answer)} /></div>
        ) : null}
      </article>
    );
  }

  function renderChoices(problem: RationalExpressionProblem, problemNumber: number) {
    const markers = ["①", "②", "③", "④"];
    return (
      <div className="trig-derivative-choices rational-answer-choices">
        {createRationalExpressionChoices(problem).map((choice, index) => {
          const selected = selectedChoices[problem.id] === choice.id;
          return (
            <button
              className={`trig-derivative-choice${selected ? " is-selected" : ""}`}
              data-testid="rational-answer-choice"
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
        <aside className="trig-derivative-answer-panel" aria-label="인수분해와 분수식 답안 입력" onClick={(event) => event.stopPropagation()}>
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
                  {graded && <span className={`counting-result ${isCorrect ? "correct" : "wrong"}`} role="status">{isCorrect ? "맞음" : <>정답 <MathFormula latex={formatRationalFractionLatex(problem.answer)} /></>}</span>}
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
      <div className={`a4-sheet counting-sheet polynomial-sheet rational-sheet polynomial-sheet-${problems.length}`} style={{ transform: `scale(${sheetScale})` }}>
        <header className="counting-sheet-header polynomial-sheet-header">
          <div className="counting-sheet-title"><span>공통수학 1</span><strong>인수분해와 분수식{answerSheet ? " 정답" : ""}</strong></div>
          <div className="counting-sheet-info"><span>이름 <i /></span><span>날짜 <i /></span><small>문제지 {questionSet.seed}</small></div>
        </header>
        <div className="polynomial-instruction"><b>인수분해하고 빈 공간에 약분 과정을 쓰세요.</b><span>답안 입력에서 4지선다 채점 · 오답 보충 최대 2문제</span></div>
        <div className="polynomial-problem-grid rational-problem-grid">
          {problems.map((problem, index) => renderProblem(problem, index, answerSheet))}
        </div>
      </div>
    );
  }

  return (
    <main className="counting-page polynomial-page rational-page">
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
      {answerPanelOpen && renderAnswerPanel()}
      <div className="a4-stage counting-a4-stage worksheet-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 인수분해와 분수식 문제지">{renderSheet(false)}</div>
      <div className="a4-stage counting-a4-stage answer-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 인수분해와 분수식 정답지">{renderSheet(true)}</div>
    </main>
  );
}
