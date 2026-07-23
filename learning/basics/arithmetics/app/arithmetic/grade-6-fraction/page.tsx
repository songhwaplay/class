"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { moveBetweenFractionAnswerInputs } from "../../components/fraction-answer-navigation";
import { createGradeSixFractionSet } from "../../../lib/grade-six-fraction";
import type { GradeSixFractionOperand, GradeSixFractionProblem } from "../../../lib/grade-six-fraction";
import type { MixedFractionAnswer } from "../../../lib/grade-five-fraction-one";

type PrintMode = "worksheet" | "answers" | "both";
type WrittenAnswer = { whole: string; numerator: string; denominator: string };

const INITIAL_SEED = 20260721;

function FractionStack({ numerator, denominator, className = "", inputOrder = false }: { numerator: ReactNode; denominator: ReactNode; className?: string; inputOrder?: boolean }) {
  return (
    <span className={`grade-five-fraction-one-stack ${className}${inputOrder ? " input-order" : ""}`}>
      {inputOrder ? (
        <>
          <span className="grade-five-fraction-one-number denominator-slot">{denominator}</span>
          <span className="grade-five-fraction-one-line" aria-hidden="true" />
          <span className="grade-five-fraction-one-number numerator-slot">{numerator}</span>
        </>
      ) : (
        <>
          <span className="grade-five-fraction-one-number">{numerator}</span>
          <span className="grade-five-fraction-one-line" aria-hidden="true" />
          <span className="grade-five-fraction-one-number">{denominator}</span>
        </>
      )}
    </span>
  );
}

function Operand({ value }: { value: GradeSixFractionOperand }) {
  if (value.kind === "natural") return <span className="grade-five-fraction-one-natural">{value.value}</span>;
  return <FractionStack numerator={value.numerator} denominator={value.denominator} />;
}

function MixedValue({ answer }: { answer: MixedFractionAnswer }) {
  return (
    <span className="grade-five-fraction-one-value mixed">
      {answer.whole > 0 && <strong>{answer.whole}</strong>}
      {answer.numerator > 0 && <FractionStack numerator={answer.numerator} denominator={answer.denominator} />}
    </span>
  );
}

