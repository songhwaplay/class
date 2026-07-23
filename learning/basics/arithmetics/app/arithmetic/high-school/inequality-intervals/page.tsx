"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createInequalityChoices,
  createInequalityProblemSet,
  createInequalityReviewProblems,
  type InequalityProblem,
  type SolutionPiece,
} from "../../../../lib/inequality-workouts";
import MathFormula from "../../../components/math-formula";
import WorksheetChoicePanel, { type WorksheetChoiceProblem } from "../components/worksheet-choice-panel";

const INITIAL_SEED = 20260725;

function expressionLatex(expression: string) {
  return expression
    .replaceAll("≤", "\\le ")
    .replaceAll("≥", "\\ge ")
    .replaceAll("그리고", "\\quad\\text{그리고}\\quad");
}

function solutionLatex(pieces: SolutionPiece[]) {
  return pieces.map((piece) => {
    if (piece.kind === "point") return `\\{${piece.value}\\}`;
    const left = piece.left === "-inf" ? "-\\infty" : piece.left;
    const right = piece.right === "inf" ? "\\infty" : piece.right;
    const leftBracket = piece.left !== "-inf" && piece.leftClosed ? "[" : "(";
    const rightBracket = piece.right !== "inf" && piece.rightClosed ? "]" : ")";
    return `${leftBracket}${left},\\ ${right}${rightBracket}`;
  }).join("\\cup");
}

export default function InequalityIntervalsPage() {
  const [questionSet, setQuestionSet] = useState(() => createInequalityProblemSet(INITIAL_SEED));
  const [reviewProblems, setReviewProblems] = useState<InequalityProblem[]>([]);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [answerPanelOpen, setAnswerPanelOpen] = useState(false);
  const [sheetScale, setSheetScale] = useState(0.6);
  const problems = useMemo(() => [...questionSet.problems, ...reviewProblems], [questionSet.problems, reviewProblems]);
  const choiceProblems: WorksheetChoiceProblem[] = problems.map((problem) => ({
    id: problem.id,
    label: problem.label,
    correctLatex: solutionLatex(problem.solution),
    choices: createInequalityChoices(problem).map((choice, index) => ({
      id: `${problem.id}-${index}`,
      latex: solutionLatex(choice.solution),
      correct: choice.correct,
    })),
  }));

  useEffect(() => {
    const fit = () => setSheetScale(Math.min((window.innerWidth - 32) / 794, 1));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const wrongOriginal = questionSet.problems.filter((problem) => results[problem.id] === false);
  const correct = Object.values(results).filter(Boolean).length;

  function reset() {
    setSelected({});
    setResults({});
    setReviewProblems([]);
  }

  function checkAll() {
    setResults(Object.fromEntries(choiceProblems.map((problem) => [
      problem.id,
      problem.choices.find((choice) => choice.id === selected[problem.id])?.correct === true,
    ])));
  }

  function choose(problemId: string, choiceId: string) {
    setSelected((current) => ({ ...current, [problemId]: choiceId }));
    setResults((current) => {
      if (!(problemId in current)) return current;
      const next = { ...current };
      delete next[problemId];
      return next;
    });
  }

  function renderProblem(problem: InequalityProblem, index: number, answerSheet: boolean) {
    return (
      <article className="polynomial-question inequality-question" data-testid="inequality-question" key={problem.id}>
        <div className="polynomial-question-number">{String(index + 1).padStart(2, "0")}</div>
        <div className="polynomial-question-body">
          <span className="polynomial-focus-label">{problem.label}</span>
          <div className="inequality-expression"><MathFormula latex={expressionLatex(problem.expression)} display /></div>
          {answerSheet && <div className="inequality-static-answer"><MathFormula latex={solutionLatex(problem.solution)} /></div>}
        </div>
      </article>
    );
  }

  function renderSheet(answerSheet: boolean) {
    return (
      <div className={`a4-sheet counting-sheet polynomial-sheet inequality-sheet polynomial-sheet-${problems.length}`} style={{ transform: `scale(${sheetScale})` }}>
        <header className="counting-sheet-header polynomial-sheet-header">
          <div className="counting-sheet-title"><span>공통수학 1</span><strong>부등식{answerSheet ? " 정답" : ""}</strong></div>
          <div className="counting-sheet-info"><span>이름 <i /></span><span>날짜 <i /></span><small>문제지 {questionSet.seed}</small></div>
        </header>
        <div className="polynomial-instruction"><b>부등식의 해를 구하세요. 빈 공간에 풀이 과정을 쓰세요.</b><span>답안 입력에서 4지선다 채점 · 오답 보충 최대 2문제</span></div>
        <div className="polynomial-problem-grid inequality-problem-grid">{problems.map((problem, index) => renderProblem(problem, index, answerSheet))}</div>
      </div>
    );
  }

  return (
    <main className="counting-page polynomial-page inequality-page">
      <div className="counting-toolbar">
        <a className="counting-back" href="/arithmetic">← 연산</a>
        <div className="counting-progress"><strong>{correct}<small>/{problems.length} 정답</small></strong></div>
        <div className="toolbar">
          <button className="button secondary" type="button" onClick={() => { setQuestionSet(createInequalityProblemSet((Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0)); reset(); }}>새 문제</button>
          <button className="button ghost" type="button" onClick={reset}>다시 풀기</button>
          {reviewProblems.length === 0 && wrongOriginal.length > 0 && <button className="button secondary" type="button" onClick={() => setReviewProblems(createInequalityReviewProblems(wrongOriginal.map(({ kind }) => kind), (questionSet.seed ^ 0x9e3779b9) >>> 0))}>틀린 유형 {Math.min(wrongOriginal.length, 2)}문제 더</button>}
          <button className="button secondary" type="button" onClick={() => setAnswerPanelOpen(true)}>답안 입력</button>
          <button className="button ghost" type="button" onClick={() => window.print()}>인쇄</button>
          <button className="button primary" type="button" onClick={checkAll}>전체 채점</button>
        </div>
      </div>
      <div className="a4-stage counting-a4-stage worksheet-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 부등식 문제지">{renderSheet(false)}</div>
      <div className="a4-stage counting-a4-stage answer-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 부등식 정답지">{renderSheet(true)}</div>
      {answerPanelOpen && <WorksheetChoicePanel title="부등식" problems={choiceProblems} selected={selected} results={results} onSelect={choose} onGrade={checkAll} onClose={() => setAnswerPanelOpen(false)} />}
    </main>
  );
}
