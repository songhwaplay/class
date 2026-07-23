"use client";

import { useEffect, useMemo, useState } from "react";
import { createLogicProblemSet, createLogicReviewProblems, type LogicProblem } from "../../../../lib/sets-propositions-workouts";
import MathFormula from "../../../components/math-formula";
import WorksheetChoicePanel, { type WorksheetChoiceProblem } from "../components/worksheet-choice-panel";

export default function SetsPropositionsPage() {
  const [questionSet, setQuestionSet] = useState(() => createLogicProblemSet(20260729));
  const [reviews, setReviews] = useState<LogicProblem[]>([]);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [panelOpen, setPanelOpen] = useState(false);
  const [scale, setScale] = useState(0.6);
  const problems = useMemo(() => [...questionSet.problems, ...reviews], [questionSet.problems, reviews]);
  const wrong = questionSet.problems.filter((problem) => results[problem.id] === false);
  const choiceProblems: WorksheetChoiceProblem[] = problems.map((problem) => ({
    id: problem.id,
    label: problem.label,
    correctLatex: problem.choices.find((choice) => choice.id === problem.answer)?.latex ?? "",
    choices: problem.choices.map((choice) => ({ ...choice, correct: choice.id === problem.answer })),
  }));

  useEffect(() => {
    const fit = () => setScale(Math.min((window.innerWidth - 32) / 794, 1));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  function reset() {
    setSelected({});
    setResults({});
    setReviews([]);
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

  function checkAll() {
    setResults(Object.fromEntries(choiceProblems.map((problem) => [
      problem.id,
      problem.choices.find((choice) => choice.id === selected[problem.id])?.correct === true,
    ])));
  }

  function row(problem: LogicProblem, index: number, answerSheet: boolean) {
    return (
      <article className="polynomial-question logic-question" key={problem.id}>
        <div className="polynomial-question-number">{String(index + 1).padStart(2, "0")}</div>
        <div className="polynomial-question-body">
          <span className="polynomial-focus-label">{problem.label}</span>
          <p className="logic-prompt">{problem.prompt}</p>
          <div className="logic-expression"><MathFormula latex={problem.latex} display /></div>
          {answerSheet && <div className="logic-choices"><MathFormula latex={choiceProblems.find(({ id }) => id === problem.id)?.correctLatex ?? ""} /></div>}
        </div>
      </article>
    );
  }

  function sheet(answerSheet: boolean) {
    return (
      <div className={`a4-sheet counting-sheet polynomial-sheet logic-sheet polynomial-sheet-${problems.length}`} style={{ transform: `scale(${scale})` }}>
        <header className="counting-sheet-header polynomial-sheet-header">
          <div className="counting-sheet-title"><span>공통수학 2</span><strong>집합과 명제{answerSheet ? " 정답" : ""}</strong></div>
          <div className="counting-sheet-info"><span>이름 <i /></span><span>날짜 <i /></span><small>문제지 {questionSet.seed}</small></div>
        </header>
        <div className="polynomial-instruction"><b>조건을 분석하여 알맞은 답을 고르세요. 빈 공간에 판단 과정을 쓰세요.</b><span>답안 입력에서 4지선다 채점 · 오답 보충 최대 2문제</span></div>
        <div className="polynomial-problem-grid logic-problem-grid">{problems.map((problem, index) => row(problem, index, answerSheet))}</div>
      </div>
    );
  }

  return (
    <main className="counting-page polynomial-page logic-page">
      <div className="counting-toolbar">
        <a className="counting-back" href="/arithmetic">← 연산</a>
        <div className="counting-progress"><strong>{Object.values(results).filter(Boolean).length}<small>/{problems.length} 정답</small></strong></div>
        <div className="toolbar">
          <button className="button secondary" onClick={() => { setQuestionSet(createLogicProblemSet(Date.now() >>> 0)); reset(); }}>새 문제</button>
          <button className="button ghost" onClick={reset}>다시 풀기</button>
          {reviews.length === 0 && wrong.length > 0 && <button className="button secondary" onClick={() => setReviews(createLogicReviewProblems(wrong.map(({ kind }) => kind), questionSet.seed ^ 0x9e3779b9))}>틀린 유형 {Math.min(wrong.length, 2)}문제 더</button>}
          <button className="button secondary" onClick={() => setPanelOpen(true)}>답안 입력</button>
          <button className="button ghost" onClick={() => window.print()}>인쇄</button>
          <button className="button primary" onClick={checkAll}>전체 채점</button>
        </div>
      </div>
      <div className="a4-stage counting-a4-stage worksheet-stage" style={{ width: 794 * scale, height: 1123 * scale }}>{sheet(false)}</div>
      <div className="a4-stage counting-a4-stage answer-stage" style={{ width: 794 * scale, height: 1123 * scale }}>{sheet(true)}</div>
      {panelOpen && <WorksheetChoicePanel title="집합과 명제" problems={choiceProblems} selected={selected} results={results} onSelect={choose} onGrade={checkAll} onClose={() => setPanelOpen(false)} />}
    </main>
  );
}