export default function GradeSixFractionPage() {
  const [seed, setSeed] = useState(INITIAL_SEED);
  const [answers, setAnswers] = useState<Record<string, WrittenAnswer>>({});
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

  const problemSet = useMemo(() => createGradeSixFractionSet(seed), [seed]);
  const problems = useMemo(() => problemSet.problems, [problemSet]);
  const completed = Object.values(answers).filter((answer) => answer.whole || answer.numerator || answer.denominator).length;
  const correct = Object.values(results).filter(Boolean).length;

  function updateAnswer(id: string, field: keyof WrittenAnswer, input: string) {
    const maximumLength = field === "whole" ? 2 : 4;
    setAnswers((current) => ({
      ...current,
      [id]: {
        whole: current[id]?.whole ?? "",
        numerator: current[id]?.numerator ?? "",
        denominator: current[id]?.denominator ?? "",
        [field]: input.replace(/[^0-9]/g, "").slice(0, maximumLength),
      },
    }));
    setResults((current) => {
      if (!(id in current)) return current;
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  function isAnswerCorrect(problem: GradeSixFractionProblem) {
    const written = answers[problem.id];
    if (!written) return false;
    const wholeCorrect = problem.answer.whole === 0
      ? written.whole === "" || written.whole === "0"
      : written.whole === String(problem.answer.whole);
    const fractionCorrect = problem.answer.numerator === 0
      ? written.numerator === "" && written.denominator === ""
      : written.numerator === String(problem.answer.numerator) && written.denominator === String(problem.answer.denominator);
    return wholeCorrect && fractionCorrect;
  }

  function checkAll() {
    setResults(Object.fromEntries(problems.map((problem) => [problem.id, isAnswerCorrect(problem)])));
  }

  function resetAnswers() {
    setAnswers({});
    setResults({});
  }

  function newSet() {
    if (completed > 0 && !window.confirm("답이 사라집니다. 새 문제를 만들까요?")) return;
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

  function renderAnswer(problem: GradeSixFractionProblem, answerSheet: boolean) {
    if (answerSheet) {
      return <span className="grade-six-fraction-static-answer grade-five-fraction-one-static-answer"><MixedValue answer={problem.answer} /></span>;
    }
    const answer = answers[problem.id] ?? { whole: "", numerator: "", denominator: "" };
    return (
      <span className="grade-five-fraction-one-answer">
        <input className="grade-six-fraction-whole-input grade-five-fraction-one-whole-input" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2} value={answer.whole} onChange={(event) => updateAnswer(problem.id, "whole", event.target.value)} data-fraction-answer-input="true" onKeyDown={moveBetweenFractionAnswerInputs} aria-label={`${problem.id} 자연수 부분`} />
        <FractionStack
          className="answer"
          inputOrder
          denominator={<input className="grade-six-fraction-part-input denominator grade-five-fraction-one-part-input" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={4} value={answer.denominator} onChange={(event) => updateAnswer(problem.id, "denominator", event.target.value)} data-fraction-answer-input="true" onKeyDown={moveBetweenFractionAnswerInputs} aria-label={`${problem.id} 분모`} />}
          numerator={<input className="grade-six-fraction-part-input numerator grade-five-fraction-one-part-input" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={4} value={answer.numerator} onChange={(event) => updateAnswer(problem.id, "numerator", event.target.value)} data-fraction-answer-input="true" onKeyDown={moveBetweenFractionAnswerInputs} aria-label={`${problem.id} 분자`} />}
        />
      </span>
    );
  }

  function renderProblem(problem: GradeSixFractionProblem, index: number, answerSheet: boolean) {
    const graded = problem.id in results;
    const isCorrect = results[problem.id] === true;
    return (
      <div className={`multiplication-question grade-five-fraction-one-question grade-six-fraction-question${graded ? isCorrect ? " is-correct" : " is-wrong" : ""}`} data-testid="grade-six-fraction-question" key={problem.id}>
        <span className="grade-five-fraction-one-index">{index + 1}</span>
        <div className="grade-five-fraction-one-expression grade-six-fraction-expression">
          {problem.operands.map((operand, operandIndex) => (
            <span className="grade-five-fraction-one-term" key={operandIndex}>
              {operandIndex > 0 && <span className="grade-five-fraction-one-operator">{problem.operators[operandIndex - 1]}</span>}
              <Operand value={operand} />
            </span>
          ))}
          <span>=</span>
          {renderAnswer(problem, answerSheet)}
        </div>
        {!answerSheet && graded && <span className={`counting-result ${isCorrect ? "correct" : "wrong"}`} role="status">{isCorrect ? "맞음" : "틀림"}</span>}
      </div>
    );
  }

  function renderSheet(answerSheet: boolean) {
    return (
      <div className="a4-sheet counting-sheet grade-five-fraction-one-sheet grade-six-fraction-sheet" style={{ transform: `scale(${sheetScale})` }}>
        <header className="counting-sheet-header">
          <div className="counting-sheet-title"><span>6학년</span><strong>분수{answerSheet ? " 정답" : ""}</strong></div>
          <div className="counting-sheet-info"><span>이름 <i /></span><span>날짜 <i /></span><small>문제지 {seed}</small></div>
        </header>
        <p className="grade-five-fraction-one-guide">답은 기약분수, 대분수 또는 자연수로 쓰세요. 자연수 부분부터 쓰고, 분모 → 분자 순서로 이동합니다.</p>
        <div className="grade-five-fraction-one-columns">
          {[problems.slice(0, 5), problems.slice(5)].map((column, columnIndex) => (
            <div className="grade-five-fraction-one-column" key={columnIndex}>
              {column.map((problem, rowIndex) => renderProblem(problem, columnIndex * 5 + rowIndex, answerSheet))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <main className="counting-page multiplication-page">
      <div className="counting-toolbar">
        <a className="counting-back" href="/arithmetic">← 연산</a>
        <div className="counting-progress"><strong>{correct}<small>/10 정답</small></strong></div>
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
      <div className="a4-stage counting-a4-stage worksheet-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 6학년 분수 문제지">{renderSheet(false)}</div>
      <div className="a4-stage counting-a4-stage answer-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 6학년 분수 전체 답지">{renderSheet(true)}</div>
    </main>
  );
}
